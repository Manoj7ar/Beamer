"""
Beamer FastAPI Server
Movie generation + video rendering pipeline for Creative Storyteller flow.
"""

import asyncio
import json
import os
import re
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel

load_dotenv()

ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()] or ["*"]
ALLOW_CREDENTIALS = "*" not in ALLOWED_ORIGINS

app = FastAPI(
    title="Beamer Agents Service",
    description="Movie storytelling pipeline with ADK agents",
    version="3.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_service = InMemorySessionService()
APP_NAME = "Beamer"


class CreateMovieRequest(BaseModel):
    prompt: str
    genre: str = ""
    scene_count: int = 8
    target_duration_seconds: int = 120


class TextToSpeechRequest(BaseModel):
    text: str
    voice_name: str = "en-US-Wavenet-D"


class RegenerateSceneImageRequest(BaseModel):
    image_prompt: str
    genre: str = ""


class RenderMovieRequest(BaseModel):
    movie_title: str
    scenes: list[dict[str, Any]]
    target_duration_seconds: int = 120
    voice_name: str = "en-US-Wavenet-D"


def extract_json_block(text: str) -> dict:
    fence_match = re.search(r"```json(.*?)```", text, re.DOTALL)
    if fence_match:
        candidate = fence_match.group(1).strip()
    else:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1:
            raise ValueError("No JSON object found in agent response")
        candidate = text[start : end + 1]

    candidate = candidate.replace("\\'", "'")
    return json.loads(candidate)


@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Beamer Agents",
        "version": "3.1.0",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Beamer Agents",
        "project": os.getenv("GOOGLE_CLOUD_PROJECT"),
        "location": os.getenv("GOOGLE_CLOUD_LOCATION"),
    }


@app.post("/create-movie")
async def create_movie(request: CreateMovieRequest):
    """
    Generates a cinematic scene plan with generated images.
    """
    try:
        from agents.movie_creator import movie_creator_agent
        from agents.movie_illustrator import generate_all_movie_illustrations

        prompt = request.prompt.strip()
        genre = request.genre.strip()
        scene_count = max(1, min(12, request.scene_count))

        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")

        user_id = f"movie_{abs(hash(prompt)) % 10**8}"
        session_id = f"session_{user_id}"

        try:
            await session_service.create_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id,
                state={},
            )
        except Exception:
            pass

        movie_input = f"Create a cinematic movie about: {prompt}"
        if genre:
            movie_input += f"\nGenre: {genre}"
        movie_input += f"\nNumber of scenes: {scene_count}"

        script_runner = Runner(
            agent=movie_creator_agent,
            app_name=APP_NAME,
            session_service=session_service,
        )

        script_message = types.Content(
            role="user",
            parts=[types.Part(text=movie_input)],
        )

        movie_response_text = ""
        async for event in script_runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=script_message,
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if hasattr(part, "text") and part.text:
                        movie_response_text = part.text

        movie_data = extract_json_block(movie_response_text)

        illustration_json = await asyncio.get_event_loop().run_in_executor(
            None,
            generate_all_movie_illustrations,
            json.dumps(movie_data),
            genre,
        )
        illustration_data = json.loads(illustration_json)

        if illustration_data.get("success"):
            scene_images = {
                img["scene_number"]: img.get("image_uri", "")
                for img in illustration_data.get("scene_images", [])
                if isinstance(img, dict) and "scene_number" in img
            }
            for scene in movie_data.get("scenes", []):
                scene_num = scene.get("scene_number")
                scene["image_uri"] = scene_images.get(scene_num, "")

        return {
            "status": "success",
            "movie_title": movie_data.get("movie_title", "Untitled Story"),
            "genre": movie_data.get("genre", genre or "Drama"),
            "scenes": movie_data.get("scenes", []),
            "total_scenes": len(movie_data.get("scenes", [])),
            "target_duration_seconds": int(max(30, min(1800, request.target_duration_seconds))),
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[create-movie] ERROR: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to generate story. Please try again.")


@app.post("/render-movie")
async def render_movie(request: RenderMovieRequest):
    """
    Renders a complete MP4 movie from scenes with transitions + VO.
    """
    try:
        if not request.scenes:
            raise HTTPException(status_code=400, detail="scenes is required")

        from tools.video_tool import render_movie_video

        render_data = await asyncio.get_event_loop().run_in_executor(
            None,
            render_movie_video,
            request.movie_title,
            request.scenes,
            int(max(30, min(1800, request.target_duration_seconds))),
            request.voice_name,
        )

        return {"status": "success", **render_data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rendering movie video: {str(e)}")


@app.post("/text-to-speech")
async def generate_speech(request: TextToSpeechRequest):
    try:
        from tools.tts_tool import text_to_speech

        audio_data = text_to_speech(
            text=request.text,
            voice_name=request.voice_name,
        )

        return {
            "status": "success",
            "audio_uri": audio_data["audio_uri"],
            "duration_seconds": audio_data["duration_seconds"],
            "word_count": audio_data["word_count"],
            "text": request.text,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")


@app.post("/regenerate-scene-image")
async def regenerate_scene_image(request: RegenerateSceneImageRequest):
    try:
        from tools.imagen_tool import generate_cinematic_scene_image

        prompt = request.image_prompt.strip()
        if not prompt:
            raise HTTPException(status_code=400, detail="image_prompt is required")

        image_uri = await asyncio.get_event_loop().run_in_executor(
            None,
            generate_cinematic_scene_image,
            prompt,
            request.genre.strip(),
        )

        return {
            "status": "success",
            "image_uri": image_uri,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error regenerating scene image: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

