import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Outfit } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Providers } from '@/components/layout/providers'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'Shake Memories - Erinnerungen die bleiben',
  description:
    'Teile deine Erinnerungen an das K-Shake, Vabrik & Shake. 35 Jahre Clubkultur in Rothis - erzähle deine Geschichte.',
  keywords: ['K-Shake', 'Shake', 'Vabrik', 'Rothis', 'Vorarlberg', 'Nachtclub', 'Erinnerungen'],
  openGraph: {
    title: 'Shake Memories',
    description: '35 Jahre Clubkultur - Deine Erinnerungen an das Shake',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${spaceGrotesk.variable} ${outfit.variable} dark`}>
      <body className="min-h-dvh bg-shake-black text-shake-text font-sans antialiased">
        <Providers>
          <main className="pb-20">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
