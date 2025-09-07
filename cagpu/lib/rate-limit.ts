import rateLimit from 'express-rate-limit'

// ============================================================================
// MIDDLEWARE DE RATE LIMITING - OPTIMIZADO PARA RED LOCAL
// ============================================================================
// Protege contra ataques de fuerza bruta y DDoS
// Considera tanto IP como usuario para evitar falsos positivos en red local
// ============================================================================

// Función helper para obtener identificador único
function getUniqueIdentifier(req: any): string {
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  
  // En red local, usar IP + User-Agent para mejor diferenciación
  return `${ip}-${userAgent}`
}

// Rate limiter para login - Optimizado para red local
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos por identificador único
  keyGenerator: getUniqueIdentifier, // Usar identificador único
  message: {
    error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info en headers
  legacyHeaders: false, // No usar headers legacy
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.',
      retryAfter: Math.ceil(15 * 60 / 1000), // segundos
      identifier: getUniqueIdentifier(req)
    })
  },
  skip: (req) => {
    // En desarrollo, ser más permisivo
    return process.env.NODE_ENV === 'development'
  }
})

// Rate limiter para creación de usuarios (solo admins) - Optimizado para red local
export const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 usuarios por hora
  keyGenerator: getUniqueIdentifier,
  message: {
    error: 'Demasiadas creaciones de usuarios. Intenta nuevamente en 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter general para APIs - Optimizado para red local
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // máximo 500 requests por identificador único
  keyGenerator: getUniqueIdentifier,
  message: {
    error: 'Demasiadas peticiones. Intenta nuevamente en 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // En desarrollo, ser más permisivo
    return process.env.NODE_ENV === 'development'
  }
})

// Rate limiter para endpoints sensibles - Optimizado para red local
export const sensitiveEndpointLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 80, // máximo 80 requests por identificador único
  keyGenerator: getUniqueIdentifier,
  message: {
    error: 'Demasiadas peticiones a endpoints sensibles. Intenta nuevamente en 5 minutos.',
    retryAfter: '5 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter para exportación de datos - Optimizado para red local
export const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 exportaciones por hora
  keyGenerator: getUniqueIdentifier,
  message: {
    error: 'Demasiadas exportaciones. Intenta nuevamente en 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter por usuario autenticado - NUEVO
export const userSpecificLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por usuario
  keyGenerator: (req) => {
    // Usar ID de usuario si está autenticado, sino IP + User-Agent
    const userId = req.user?.id || req.headers['x-user-id']
    if (userId) {
      return `user-${userId}`
    }
    return getUniqueIdentifier(req)
  },
  message: {
    error: 'Demasiadas peticiones para tu usuario. Intenta nuevamente en 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // En desarrollo, ser más permisivo
    return process.env.NODE_ENV === 'development'
  }
})

// Rate limiter para acciones administrativas - NUEVO
export const adminActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // máximo 50 acciones administrativas por hora
  keyGenerator: (req) => {
    const userId = req.user?.id || req.headers['x-user-id']
    return userId ? `admin-${userId}` : getUniqueIdentifier(req)
  },
  message: {
    error: 'Demasiadas acciones administrativas. Intenta nuevamente en 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Función helper para obtener información de rate limiting
export function getRateLimitInfo(req: any) {
  return {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || req.headers['x-user-id'],
    uniqueIdentifier: getUniqueIdentifier(req),
    isLocalNetwork: process.env.NODE_ENV === 'development' || process.env.IS_LOCAL_NETWORK === 'true'
  }
}
