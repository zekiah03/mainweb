import type { Metadata } from 'next'
import { IBM_Plex_Sans_JP, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { AuthInit } from '@/components/AuthInit'
import { Sidebar } from '@/components/Sidebar'
import { FogBackground } from '@/components/FogBackground'

const sans = IBM_Plex_Sans_JP({
  weight: ['300', '400', '500'],
  preload: false,
  variable: '--font-sans',
})

const mono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Solnova Lab',
  description: 'デジタルツインで自分を深く理解する',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${sans.variable} ${mono.variable}`}>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#050508',
        overflow: 'hidden',
        height: '100vh',
      }}>
        <AuthInit />
        <FogBackground />
        <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 1 }}>
          <Sidebar />
          <main style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
