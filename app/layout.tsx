// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-jp",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shiranai-michi.com'),
  title: {
    default: 'Shiranai Michi - みちへしらない | Unknown Roads',
    template: '%s | Shiranai Michi',
  },
  description: 'Shiranai Michi (みちへしらない) - A bilingual travel blog exploring Japanese culture, hidden destinations, and authentic travel experiences in Japan.',
  keywords: [
    'Shiranai Michi',
    'shiranai-michi',
    'みちへしらない',
    'Unknown Roads',
    'Japan travel blog',
    'Japanese culture',
    'Japan destinations',
    'travel Japan',
    'Japan tourism',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Shiranai Michi - Unknown Roads',
    locale: 'en_US',
    url: 'https://shiranai-michi.com',
    title: 'Shiranai Michi - Unknown Roads',
    description: 'Explore Japan through authentic travel stories and cultural insights',
    images: [
      {
        url: 'https://res.cloudinary.com/duvusa8ck/image/upload/v1768729098/profile_anvogi.png',
        width: 1200,
        height: 630,
        alt: 'Shiranai Michi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shiranai Michi - Unknown Roads',
    description: 'Explore Japan through authentic travel stories',
    images: ['https://res.cloudinary.com/duvusa8ck/image/upload/v1768729098/profile_anvogi.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${notoSerifJP.variable} antialiased bg-paper text-ink dark:bg-midnight dark:text-paper transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}