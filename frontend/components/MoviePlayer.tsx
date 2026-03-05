'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface Scene {
  scene_number: number
  title: string
  narration: string
  image_uri: string
  image_prompt?: string
}

interface MoviePlayerProps {
  scenes: Scene[]
  movieTitle: string
  genre?: string
  onSceneUpdate: (sceneNumber: number, patch: Partial<Scene>) => void
}

const AUTO_PLAY_MS = 7000
const VOICES = [
  { label: 'Narrator', value: 'en-US-Wavenet-D' },
  { label: 'Neutral', value: 'en-US-Wavenet-A' },
  { label: 'Warm', value: 'en-US-Wavenet-F' },
]

// ── Icons ─────────────────────────────────────────────────────────────────────
const PrevIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
  </svg>
)
const NextIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
  </svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" clipRule="evenodd"/>
  </svg>
)
const SpeakerIcon = ({ loading, playing }: { loading: boolean; playing: boolean }) => {
  if (loading) return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 animate-spin opacity-60">
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.26-3.673a.75.75 0 00.219-.53V2.979a.75.75 0 00-1.5 0V5.43l-.31-.31A7 7 0 003.239 8.158a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd"/>
    </svg>
  )
  if (playing) return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75z"/>
      <path d="M13.5 8a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0V8zM16.5 6a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0V6z"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z"/>
      <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z"/>
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MoviePlayer({ scenes, movieTitle, genre = '', onSceneUpdate }: MoviePlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [showFilmstrip, setShowFilmstrip] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState('en-US-Wavenet-D')
  const [regeneratingImage, setRegeneratingImage] = useState(false)
  const [regenerateError, setRegenerateError] = useState('')

  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const filmstripRef = useRef<HTMLDivElement | null>(null)

  const currentScene = scenes[currentIndex]
  const total = scenes.length

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= total || isTransitioning) return
    setIsTransitioning(true)
    setImgLoaded(false)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 250)
  }, [total, isTransitioning])

  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])
  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])

  // ── Scroll filmstrip to keep active thumb visible ───────────────────────────
  useEffect(() => {
    if (!filmstripRef.current) return
    const thumb = filmstripRef.current.children[currentIndex] as HTMLElement
    if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentIndex])

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === ' ') { e.preventDefault(); setIsAutoPlaying((v) => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  // ── Auto-play timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    if (!isAutoPlaying) return
    autoPlayTimerRef.current = setTimeout(() => {
      if (currentIndex < total - 1) {
        next()
      } else {
        setIsAutoPlaying(false)
      }
    }, AUTO_PLAY_MS)
    return () => { if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current) }
  }, [isAutoPlaying, currentIndex, total, next])

  // ── Stop audio on scene change ──────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current = null
      setAudioPlaying(false)
    }
  }, [currentIndex])

  // ── TTS narration ───────────────────────────────────────────────────────────
  const playNarration = async () => {
    if (!currentScene?.narration || audioLoading) return
    if (audioRef.current && audioPlaying) {
      audioRef.current.pause()
      setAudioPlaying(false)
      return
    }
    setAudioLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const res = await fetch(`${apiUrl}/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentScene.narration, voice_name: selectedVoice }),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data.audio_uri) {
        const audio = new Audio(data.audio_uri)
        audioRef.current = audio
        audio.onended = () => setAudioPlaying(false)
        audio.play()
        setAudioPlaying(true)
      }
    } catch {
      // Silently fail
    } finally {
      setAudioLoading(false)
    }
  }

  const regenerateSceneImage = async () => {
    if (!currentScene || regeneratingImage) return
    setRegenerateError('')
    setRegeneratingImage(true)
    try {
      const imagePrompt =
        currentScene.image_prompt?.trim() ||
        `Cinematic still frame, scene title: ${currentScene.title}. Narration context: ${currentScene.narration}`
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const res = await fetch(`${apiUrl}/regenerate-scene-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_prompt: imagePrompt, genre }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      if (!data.image_uri) throw new Error('No image URL returned')
      onSceneUpdate(currentScene.scene_number, { image_uri: data.image_uri })
      setImgLoaded(false)
    } catch (err: any) {
      setRegenerateError(err?.message || 'Failed to regenerate frame')
    } finally {
      setRegeneratingImage(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full select-none">

      {/* ── Scene image ── */}
      <div
        className="relative w-full overflow-hidden rounded-lg"
        style={{ aspectRatio: '16/9', backgroundColor: '#0a0a0a' }}
      >
        {/* Image skeleton */}
        {!imgLoaded && currentScene?.image_uri && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: 'linear-gradient(110deg, #111 30%, #1a1a1a 50%, #111 70%)' }}
          />
        )}

        {/* Scene image */}
        {currentScene?.image_uri ? (
          <Image
            key={currentScene.image_uri}
            src={currentScene.image_uri}
            alt={currentScene.title}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover transition-opacity duration-400"
            style={{ opacity: isTransitioning || !imgLoaded ? 0 : 1 }}
            onLoad={() => setImgLoaded(true)}
            priority={currentIndex === 0}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: '#111' }}>
            <Image src="/beamer-logo.svg" alt="" width={36} height={36} style={{ opacity: 0.2 }} />
            <p className="text-[#333] text-xs">Image unavailable for this scene</p>
          </div>
        )}

        {/* Auto-play progress bar */}
        {isAutoPlaying && (
          <div
            key={`progress-${currentIndex}`}
            className="absolute bottom-0 left-0 h-0.5 rounded-full"
            style={{
              backgroundColor: '#E50914',
              animation: `fill-width ${AUTO_PLAY_MS}ms linear forwards`,
            }}
          />
        )}

        {/* Cinematic gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.1) 45%, transparent 65%)' }}
        />

        {/* Top-left: Movie title */}
        <div className="absolute top-4 left-5">
          <span className="text-white/40 text-xs uppercase tracking-widest font-medium" style={{ fontSize: '0.65rem' }}>
            {movieTitle}
          </span>
        </div>

        {/* Top-right: Scene counter */}
        <div className="absolute top-4 right-5">
          <span className="font-mono text-white/40" style={{ fontSize: '0.7rem' }}>
            {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        {/* Bottom: Scene title */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 py-5 transition-opacity duration-300"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1" style={{ fontSize: '0.65rem' }}>
            Scene {currentScene?.scene_number}
          </p>
          <h2 className="text-white font-bold" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
            {currentScene?.title}
          </h2>
        </div>

        {/* Prev / Next overlay arrows */}
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          aria-label="Previous scene"
          className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity disabled:hidden"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)' }}
        >
          <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <PrevIcon />
          </div>
        </button>
        <button
          onClick={next}
          disabled={currentIndex === total - 1}
          aria-label="Next scene"
          className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity disabled:hidden"
          style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.5), transparent)' }}
        >
          <div className="p-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <NextIcon />
          </div>
        </button>
      </div>

      {/* ── Narration ── */}
      <div className="mt-4 transition-opacity duration-300" style={{ opacity: isTransitioning ? 0 : 1 }}>
        <p className="leading-relaxed" style={{ color: '#888', fontSize: '0.9375rem' }}>
          {currentScene?.narration}
        </p>
      </div>

      {/* ── Controls bar ── */}
      <div className="mt-5 flex items-center justify-between gap-4">
        {/* Left: Prev / Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            aria-label="Previous scene"
            className="p-2 rounded transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
            onMouseEnter={(e) => { if (currentIndex > 0) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <PrevIcon />
          </button>
          <button
            onClick={next}
            disabled={currentIndex === total - 1}
            aria-label="Next scene"
            className="p-2 rounded transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
            onMouseEnter={(e) => { if (currentIndex < total - 1) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <NextIcon />
          </button>
        </div>

        {/* Center: dot nav */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Scene ${i + 1}`}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === currentIndex ? '18px' : '6px',
                height: '6px',
                backgroundColor: i === currentIndex ? '#E50914' : 'rgba(255,255,255,0.18)',
              }}
            />
          ))}
        </div>

        {/* Right: TTS + Auto-play + Filmstrip toggle */}
        <div className="flex items-center gap-2">
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="px-2.5 py-2 rounded text-xs"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#999',
              backgroundColor: 'transparent',
            }}
            aria-label="Narration voice"
          >
            {VOICES.map((voice) => (
              <option key={voice.value} value={voice.value} style={{ color: '#111' }}>
                {voice.label}
              </option>
            ))}
          </select>

          <button
            onClick={playNarration}
            disabled={audioLoading}
            aria-label={audioPlaying ? 'Stop narration' : 'Play narration'}
            title={audioPlaying ? 'Stop narration' : 'Play narration'}
            className="p-2 rounded transition-all"
            style={{
              border: `1px solid ${audioPlaying ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: audioPlaying ? '#E50914' : '#666',
              backgroundColor: audioPlaying ? 'rgba(229,9,20,0.08)' : 'transparent',
            }}
          >
            <SpeakerIcon loading={audioLoading} playing={audioPlaying} />
          </button>

          <button
            onClick={regenerateSceneImage}
            disabled={regeneratingImage}
            title="Regenerate this scene image"
            className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all"
            style={{
              border: `1px solid ${regeneratingImage ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: regeneratingImage ? '#E50914' : '#666',
              backgroundColor: regeneratingImage ? 'rgba(229,9,20,0.08)' : 'transparent',
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 ${regeneratingImage ? 'animate-spin' : ''}`}>
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.26-3.673a.75.75 0 00.219-.53V2.979a.75.75 0 00-1.5 0V5.43l-.31-.31A7 7 0 003.239 8.158a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd"/>
            </svg>
            <span className="hidden sm:inline">{regeneratingImage ? 'Regenerating' : 'New Frame'}</span>
          </button>

          <button
            onClick={() => setIsAutoPlaying((v) => !v)}
            aria-label={isAutoPlaying ? 'Pause auto-play' : 'Auto-play all scenes'}
            title={isAutoPlaying ? 'Pause (Space)' : 'Auto-play (Space)'}
            className="flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all"
            style={{
              border: `1px solid ${isAutoPlaying ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: isAutoPlaying ? '#E50914' : '#666',
              backgroundColor: isAutoPlaying ? 'rgba(229,9,20,0.08)' : 'transparent',
            }}
          >
            {isAutoPlaying ? <PauseIcon /> : <PlayIcon />}
            <span className="hidden sm:inline">{isAutoPlaying ? 'Pause' : 'Auto-play'}</span>
          </button>

          {/* Filmstrip toggle */}
          <button
            onClick={() => setShowFilmstrip((v) => !v)}
            title={showFilmstrip ? 'Hide filmstrip' : 'Show filmstrip'}
            className="p-2 rounded transition-all hidden sm:flex"
            style={{
              border: `1px solid ${showFilmstrip ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
              color: showFilmstrip ? '#ccc' : '#444',
            }}
          >
            {/* Film icon */}
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Filmstrip ── */}
      {showFilmstrip && (
        <div className="mt-4 hidden sm:block">
          <div
            ref={filmstripRef}
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {scenes.map((scene, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Jump to scene ${i + 1}: ${scene.title}`}
                className="relative flex-shrink-0 rounded overflow-hidden transition-all"
                style={{
                  width: '96px',
                  aspectRatio: '16/9',
                  outline: i === currentIndex ? '2px solid #E50914' : '2px solid transparent',
                  outlineOffset: '2px',
                  opacity: i === currentIndex ? 1 : 0.5,
                }}
                onMouseEnter={(e) => { if (i !== currentIndex) (e.currentTarget as HTMLElement).style.opacity = '0.8' }}
                onMouseLeave={(e) => { if (i !== currentIndex) (e.currentTarget as HTMLElement).style.opacity = '0.5' }}
              >
                {scene.image_uri ? (
                  <Image
                    src={scene.image_uri}
                    alt={scene.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ backgroundColor: '#1a1a1a' }} />
                )}
                {/* Scene number overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-1.5 py-1"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}
                >
                  <span className="text-white font-mono" style={{ fontSize: '0.55rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {regenerateError && (
        <p className="mt-3 text-center text-xs" style={{ color: '#b91c1c' }}>
          {regenerateError}
        </p>
      )}
      {/* ── Keyboard hint ── */}
      <p className="mt-4 text-center text-[#333] text-xs">
        ← → to navigate &nbsp;·&nbsp; Space to toggle auto-play
      </p>
    </div>
  )
}
