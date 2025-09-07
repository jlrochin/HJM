// ============================================================================
// CONFIGURACIÓN DE NEXT.JS PARA CAGPU
// ============================================================================
// Este archivo define la configuración principal de Next.js
// Incluye configuraciones para:
// - ESLint y TypeScript durante el build
// - Optimización de imágenes
// - Configuraciones de desarrollo y producción
// ============================================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // CONFIGURACIÓN DE ESLINT
  // ============================================================================
  // Solo ignorar errores de ESLint en desarrollo
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },

  // ============================================================================
  // CONFIGURACIÓN DE TYPESCRIPT
  // ============================================================================
  // Solo ignorar errores de TypeScript en desarrollo
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  // ============================================================================
  // CONFIGURACIÓN DE IMÁGENES
  // ============================================================================
  // Optimizar imágenes en producción
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // ============================================================================
  // CONFIGURACIÓN DE SEGURIDAD
  // ============================================================================
  // Headers de seguridad para producción
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
