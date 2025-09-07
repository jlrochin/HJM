import { prisma } from './db'

// ============================================================================
// SISTEMA DE LOGGING DE SEGURIDAD
// ============================================================================
// Registra eventos de seguridad para auditoría y monitoreo
// ============================================================================

export interface SecurityEvent {
  action: string
  userId?: number
  ip?: string
  userAgent?: string
  details?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
}

export interface SecurityLogEntry {
  id: number
  action: string
  userId?: number
  ip?: string
  userAgent?: string
  details?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: Record<string, any>
  createdAt: Date
}

// Función principal para registrar eventos de seguridad
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: event.action,
        performedBy: event.userId,
        details: event.details,
        ip: event.ip,
        userAgent: event.userAgent,
      }
    })

    // Log adicional para eventos críticos
    if (event.severity === 'critical' || event.severity === 'high') {
      console.error(`🚨 SECURITY ALERT [${event.severity.toUpperCase()}]: ${event.action}`, {
        userId: event.userId,
        ip: event.ip,
        details: event.details,
        metadata: event.metadata,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error logging security event:', error)
  }
}

// Funciones específicas para diferentes tipos de eventos
export async function logLoginAttempt(username: string, success: boolean, ip?: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    action: success ? 'login_success' : 'login_failed',
    details: `Login ${success ? 'exitoso' : 'fallido'} para usuario: ${username}`,
    ip,
    userAgent,
    severity: success ? 'low' : 'medium',
    metadata: { username, success }
  })
}

export async function logPasswordChange(userId: number, ip?: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    action: 'password_change',
    userId,
    details: 'Contraseña cambiada',
    ip,
    userAgent,
    severity: 'medium'
  })
}

export async function logUserCreation(createdBy: number, newUserId: number, ip?: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    action: 'user_creation',
    userId: createdBy,
    details: `Usuario creado con ID: ${newUserId}`,
    ip,
    userAgent,
    severity: 'medium',
    metadata: { newUserId }
  })
}

export async function logUserDeactivation(performedBy: number, targetUserId: number, ip?: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    action: 'user_deactivation',
    userId: performedBy,
    details: `Usuario desactivado con ID: ${targetUserId}`,
    ip,
    userAgent,
    severity: 'high',
    metadata: { targetUserId }
  })
}

export async function logSuspiciousActivity(action: string, userId?: number, ip?: string, userAgent?: string, details?: string): Promise<void> {
  await logSecurityEvent({
    action: `suspicious_${action}`,
    userId,
    details: details || 'Actividad sospechosa detectada',
    ip,
    userAgent,
    severity: 'high',
    metadata: { suspicious: true }
  })
}

export async function logRateLimitExceeded(action: string, ip?: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    action: `rate_limit_exceeded_${action}`,
    details: `Rate limit excedido para acción: ${action}`,
    ip,
    userAgent,
    severity: 'medium',
    metadata: { rateLimited: true, action }
  })
}

export async function logUnauthorizedAccess(attemptedAction: string, ip?: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    action: 'unauthorized_access',
    details: `Acceso no autorizado intentado: ${attemptedAction}`,
    ip,
    userAgent,
    severity: 'high',
    metadata: { attemptedAction }
  })
}

export async function logDataExport(userId: number, exportType: string, recordCount: number, ip?: string, userAgent?: string): Promise<void> {
  await logSecurityEvent({
    action: 'data_export',
    userId,
    details: `Exportación de datos: ${exportType} (${recordCount} registros)`,
    ip,
    userAgent,
    severity: 'medium',
    metadata: { exportType, recordCount }
  })
}

// Función para obtener logs de seguridad
export async function getSecurityLogs(
  page: number = 1,
  limit: number = 10,
  severity?: string,
  action?: string,
  userId?: number
): Promise<{ logs: SecurityLogEntry[], total: number }> {
  const skip = (page - 1) * limit
  
  const where: any = {}
  if (severity) where.severity = severity
  if (action) where.action = { contains: action }
  if (userId) where.performedBy = userId

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        performedBy: true,
        ip: true,
        userAgent: true,
        details: true,
        createdAt: true
      }
    }),
    prisma.auditLog.count({ where })
  ])

  return {
    logs: logs.map(log => ({
      ...log,
      severity: getSeverityFromAction(log.action),
      metadata: {},
      ip: log.ip || undefined,
      userAgent: log.userAgent || undefined,
      details: log.details || undefined
    })),
    total
  }
}

// Función helper para determinar severidad basada en la acción
function getSeverityFromAction(action: string): 'low' | 'medium' | 'high' | 'critical' {
  if (action.includes('critical') || action.includes('suspicious')) return 'critical'
  if (action.includes('unauthorized') || action.includes('deactivation')) return 'high'
  if (action.includes('failed') || action.includes('rate_limit')) return 'medium'
  return 'low'
}

// Función para limpiar logs antiguos (mantener solo últimos 90 días)
export async function cleanupOldSecurityLogs(): Promise<void> {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    })

    console.log(`🧹 Limpieza de logs: ${result.count} registros eliminados`)
  } catch (error) {
    console.error('Error limpiando logs antiguos:', error)
  }
}
