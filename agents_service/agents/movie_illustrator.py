"""
Movie Illustrator Agent
Generates 8 cinematic scene images for a Beamer movie.

Separate from the children's illustrator — uses genre-aware Imagen prompts,
no children's safety filters, and cinematic 16:9 framing.
"""

import os
import json
import sys
import time
from google.adk.agents import LlmAgent

sys.path.append('..')
from tools.imagen_tool import generate_cinematic_scene_image


def generate_all_movie_illustrations(movie_json: str, genre: str = "") -> str:
    """
    Tool function: Generates 8 cinematic scene images for a movie.

    Args:
        movie_json: JSON string of the full movie data (must have "scenes" array,
                    each scene must have an "image_prompt" field)
        genre: Movie genre — passed to Imagen for genre-specific visual styling
               (Documentary, Drama, Action, Sci-Fi, Fantasy, Horror)

    Returns:
        JSON string: {"success": bool, "scene_images": [{"scene_number": int, "image_uri": str}], ...}
    """
    try:
        print(f"[Movie Illustrator] Starting cinematic illustration generation (genre: {genre or 'unspecified'})...")

        movie_data = json.loads(movie_json)
        scenes = movie_data.get("scenes", [])
        n = len(scenes)

        if n == 0:
            return json.dumps({"success": False, "error": "No scenes found in movie data"})

        image_uris = []
        batch_size = 4

        for batch_start in range(0, n, batch_size):
            batch = scenes[batch_start:batch_start + batch_size]
            batch_num = batch_start // batch_size + 1
            print(f"[Movie Illustrator] Batch {batch_num}: scenes {batch_start+1}–{batch_start+len(batch)}...")
            for j, scene in enumerate(batch):
                scene_num = batch_start + j + 1
                _generate_one(scene_num, scene, genre, image_uris)
                if j < len(batch) - 1:
                    time.sleep(5)
            if batch_start + batch_size < n:
                print("[Movie Illustrator] Batch done. Waiting 20s before next batch...")
                time.sleep(20)

        print(f"[Movie Illustrator] All {n} scenes complete.")
        return json.dumps({
            "success": True,
            "scene_images": image_uris,
            "total_scenes": len(image_uris)
        })

    except Exception as e:
        import traceback
        print(f"[Movie Illustrator] ERROR: {e}")
        traceback.print_exc()
        return json.dumps({
            "success": False,
            "error": f"{type(e).__name__}: {str(e)}"
        })


def _generate_one(scene_number: int, scene: dict, genre: str, results: list):
    """Helper: generate one scene image and append result to the list."""
    image_prompt = scene.get("image_prompt", "")
    print(f"[Movie Illustrator] Generating scene {scene_number}/8: {image_prompt[:60]}...")
    try:
        image_uri = generate_cinematic_scene_image(prompt=image_prompt, genre=genre)
        results.append({"scene_number": scene_number, "image_uri": image_uri})
        print(f"[Movie Illustrator] Scene {scene_number} done: {image_uri}")
    except Exception as e:
        print(f"[Movie Illustrator] Scene {scene_number} failed: {e}")
        results.append({"scene_number": scene_number, "image_uri": "", "error": str(e)})


# ── Agent ──────────────────────────────────────────────────────────────────────

movie_illustrator_instruction = """
You are the Beamer Movie Illustrator. Your ONLY task is to call generate_all_movie_illustrations.

STEPS:
1. Find the movie JSON in the user message under the header "MOVIE DATA (JSON):"
2. Find the genre string under the header "GENRE:" (use empty string if missing)
3. Call generate_all_movie_illustrations(movie_json=<the JSON string>, genre=<the genre>)
4. Return ONLY the tool's response JSON — nothing else

DO NOT generate fake image URLs.
DO NOT return anything before calling the tool.
DO NOT skip calling the tool under any circumstances.
"""

movie_illustrator_agent = LlmAgent(
    name="movie_illustrator",
    model="gemini-2.0-flash-001",
    description="Generates 8 cinematic scene images for a Beamer movie using Imagen 3",
    instruction=movie_illustrator_instruction,
    tools=[generate_all_movie_illustrations],
    output_key="movie_illustration_result"
)
