"""
Text-to-Speech Tool
Converts narration text to audio using Google Cloud TTS.
"""

from google.cloud import texttospeech
from .storage_tool import upload_to_gcs

_tts_client = None


def get_tts_client():
    global _tts_client
    if _tts_client is None:
        _tts_client = texttospeech.TextToSpeechClient()
    return _tts_client


def synthesize_speech_bytes(text: str, voice_name: str = "en-US-Wavenet-D") -> dict:
    """
    Convert text to speech and return MP3 bytes + metadata.
    """
    try:
        client = get_tts_client()

        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name=voice_name,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=0.92,
            pitch=-1.5,
            volume_gain_db=0.0,
        )

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )

        word_count = len(text.split())
        estimated_duration = (word_count / 130) * 60

        return {
            "audio_bytes": response.audio_content,
            "duration_seconds": estimated_duration,
            "word_count": word_count,
        }

    except Exception as e:
        raise Exception(f"TTS failed: {str(e)}")


def text_to_speech(text: str, voice_name: str = "en-US-Wavenet-D") -> dict:
    """
    Convert narration text to speech, upload it, and return URI + metadata.
    """
    tts_data = synthesize_speech_bytes(text=text, voice_name=voice_name)
    audio_uri = upload_to_gcs(
        file_data=tts_data["audio_bytes"],
        filename="narration.mp3",
        content_type="audio/mpeg",
    )
    return {
        "audio_uri": audio_uri,
        "duration_seconds": tts_data["duration_seconds"],
        "word_count": tts_data["word_count"],
    }

