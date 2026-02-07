import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Analytics } from '@vercel/analytics/react';
import PageViewTracker from "@/components/PageViewTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'しらないみちへ - Unknown Roads',
    template: '%s | しらないみちへ',
  },
  description: 'A bilingual travel blog exploring Japanese culture and destinations',
  openGraph: {
    type: 'website',
    siteName: 'しらないみちへ (Unknown Roads)',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@your_twitter_handle',
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
          <PageViewTracker />
        </AuthProvider>
      </body>
    </html>
  );
}