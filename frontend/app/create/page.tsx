'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MoviePlayer from '@/components/MoviePlayer'

interface Scene {
  scene_number: number
  title: string
  narration: string
  image_uri: string
  image_prompt?: string
}

interface MovieData {
  movie_title: string
  genre: string
  scenes: Scene[]
  video_uri?: string
  actual_duration_seconds?: number
  target_duration_seconds?: number
}

type AppState = 'idle' | 'generating' | 'result'

const GENRES = ['Documentary', 'Drama', 'Action', 'Sci-Fi', 'Fantasy', 'Horror']
const LOADING_MESSAGES = [
  'Gemini is writing your screenplay...',
  'Building story structure and scene beats...',
  'Imagen is rendering cinematic frames...',
  'Color grading and scene continuity pass...',
  'Generating voiceover narration...',
  'Mixing audio and timing transitions...',
  'Assembling final movie timeline...',
  'Rendering MP4 output...',
]
const MESSAGE_INTERVAL = 7000

function LoadingScreen({
  prompt,
  genre,
  sceneCount,
  targetDurationSeconds,
}: {
  prompt: string
  genre: string
  sceneCount: number
  targetDurationSeconds: number
}) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [dots, setDots] = useState('')
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    const msgTimer = setInterval(() => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length), MESSAGE_INTERVAL)
    const dotTimer = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 420)
    const elapsedTimer = setInterval(() => setElapsedSec((s) => s + 1), 1000)
    return () => {
      clearInterval(msgTimer)
      clearInterval(dotTimer)
      clearInterval(elapsedTimer)
    }
  }, [])

  const estimateSec = Math.max(45, Math.round(targetDurationSeconds * 0.18 + sceneCount * 4))
  const progress = Math.min(95, Math.round((elapsedSec / estimateSec) * 100))
  const remaining = Math.max(0, estimateSec - elapsedSec)
  const phase = progress < 28 ? 'Script' : progress < 72 ? 'Frames + Audio' : 'Final Render'

  return (
    <main className="relative max-w-4xl mx-auto px-6 py-14 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(251,146,60,0.28), transparent 42%), radial-gradient(circle at 80% 90%, rgba(239,68,68,0.24), transparent 45%), linear-gradient(135deg, #18100b 0%, #130d12 52%, #180b0b 100%)',
        }}
      />
      <div className="absolute inset-0 pointer-events-none loading-gradient-shift rounded-3xl opacity-65" />
      <div className="absolute inset-0 pointer-events-none loading-grain rounded-3xl" />

      <div
        className="relative rounded-3xl p-7 sm:p-9 border"
        style={{
          backgroundColor: 'rgba(13,10,10,0.72)',
          borderColor: 'rgba(251,146,60,0.42)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 20px 90px rgba(239,68,68,0.26)',
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <span
            className="px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold"
            style={{ color: '#fef3c7', border: '1px solid rgba(251,191,36,0.38)', backgroundColor: 'rgba(251,191,36,0.12)' }}
          >
            Movie Generation In Progress
          </span>
          <span className="text-xs text-white/70">~{Math.ceil(remaining / 5) * 5}s remaining</span>
        </div>

        <div className="mb-4">
          <div className="h-2 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full loading-progress-stripes"
              style={{
                width: `${progress}%`,
                backgroundColor: '#f59e0b',
                boxShadow: '0 0 18px rgba(251,146,60,0.65)',
                transition: 'width 900ms ease',
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
            <span>Current Phase: {phase}</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="loading-orbit-ring" style={{ borderColor: 'rgba(248,113,113,0.55)' }} />
            <div className="animate-beam-pulse">
              <Image src="/beamer-logo.svg" alt="Generating" width={76} height={76} />
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-amber-100">Building your movie</h2>
          <p className="text-sm text-white/80 mb-1">{LOADING_MESSAGES[msgIndex]}{dots}</p>
          <p className="text-xs text-white/55 mb-6">Target: {formatDuration(targetDurationSeconds)} | Scenes: ~{sceneCount}</p>

          <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
            {Array.from({ length: Math.min(sceneCount, 12) }).map((_, i) => (
              <div
                key={i}
                className="relative h-10 rounded-lg overflow-hidden border border-white/15"
                style={{ backgroundColor: i < Math.max(1, Math.floor((progress / 100) * sceneCount)) ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.05)' }}
              >
                <div className="absolute inset-0 loading-scanline" />
                <span className="absolute left-2 top-1 text-[10px] font-mono text-white/90">S{i + 1}</span>
              </div>
            ))}
          </div>

          <div className="w-full rounded-xl px-4 py-3 border border-white/15 bg-white/5">
            <p className="text-sm text-white/85">
              {genre && <span className="font-semibold text-amber-200">{genre} · </span>}
              "{prompt}"
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function estimateSceneCount(targetDurationSeconds: number): number {
  if (targetDurationSeconds <= 90) return 4
  if (targetDurationSeconds <= 300) return 6
  if (targetDurationSeconds <= 900) return 8
  if (targetDurationSeconds <= 1500) return 10
  return 12
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export default function CreatePage() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [prompt, setPrompt] = useState('')
  const [genre, setGenre] = useState('')
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(120)
  const [error, setError] = useState('')
  const [movieData, setMovieData] = useState<MovieData | null>(null)

  const sceneCount = estimateSceneCount(targetDurationSeconds)

  const handleGenerate = async () => {
    if (!prompt.trim() || appState === 'generating') return

    setAppState('generating')
    setError('')
    setMovieData(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

      const createRes = await fetch(`${apiUrl}/create-movie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          genre,
          scene_count: sceneCount,
          target_duration_seconds: targetDurationSeconds,
        }),
      })

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.detail || `Story generation failed (${createRes.status})`)
      }

      const createData = await createRes.json()

      const renderRes = await fetch(`${apiUrl}/render-movie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movie_title: createData.movie_title,
          scenes: createData.scenes,
          target_duration_seconds: targetDurationSeconds,
          voice_name: 'en-US-Wavenet-D',
        }),
      })

      if (!renderRes.ok) {
        const err = await renderRes.json().catch(() => ({}))
        throw new Error(err.detail || `Movie render failed (${renderRes.status})`)
      }

      const renderData = await renderRes.json()

      setMovieData({
        movie_title: createData.movie_title,
        genre: createData.genre,
        scenes: createData.scenes,
        video_uri: renderData.video_uri,
        actual_duration_seconds: renderData.actual_duration_seconds,
        target_duration_seconds: targetDurationSeconds,
      })

      setAppState('result')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setAppState('idle')
    }
  }

  const handleNew = () => {
    setAppState('idle')
    setMovieData(null)
    setError('')
    setPrompt('')
    setGenre('')
    setTargetDurationSeconds(120)
  }

  const handleSceneUpdate = (sceneNumber: number, patch: Partial<Scene>) => {
    setMovieData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        scenes: prev.scenes.map((scene) =>
          scene.scene_number === sceneNumber ? { ...scene, ...patch } : scene
        ),
      }
    })
  }

  const handleDownload = () => {
    if (!movieData) return
    const payload = {
      exported_at: new Date().toISOString(),
      ...movieData,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${movieData.movie_title.replace(/[^a-z0-9-_]+/gi, '_').toLowerCase() || 'movie'}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/beamer-logo.svg" alt="Beamer" width={30} height={30} />
          <span className="font-black tracking-widest text-sm uppercase">Beamer</span>
        </Link>
        {appState === 'result' && (
          <button onClick={handleNew} className="px-4 py-2 rounded border border-white/20 text-sm text-white/80 hover:text-white hover:border-white/40">
            New Story
          </button>
        )}
      </nav>

      {appState === 'idle' && (
        <main className="max-w-3xl mx-auto px-6 py-14">
          <h1 className="text-4xl font-black mb-2">Create a Full Movie</h1>
          <p className="text-white/60 mb-8">Generate a complete video with transitions and voiceover from one prompt.</p>

          <label className="block text-sm mb-2">Story Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            maxLength={800}
            placeholder="A sci-fi story where the first mission to Europa uncovers ancient signals under the ice..."
            className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-sm mb-6"
          />

          <label className="block text-sm mb-2">Genre (optional)</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(genre === g ? '' : g)}
                className={`px-4 py-2 rounded-full text-sm border ${genre === g ? 'bg-white text-black border-white' : 'text-white/70 border-white/20 hover:border-white/40'}`}
              >
                {g}
              </button>
            ))}
          </div>

          <label className="block text-sm mb-2">Movie Duration</label>
          <div className="rounded-lg border border-white/15 p-4 mb-6 bg-white/5">
            <input
              type="range"
              min={30}
              max={1800}
              step={30}
              value={targetDurationSeconds}
              onChange={(e) => setTargetDurationSeconds(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 flex justify-between text-xs text-white/60">
              <span>30s</span>
              <span className="text-white font-semibold">{formatDuration(targetDurationSeconds)}</span>
              <span>30m</span>
            </div>
            <p className="text-xs text-white/50 mt-2">Credits saver: ~{sceneCount} scenes with cinematic transitions and continuous VO.</p>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className={`w-full py-3 rounded-lg font-bold ${prompt.trim() ? 'bg-red-600 hover:bg-red-500' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
          >
            Generate Movie
          </button>
        </main>
      )}

      {appState === 'generating' && (
        <LoadingScreen
          prompt={prompt}
          genre={genre}
          sceneCount={sceneCount}
          targetDurationSeconds={targetDurationSeconds}
        />
      )}

      {appState === 'result' && movieData && (
        <main className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-3xl font-black">{movieData.movie_title}</h2>
              <p className="text-sm text-white/60">
                {movieData.genre || 'Drama'} • {movieData.scenes.length} scenes • {formatDuration(movieData.actual_duration_seconds || targetDurationSeconds)}
              </p>
            </div>
            <button onClick={handleDownload} className="px-4 py-2 rounded border border-white/20 text-sm text-white/80 hover:text-white hover:border-white/40">
              Download JSON
            </button>
          </div>

          {movieData.video_uri && (
            <div className="mb-8 rounded-xl overflow-hidden border border-white/10 bg-black">
              <video
                src={movieData.video_uri}
                controls
                preload="metadata"
                className="w-full h-auto"
              />
            </div>
          )}

          <MoviePlayer
            scenes={movieData.scenes}
            movieTitle={movieData.movie_title}
            genre={movieData.genre}
            onSceneUpdate={handleSceneUpdate}
          />
        </main>
      )}
    </div>
  )
}

