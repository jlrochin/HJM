'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  RefreshCw,
  BarChart3,
  UserCheck,
  Lock
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// ============================================================================
// DASHBOARD DE SEGURIDAD PARA ADMINISTRADORES
// ============================================================================
// Panel de control completo para monitoreo de seguridad
// Solo accesible para usuarios con rol 'admin'
// ============================================================================

interface SecurityMetrics {
  totalLogins: number
  failedLogins: number
  suspiciousActivities: number
  rateLimitExceeded: number
  unauthorizedAccess: number
  dataExports: number
  userCreations: number
  userDeactivations: number
  period: string
}

interface SecurityAlert {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: any
  timestamp: string
}

interface Overview {
  systemHealth: string
  riskLevel: string
  activeAlerts: number
  loginSuccessRate: number
  averageResponseTime: number
  totalUsers: number
  activeUsers: number
  totalServices: number
  totalDirections: number
}

interface RecentActivity {
  logins: Array<{
    id: number
    username: string
    userFullName: string
    ip: string
    userAgent: string
    timestamp: string
  }>
  securityEvents: Array<{
    id: number
    action: string
    username: string
    userFullName: string
    ip: string
    userAgent: string
    details: string
    timestamp: string
  }>
}

interface DashboardData {
  timestamp: string
  period: string
  overview: Overview
  securityMetrics: SecurityMetrics
  alerts: SecurityAlert[]
  rateLimiting: {
    activeEntries: number
    totalEntries: number
    blockedRequests: number
  }
  recentActivity: RecentActivity
}

const COLORS = {
  excellent: '#10b981',
  good: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f59e0b'
}

export default function SecurityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/security-metrics?period=${period}&includeDetails=true`)

      if (!response.ok) {
        throw new Error('Error al obtener métricas de seguridad')
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000) // Actualizar cada 30 segundos
      return () => clearInterval(interval)
    }
  }, [period, autoRefresh])

  const getHealthColor = (health: string) => {
    return COLORS[health as keyof typeof COLORS] || '#6b7280'
  }

  const getSeverityColor = (severity: string) => {
    return COLORS[severity as keyof typeof COLORS] || '#6b7280'
  }

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: es })
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard de seguridad...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar el dashboard: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No se pudieron cargar los datos del dashboard
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Seguridad</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de la seguridad de CAGPU
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={(value: '24h' | '7d' | '30d') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getHealthColor(data.overview.systemHealth) }}
              />
              <span className="text-2xl font-bold capitalize">
                {data.overview.systemHealth}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nivel de riesgo: {data.overview.riskLevel}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              de {data.overview.totalUsers} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito Login</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.loginSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              {data.securityMetrics.totalLogins} intentos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Actividad de Login */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Login</CardTitle>
                <CardDescription>Últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { time: '00:00', logins: data.securityMetrics.totalLogins, failed: data.securityMetrics.failedLogins },
                    { time: '06:00', logins: Math.floor(data.securityMetrics.totalLogins * 0.3), failed: Math.floor(data.securityMetrics.failedLogins * 0.3) },
                    { time: '12:00', logins: Math.floor(data.securityMetrics.totalLogins * 0.6), failed: Math.floor(data.securityMetrics.failedLogins * 0.6) },
                    { time: '18:00', logins: Math.floor(data.securityMetrics.totalLogins * 0.8), failed: Math.floor(data.securityMetrics.failedLogins * 0.8) },
                    { time: '24:00', logins: data.securityMetrics.totalLogins, failed: data.securityMetrics.failedLogins }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="logins" stroke="#3b82f6" name="Logins Exitosos" />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Logins Fallidos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Métricas de Seguridad */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Seguridad</CardTitle>
                <CardDescription>Eventos de seguridad detectados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Actividades Sospechosas</span>
                    <Badge variant="secondary">{data.securityMetrics.suspiciousActivities}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rate Limits Excedidos</span>
                    <Badge variant="secondary">{data.securityMetrics.rateLimitExceeded}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Accesos No Autorizados</span>
                    <Badge variant="destructive">{data.securityMetrics.unauthorizedAccess}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Exportaciones de Datos</span>
                    <Badge variant="secondary">{data.securityMetrics.dataExports}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Logins Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Logins Recientes</CardTitle>
                <CardDescription>Últimos 10 logins exitosos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recentActivity.logins.map((login) => (
                    <div key={login.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{login.userFullName || login.username}</div>
                        <div className="text-sm text-muted-foreground">{login.ip}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(login.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Eventos de Seguridad */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos de Seguridad</CardTitle>
                <CardDescription>Últimos 20 eventos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recentActivity.securityEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{event.userFullName || event.username}</div>
                        <div className="text-sm text-muted-foreground">{event.action}</div>
                        <div className="text-xs text-muted-foreground">{event.ip}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Seguridad</CardTitle>
              <CardDescription>Alertas activas que requieren atención</CardDescription>
            </CardHeader>
            <CardContent>
              {!data.alerts || data.alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay alertas activas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.alerts?.map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.message}</span>
                          <Badge
                            variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                            style={{ backgroundColor: getSeverityColor(alert.severity) }}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(alert.timestamp)}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribución de Eventos */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Eventos</CardTitle>
                <CardDescription>Tipos de eventos de seguridad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Logins Exitosos', value: data.securityMetrics.totalLogins - data.securityMetrics.failedLogins },
                        { name: 'Logins Fallidos', value: data.securityMetrics.failedLogins },
                        { name: 'Actividades Sospechosas', value: data.securityMetrics.suspiciousActivities },
                        { name: 'Rate Limits', value: data.securityMetrics.rateLimitExceeded }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Logins Exitosos', value: data.securityMetrics.totalLogins - data.securityMetrics.failedLogins },
                        { name: 'Logins Fallidos', value: data.securityMetrics.failedLogins },
                        { name: 'Actividades Sospechosas', value: data.securityMetrics.suspiciousActivities },
                        { name: 'Rate Limits', value: data.securityMetrics.rateLimitExceeded }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444', '#f59e0b', '#3b82f6'][index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Rate Limiting Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Rate Limiting</CardTitle>
                <CardDescription>Estado actual del rate limiting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Entradas Activas</span>
                    <Badge variant="secondary">{data.rateLimiting.activeEntries}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total de Entradas</span>
                    <Badge variant="secondary">{data.rateLimiting.totalEntries}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Requests Bloqueados</span>
                    <Badge variant="destructive">{data.rateLimiting.blockedRequests}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
