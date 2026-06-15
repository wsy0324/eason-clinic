import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "陈医生音乐门诊 | Eason Music Clinic",
  description:
    "感谢永远有歌把心境道破。一个深夜音乐门诊，用陈奕迅的歌，给今天的心情开一张处方。",
  keywords: ["陈奕迅", "Eason Chan", "音乐门诊", "情绪", "处方", "歌曲推荐"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-HK"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-clinic-dark text-foreground">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#2c2416",
              color: "#fef9e7",
              border: "1px solid #8b7355",
            },
          }}
        />
      </body>
    </html>
  );
}
