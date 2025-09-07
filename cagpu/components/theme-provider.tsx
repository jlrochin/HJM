"use client"

// ============================================================================
// COMPONENTE: PROVEEDOR DE TEMA
// ============================================================================
// Este componente envuelve la aplicación para proporcionar
// funcionalidad de cambio de tema (claro/oscuro/sistema)
// Utiliza next-themes para la gestión del estado del tema
// ============================================================================

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// ============================================================================
// COMPONENTE PRINCIPAL: PROVEEDOR DE TEMA
// ============================================================================
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
