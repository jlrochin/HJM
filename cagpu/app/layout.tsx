// ============================================================================
// LAYOUT PRINCIPAL DE LA APLICACIÓN CAGPU
// ============================================================================
// Este archivo define la estructura base de la aplicación Next.js
// Incluye:
// - Configuración de metadatos y SEO
// - Fuente tipográfica (Inter)
// - Proveedor de tema (claro/oscuro)
// - Estructura HTML base
// ============================================================================

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

// ============================================================================
// CONFIGURACIÓN DE FUENTE
// ============================================================================
const inter = Inter({ subsets: ["latin"] })

// ============================================================================
// METADATOS DE LA APLICACIÓN
// ============================================================================
export const metadata: Metadata = {
  title: "CAGPU - Catálogo de Atención",
  description: "Sistema de gestión CAGPU - Catálogo de Atención",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo_cagpu_sintexto.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo_cagpu_sintexto.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logo_cagpu_sintexto.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/logo_cagpu_sintexto.png',
    },
  },
}

// ============================================================================
// COMPONENTE PRINCIPAL DEL LAYOUT
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Proveedor de tema para funcionalidad claro/oscuro */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
