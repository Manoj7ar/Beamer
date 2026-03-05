import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Beamer — AI Movie Maker',
  description: 'Create cinematic AI-generated movies from any prompt. Powered by Gemini 2.0 Flash and Google Cloud.',
  icons: {
    icon: [
      { url: '/beamer-logo.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ backgroundColor: '#0d0d0d' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: '#0d0d0d', color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
