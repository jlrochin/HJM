import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// ============================================================================
// MIDDLEWARE DE RATE LIMITING PARA NEXT.JS - OPTIMIZADO PARA RED LOCAL
// ============================================================================
// Maneja rate limiting de forma más inteligente para redes locales
// donde múltiples usuarios pueden compartir la misma IP
// ============================================================================

interface RateLimitConfig {
  windowMs: number
  max: number
  keyGenerator: (req: NextRequest) => string
  message: string
  retryAfter: string
}

// Store para rate limiting (en producción usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Función helper para obtener identificador único
function getUniqueIdentifier(req: NextRequest): string {
  const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const userId = req.headers.get('x-user-id') || 'anonymous'
  
  // En red local, usar IP + User-Agent + UserID para mejor diferenciación
  return `${ip}-${userAgent}-${userId}`
}

// Función helper para limpiar store antiguo
function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Función principal de rate limiting
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimitMiddleware(req: NextRequest) {
    // Limpiar entradas antiguas
    cleanupOldEntries()
    
    const key = config.keyGenerator(req)
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Obtener entrada actual
    const current = rateLimitStore.get(key)
    
    if (!current || now > current.resetTime) {
      // Primera petición o ventana expirada
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return NextResponse.next()
    }
    
    // Incrementar contador
    current.count++
    
    if (current.count > config.max) {
      // Rate limit excedido
      return NextResponse.json(
        {
          error: config.message,
          retryAfter: config.retryAfter,
          identifier: key,
          remaining: 0,
          resetTime: new Date(current.resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
            'Retry-After': Math.ceil(config.windowMs / 1000).toString()
          }
        }
      )
    }
    
    // Petición permitida
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.max.toString())
    response.headers.set('X-RateLimit-Remaining', (config.max - current.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(current.resetTime).toISOString())
    
    return response
  }
}

// Configuraciones predefinidas para diferentes tipos de endpoints

// Rate limiter para login
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos por identificador único
  keyGenerator: getUniqueIdentifier,
  message: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
  retryAfter: '15 minutos'
})

// Rate limiter para APIs generales
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // máximo 500 requests por identificador único
  keyGenerator: getUniqueIdentifier,
  message: 'Demasiadas peticiones. Intenta nuevamente en 15 minutos.',
  retryAfter: '15 minutos'
})

// Rate limiter para endpoints sensibles
export const sensitiveRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 80, // máximo 80 requests por identificador único
  keyGenerator: getUniqueIdentifier,
  message: 'Demasiadas peticiones a endpoints sensibles. Intenta nuevamente en 5 minutos.',
  retryAfter: '5 minutos'
})

// Rate limiter para exportaciones
export const exportRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 exportaciones por hora
  keyGenerator: getUniqueIdentifier,
  message: 'Demasiadas exportaciones. Intenta nuevamente en 1 hora.',
  retryAfter: '1 hora'
})

// Rate limiter por usuario autenticado
export const userRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por usuario
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id') || req.cookies.get('user-id')?.value
    if (userId) {
      return `user-${userId}`
    }
    return getUniqueIdentifier(req)
  },
  message: 'Demasiadas peticiones para tu usuario. Intenta nuevamente en 15 minutos.',
  retryAfter: '15 minutos'
})

// Función helper para obtener información de rate limiting
export function getRateLimitInfo(req: NextRequest) {
  return {
    ip: req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    userAgent: req.headers.get('user-agent'),
    userId: req.headers.get('x-user-id') || req.cookies.get('user-id')?.value,
    uniqueIdentifier: getUniqueIdentifier(req),
    isLocalNetwork: process.env.NODE_ENV === 'development' || process.env.IS_LOCAL_NETWORK === 'true',
    currentStoreSize: rateLimitStore.size
  }
}

// Función para limpiar rate limit store (útil para testing)
export function clearRateLimitStore() {
  rateLimitStore.clear()
}

// Función para obtener estadísticas del rate limiting
export function getRateLimitStats() {
  const now = Date.now()
  const activeEntries = Array.from(rateLimitStore.entries())
    .filter(([_, value]) => now <= value.resetTime)
    .map(([key, value]) => ({
      key,
      count: value.count,
      resetTime: new Date(value.resetTime).toISOString()
    }))
  
  return {
    totalEntries: rateLimitStore.size,
    activeEntries: activeEntries.length,
    entries: activeEntries
  }
}
