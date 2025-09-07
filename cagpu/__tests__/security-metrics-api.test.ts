import { GET } from '@/app/api/admin/security-metrics/route'



// Mock de las dependencias
jest.mock('@/lib/security-monitor', () => ({
  getSecurityStats: jest.fn(),
  getSecurityMetrics: jest.fn()
}))

jest.mock('@/lib/rate-limit-simple', () => ({
  getRateLimitStats: jest.fn()
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      count: jest.fn()
    },
    service: {
      count: jest.fn()
    },
    direction: {
      count: jest.fn()
    },
    auditLog: {
      findMany: jest.fn()
    }
  }
}))

// Mock de NextRequest para evitar problemas con el entorno de Jest
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    headers: Headers
    url: string

    constructor(url: string, options: { headers?: Headers } = {}) {
      this.url = url
      this.headers = options.headers || new Headers()
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data
    }))
  }
}))

import { getSecurityStats, getSecurityMetrics } from '@/lib/security-monitor'
import { getRateLimitStats } from '@/lib/rate-limit-simple'
import { prisma } from '@/lib/db'

describe('Security Metrics API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (userRole: string = 'admin') => {
    const headers = new Headers()
    headers.set('x-user-role', userRole)
    
    return new (require('next/server').NextRequest)('http://localhost:3000/api/admin/security-metrics?period=24h&includeDetails=true', {
      headers
    })
  }

  it('should return 403 for non-admin and non-developer users', async () => {
    const request = createMockRequest('user')
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(403)
    expect(data.error).toBe('Acceso denegado. Solo administradores y desarrolladores pueden acceder a estas métricas.')
  })

  it('should return security metrics for admin users', async () => {
    // Mock de los datos
    const mockSecurityStats = {
      riskLevel: 'low',
      alerts: []
    }
    
    const mockSecurityMetrics = {
      totalLogins: 100,
      failedLogins: 5,
      suspiciousActivities: 2,
      rateLimitExceeded: 1,
      unauthorizedAccess: 0,
      dataExports: 3,
      userCreations: 1,
      userDeactivations: 0,
      period: '24h'
    }
    
    const mockRateLimitStats = {
      activeEntries: 10,
      totalEntries: 15,
      entries: []
    }

    // Configurar mocks
    ;(getSecurityStats as jest.Mock).mockResolvedValue(mockSecurityStats)
    ;(getSecurityMetrics as jest.Mock).mockResolvedValue(mockSecurityMetrics)
    ;(getRateLimitStats as jest.Mock).mockReturnValue(mockRateLimitStats)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(50)
    ;(prisma.service.count as jest.Mock).mockResolvedValue(25)
    ;(prisma.direction.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.auditLog.findMany as jest.Mock).mockResolvedValue([])

    const request = createMockRequest('admin')
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('period', '24h')
    expect(data).toHaveProperty('overview')
    expect(data).toHaveProperty('securityMetrics')
    expect(data.securityMetrics).toHaveProperty('alerts')
    expect(data).toHaveProperty('rateLimiting')
    expect(data).toHaveProperty('recentActivity')
  })

  it('should calculate login success rate correctly', async () => {
    const mockSecurityStats = {
      riskLevel: 'low',
      alerts: []
    }
    
    const mockSecurityMetrics = {
      totalLogins: 100,
      failedLogins: 10,
      suspiciousActivities: 2,
      rateLimitExceeded: 1,
      unauthorizedAccess: 0,
      dataExports: 3,
      userCreations: 1,
      userDeactivations: 0,
      period: '24h'
    }
    
    const mockRateLimitStats = {
      activeEntries: 10,
      totalEntries: 15,
      entries: []
    }

    // Configurar mocks
    ;(getSecurityStats as jest.Mock).mockResolvedValue(mockSecurityStats)
    ;(getSecurityMetrics as jest.Mock).mockResolvedValue(mockSecurityMetrics)
    ;(getRateLimitStats as jest.Mock).mockReturnValue(mockRateLimitStats)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(50)
    ;(prisma.service.count as jest.Mock).mockResolvedValue(25)
    ;(prisma.direction.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.auditLog.findMany as jest.Mock).mockResolvedValue([])

    const request = createMockRequest('admin')
    
    const response = await GET(request)
    const data = await response.json()
    
    // Tasa de éxito = (100 - 10) / 100 * 100 = 90%
    expect(data.overview.loginSuccessRate).toBe(90)
  })

  it('should return security metrics for developer users', async () => {
    // Mock de los datos
    const mockSecurityStats = {
      riskLevel: 'low',
      alerts: []
    }
    
    const mockSecurityMetrics = {
      totalLogins: 100,
      failedLogins: 5,
      suspiciousActivities: 2,
      rateLimitExceeded: 1,
      unauthorizedAccess: 0,
      dataExports: 3,
      userCreations: 1,
      userDeactivations: 0,
      period: '24h'
    }
    
    const mockRateLimitStats = {
      activeEntries: 10,
      totalEntries: 15,
      entries: []
    }

    // Configurar mocks
    ;(getSecurityStats as jest.Mock).mockResolvedValue(mockSecurityStats)
    ;(getSecurityMetrics as jest.Mock).mockResolvedValue(mockSecurityMetrics)
    ;(getRateLimitStats as jest.Mock).mockReturnValue(mockRateLimitStats)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(50)
    ;(prisma.service.count as jest.Mock).mockResolvedValue(25)
    ;(prisma.direction.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.auditLog.findMany as jest.Mock).mockResolvedValue([])

    const request = createMockRequest('developer')
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('period')
    expect(data).toHaveProperty('overview')
    expect(data).toHaveProperty('securityMetrics')
    expect(data).toHaveProperty('rateLimiting')
    expect(data).toHaveProperty('recentActivity')
  })

  it('should handle database errors gracefully', async () => {
    ;(getSecurityStats as jest.Mock).mockRejectedValue(new Error('Database error'))
    ;(getSecurityMetrics as jest.Mock).mockResolvedValue({})
    ;(getRateLimitStats as jest.Mock).mockReturnValue({})
    ;(prisma.user.count as jest.Mock).mockResolvedValue(50)

    const request = createMockRequest('admin')
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(500)
    expect(data.error).toBe('Error interno del servidor al obtener métricas de seguridad')
  })

  it('should include recent activity data', async () => {
    const mockSecurityStats = {
      riskLevel: 'low',
      alerts: []
    }
    
    const mockSecurityMetrics = {
      totalLogins: 100,
      failedLogins: 5,
      suspiciousActivities: 2,
      rateLimitExceeded: 1,
      unauthorizedAccess: 0,
      dataExports: 3,
      userCreations: 1,
      userDeactivations: 0,
      period: '24h'
    }
    
    const mockRateLimitStats = {
      activeEntries: 10,
      totalEntries: 15,
      entries: []
    }

    const mockRecentLogins = [
      {
        id: 1,
        performedByUser: {
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User'
        },
        ip: '192.168.1.100',
        userAgent: 'Chrome',
        createdAt: new Date()
      }
    ]

    const mockSecurityEvents = [
      {
        id: 1,
        action: 'login_failed',
        performedByUser: {
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User'
        },
        ip: '192.168.1.101',
        userAgent: 'Firefox',
        details: 'Contraseña incorrecta',
        createdAt: new Date()
      }
    ]

    // Configurar mocks
    ;(getSecurityStats as jest.Mock).mockResolvedValue(mockSecurityStats)
    ;(getSecurityMetrics as jest.Mock).mockResolvedValue(mockSecurityMetrics)
    ;(getRateLimitStats as jest.Mock).mockReturnValue(mockRateLimitStats)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(50)
    ;(prisma.service.count as jest.Mock).mockResolvedValue(25)
    ;(prisma.direction.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.auditLog.findMany as jest.Mock)
      .mockResolvedValueOnce(mockRecentLogins)
      .mockResolvedValueOnce(mockSecurityEvents)

    const request = createMockRequest('admin')
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.recentActivity.logins).toHaveLength(1)
    expect(data.recentActivity.logins[0].username).toBe('admin')
    expect(data.recentActivity.logins[0].userFullName).toBe('Admin User')
    
    expect(data.recentActivity.securityEvents).toHaveLength(1)
    expect(data.recentActivity.securityEvents[0].action).toBe('login_failed')
    expect(data.recentActivity.securityEvents[0].username).toBe('testuser')
  })

  it('should handle missing user data gracefully', async () => {
    const mockSecurityStats = {
      riskLevel: 'low',
      alerts: []
    }
    
    const mockSecurityMetrics = {
      totalLogins: 100,
      failedLogins: 5,
      suspiciousActivities: 2,
      rateLimitExceeded: 1,
      unauthorizedAccess: 0,
      dataExports: 3,
      userCreations: 1,
      userDeactivations: 0,
      period: '24h'
    }
    
    const mockRateLimitStats = {
      activeEntries: 10,
      totalEntries: 15,
      entries: []
    }

    const mockRecentLogins = [
      {
        id: 1,
        performedBy: null, // Usuario no encontrado
        ip: '192.168.1.100',
        userAgent: 'Chrome',
        createdAt: new Date()
      }
    ]

    // Configurar mocks
    ;(getSecurityStats as jest.Mock).mockResolvedValue(mockSecurityStats)
    ;(getSecurityMetrics as jest.Mock).mockResolvedValue(mockSecurityMetrics)
    ;(getRateLimitStats as jest.Mock).mockReturnValue(mockRateLimitStats)
    ;(prisma.user.count as jest.Mock).mockResolvedValue(50)
    ;(prisma.service.count as jest.Mock).mockResolvedValue(25)
    ;(prisma.direction.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.auditLog.findMany as jest.Mock)
      .mockResolvedValueOnce(mockRecentLogins)
      .mockResolvedValueOnce([])

    const request = createMockRequest('admin')
    
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.recentActivity.logins[0].username).toBe('unknown')
    expect(data.recentActivity.logins[0].userFullName).toBe('unknown')
  })
})
