import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from '@/components/shared/Providers'
import './globals.css'

const rubik = Rubik({
  subsets: ['latin', 'hebrew'],
  variable: '--font-rubik-gf',
  weight: ['300', '400', '500', '600', '700', '800'],
})

import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#9333ea',
}

export const metadata: Metadata = {
  title: 'מועדון באולינג - מערכת ניהול',
  description: 'מערכת ניהול מועדון לקוחות לבאולינג',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'באולינג קלאב',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body className={`${rubik.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Rubik, sans-serif',
              direction: 'rtl',
            },
          }}
        />
      </body>
    </html>
  )
}
