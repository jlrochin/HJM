import { prisma } from './db'
import { logSecurityEvent } from './security-logger'

// ============================================================================
// SISTEMA DE MONITOREO DE SEGURIDAD
// ============================================================================
// Detecta y alerta sobre actividades sospechosas
// ============================================================================

export interface SecurityMetrics {
  totalLogins: number
  failedLogins: number
  suspiciousActivities: number
  rateLimitExceeded: number
  unauthorizedAccess: number
  dataExports: number
  userCreations: number
  userDeactivations: number
  period: '24h' | '7d' | '30d'
}

export interface SecurityAlert {
  type: 'login_attack' | 'suspicious_activity' | 'data_breach' | 'rate_limit_spike'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: Record<string, any>
  timestamp: Date
}

// Configuración de umbrales de alerta - Ajustados para red local
const ALERT_THRESHOLDS = {
  failedLoginsPerHour: 30, // Más permisivo para red local
  failedLoginsPerDay: 100, // Más permisivo para red local
  suspiciousActivitiesPerDay: 10, // Más permisivo para red local
  rateLimitExceededPerHour: 50, // Más permisivo para red local
  unauthorizedAccessPerDay: 5, // Más permisivo para red local
  dataExportsPerDay: 20, // Más permisivo para red local
  userCreationsPerDay: 10, // Más permisivo para red local
  userDeactivationsPerDay: 5 // Más permisivo para red local
}

// Función para obtener métricas de seguridad
export async function getSecurityMetrics(period: '24h' | '7d' | '30d' = '24h'): Promise<SecurityMetrics> {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
  }

  const [
    totalLogins,
    failedLogins,
    suspiciousActivities,
    rateLimitExceeded,
    unauthorizedAccess,
    dataExports,
    userCreations,
    userDeactivations
  ] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action: 'login_success',
        createdAt: { gte: startDate }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: 'login_failed',
        createdAt: { gte: startDate }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: { startsWith: 'suspicious_' },
        createdAt: { gte: startDate }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: { startsWith: 'rate_limit_exceeded_' },
        createdAt: { gte: startDate }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: 'unauthorized_access',
        createdAt: { gte: startDate }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: 'data_export',
        createdAt: { gte: startDate }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: 'user_creation',
        createdAt: { gte: startDate }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: 'user_deactivation',
        createdAt: { gte: startDate }
      }
    })
  ])

  return {
    totalLogins,
    failedLogins,
    suspiciousActivities,
    rateLimitExceeded,
    unauthorizedAccess,
    dataExports,
    userCreations,
    userDeactivations,
    period
  }
}

// Función para detectar ataques de fuerza bruta
export async function detectBruteForceAttack(): Promise<SecurityAlert | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [failedLoginsLastHour, failedLoginsLastDay] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action: 'login_failed',
        createdAt: { gte: oneHourAgo }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: 'login_failed',
        createdAt: { gte: oneDayAgo }
      }
    })
  ])

  if (failedLoginsLastHour >= ALERT_THRESHOLDS.failedLoginsPerHour) {
    return {
      type: 'login_attack',
      severity: 'high',
      message: `Ataque de fuerza bruta detectado: ${failedLoginsLastHour} intentos fallidos en la última hora`,
      details: {
        failedLoginsLastHour,
        failedLoginsLastDay,
        threshold: ALERT_THRESHOLDS.failedLoginsPerHour
      },
      timestamp: new Date()
    }
  }

  if (failedLoginsLastDay >= ALERT_THRESHOLDS.failedLoginsPerDay) {
    return {
      type: 'login_attack',
      severity: 'medium',
      message: `Actividad sospechosa de login: ${failedLoginsLastDay} intentos fallidos en el último día`,
      details: {
        failedLoginsLastHour,
        failedLoginsLastDay,
        threshold: ALERT_THRESHOLDS.failedLoginsPerDay
      },
      timestamp: new Date()
    }
  }

  return null
}

