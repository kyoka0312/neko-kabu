import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "猫とカブトムシ",
  description: "猫とカブトムシの体重・プロフィール・写真を記録するアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=JetBrains+Mono:wght@400;600&family=Klee+One:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink min-h-screen font-['Zen_Kaku_Gothic_New',sans-serif]">
        {children}
      </body>
    </html>
  );
}
