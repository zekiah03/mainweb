import type { Metadata } from 'next'
import './globals.css'
import { AuthInit } from '@/components/AuthInit'

export const metadata: Metadata = {
  title: 'Solnova Lab',
  description: 'デジタルツインで自分を深く理解する',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthInit />
        {children}
      </body>
    </html>
  )
}
