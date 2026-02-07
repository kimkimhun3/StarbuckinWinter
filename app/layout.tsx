// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}