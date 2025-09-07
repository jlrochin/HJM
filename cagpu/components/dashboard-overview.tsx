"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, AlertCircle, CheckCircle, Clock, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
// Removed hardcoded data import - now uses database data
import { cn, formatTimeAgo } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChangeHistorySummary } from "@/components/change-history"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    activeServices: 0,
    pendingUpdates: 0,
    recentChanges: 0,
    serviceStatus: 0,
    activeUsers: 0,
  })
  const [userChanges, setUserChanges] = useState<any[]>([])
  const [directionsData, setDirectionsData] = useState<any[]>([])
  const [servicesData, setServicesData] = useState<any[]>([])

  // Load data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, directionsRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/directions')
        ])

        const services = await servicesRes.json()
        const directions = await directionsRes.json()

        setServicesData(services)
        setDirectionsData(directions)

        // Initial stats
        setStats({
          activeServices: services.length,
          pendingUpdates: Math.floor(Math.random() * 5) + 2,
          recentChanges: Math.floor(Math.random() * 10) + 5,
          serviceStatus: Math.floor(Math.random() * 30) + 70, // 70-100%
          activeUsers: Math.floor(Math.random() * 5) + 3,
        })
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    fetchData()

    // Update stats periodically
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        pendingUpdates: Math.max(0, prev.pendingUpdates + (Math.random() > 0.7 ? 1 : -1)),
        recentChanges: prev.recentChanges + (Math.random() > 0.5 ? 1 : 0),
        serviceStatus: Math.min(100, Math.max(70, prev.serviceStatus + (Math.random() > 0.5 ? 1 : -1))),
        activeUsers: Math.max(1, Math.min(10, prev.activeUsers + (Math.random() > 0.7 ? 1 : -1))),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Fetch usuarios activos en tiempo real
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await fetch('/api/users/active');
        const data = await res.json();
        setStats((prev) => ({ ...prev, activeUsers: data.activeUsers }));
      } catch (e) {
        // Silenciar error
      }
    };
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mantener lastActiveAt actualizado
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch('/api/ping');
      } catch { }
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/user-change-history')
      .then(res => res.json())
      .then(data => setUserChanges(data.history || []));
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-100 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                Servicios Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <div className="text-2xl font-bold text-green-800 dark:text-green-300">{stats.activeServices}</div>
              </div>
              <p className="text-xs text-green-700/70 dark:text-green-400/70 mt-1">
                {directionsData.length} direcciones
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-100 dark:border-amber-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Actualizaciones Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">{stats.pendingUpdates}</div>
              </div>
              <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-1">Requieren revisión</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-100 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Cambios Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{stats.recentChanges}</div>
              </div>
              <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-1">En las últimas 24 horas</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-1"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40 border-purple-100 dark:border-purple-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Usuarios Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">{stats.activeUsers}</div>
              </div>
              <p className="text-xs text-purple-700/70 dark:text-purple-400/70 mt-1">En este momento</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border-rose-100 dark:border-rose-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-300">
                Estado de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <AlertCircle
                  className={cn(
                    "h-5 w-5 mr-2",
                    stats.serviceStatus > 90
                      ? "text-green-600 dark:text-green-400"
                      : stats.serviceStatus > 80
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400",
                  )}
                />
                <div className="text-2xl font-bold text-rose-800 dark:text-rose-300">{stats.serviceStatus}%</div>
              </div>
              <Progress
                value={stats.serviceStatus}
                className="h-2"
                indicatorClassName={cn(
                  stats.serviceStatus > 90
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : stats.serviceStatus > 80
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                      : "bg-gradient-to-r from-rose-500 to-pink-500",
                )}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas actualizaciones de usuarios y servicios</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-muted">
                {userChanges.length === 0 ? (
                  <li className="py-4 text-muted-foreground">No hay cambios recientes.</li>
                ) : (
                  userChanges.slice(0, 5).map((change) => (
                    <li key={change.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full bg-blue-500 inline-block" />
                        <div>
                          <span className="font-semibold text-foreground">
                            {formatAction(change.action)}
                          </span>{' '}
                          {change.action?.includes('service') ? (
                            <span className="font-medium text-primary">
                              {change.details?.split('"')[1] || 'Servicio'}
                            </span>
                          ) : (
                            <span className="font-medium text-primary">{change.targetUser?.username || 'Desconocido'}</span>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Por: {change.performedByUser?.username || 'Desconocido'}
                          </div>
                          {change.details && !change.details.startsWith('Usuario actualizado: {') && (
                            <div className="text-xs text-muted-foreground mt-1 bg-muted/30 p-1 rounded">
                              {change.details}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{formatTimeAgo(new Date(change.createdAt))}</span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function formatAction(action: string): string {
  if (action === 'activate') return 'Usuario Activado';
  if (action === 'deactivate') return 'Usuario Desactivado';
  if (action === 'update') return 'Usuario Modificado';
  if (action === 'create') return 'Usuario Creado';
  if (action === 'service_create') return 'Servicio Creado';
  if (action === 'service_update') return 'Servicio Actualizado';
  return action;
}
