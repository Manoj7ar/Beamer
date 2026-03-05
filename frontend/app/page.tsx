'use client'

import Link from 'next/link'
import Image from 'next/image'

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  cream:   '#F5F0E8',
  white:   '#FFFFFF',
  black:   '#0a0a0a',
  ink:     '#1a1a1a',
  sub:     '#555555',
  muted:   '#999999',
  border:  'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.06)',
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      style={{ backgroundColor: C.cream, borderBottom: `1px solid ${C.border}` }}
    >
      <a href="#hero" className="flex items-center gap-3">
        <Image src="/beamer-logo.svg" alt="Beamer" width={30} height={30} priority />
        <span className="font-black tracking-widest text-sm uppercase" style={{ color: C.black }}>Beamer</span>
      </a>
      <div className="flex items-center gap-6">
        <a href="#technology" className="text-sm transition-colors hidden sm:block" style={{ color: C.sub }}
          onMouseEnter={e => (e.currentTarget.style.color = C.black)}
          onMouseLeave={e => (e.currentTarget.style.color = C.sub)}>Technology</a>
        <a href="#how-it-works" className="text-sm transition-colors hidden sm:block" style={{ color: C.sub }}
          onMouseEnter={e => (e.currentTarget.style.color = C.black)}
          onMouseLeave={e => (e.currentTarget.style.color = C.sub)}>How It Works</a>
        <Link
          href="/create"
          className="px-5 py-2 text-sm font-semibold rounded transition-all"
          style={{ backgroundColor: C.black, color: C.white }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#333')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = C.black)}
        >
          Create a Film
        </Link>
      </div>
    </nav>
  )
}

