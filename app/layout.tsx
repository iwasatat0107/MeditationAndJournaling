import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "瞑想+メモ書き",
  description: "瞑想とメモ書きの記録アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
