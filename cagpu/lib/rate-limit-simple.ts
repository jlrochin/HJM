// ============================================================================
// RATE LIMITING SIMPLIFICADO - OPTIMIZADO PARA RED LOCAL
// ============================================================================
// Versión simplificada que funciona mejor con Jest y Next.js
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Store en memoria (en producción usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Función helper para obtener identificador único
export function getUniqueIdentifier(req: any): string {
  const ip = req.ip || req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || 'unknown'
  const userAgent = req.headers?.['user-agent'] || 'unknown'
  const userId = req.headers?.['x-user-id'] || req.cookies?.get?.('user-id')?.value || 'anonymous'
  
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
export function checkRateLimit(
  identifier: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number; error?: string } {
  // Limpiar entradas antiguas
  cleanupOldEntries()
  
  const now = Date.now()
  const current = rateLimitStore.get(identifier)
  
  if (!current || now > current.resetTime) {
    // Primera petición o ventana expirada
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    })
    return {
      allowed: true,
      remaining: max - 1,
      resetTime: now + windowMs
    }
  }
  
  // Incrementar contador
  current.count++
  
  if (current.count > max) {
    // Rate limit excedido
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      error: 'Rate limit exceeded'
    }
  }
  
  // Petición permitida
  return {
    allowed: true,
    remaining: max - current.count,
    resetTime: current.resetTime
  }
}

// Configuraciones predefinidas
export const RATE_LIMIT_CONFIGS = {
  login: {
    max: 20,
    windowMs: 15 * 60 * 1000 // 15 minutos
  },
  api: {
    max: 500,
    windowMs: 15 * 60 * 1000 // 15 minutos
  },
  sensitive: {
    max: 80,
    windowMs: 5 * 60 * 1000 // 5 minutos
  },
  export: {
    max: 20,
    windowMs: 60 * 60 * 1000 // 1 hora
  },
  user: {
    max: 100,
    windowMs: 15 * 60 * 1000 // 15 minutos
  }
}

// Funciones específicas para diferentes tipos
export function checkLoginRateLimit(req: any) {
  const identifier = getUniqueIdentifier(req)
  return checkRateLimit(identifier, RATE_LIMIT_CONFIGS.login.max, RATE_LIMIT_CONFIGS.login.windowMs)
}

export function checkApiRateLimit(req: any) {
  const identifier = getUniqueIdentifier(req)
  return checkRateLimit(identifier, RATE_LIMIT_CONFIGS.api.max, RATE_LIMIT_CONFIGS.api.windowMs)
}

export function checkSensitiveRateLimit(req: any) {
  const identifier = getUniqueIdentifier(req)
  return checkRateLimit(identifier, RATE_LIMIT_CONFIGS.sensitive.max, RATE_LIMIT_CONFIGS.sensitive.windowMs)
}

export function checkExportRateLimit(req: any) {
  const identifier = getUniqueIdentifier(req)
  return checkRateLimit(identifier, RATE_LIMIT_CONFIGS.export.max, RATE_LIMIT_CONFIGS.export.windowMs)
}

export function checkUserRateLimit(req: any) {
  const identifier = getUniqueIdentifier(req)
  return checkRateLimit(identifier, RATE_LIMIT_CONFIGS.user.max, RATE_LIMIT_CONFIGS.user.windowMs)
}

// Función helper para obtener información de rate limiting
export function getRateLimitInfo(req: any) {
  return {
    ip: req.ip || req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
    userAgent: req.headers?.['user-agent'],
    userId: req.headers?.['x-user-id'] || req.cookies?.get?.('user-id')?.value,
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
