import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Roblog — AI Blog Generator',
  description: 'Generate SEO-optimized blog posts with local LLMs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
