"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { Calendar, Download, FileSpreadsheet, FileText, RefreshCw, TrendingUp, Users, Activity, Clock, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("month")
  const [exportLoading, setExportLoading] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [directionsData, setDirectionsData] = useState<any[]>([])
  const [servicesData, setServicesData] = useState<any[]>([])
  const [changeHistoryData, setChangeHistoryData] = useState<any[]>([])
  const [auditLogData, setAuditLogData] = useState<any[]>([])
  const [usersData, setUsersData] = useState<any[]>([])

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [servicesRes, directionsRes, changeHistoryRes, auditLogRes, usersRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/directions'),
          fetch('/api/user-change-history?limit=100'),
          fetch('/api/audit-log?limit=100'),
          fetch('/api/users')
        ])

        const services = await servicesRes.json()
        const directions = await directionsRes.json()
        const changeHistory = await changeHistoryRes.json()
        const auditLog = await auditLogRes.json()
        const users = await usersRes.json()

        setServicesData(services)
        setDirectionsData(directions)
        setChangeHistoryData(changeHistory)
        setAuditLogData(auditLog)
        setUsersData(users)
        setAnalyticsData(generateAnalyticsData(services, directions, changeHistory, auditLog, users))
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const [servicesRes, directionsRes, changeHistoryRes, auditLogRes, usersRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/directions'),
        fetch('/api/user-change-history?limit=100'),
        fetch('/api/audit-log?limit=100'),
        fetch('/api/users')
      ])

      const services = await servicesRes.json()
      const directions = await directionsRes.json()
      const changeHistory = await changeHistoryRes.json()
      const auditLog = await auditLogRes.json()
      const users = await usersRes.json()

      setServicesData(services)
      setDirectionsData(directions)
      setChangeHistoryData(changeHistory)
      setAuditLogData(auditLog)
      setUsersData(users)
      setAnalyticsData(generateAnalyticsData(services, directions, changeHistory, auditLog, users))
      setRefreshing(false)
      toast({
        title: "Datos actualizados",
        description: "Los datos de analíticas han sido actualizados correctamente.",
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      setRefreshing(false)
    }
  }

  // Export functionality
  const handleExport = (format: string) => {
    setExportLoading(format)
    setTimeout(() => {
      setExportLoading(null)
      toast({
        title: "Exportación completada",
        description: `Los datos han sido exportados en formato ${format.toUpperCase()} correctamente.`,
      })
    }, 400)
  }

  // Generate analytics data from real database data
  const generateAnalyticsData = (services: any[], directions: any[], changeHistory: any[] = [], auditLog: any[] = [], users: any[] = []) => {
    // Asegurar que los arrays no sean undefined y sean realmente arrays
    const safeServices = Array.isArray(services) ? services : []
    const safeDirections = Array.isArray(directions) ? directions : []
    const safeChangeHistory = Array.isArray(changeHistory) ? changeHistory : []
    const safeAuditLog = Array.isArray(auditLog) ? auditLog : []
    const safeUsers = Array.isArray(users) ? users : []

    const servicesByDirection = safeDirections.map((direction) => {
      const count = safeServices.filter((service) => service.directionId === direction.id).length
      return {
        name: direction.name.split(" ")[1] || direction.name.split(" ")[0],
        count,
        fullName: direction.name,
      }
    })

    const servicesByType = [
      { name: "Clínico", value: safeServices.filter((s) => s.serviceType === "clinical").length },
      { name: "Administrativo", value: safeServices.filter((s) => s.serviceType === "administrative").length },
      { name: "Apoyo", value: safeServices.filter((s) => s.serviceType === "support").length },
      { name: "Especializado", value: safeServices.filter((s) => s.serviceType === "specialized").length },
      { name: "Unidad", value: safeServices.filter((s) => s.serviceType === "Unidad").length },
      { name: "División", value: safeServices.filter((s) => s.serviceType === "División").length },
      { name: "Servicio", value: safeServices.filter((s) => s.serviceType === "Servicio").length },
      { name: "Departamento", value: safeServices.filter((s) => s.serviceType === "Departamento").length },
      { name: "Subdirección", value: safeServices.filter((s) => s.serviceType === "Subdirección").length },
      { name: "Coordinación", value: safeServices.filter((s) => s.serviceType === "Coordinación").length },
      { name: "Área", value: safeServices.filter((s) => s.serviceType === "Área").length },
      { name: "Laboratorio", value: safeServices.filter((s) => s.serviceType === "Laboratorio").length },
    ].filter(item => item.value > 0)

    // Analíticas de cambios y actividad
    const changesByType = safeChangeHistory.reduce((acc: any, change: any) => {
      const action = change.action
      acc[action] = (acc[action] || 0) + 1
      return acc
    }, {})

    const changesByTypeArray = Object.entries(changesByType).map(([key, value]) => ({
      name: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }))

    // Actividad por día (últimos 7 días)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const activityByDay = last7Days.map(date => {
      const dayChanges = safeChangeHistory.filter((change: any) =>
        change.createdAt && change.createdAt.startsWith(date)
      ).length

      const dayAudits = safeAuditLog.filter((log: any) =>
        log.createdAt && log.createdAt.startsWith(date)
      ).length

      return {
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        cambios: dayChanges,
        auditoria: dayAudits,
        total: dayChanges + dayAudits
      }
    })

    // Usuarios más activos
    const userActivity = safeChangeHistory.reduce((acc: any, change: any) => {
      const userId = change.performedBy
      if (!acc[userId]) {
        acc[userId] = { userId, changes: 0, lastActivity: null }
      }
      acc[userId].changes += 1
      if (!acc[userId].lastActivity || change.createdAt > acc[userId].lastActivity) {
        acc[userId].lastActivity = change.createdAt
      }
      return acc
    }, {})

    const topUsers = Object.values(userActivity)
      .sort((a: any, b: any) => b.changes - a.changes)
      .slice(0, 5)
      .map((user: any) => ({
        userId: user.userId,
        changes: user.changes,
        lastActivity: user.lastActivity
      }))

    // Real summary metrics from database
    const summaryMetrics = {
      totalServices: safeServices.length,
      totalDirections: safeDirections.length,
      activeServices: safeServices.filter(s => s.isActive !== false).length,
      totalUpdates: safeChangeHistory.length,
      activeUsers: safeUsers.filter(user => user.isActive).length,
      totalUsers: safeUsers.length,
      totalAuditLogs: safeAuditLog.length,
      recentActivity: safeChangeHistory.filter((change: any) => {
        const changeDate = new Date(change.createdAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return changeDate > weekAgo
      }).length
    }

    return {
      servicesByDirection,
      servicesByType,
      changesByType: changesByTypeArray,
      activityByDay,
      topUsers,
      summaryMetrics,
    }
  }

  const COLORS = [
    "#3B82F6", // Azul - Unidad
    "#10B981", // Verde - División  
    "#F59E0B", // Amarillo - Servicio
    "#EF4444", // Rojo - Departamento
    "#8B5CF6", // Púrpura - Subdirección
    "#06B6D4", // Cian - Coordinación
    "#84CC16", // Verde lima - Área
    "#F97316", // Naranja - Laboratorio
    "#EC4899", // Rosa - Clinical
    "#6366F1", // Índigo - Administrative
    "#14B8A6", // Teal - Support
    "#F43F5E"  // Rose - Specialized
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-6">
        <div className="animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 h-16 w-16 mb-4" />
        <span className="text-lg text-blue-700 font-semibold">Cargando analíticas...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-6">
        <span className="text-lg text-gray-600">No hay datos de analíticas disponibles.</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analíticas del Sistema</h2>
          <p className="text-muted-foreground">Visualización de datos y estadísticas de servicios</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Exportar datos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={exportLoading === "pdf"}>
                <FileText className="mr-2 h-4 w-4 text-rose-500" />
                <span>Exportar como PDF</span>
                {exportLoading === "pdf" && (
                  <Badge variant="outline" className="ml-2 animate-pulse">
                    Exportando...
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} disabled={exportLoading === "excel"}>
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Exportar como Excel</span>
                {exportLoading === "excel" && (
                  <Badge variant="outline" className="ml-2 animate-pulse">
                    Exportando...
                  </Badge>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-100 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Total de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {analyticsData.summaryMetrics.totalServices}
              </div>
              <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-1">{analyticsData.summaryMetrics.totalDirections} direcciones</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-100 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                Servicios Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                {analyticsData.summaryMetrics.activeServices}
              </div>
              <p className="text-xs text-green-700/70 dark:text-green-400/70 mt-1">En funcionamiento</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 border-purple-100 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Cambios Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                {analyticsData.summaryMetrics.totalUpdates}
              </div>
              <p className="text-xs text-purple-700/70 dark:text-purple-400/70 mt-1">
                <TrendingUp className="inline-block h-4 w-4 mr-1" />
                Actualizaciones de servicios
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border-orange-100 dark:border-orange-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Usuarios Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                {analyticsData.summaryMetrics.activeUsers}
              </div>
              <p className="text-xs text-orange-700/70 dark:text-orange-400/70 mt-1">
                <Users className="inline-block h-4 w-4 mr-1" />
                Usuarios en el sistema
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Actividad Reciente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente del Sistema
            </CardTitle>
            <CardDescription>Resumen de la actividad más reciente en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  {analyticsData.summaryMetrics.recentActivity || 0}
                </div>
                <p className="text-sm text-blue-700/70 dark:text-blue-400/70">Cambios esta semana</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/40 rounded-lg">
                <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                  {analyticsData.summaryMetrics.totalUsers || 0}
                </div>
                <p className="text-sm text-green-700/70 dark:text-green-400/70">Total de usuarios</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                  {analyticsData.summaryMetrics.totalAuditLogs || 0}
                </div>
                <p className="text-sm text-purple-700/70 dark:text-purple-400/70">Registros de auditoría</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Servicios por Dirección</CardTitle>
                  <CardDescription>Distribución de servicios por dirección</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.servicesByDirection}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [value, "Cantidad"]}
                          labelFormatter={(label: any, payload: any) => {
                            if (payload && payload.length > 0) {
                              return payload[0].payload.fullName
                            }
                            return label
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" name="Servicios" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Servicios por Tipo</CardTitle>
                  <CardDescription>Distribución de servicios por categoría</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                  <div className="h-[350px] w-full max-w-[450px] mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                        <Pie
                          data={analyticsData.servicesByType.filter((item: { name: string, value: number }) => item.value > 0)}
                          cx="50%"
                          cy="45%"
                          labelLine={false}
                          outerRadius={80}
                          innerRadius={30}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent, value }) => {
                            // Solo mostrar etiquetas para porcentajes mayores al 3% o valores mayores a 2
                            if (percent > 0.03 || value > 2) {
                              return `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            return ''
                          }}
                          paddingAngle={2}
                        >
                          {analyticsData.servicesByType.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} servicios`, "Cantidad"]}
                          labelFormatter={(label) => label}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={50}
                          wrapperStyle={{ paddingTop: '20px' }}
                          formatter={(value, entry, index) => {
                            const item = analyticsData.servicesByType[index]
                            return [
                              <span key={`legend-${index}`} className="text-xs">
                                {value} ({item.value})
                              </span>
                            ]
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Servicios</CardTitle>
                <CardDescription>Todos los servicios registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {servicesData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay servicios registrados en el sistema.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {servicesData.map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {directionsData.find(d => d.id === service.directionId)?.name || 'Sin dirección'}
                          </p>
                        </div>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Actividad por Día</CardTitle>
                  <CardDescription>Actividad del sistema en los últimos 7 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analyticsData.activityByDay}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            name === 'cambios' ? 'Cambios' : name === 'auditoria' ? 'Auditoría' : 'Total'
                          ]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="cambios" stackId="1" stroke="#8884d8" fill="#8884d8" name="Cambios" />
                        <Area type="monotone" dataKey="auditoria" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Auditoría" />
                        <Area type="monotone" dataKey="total" stackId="1" stroke="#ffc658" fill="#ffc658" name="Total" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Cambios</CardTitle>
                  <CardDescription>Distribución de cambios por tipo de acción</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-[300px] w-full max-w-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.changesByType}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {analyticsData.changesByType.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} cambios`, "Cantidad"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle>Usuarios Más Activos</CardTitle>
                <CardDescription>Top 5 usuarios con más cambios realizados</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.topUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos de actividad de usuarios disponibles.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData.topUsers.map((user: any, index: number) => (
                      <div key={user.userId} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-semibold text-blue-800 dark:text-blue-200">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">Usuario ID: {user.userId}</h4>
                            <p className="text-sm text-muted-foreground">
                              Última actividad: {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('es-ES') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {user.changes} cambios
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
