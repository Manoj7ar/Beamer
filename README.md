<p align="center">
  <img src="frontend/public/beamer-logo.svg" alt="Beamer logo" width="96" />
</p>

# Beamer

Beamer is an AI cinematic storytelling app that turns one prompt into a complete movie experience.

It generates:
- a structured multi-scene story
- cinematic scene images
- narration audio
- a rendered MP4 movie

## Repository Structure

- `frontend/` - Next.js app (prompt input, loading UX, playback, scene controls)
- `agents_service/` - FastAPI + ADK orchestration and media tools
- `submission/creative-storyteller/` - submission docs and judging materials

## Current Product Flow

1. User opens `/create`, enters prompt, optional genre, and target duration.
2. Frontend calls `POST /create-movie` to generate story + scene images.
3. Frontend calls `POST /render-movie` to create a full MP4 with transitions + voiceover.
4. User watches the generated video and can still browse scenes in the player.
5. Optional tools:
   - regenerate a scene image (`POST /regenerate-scene-image`)
   - generate narration for text (`POST /text-to-speech`)

## API

Base URL (local): `http://localhost:8080`

### Endpoints

- `GET /` - basic health info
- `GET /health` - health + configured project/location
- `POST /create-movie` - generate movie scene plan and images
- `POST /render-movie` - render complete MP4 from scenes
- `POST /text-to-speech` - generate narration audio
- `POST /regenerate-scene-image` - regenerate one scene image from prompt

### Example: `POST /create-movie`

```json
{
  "prompt": "A sci-fi rescue mission on Europa",
  "genre": "Sci-Fi",
  "scene_count": 8,
  "target_duration_seconds": 120
}
```

### Example: `POST /render-movie`

```json
{
  "movie_title": "Echoes Under Europa",
  "target_duration_seconds": 120,
  "voice_name": "en-US-Wavenet-D",
  "scenes": [
    {
      "scene_number": 1,
      "title": "Icefall Descent",
      "narration": "The rescue team drops through the blue-lit crevasse.",
      "image_uri": "https://storage.googleapis.com/your-bucket/scene-1.png"
    }
  ]
}
```

## Tech Stack

### Frontend
- Next.js 14
- React 18
- Tailwind CSS

### Backend
- FastAPI
- Google ADK
- Google GenAI + Vertex Imagen
- Google Cloud Text-to-Speech
- Google Cloud Storage

## Local Development

### 1) Backend

```bash
cd agents_service
pip install -r requirements.txt
python main.py
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

## Environment Variables

### Backend (`agents_service/.env`)
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION` (recommended: `us-central1`)
- `GCS_BUCKET_NAME`
- `ALLOWED_ORIGINS` (optional, comma-separated, default `*`)
- `GOOGLE_GENAI_USE_VERTEXAI=1`
- Application Default Credentials (ADC)

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL=http://localhost:8080`

## Validation Commands

- Frontend build: `cd frontend && npm run build`
- Backend compile check: `py -3 -m compileall agents_service`

## Notes

- The create flow now targets full video output (`/render-movie`) in addition to scene-level playback.
- Keep bucket/object permissions configured correctly for media URLs served to the frontend.
