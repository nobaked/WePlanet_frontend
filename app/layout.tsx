import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "We Planet",
  description: "みんなで地球を守ろう！"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body
        className="min-h-screen bg-gradient-to-br from-brand-gradientStart via-brand-gradientMid to-brand-gradientEnd antialiased"
      >
        <div className="container mx-auto px-4 py-10">{children}</div>
      </body>
    </html>
  );
}
