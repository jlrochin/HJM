import { 
  validateData, 
  loginSchema, 
  createUserSchema, 
  serviceSchema 
} from '@/lib/validation'
import { 
  logSecurityEvent, 
  logLoginAttempt, 
  logPasswordChange 
} from '@/lib/security-logger'
import { 
  getSecurityMetrics, 
  detectBruteForceAttack,
  getSecurityStats 
} from '@/lib/security-monitor'

// Mock de prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}))

describe('Security Validation', () => {
  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const validData = {
        username: 'testuser',
        password: 'MySecurePass123!'
      }
      
      const result = validateData(loginSchema, validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should reject invalid username', () => {
      const invalidData = {
        username: 'ab', // muy corto
        password: 'MySecurePass123!'
      }
      
      const result = validateData(loginSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('El nombre de usuario debe tener al menos 3 caracteres')
      }
    })

    it('should reject invalid password', () => {
      const invalidData = {
        username: 'testuser',
        password: 'short' // muy corto
      }
      
      const result = validateData(loginSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('La contraseña debe tener al menos 12 caracteres')
      }
    })

    it('should reject username with special characters', () => {
      const invalidData = {
        username: 'test@user',
        password: 'MySecurePass123!'
      }
      
      const result = validateData(loginSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos')
      }
    })
  })

  describe('Create User Schema', () => {
    it('should validate correct user data', () => {
      const validData = {
        username: 'newuser',
        email: 'user@example.com',
        password: 'MySecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        department: 'IT',
        phone: '+1234567890'
      }
      
      const result = validateData(createUserSchema, validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        username: 'newuser',
        email: 'invalid-email',
        password: 'MySecurePass123!'
      }
      
      const result = validateData(createUserSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('El email debe tener un formato válido')
      }
    })

    it('should reject weak password', () => {
      const invalidData = {
        username: 'newuser',
        email: 'user@example.com',
        password: 'weakpassword' // sin mayúsculas, números ni símbolos
      }
      
      const result = validateData(createUserSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.some(err => err.includes('mayúscula'))).toBe(true)
      }
    })

    it('should reject invalid phone format', () => {
      const invalidData = {
        username: 'newuser',
        email: 'user@example.com',
        password: 'MySecurePass123!',
        phone: 'invalid-phone'
      }
      
      const result = validateData(createUserSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('El teléfono debe tener un formato válido')
      }
    })
  })

  describe('Service Schema', () => {
    it('should validate correct service data', () => {
      const validData = {
        id: 'service-001',
        directionId: 'dir-001',
        name: 'Servicio de Prueba',
        responsiblePerson: 'Juan Pérez',
        phoneExtension: '1234',
        serviceType: 'clinical',
        location: 'Piso 3, Ala Norte',
        description: 'Servicio de pruebas médicas'
      }
      
      const result = validateData(serviceSchema, validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid service ID', () => {
      const invalidData = {
        id: 'service@001', // caracteres especiales no permitidos
        directionId: 'dir-001',
        name: 'Servicio de Prueba'
      }
      
      const result = validateData(serviceSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('El ID solo puede contener letras, números, guiones y guiones bajos')
      }
    })

    it('should reject invalid phone extension', () => {
      const invalidData = {
        id: 'service-001',
        directionId: 'dir-001',
        name: 'Servicio de Prueba',
        phoneExtension: 'abc123' // no solo números
      }
      
      const result = validateData(serviceSchema, invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toContain('La extensión debe ser un número de hasta 10 dígitos')
      }
    })
  })
})

describe('Security Logging', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should log security events', async () => {
    const { prisma } = require('@/lib/db')
    prisma.auditLog.create.mockResolvedValue({ id: 1 })

    await logSecurityEvent({
      action: 'test_action',
      userId: 1,
      ip: '192.168.1.1',
      userAgent: 'Test Browser',
      details: 'Test event',
      severity: 'medium'
    })

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'test_action',
        performedBy: 1,
        details: 'Test event',
        ip: '192.168.1.1',
        userAgent: 'Test Browser'
      }
    })
  })

  it('should log login attempts', async () => {
    const { prisma } = require('@/lib/db')
    prisma.auditLog.create.mockResolvedValue({ id: 1 })

    await logLoginAttempt('testuser', true, '192.168.1.1', 'Test Browser')

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'login_success',
        performedBy: undefined,
        details: 'Login exitoso para usuario: testuser',
        ip: '192.168.1.1',
        userAgent: 'Test Browser'
      }
    })
  })

  it('should log password changes', async () => {
    const { prisma } = require('@/lib/db')
    prisma.auditLog.create.mockResolvedValue({ id: 1 })

    await logPasswordChange(1, '192.168.1.1', 'Test Browser')

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'password_change',
        performedBy: 1,
        details: 'Contraseña cambiada',
        ip: '192.168.1.1',
        userAgent: 'Test Browser'
      }
    })
  })
})

describe('Security Monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get security metrics', async () => {
    const { prisma } = require('@/lib/db')
    prisma.auditLog.count.mockResolvedValue(5)

    const metrics = await getSecurityMetrics('24h')

    expect(metrics).toEqual({
      totalLogins: 5,
      failedLogins: 5,
      suspiciousActivities: 5,
      rateLimitExceeded: 5,
      unauthorizedAccess: 5,
      dataExports: 5,
      userCreations: 5,
      userDeactivations: 5,
      period: '24h'
    })
  })

  it('should detect brute force attacks', async () => {
    const { prisma } = require('@/lib/db')
    prisma.auditLog.count
      .mockResolvedValueOnce(35) // failed logins last hour (above new threshold of 30)
      .mockResolvedValueOnce(120) // failed logins last day (above new threshold of 100)

    const alert = await detectBruteForceAttack()

    expect(alert).toEqual({
      type: 'login_attack',
      severity: 'high',
      message: 'Ataque de fuerza bruta detectado: 35 intentos fallidos en la última hora',
      details: {
        failedLoginsLastHour: 35,
        failedLoginsLastDay: 120,
        threshold: 30
      },
      timestamp: expect.any(Date)
    })
  })

  it('should get security stats', async () => {
    const { prisma } = require('@/lib/db')
    prisma.auditLog.count.mockResolvedValue(5)

    const stats = await getSecurityStats()

    expect(stats.metrics).toEqual({
      totalLogins: 5,
      failedLogins: 5,
      suspiciousActivities: 5,
      rateLimitExceeded: 5,
      unauthorizedAccess: 5,
      dataExports: 5,
      userCreations: 5,
      userDeactivations: 5,
      period: '24h'
    })
    expect(stats.riskLevel).toBe('high') // Con 5 accesos no autorizados, el riesgo es alto
    expect(stats.alerts.length).toBeGreaterThan(0) // Debería haber alertas
  })
})
