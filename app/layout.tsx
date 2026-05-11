import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'
import { AuthInit } from '@/components/AuthInit'

const FogBackground = dynamic(
  () => import('@/components/FogBackground').then((m) => ({ default: m.FogBackground })),
  { ssr: false }
)

const Sidebar = dynamic(
  () => import('@/components/Sidebar').then((m) => ({ default: m.Sidebar })),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Solnova Lab',
  description: 'デジタルツインで自分を深く理解する',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
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
