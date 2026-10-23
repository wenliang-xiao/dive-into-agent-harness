import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { RunnerConfigButton, RunnerConfigProvider } from "@/components/runner-config";
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
  title: "动手学智能体框架 · Dive into Agent Harness",
  description:
    "一本交互式书 + 刷题平台，教你 agent harness——把 LLM 变成 agent 的那层框架。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-bg text-ink">
        <RunnerConfigProvider>
          <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
              <Link href="/" className="font-semibold tracking-tight">
                动手学智能体框架
                <span className="ml-2 text-sm font-normal text-muted">
                  Dive into Agent Harness
                </span>
              </Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link href="/" className="text-muted transition-colors hover:text-ink">
                  目录
                </Link>
                <Link href="/progress" className="text-muted transition-colors hover:text-ink">
                  进度
                </Link>
                <Link href="/mistakes" className="text-muted transition-colors hover:text-ink">
                  错题本
                </Link>
                <RunnerConfigButton />
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line py-6 text-center text-sm text-muted">
            致敬李沐《动手学深度学习》（d2l.ai）· MIT License
          </footer>
        </RunnerConfigProvider>
      </body>
    </html>
  );
}
