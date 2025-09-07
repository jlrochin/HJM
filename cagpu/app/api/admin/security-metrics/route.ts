import { NextRequest, NextResponse } from 'next/server'
import { getSecurityStats, getSecurityMetrics } from '@/lib/security-monitor'
import { getRateLimitStats } from '@/lib/rate-limit-simple'
import { prisma } from '@/lib/db'

// ============================================================================
// API: MÉTRICAS DE SEGURIDAD PARA DASHBOARD ADMIN
// ============================================================================
// Endpoint para obtener métricas de seguridad en tiempo real
// Solo accesible para administradores
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario es admin o developer
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'admin' && userRole !== 'developer') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores y desarrolladores pueden acceder a estas métricas.' },
        { status: 403 }
      )
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as '24h' | '7d' | '30d' || '24h'
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // Obtener métricas de seguridad
    const securityStats = await getSecurityStats()
    const securityMetrics = securityStats.metrics || await getSecurityMetrics(period)
    const rateLimitStats = getRateLimitStats()

    // Obtener estadísticas adicionales de la base de datos
    const [
      totalUsers,
      activeUsers,
      totalServices,
      totalDirections,
      recentLogins,
      recentSecurityEvents
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.service.count(),
      prisma.direction.count(),
      prisma.auditLog.findMany({
        where: {
          action: 'login_success',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          performedByUser: {
            select: { username: true, firstName: true, lastName: true }
          }
        }
      }),
      prisma.auditLog.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          action: {
            in: ['login_failed', 'unauthorized_access', 'suspicious_activity', 'rate_limit_exceeded']
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          performedByUser: {
            select: { username: true, firstName: true, lastName: true }
          }
        }
      })
    ])

    // Calcular métricas adicionales
    const loginSuccessRate = securityMetrics.totalLogins > 0 
      ? ((securityMetrics.totalLogins - securityMetrics.failedLogins) / securityMetrics.totalLogins) * 100 
      : 100

    const averageResponseTime = 150 // ms (simulado)
    const systemHealth = securityStats.riskLevel === 'low' ? 'excellent' : 
                        securityStats.riskLevel === 'medium' ? 'good' : 
                        securityStats.riskLevel === 'high' ? 'warning' : 'critical'

    // Construir respuesta
    const response = {
      timestamp: new Date().toISOString(),
      period,
      overview: {
        systemHealth,
        riskLevel: securityStats.riskLevel,
        activeAlerts: securityStats.alerts.length,
        loginSuccessRate: Math.round(loginSuccessRate * 100) / 100,
        averageResponseTime,
        totalUsers,
        activeUsers,
        totalServices,
        totalDirections
      },
      securityMetrics: {
        ...securityMetrics,
        alerts: includeDetails ? securityStats.alerts : securityStats.alerts.length
      },
      rateLimiting: {
        activeEntries: rateLimitStats.activeEntries,
        totalEntries: rateLimitStats.totalEntries,
        blockedRequests: rateLimitStats.entries.filter(e => e.count > 50).length
      },
      recentActivity: {
        logins: recentLogins.map(log => ({
          id: log.id,
          username: log.performedByUser?.username || 'unknown',
          userFullName: log.performedByUser ? 
            `${log.performedByUser.firstName || ''} ${log.performedByUser.lastName || ''}`.trim() : 'unknown',
          ip: log.ip,
          userAgent: log.userAgent,
          timestamp: log.createdAt
        })),
        securityEvents: recentSecurityEvents.map(event => ({
          id: event.id,
          action: event.action,
          username: event.performedByUser?.username || 'unknown',
          userFullName: event.performedByUser ? 
            `${event.performedByUser.firstName || ''} ${event.performedByUser.lastName || ''}`.trim() : 'unknown',
          ip: event.ip,
          userAgent: event.userAgent,
          details: event.details,
          timestamp: event.createdAt
        }))
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error obteniendo métricas de seguridad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener métricas de seguridad' },
      { status: 500 }
    )
  }
}
