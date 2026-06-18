import type { Metadata } from "next";
import "./globals.css";
import AvatarDefs from "@/components/ui/AvatarDefs";
import AppHeader from "@/components/ui/AppHeader";

export const metadata: Metadata = {
  title: "정치성향 테스트 — 나와 가장 가까운 정치인은?",
  description: "18문항 내외로 알아보는 세분화된 나의 정치 유형",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AvatarDefs />
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
