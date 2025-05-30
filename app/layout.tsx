import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { PWARegister } from '@/components/pwa-register'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuoteCraft Pro - Professional Painting Quotes',
  description: 'Professional painting quote generator for contractors. Create accurate estimates with AI assistance.',
  keywords: 'painting quotes, contractor software, estimate generator, painting business',
  authors: [{ name: 'QuoteCraft Pro' }],
  manifest: '/manifest.json',
  robots: 'index, follow',
  openGraph: {
    title: 'QuoteCraft Pro - Professional Painting Quotes',
    description: 'Professional painting quote generator for contractors',
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
          <PWARegister />
        </Providers>
      </body>
    </html>
  )
}
