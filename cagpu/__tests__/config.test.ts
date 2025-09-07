// Mock de process.env
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterEach(() => {
  process.env = originalEnv
})

describe('Configuration', () => {
  describe('JWT Configuration', () => {
    it('should throw error when JWT_SECRET is not provided', () => {
      delete process.env.JWT_SECRET
      
      expect(() => {
        require('@/lib/config')
      }).toThrow('JWT_SECRET environment variable is required')
    })

    it('should throw error when JWT_SECRET is too short', () => {
      process.env.JWT_SECRET = 'short'
      
      expect(() => {
        require('@/lib/config')
      }).toThrow('JWT_SECRET must be at least 32 characters long')
    })

    it('should throw error when JWT_SECRET is default value', () => {
      process.env.JWT_SECRET = 'supersecreto'
      
      expect(() => {
        require('@/lib/config')
      }).toThrow('JWT_SECRET must be at least 32 characters long and not use default value')
    })

    it('should accept valid JWT_SECRET', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.jwt.secret).toBe('a'.repeat(32))
    })

    it('should use default JWT_EXPIRES_IN when not provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.jwt.expiresIn).toBe('1d')
    })

    it('should use custom JWT_EXPIRES_IN when provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.JWT_EXPIRES_IN = '2h'
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.jwt.expiresIn).toBe('2h')
    })
  })

  describe('Database Configuration', () => {
    it('should throw error when DATABASE_URL is not provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      delete process.env.DATABASE_URL
      
      expect(() => {
        require('@/lib/config')
      }).toThrow('DATABASE_URL environment variable is required')
    })

    it('should accept valid DATABASE_URL', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.database.url).toBe('postgresql://user:pass@localhost:5432/db')
    })
  })

  describe('Auth Configuration', () => {
    it('should use default salt rounds when not provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.auth.saltRounds).toBe(14)
    })

    it('should use custom salt rounds when provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      process.env.AUTH_SALT_ROUNDS = '16'
      
      const config = require('@/lib/config').config
      expect(config.auth.saltRounds).toBe(16)
    })

    it('should use default min password length when not provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.auth.minPasswordLength).toBe(12)
    })

    it('should use custom min password length when provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      process.env.AUTH_MIN_PASSWORD_LENGTH = '16'
      
      const config = require('@/lib/config').config
      expect(config.auth.minPasswordLength).toBe(16)
    })
  })

  describe('App Configuration', () => {
    it('should use default app name when not provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.app.name).toBe('CAGPU')
    })

    it('should use custom app name when provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      process.env.APP_NAME = 'CustomApp'
      
      const config = require('@/lib/config').config
      expect(config.app.name).toBe('CustomApp')
    })

    it('should use default version when not provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      
      const config = require('@/lib/config').config
      expect(config.app.version).toBe('0.1.0')
    })

    it('should use custom version when provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      process.env.APP_VERSION = '1.0.0'
      
      const config = require('@/lib/config').config
      expect(config.app.version).toBe('1.0.0')
    })

    it('should use NODE_ENV when provided', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      process.env.NODE_ENV = 'production'
      
      const config = require('@/lib/config').config
      expect(config.app.environment).toBe('production')
    })

    it('should use development as default environment', () => {
      process.env.JWT_SECRET = 'a'.repeat(32)
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db'
      delete process.env.NODE_ENV
      
      const config = require('@/lib/config').config
      expect(config.app.environment).toBe('development')
    })
  })
})