// ─── Section 1: Hero ──────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24"
      style={{ backgroundColor: C.cream }}
    >
      {/* Faint grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="animate-float mb-10">
          <Image src="/beamer-logo.svg" alt="Beamer" width={80} height={80} priority />
        </div>

        {/* Eyebrow */}
        <p className="animate-fade-in mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>
          AI Cinematic Storytelling
        </p>

        {/* Wordmark */}
        <h1
          className="animate-slide-up font-black uppercase text-center leading-none"
          style={{
            fontSize: 'clamp(5rem, 15vw, 11rem)',
            letterSpacing: '-0.04em',
            color: C.black,
          }}
        >
          BEAMER
        </h1>

        {/* Tagline */}
        <p
          className="animate-slide-up-delay-1 mt-5 font-light italic"
          style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: C.sub }}
        >
          Your Story. On Screen.
        </p>

        {/* Description */}
        <p
          className="animate-slide-up-delay-2 mt-5 max-w-lg leading-relaxed"
          style={{ fontSize: '0.9375rem', color: C.muted }}
        >
          Turn any idea into a full cinematic story film — AI-written scenes, Imagen visuals,
          and voiceover narration — in under two minutes.
        </p>

        {/* CTAs */}
        <div className="animate-slide-up-delay-3 mt-10 flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-10 py-4 font-bold rounded text-base transition-all hover:scale-105"
            style={{ backgroundColor: C.black, color: C.white }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#333')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = C.black)}
          >
            Start Creating
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </Link>
          <a
            href="#technology"
            className="inline-flex items-center gap-2 px-8 py-4 rounded text-base transition-all font-medium"
            style={{ border: `1.5px solid ${C.black}`, color: C.black, backgroundColor: 'transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = C.black
              ;(e.currentTarget as HTMLElement).style.color = C.white
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = C.black
            }}
          >
            Learn More
          </a>
        </div>

        {/* Stat strip */}
        <div
          className="animate-fade-in mt-16 flex items-center gap-8 flex-wrap justify-center px-10 py-5 rounded-2xl"
          style={{
            backgroundColor: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >
          {[
            { value: '< 2 min', label: 'Generation time' },
            { value: '8 scenes', label: 'Per story film' },
            { value: 'Imagen 3', label: 'AI visuals' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-black text-xl" style={{ color: C.black }}>{value}</p>
              <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: C.muted }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle flex flex-col items-center gap-1.5">
        <span className="text-xs uppercase tracking-widest" style={{ color: C.muted }}>Scroll</span>
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5" style={{ color: C.muted }}>
          <path d="M6 9L1 4h10L6 9z"/>
        </svg>
      </div>
    </section>
  )
}

// ─── Section 2: Technology & Mission ─────────────────────────────────────────
const TECH_STACK = [
  {
    name: 'Gemini 2.0 Flash',
    role: 'AI Director',
    description: 'Writes the full cinematic script, crafts scene narration, and generates detailed image prompts — all from your single sentence.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Imagen 3',
    role: 'Visual Storytelling',
    description: 'Generates photorealistic, cinematic-quality scene images. Every frame feels like it belongs in a real film production.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="14" rx="2"/>
        <path d="M9 9l6 3-6 3V9z" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: 'Google Cloud TTS',
    role: 'The Narrator',
    description: 'Gives every scene a voice. Natural WaveNet narration brings your story to life with the feel of a real documentary voiceover.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
  },
  {
    name: 'Cloud Run + ADK',
    role: 'Always On',
    description: 'Serverless Google Cloud infrastructure. Beamer orchestrates a multi-agent pipeline — Director, Illustrator, Narrator — reliably at scale.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

function TechnologySection() {
  return (
    <section
      id="technology"
      className="py-32 px-6"
      style={{ backgroundColor: C.white }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>Technology &amp; Mission</span>
          <h2
            className="mt-4 font-black leading-none"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em', color: C.black }}
          >
            Cinema belongs
            <br />
            to everyone.
          </h2>
          <p className="mt-6 leading-relaxed max-w-xl" style={{ fontSize: '1.0625rem', color: C.sub }}>
            For a century, visual storytelling meant a crew, a budget, and years of work.
            Beamer changes that. Using Google&apos;s most advanced AI — Gemini, Imagen, and Cloud TTS —
            we turn a single sentence into a full cinematic experience in under two minutes.
            No camera. No crew. Just your idea.
          </p>
        </div>

        {/* Tech cards */}
        <div className="grid sm:grid-cols-2 gap-3">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="p-7 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.7)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.65)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.45)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="mt-0.5 p-2.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: C.black, color: C.white }}
                >
                  {tech.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-base" style={{ color: C.black }}>{tech.name}</h3>
                    <span className="text-xs font-medium" style={{ color: C.muted }}>— {tech.role}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: C.sub }}>{tech.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ADK callout */}
        <div
          className="mt-4 px-7 py-5 rounded-xl flex items-center gap-4"
          style={{
            backgroundColor: 'rgba(10,10,10,0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex-shrink-0">
            <Image src="/beamer-logo.svg" alt="Beamer" width={34} height={34} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Built with the{' '}
            <span style={{ color: C.white, fontWeight: 600 }}>Google Agent Development Kit (ADK)</span>
            , Beamer orchestrates a multi-agent pipeline: a Director agent writes the script,
            an Illustrator agent generates the visuals, and TTS narrates every scene —
            all on{' '}
            <span style={{ color: C.white, fontWeight: 600 }}>Google Cloud Run</span>.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Section 3: How It Works ──────────────────────────────────────────────────
const STEPS = [
  {
    number: '01',
    title: 'Write Your Vision',
    description: 'Type anything. "A WWII epic about D-Day." "A sci-fi love story on Mars." "A documentary about deep-sea creatures." One sentence is all it takes.',
    detail: 'Add an optional genre — Documentary, Drama, Action, Sci-Fi, Fantasy, or Horror — to shape the visual style.',
  },
  {
    number: '02',
    title: 'AI Directs Your Movie',
    description: 'Gemini writes a full cinematic script with titles and narration. Imagen generates a stunning visual for each scene. TTS voices the story.',
    detail: 'The entire pipeline runs in under two minutes on Google Cloud infrastructure.',
  },
  {
    number: '03',
    title: 'Watch Your Story',
    description: 'A cinematic movie player presents your film scene by scene. Navigate manually, auto-play with timed transitions, or listen to the narration.',
    detail: 'Every movie you create is unique — the same prompt generates a different film every time.',
  },
]

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-32 px-6"
      style={{ backgroundColor: C.cream }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>How It Works</span>
          <h2
            className="mt-4 font-black"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em', lineHeight: 1, color: C.black }}
          >
            From idea to premiere
            <br />
            in three acts.
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="group relative flex gap-8 p-8 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.75)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.7)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.5)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'
              }}
            >
              {/* Big step number */}
              <div
                className="flex-shrink-0 font-black select-none leading-none"
                style={{ fontSize: 'clamp(3.5rem, 7vw, 5.5rem)', color: 'rgba(0,0,0,0.06)' }}
              >
                {step.number}
              </div>
              {/* Content */}
              <div className="flex-1 py-2">
                <h3 className="font-bold text-xl mb-3" style={{ color: C.black }}>{step.title}</h3>
                <p className="leading-relaxed mb-3" style={{ fontSize: '0.9375rem', color: C.sub }}>{step.description}</p>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{step.detail}</p>
              </div>
              {/* Left accent */}
              <div
                className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: C.black }}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-sm mb-6" style={{ color: C.muted }}>No account needed. No credit card. Just your imagination.</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-12 py-5 font-bold text-base rounded transition-all hover:scale-105"
            style={{ backgroundColor: C.black, color: C.white }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#333')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = C.black)}
          >
            Make Your First Movie
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Section 4: Footer ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="py-16 px-6"
      style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}` }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image src="/beamer-logo.svg" alt="Beamer" width={26} height={26} />
              <span className="font-black tracking-widest text-sm uppercase" style={{ color: C.black }}>Beamer</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: C.muted }}>
              AI-powered cinematic storytelling. Turn any prompt into a story film.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'rgba(0,0,0,0.25)' }}>Navigation</span>
            <a href="#hero" className="text-sm transition-colors" style={{ color: C.sub }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)} onMouseLeave={e => (e.currentTarget.style.color = C.sub)}>Home</a>
            <a href="#technology" className="text-sm transition-colors" style={{ color: C.sub }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)} onMouseLeave={e => (e.currentTarget.style.color = C.sub)}>Technology</a>
            <a href="#how-it-works" className="text-sm transition-colors" style={{ color: C.sub }}
              onMouseEnter={e => (e.currentTarget.style.color = C.black)} onMouseLeave={e => (e.currentTarget.style.color = C.sub)}>How It Works</a>
            <Link href="/create" className="text-sm font-semibold transition-colors" style={{ color: C.black }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
              Create a Film →
            </Link>
          </div>

          {/* Built with */}
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'rgba(0,0,0,0.25)' }}>Built With</span>
            {['Gemini 2.0 Flash', 'Imagen 3', 'Google Cloud TTS', 'Cloud Run', 'Google ADK'].map(t => (
              <span key={t} className="text-sm" style={{ color: C.muted }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <p className="text-xs" style={{ color: C.muted }}>
            Built for the <span style={{ color: C.sub }}>Gemini Live Agent Challenge</span> — Creative Storyteller Track · March 2026
          </p>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.25)' }}>© 2026 Beamer. Powered by Google Cloud &amp; Gemini.</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ backgroundColor: C.cream, minHeight: '100vh' }}>
      <Nav />
      <HeroSection />
      <TechnologySection />
      <HowItWorksSection />
      <Footer />
    </div>
  )
}
