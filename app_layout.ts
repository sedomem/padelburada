import type { Metadata } from "next";
import { Public_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "PadelBurada — Türkiye'nin Padel Kort Platformu",
    template: "%s | PadelBurada",
  },
  description: "Türkiye'deki padel kortlarını bul, rezervasyon yap, değerlendir. İstanbul, Ankara, İzmir ve daha fazlası.",
  keywords: ["padel", "padel kort", "padel rezervasyon", "padel türkiye", "kort bul"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://padelburada.com",
    siteName: "PadelBurada",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${publicSans.variable} ${manrope.variable}`}>
      <body className="bg-surface text-on-surface font-body antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#2A2A2A",
                color: "#E5E2E1",
                border: "none",
              },
              success: { iconTheme: { primary: "#C3F400", secondary: "#283500" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