// Función para detectar actividades sospechosas
export async function detectSuspiciousActivity(): Promise<SecurityAlert | null> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const suspiciousActivities = await prisma.auditLog.count({
    where: {
      action: { startsWith: 'suspicious_' },
      createdAt: { gte: oneDayAgo }
    }
  })

  if (suspiciousActivities >= ALERT_THRESHOLDS.suspiciousActivitiesPerDay) {
    return {
      type: 'suspicious_activity',
      severity: 'high',
      message: `Actividades sospechosas detectadas: ${suspiciousActivities} eventos en el último día`,
      details: {
        suspiciousActivities,
        threshold: ALERT_THRESHOLDS.suspiciousActivitiesPerDay
      },
      timestamp: new Date()
    }
  }

  return null
}

// Función para detectar picos de rate limiting
export async function detectRateLimitSpike(): Promise<SecurityAlert | null> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const rateLimitExceeded = await prisma.auditLog.count({
    where: {
      action: { startsWith: 'rate_limit_exceeded_' },
      createdAt: { gte: oneHourAgo }
    }
  })

  if (rateLimitExceeded >= ALERT_THRESHOLDS.rateLimitExceededPerHour) {
    return {
      type: 'rate_limit_spike',
      severity: 'medium',
      message: `Pico de rate limiting detectado: ${rateLimitExceeded} excesos en la última hora`,
      details: {
        rateLimitExceeded,
        threshold: ALERT_THRESHOLDS.rateLimitExceededPerHour
      },
      timestamp: new Date()
    }
  }

  return null
}

// Función para detectar posibles brechas de datos
export async function detectDataBreach(): Promise<SecurityAlert | null> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [dataExports, unauthorizedAccess] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action: 'data_export',
        createdAt: { gte: oneDayAgo }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: 'unauthorized_access',
        createdAt: { gte: oneDayAgo }
      }
    })
  ])

  if (dataExports >= ALERT_THRESHOLDS.dataExportsPerDay || unauthorizedAccess >= ALERT_THRESHOLDS.unauthorizedAccessPerDay) {
    return {
      type: 'data_breach',
      severity: unauthorizedAccess >= ALERT_THRESHOLDS.unauthorizedAccessPerDay ? 'critical' : 'high',
      message: `Posible brecha de datos detectada: ${dataExports} exportaciones y ${unauthorizedAccess} accesos no autorizados en el último día`,
      details: {
        dataExports,
        unauthorizedAccess,
        dataExportsThreshold: ALERT_THRESHOLDS.dataExportsPerDay,
        unauthorizedAccessThreshold: ALERT_THRESHOLDS.unauthorizedAccessPerDay
      },
      timestamp: new Date()
    }
  }

  return null
}

// Función principal para ejecutar todas las detecciones
export async function runSecurityMonitoring(): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = []

  const [
    bruteForceAlert,
    suspiciousActivityAlert,
    rateLimitAlert,
    dataBreachAlert
  ] = await Promise.all([
    detectBruteForceAttack(),
    detectSuspiciousActivity(),
    detectRateLimitSpike(),
    detectDataBreach()
  ])

  if (bruteForceAlert) alerts.push(bruteForceAlert)
  if (suspiciousActivityAlert) alerts.push(suspiciousActivityAlert)
  if (rateLimitAlert) alerts.push(rateLimitAlert)
  if (dataBreachAlert) alerts.push(dataBreachAlert)

  // Log de alertas críticas
  for (const alert of alerts) {
    if (alert.severity === 'critical' || alert.severity === 'high') {
      await logSecurityEvent({
        action: `security_alert_${alert.type}`,
        details: alert.message,
        severity: alert.severity,
        metadata: alert.details
      })
    }
  }

  return alerts
}

// Función para obtener estadísticas de seguridad
export async function getSecurityStats(): Promise<{
  metrics: SecurityMetrics
  alerts: SecurityAlert[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}> {
  const metrics = await getSecurityMetrics('24h')
  const alerts = await runSecurityMonitoring()

  // Calcular nivel de riesgo
  let riskScore = 0
  if (metrics.failedLogins > 20) riskScore += 3
  if (metrics.suspiciousActivities > 2) riskScore += 2
  if (metrics.unauthorizedAccess > 0) riskScore += 4
  if (metrics.rateLimitExceeded > 10) riskScore += 1

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (riskScore >= 8) riskLevel = 'critical'
  else if (riskScore >= 5) riskLevel = 'high'
  else if (riskScore >= 2) riskLevel = 'medium'

  return {
    metrics,
    alerts,
    riskLevel
  }
}
