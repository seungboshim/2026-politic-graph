import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import AvatarDefs from "@/components/ui/AvatarDefs";
import AppHeader from "@/components/ui/AppHeader";
import AdsenseScript from "@/components/ads/AdsenseScript";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_KEYWORDS } from "@/lib/site";

// 자동 self-host + preload + 메트릭 보정 폴백으로 웹폰트 로드에 의한 레이아웃 시프트(CLS) 제거.
const bookk = localFont({
  src: [
    { path: "./fonts/BookkGothic-Light.woff2", weight: "400", style: "normal" },
    { path: "./fonts/BookkGothic-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-bookk",
  // 폰트 로드 전/누락 글리프(임의 한글 댓글)용 폴백 — 한글 시스템 폰트 우선
  fallback: ["Apple SD Gothic Neo", "Pretendard", "Malgun Gothic", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  category: "정치",
  verification: { google: "WfurLEx8DMdzVIYgL3WkE3MKDHxfGOjPt4eajUNV7OU" },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  inLanguage: "ko-KR",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${bookk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <AdsenseScript />
        <AvatarDefs />
        <AppHeader />
        {children}
        <footer className="mt-auto border-t border-border px-4 py-6 text-center">
          <Link href="/privacy" className="font-mono text-label01 text-foreground-faint hover:text-foreground-subtle">개인정보처리방침</Link>
        </footer>
      </body>
    </html>
  );
}
