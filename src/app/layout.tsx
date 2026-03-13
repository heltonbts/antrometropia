import type { Metadata } from "next"
import { IBM_Plex_Mono, Manrope } from "next/font/google"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "NutriEval — Avaliação Física para Nutricionistas",
  description: "Plataforma SaaS de avaliação física antropométrica para nutricionistas",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${plexMono.variable}`}>{children}</body>
    </html>
  )
}
