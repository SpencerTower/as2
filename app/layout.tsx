import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleTagManager } from '@next/third-parties/google';
import '../styles/globals.css';
import { siteConfig } from '@/config/site';

const GA_MEASUREMENT_ID = 'G-CS5XEFS7KQ';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [
    {
      name: 'Rob Bearman',
      url: 'https://hyperfine.com',
    },
  ],
  creator: 'Rob Bearman',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 300,
        height: 300,
        alt: siteConfig.name,
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@AtlasphereApp',
  },
  icons: {
    icon: '/images/icons/atlasphere-tab-icon.png',
  }
}

interface RootLayoutProps {
  children: React.ReactNode,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>{children}</body>
      <GoogleTagManager gtmId={GA_MEASUREMENT_ID} />
    </html>
  );
}
