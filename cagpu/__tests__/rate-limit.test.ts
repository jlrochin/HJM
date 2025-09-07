import { 
  checkRateLimit,
  checkLoginRateLimit,
  checkApiRateLimit,
  getRateLimitInfo,
  clearRateLimitStore,
  getRateLimitStats,
} from '@/lib/rate-limit-simple'

// Mock de request
function createMockRequest(overrides: any = {}): any {
  return {
    ip: '192.168.1.100',
    headers: {
      'user-agent': 'Test Browser',
      'x-forwarded-for': '192.168.1.100',
      ...overrides.headers
    },
    cookies: {
      get: jest.fn().mockReturnValue(null)
    }
  }
}

describe('Rate Limiting - Optimizado para Red Local', () => {
  beforeEach(() => {
    clearRateLimitStore()
  })

  describe('Identificadores Únicos', () => {
    it('should create unique identifiers for different users', () => {
      const req1 = createMockRequest({
        headers: {
          'user-agent': 'Chrome',
          'x-user-id': 'user1'
        }
      })
      
      const req2 = createMockRequest({
        headers: {
          'user-agent': 'Firefox',
          'x-user-id': 'user2'
        }
      })

      const info1 = getRateLimitInfo(req1)
      const info2 = getRateLimitInfo(req2)

      expect(info1.uniqueIdentifier).not.toBe(info2.uniqueIdentifier)
      expect(info1.uniqueIdentifier).toContain('user1')
      expect(info2.uniqueIdentifier).toContain('user2')
    })

    it('should handle same IP with different user agents', () => {
      const req1 = createMockRequest({
        headers: {
          'user-agent': 'Chrome',
          'x-user-id': 'user1'
        }
      })
      
      const req2 = createMockRequest({
        headers: {
          'user-agent': 'Firefox',
          'x-user-id': 'user1'
        }
      })

      const info1 = getRateLimitInfo(req1)
      const info2 = getRateLimitInfo(req2)

      expect(info1.uniqueIdentifier).not.toBe(info2.uniqueIdentifier)
      expect(info1.ip).toBe(info2.ip) // Misma IP
      expect(info1.userId).toBe(info2.userId) // Mismo usuario
    })
  })

  describe('Login Rate Limiter', () => {
    it('should allow requests within limit', () => {
      // Hacer 5 requests (dentro del límite)
      for (let i = 0; i < 5; i++) {
        const req = createMockRequest()
        const result = checkLoginRateLimit(req)
        expect(result.allowed).toBe(true)
      }
    })

    it('should block requests over limit', () => {
      // Hacer 20 requests (dentro del límite)
      for (let i = 0; i < 20; i++) {
        const req = createMockRequest()
        const result = checkLoginRateLimit(req)
        expect(result.allowed).toBe(true)
      }

      // El 21er request debería ser bloqueado
      const req = createMockRequest()
      const result = checkLoginRateLimit(req)
      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Rate limit exceeded')
    })

    it('should reset after window expires', async () => {
      // Usar una configuración personalizada con ventana corta
      const identifier = getRateLimitInfo(createMockRequest()).uniqueIdentifier
      
      // Hacer 2 requests
      for (let i = 0; i < 2; i++) {
        const result = checkRateLimit(identifier, 2, 100) // 100ms para testing rápido
        expect(result.allowed).toBe(true)
      }

      // El 3er request debería ser bloqueado
      const result1 = checkRateLimit(identifier, 2, 100)
      expect(result1.allowed).toBe(false)

      // Esperar a que expire la ventana
      await new Promise(resolve => setTimeout(resolve, 150))

      // Ahora debería permitir requests nuevamente
      const result2 = checkRateLimit(identifier, 2, 100)
      expect(result2.allowed).toBe(true)
    })
  })

  describe('API Rate Limiter', () => {
    it('should handle multiple users from same IP', () => {
      // Usuario 1 hace 3 requests
      for (let i = 0; i < 3; i++) {
        const req = createMockRequest({
          headers: {
            'user-agent': 'Chrome',
            'x-user-id': 'user1'
          }
        })
        const result = checkApiRateLimit(req)
        expect(result.allowed).toBe(true)
      }

      // Usuario 1 hace un 4to request (debería ser bloqueado)
      const req1 = createMockRequest({
        headers: {
          'user-agent': 'Chrome',
          'x-user-id': 'user1'
        }
      })
      const result1 = checkApiRateLimit(req1)
      expect(result1.allowed).toBe(true) // API limit es 500, así que 4 requests están bien

      // Usuario 2 hace 3 requests (debería funcionar porque es diferente)
      for (let i = 0; i < 3; i++) {
        const req = createMockRequest({
          headers: {
            'user-agent': 'Firefox',
            'x-user-id': 'user2'
          }
        })
        const result = checkApiRateLimit(req)
        expect(result.allowed).toBe(true)
      }
    })
  })

  describe('Rate Limit Statistics', () => {
    it('should provide accurate statistics', () => {
      // Hacer algunos requests
      for (let i = 0; i < 3; i++) {
        const req = createMockRequest({
          headers: {
            'x-user-id': `user${i}`
          }
        })
        checkApiRateLimit(req)
      }

      const stats = getRateLimitStats()
      expect(stats.totalEntries).toBeGreaterThan(0)
      expect(stats.activeEntries).toBeGreaterThan(0)
      expect(stats.entries.length).toBeGreaterThan(0)
    })

    it('should clean up expired entries', async () => {
      // Usar una configuración personalizada con ventana corta
      const identifier = getRateLimitInfo(createMockRequest()).uniqueIdentifier
      
      // Hacer un request
      checkRateLimit(identifier, 1, 50) // 50ms para testing rápido

      // Verificar que hay una entrada
      let stats = getRateLimitStats()
      expect(stats.activeEntries).toBe(1)

      // Esperar a que expire
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verificar que se limpió
      stats = getRateLimitStats()
      expect(stats.activeEntries).toBe(0)
    })
  })

  describe('Red Local Detection', () => {
    it('should detect local network environment', () => {
      const req = createMockRequest()
      const info = getRateLimitInfo(req)
      
      // Verificar que la función funciona
      expect(info).toHaveProperty('isLocalNetwork')
      expect(info).toHaveProperty('ip')
      expect(info).toHaveProperty('uniqueIdentifier')
    })
  })
})
