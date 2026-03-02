import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'igniteHER – STEM Mentorship for Girls',
  description: 'Personalized STEM mentorship, career guidance, and role model inspiration for female students. Explore careers in AI, biotech, cybersecurity, aerospace, and more.',
  keywords: 'STEM, women in STEM, mentorship, career guidance, girls in tech, AI, coding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
