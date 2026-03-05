"""
Imagen Tool
Generates cinematic scene images for Beamer movie outputs.
Uses the google-genai SDK (replaces deprecated vertexai.preview.vision_models).
"""

import os
import time
from google import genai
from google.genai import types
from .storage_tool import upload_to_gcs

GENRE_VISUAL_STYLES = {
    "Documentary": (
        "documentary photojournalism, desaturated Kodak color grade, authentic grain texture, "
        "journalistic composition, wide establishing shots, natural lighting"
    ),
    "Drama": (
        "dramatic cinematic lighting, warm amber-teal color grade, shallow depth of field, "
        "emotional close-ups, golden hour light, Academy Award-winning cinematography"
    ),
    "Action": (
        "high contrast blockbuster cinematography, dynamic Dutch angle, kinetic motion energy, "
        "anamorphic lens flares, explosive practical lighting"
    ),
    "Sci-Fi": (
        "sci-fi concept art cinematography, deep blue and neon accent lighting, "
        "ultra-wide establishing shot, futuristic environments"
    ),
    "Fantasy": (
        "epic fantasy cinematography, magical golden atmosphere, grand sweeping landscapes, "
        "ethereal mist and light rays, painterly quality"
    ),
    "Horror": (
        "psychological horror cinematography, oppressive deep shadows, chiaroscuro side-lighting, "
        "cold desaturated palette, unsettling off-center composition"
    ),
}

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
    return _client


def generate_cinematic_scene_image(prompt: str, genre: str = "") -> str:
    """
    Generates a cinematic 16:9 scene image using Imagen 3.

    Args:
        prompt: Scene prompt
        genre: Optional genre to tune style

    Returns:
        GCS URI for the generated image
    """
    try:
        client = _get_client()

        visual_style = GENRE_VISUAL_STYLES.get(
            genre,
            "cinematic film still, professional cinematography, Kodak color grade, sharp focus, widescreen",
        )

        full_prompt = (
            f"{prompt}\n\n"
            f"Visual style: {visual_style}.\n"
            "Quality: Ultra-high quality cinematic still frame, 4K resolution, "
            "professional film production, sharp details, perfect exposure."
        )

        negative_prompt = (
            "cartoon, anime, illustration, sketch, watermark, text overlay, subtitles, "
            "captions, logo, low quality, blurry, out of focus, overexposed, bad composition"
        )

        max_retries = 3
        response = None
        for attempt in range(max_retries):
            try:
                response = client.models.generate_images(
                    model="imagen-3.0-generate-001",
                    prompt=full_prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        aspect_ratio="16:9",
                        safety_filter_level="BLOCK_SOME",
                        person_generation="allow_adult",
                        negative_prompt=negative_prompt,
                    ),
                )
                if not response.generated_images:
                    raise Exception("Imagen returned no images")
                break
            except Exception as e:
                err = str(e)
                if ("429" in err or "RESOURCE_EXHAUSTED" in err) and attempt < max_retries - 1:
                    wait = 5 * (2 ** attempt)
                    print(f"[Imagen] Rate limit hit, retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                raise

        image_bytes = response.generated_images[0].image.image_bytes
        return upload_to_gcs(
            file_data=image_bytes,
            filename="movie_scene.png",
            content_type="image/png",
        )

    except Exception as e:
        raise Exception(f"Failed to generate cinematic scene image: {str(e)}")
