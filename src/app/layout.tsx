import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ITS AI - Semua Fitur AI dalam Satu Aplikasi",
  description: "ITS AI gratis dengan fitur Chat, Image Generation, Text-to-Speech, dan Video Generation. 100% GRATIS untuk prototyping.",
  keywords: ["AI", "Chatbot", "Image Generation", "Text to Speech", "Video Generation", "Free AI", "ITS Academic"],
  authors: [{ name: "PT ITS Academic Technology" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ITS AI",
    description: "Semua fitur AI dalam satu aplikasi - 100% GRATIS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ITS AI",
    description: "Semua fitur AI dalam satu aplikasi - 100% GRATIS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
