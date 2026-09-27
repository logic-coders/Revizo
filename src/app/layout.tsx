import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BookmarkProvider } from "@/components/BookmarkProvider";
import Header from "@/components/Header";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming out on mobile
};

export const metadata: Metadata = {
  title: "Revizo — AI-Powered Interview Prep for Software Engineers",
  description:
    "Master your software engineering interviews with AI-curated questions and structured answers across Java, Spring Boot, Python, Kafka, Redis, and more. Quick, structured, last-minute revision.",
  manifest: "/manifest.json",
  keywords: [
    "software engineer interview",
    "java interview questions",
    "spring boot interview",
    "python interview questions",
    "coding interview prep",
    "AI curated questions",
  ],
  openGraph: {
    title: "Revizo — AI-Powered Interview Prep",
    description:
      "AI-curated interview questions with structured answers for software engineers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <BookmarkProvider>
            <Header />
            <main className="main-content">{children}</main>
          </BookmarkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
