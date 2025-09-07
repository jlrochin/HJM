import { z } from 'zod'

// ============================================================================
// CONFIGURACIÓN CENTRALIZADA
// ============================================================================
// Validación estricta de variables de entorno y configuración de la aplicación
// ============================================================================

interface Config {
  jwt: {
    secret: string
    expiresIn: string
  }
  database: {
    url: string
  }
  auth: {
    saltRounds: number
    minPasswordLength: number
  }
  app: {
    name: string
    version: string
    environment: string
  }
  security: {
    isLocalNetwork: boolean
    rateLimitMultiplier: number
    alertThresholdMultiplier: number
  }
}

function validateConfig(): Config {
  const jwtSecret = process.env.JWT_SECRET
  const databaseUrl = process.env.DATABASE_URL
  const isLocalNetwork = process.env.NODE_ENV === 'development' || process.env.IS_LOCAL_NETWORK === 'true'

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  if (jwtSecret === 'supersecreto' || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long and not use default value')
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  return {
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    database: {
      url: databaseUrl
    },
    auth: {
      saltRounds: parseInt(process.env.AUTH_SALT_ROUNDS || '14'),
      minPasswordLength: parseInt(process.env.AUTH_MIN_PASSWORD_LENGTH || '12')
    },
    app: {
      name: process.env.APP_NAME || 'CAGPU',
      version: process.env.APP_VERSION || '0.1.0',
      environment: process.env.NODE_ENV || 'development'
    },
    security: {
      isLocalNetwork,
      rateLimitMultiplier: isLocalNetwork ? 4 : 1, // 4x más permisivo en red local
      alertThresholdMultiplier: isLocalNetwork ? 3 : 1 // 3x más permisivo en red local
    }
  }
}

export const config = validateConfig()
export const JWT_SECRET = config.jwt.secret
export const JWT_EXPIRES_IN = config.jwt.expiresIn
export const DATABASE_URL = config.database.url
export const AUTH_SALT_ROUNDS = config.auth.saltRounds
export const AUTH_MIN_PASSWORD_LENGTH = config.auth.minPasswordLength
export const APP_NAME = config.app.name
export const APP_VERSION = config.app.version
export const NODE_ENV = config.app.environment
export const IS_LOCAL_NETWORK = config.security.isLocalNetwork
export const RATE_LIMIT_MULTIPLIER = config.security.rateLimitMultiplier
export const ALERT_THRESHOLD_MULTIPLIER = config.security.alertThresholdMultiplier
