import type React from "react"
import type { Metadata } from "next"
import { Inter, Syne } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Prepwise — AI Mock Interviewer",
  description:
    "Practice real interviews with your AI voice interviewer. Get instant feedback, land your dream job.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
