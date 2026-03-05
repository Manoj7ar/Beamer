"""
Video rendering tool
Builds a final MP4 movie from scene images + synthesized voiceover audio.
"""

import math
import os
import shutil
import subprocess
import tempfile
import urllib.request
from typing import Any

from .storage_tool import upload_to_gcs
from .tts_tool import synthesize_speech_bytes


def _resolve_ffmpeg_binary() -> str:
    candidates = []
    env_bin = os.getenv("FFMPEG_BINARY", "").strip()
    if env_bin:
        candidates.append(env_bin)
    path_bin = shutil.which("ffmpeg")
    if path_bin:
        candidates.append(path_bin)
    candidates.extend([
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0.1-essentials_build\bin\ffmpeg.exe"),
        r"C:\ffmpeg\bin\ffmpeg.exe",
    ])

    for candidate in candidates:
        if candidate and os.path.isfile(candidate):
            return candidate
    raise Exception("ffmpeg is not available on this server")


def _download_file(url: str, output_path: str) -> None:
    with urllib.request.urlopen(url, timeout=120) as response:
        data = response.read()
    with open(output_path, "wb") as f:
        f.write(data)


def _render_scene_clip(ffmpeg_bin: str, image_path: str, audio_path: str, out_path: str, duration_seconds: float, fps: int) -> None:
    # Static frame with subtle Ken Burns zoom and fade in/out to make scene transitions smoother.
    duration = max(3.0, float(duration_seconds))
    fade_dur = min(0.7, duration / 5)
    total_frames = int(duration * fps)

    vf = (
        "scale=1600:900:force_original_aspect_ratio=decrease,"
        "pad=1600:900:(ow-iw)/2:(oh-ih)/2,"
        f"zoompan=z='min(zoom+0.0006,1.12)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720,"
        f"fade=t=in:st=0:d={fade_dur},"
        f"fade=t=out:st={max(0, duration - fade_dur)}:d={fade_dur},"
        f"fps={fps},format=yuv420p"
    )

    cmd = [
        ffmpeg_bin, "-y",
        "-loop", "1", "-i", image_path,
        "-i", audio_path,
        "-t", f"{duration:.3f}",
        "-vf", vf,
        "-af", f"apad=pad_dur={duration:.3f}",
        "-shortest",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "21",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "160k",
        "-ar", "48000",
        out_path,
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def render_movie_video(
    movie_title: str,
    scenes: list[dict[str, Any]],
    target_duration_seconds: int,
    voice_name: str = "en-US-Wavenet-D",
    fps: int = 30,
) -> dict:
    """
    Build a full MP4 movie file with transitions and voiceover.

    Returns:
        { video_uri, actual_duration_seconds, per_scene_seconds, scene_count }
    """
    ffmpeg_bin = _resolve_ffmpeg_binary()

    if not scenes:
        raise Exception("No scenes provided")

    target = int(max(30, min(1800, target_duration_seconds)))
    scene_count = len(scenes)
    per_scene = max(3.0, target / scene_count)

    with tempfile.TemporaryDirectory(prefix="beamer_video_") as tmp:
        clip_paths: list[str] = []

        for index, scene in enumerate(scenes, start=1):
            image_uri = (scene.get("image_uri") or "").strip()
            narration = (scene.get("narration") or "").strip()
            if not image_uri:
                raise Exception(f"Scene {index} has no image_uri")

            image_path = os.path.join(tmp, f"scene_{index:03d}.jpg")
            audio_path = os.path.join(tmp, f"scene_{index:03d}.mp3")
            clip_path = os.path.join(tmp, f"clip_{index:03d}.mp4")

            _download_file(image_uri, image_path)

            tts_data = synthesize_speech_bytes(
                text=narration if narration else f"Scene {index}",
                voice_name=voice_name,
            )
            with open(audio_path, "wb") as f:
                f.write(tts_data["audio_bytes"])

            _render_scene_clip(
                ffmpeg_bin=ffmpeg_bin,
                image_path=image_path,
                audio_path=audio_path,
                out_path=clip_path,
                duration_seconds=per_scene,
                fps=fps,
            )
            clip_paths.append(clip_path)

        concat_list_path = os.path.join(tmp, "concat.txt")
        with open(concat_list_path, "w", encoding="utf-8") as f:
            for clip in clip_paths:
                safe_path = clip.replace("'", "'\\''")
                f.write(f"file '{safe_path}'\n")

        output_path = os.path.join(tmp, "movie_final.mp4")
        concat_cmd = [
            ffmpeg_bin, "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list_path,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "21",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "160k",
            "-ar", "48000",
            output_path,
        ]
        subprocess.run(concat_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        with open(output_path, "rb") as f:
            video_bytes = f.read()

        safe_name = "".join(ch for ch in movie_title if ch.isalnum() or ch in ("-", "_", " ")).strip()
        safe_name = safe_name.replace(" ", "_")[:80] or "beamer_movie"
        video_uri = upload_to_gcs(
            file_data=video_bytes,
            filename=f"{safe_name}.mp4",
            content_type="video/mp4",
        )

    return {
        "video_uri": video_uri,
        "actual_duration_seconds": int(math.floor(per_scene * scene_count)),
        "per_scene_seconds": float(per_scene),
        "scene_count": scene_count,
    }

