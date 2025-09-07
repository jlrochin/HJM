"use client"

// ============================================================================
// COMPONENTE: CAMBIO DE TEMA
// ============================================================================
// Este componente permite al usuario cambiar entre:
// - Tema claro
// - Tema oscuro  
// - Tema del sistema
// Incluye animaciones suaves usando Framer Motion
// ============================================================================

import { motion } from "framer-motion"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

// ============================================================================
// COMPONENTE PRINCIPAL: CAMBIO DE TEMA
// ============================================================================
export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  // ============================================================================
  // FUNCIÓN: DETERMINAR ÍCONO SEGÚN EL TEMA
  // ============================================================================
  // Retorna el ícono apropiado basado en el tema actual
  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-5 w-5" />
      case "system":
        return <Monitor className="h-5 w-5" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full">
          {/* ============================================================================
               ANIMACIÓN: ÍCONO DE TEMA CLARO
               ============================================================================ */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: theme === "light" ? 1 : 0,
              scale: theme === "light" ? 1 : 0.5,
              rotate: theme === "light" ? 0 : -30,
            }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>

          {/* ============================================================================
               ANIMACIÓN: ÍCONO DE TEMA OSCURO
               ============================================================================ */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: theme === "dark" ? 1 : 0,
              scale: theme === "dark" ? 1 : 0.5,
              rotate: theme === "dark" ? 0 : 30,
            }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>

          {/* ============================================================================
               ANIMACIÓN: ÍCONO DE TEMA DEL SISTEMA
               ============================================================================ */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: theme === "system" ? 1 : 0,
              scale: theme === "system" ? 1 : 0.5,
              rotate: theme === "system" ? 0 : 30,
            }}
            transition={{ duration: 0.3 }}
          >
            <Monitor className="h-5 w-5" />
          </motion.div>

          {/* Texto para lectores de pantalla */}
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>

      {/* ============================================================================
           MENÚ DESPLEGABLE DE OPCIONES DE TEMA
           ============================================================================ */}
      <DropdownMenuContent align="end">
        {/* Opción: Tema claro */}
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>

        {/* Opción: Tema oscuro */}
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Oscuro</span>
        </DropdownMenuItem>

        {/* Opción: Tema del sistema */}
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
