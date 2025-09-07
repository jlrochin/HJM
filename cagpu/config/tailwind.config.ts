import type { Config } from "tailwindcss"

// ============================================================================
// CONFIGURACIÓN DE TAILWIND CSS PARA CAGPU
// ============================================================================
// Esta configuración define:
// - Modo oscuro basado en clases CSS
// - Rutas de contenido para purging de CSS
// - Sistema de colores personalizado
// - Animaciones y keyframes
// - Plugins adicionales
// ============================================================================

const config = {
  // ============================================================================
  // CONFIGURACIÓN BÁSICA
  // ============================================================================
  darkMode: ["class"], // Modo oscuro basado en clases CSS
  
  // Rutas donde Tailwind buscará clases para purging
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  
  prefix: "", // Sin prefijo para las clases
  
  // ============================================================================
  // CONFIGURACIÓN DEL TEMA
  // ============================================================================
  theme: {
    // Configuración del contenedor principal
    container: {
      center: true,        // Centrar contenedor
      padding: "2rem",     // Padding horizontal
      screens: {
        "2xl": "1400px",   // Breakpoint para pantallas extra grandes
      },
    },
    
    // Extensiones del tema por defecto
    extend: {
      // ============================================================================
      // SISTEMA DE COLORES PERSONALIZADO
      // ============================================================================
      colors: {
        // Colores base del sistema de diseño
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Colores primarios
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        
        // Colores secundarios
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        // Colores destructivos (errores, alertas)
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        // Colores silenciados (texto secundario)
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Colores de acento
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        
        // Colores para popovers y tooltips
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        // Colores para tarjetas
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // ============================================================================
        // PALETA DE COLORES AZULES PERSONALIZADA
        // ============================================================================
        blue: {
          50: "#eff6ff",   // Azul muy claro
          100: "#dbeafe",  // Azul claro
          200: "#bfdbfe",  // Azul medio claro
          300: "#93c5fd",  // Azul medio
          400: "#60a5fa",  // Azul
          500: "#3b82f6",  // Azul principal
          600: "#2563eb",  // Azul oscuro
          700: "#1d4ed8",  // Azul muy oscuro
          800: "#1e40af",  // Azul extra oscuro
          900: "#1e3a8a",  // Azul profundo
          950: "#172554",  // Azul más profundo
        },
      },
      
      // ============================================================================
      // RADIOS DE BORDE PERSONALIZADOS
      // ============================================================================
      borderRadius: {
        lg: "var(--radius)",                    // Radio grande
        md: "calc(var(--radius) - 2px)",       // Radio medio
        sm: "calc(var(--radius) - 4px)",       // Radio pequeño
      },
      
      // ============================================================================
      // KEYFRAMES PARA ANIMACIONES
      // ============================================================================
      keyframes: {
        // Animación de acordeón hacia abajo
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        // Animación de acordeón hacia arriba
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      
      // ============================================================================
      // ANIMACIONES PERSONALIZADAS
      // ============================================================================
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out", // Acordeón abajo
        "accordion-up": "accordion-up 0.2s ease-out",     // Acordeón arriba
      },
    },
  },
  
  // ============================================================================
  // PLUGINS
  // ============================================================================
  plugins: [
    require("tailwindcss-animate"), // Plugin para animaciones CSS
  ],
} satisfies Config

export default config
