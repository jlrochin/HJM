'use client'

import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { DashboardOverview } from "@/components/dashboard-overview"
import { Header } from "@/components/header"
import { ServiceManagement } from "@/components/service-management"
import SecurityDashboard from "@/components/security-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AdminUsuariosPage from "@/app/admin/usuarios/page"
import { useAuth } from "@/hooks/use-auth"

function AccessDenied({ onGoToServices }: { onGoToServices: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <span className="text-8xl">🚫</span>
      <h2 className="text-4xl font-extrabold text-red-500">¡Acceso denegado!</h2>
      <p className="text-2xl text-muted-foreground text-center max-w-xl">
        No tienes permiso para ver esta sección.<br />
        <span className="text-lg">(Error 403: Solo admins pueden entrar aquí. ¡Ups! 😅)</span>
      </p>
      <Button onClick={onGoToServices} className="mt-4 px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
        Ir a Servicios
      </Button>
    </div>
  )
}

function CambiosRecientes({ history }: { history: any[] }) {
  // Función para asignar color según la acción
  function actionBadgeClass(action: string) {
    switch (action) {
      case 'activate':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'deactivate':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'create':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Cambios Recientes de Usuarios y Servicios</h2>
      {history.length === 0 ? (
        <div className="text-gray-500">No hay cambios recientes.</div>
      ) : (
        <ul className="space-y-2">
          {history.map((item) => (
            <li key={item.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-1">
                <span className={`inline-block px-2 py-0.5 rounded font-semibold text-xs mr-2 capitalize ${actionBadgeClass(item.action)}`}>{item.action}</span>
                <span className="inline-block bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded font-semibold text-xs">
                  {new Date(item.createdAt).toLocaleString('es-ES')}
                </span>
              </div>
              {item.details && (
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2">
                  <strong>Cambios:</strong> {
                    item.details.startsWith('Usuario actualizado: {')
                      ? 'Datos del usuario actualizados (información personal, rol, etc.)'
                      : item.details
                  }
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1 flex gap-2 items-center">
                Usuario afectado:
                <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded font-semibold text-xs">
                  {item.targetUser?.username || item.targetUserId}
                </span>
                |
                Realizado por:
                <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded font-semibold text-xs">
                  {item.performedByUser?.username || item.performedBy}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AuditoriaLog({ logs, page, total, onPageChange }: { logs: any[], page: number, total: number, onPageChange: (p: number) => void }) {
  function actionBadgeClass(action: string) {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'logout':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'create':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
  const totalPages = Math.ceil(total / 10);
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Auditoría del Sistema</h2>
      {logs.length === 0 ? (
        <div className="text-gray-500">No hay eventos de auditoría.</div>
      ) : (
        <>
          <ul className="space-y-2">
            {logs.map((item) => (
              <li key={item.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-1">
                  <span className={`inline-block px-2 py-0.5 rounded font-semibold text-xs mr-2 capitalize ${actionBadgeClass(item.action)}`}>{item.action}</span>
                  <span className="inline-block bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-0.5 rounded font-semibold text-xs">
                    {new Date(item.createdAt).toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {item.details}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex gap-2 items-center">
                  {item.performedByUser?.username && (
                    <>
                      Usuario:
                      <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded font-semibold text-xs">
                        {item.performedByUser.username}
                      </span>
                    </>
                  )}
                  {item.targetUser?.username && (
                    <>
                      | Afectado:
                      <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded font-semibold text-xs">
                        {item.targetUser.username}
                      </span>
                    </>
                  )}
                  {item.ip && <span>| IP: {item.ip}</span>}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading, isAdmin, isDeveloper } = useAuth()
  const [tab, setTab] = React.useState('services')
  const [history, setHistory] = React.useState<any[]>([])
  const [audit, setAudit] = React.useState<any[]>([])
  const [auditTotal, setAuditTotal] = React.useState(0)
  const [auditPage, setAuditPage] = React.useState(1)

  React.useEffect(() => {
    if (!authLoading && user) {
      // Cargar historial de cambios recientes para admins y developers
      if (isAdmin || isDeveloper) {
        fetch('/api/user-change-history', { credentials: 'include' })
          .then(res => res.json())
          .then(data => setHistory(data.history || []));
      }
    }
  }, [authLoading, user, isAdmin, isDeveloper])

  React.useEffect(() => {
    if (isAdmin || isDeveloper) {
      fetch(`/api/audit-log?page=${auditPage}&limit=10`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setAudit(data.logs || [])
          setAuditTotal(data.total || 0)
        });
    }
  }, [auditPage, isAdmin, isDeveloper])

  React.useEffect(() => {
    if (!isAdmin && !isDeveloper) {
      setTab('services')
    }
  }, [isAdmin, isDeveloper])
  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Verificando autenticación...</div>
          </div>
        </main>
      </div>
    )
  }

  // Redirigir al login si no hay usuario autenticado
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-lg mb-4">Debes iniciar sesión para acceder</div>
            <Button onClick={() => window.location.href = '/login'}>
              Ir al Login
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted/80 p-1">
              {(isAdmin || isDeveloper) && (
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              )}
              <TabsTrigger
                value="services"
                className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Servicios
              </TabsTrigger>
              {(isAdmin || isDeveloper) && <TabsTrigger value="analytics">Analíticas</TabsTrigger>}
              {(isAdmin || isDeveloper) && <TabsTrigger value="admin">Administrador</TabsTrigger>}
              {(isAdmin || isDeveloper) && <TabsTrigger value="security">Seguridad</TabsTrigger>}
              {(isAdmin || isDeveloper) && <TabsTrigger value="history">Cambios Recientes</TabsTrigger>}
              {(isAdmin || isDeveloper) && <TabsTrigger value="audit">Auditoría</TabsTrigger>}
            </TabsList>
          </div>
          {(isAdmin || isDeveloper) && (
            <TabsContent value="dashboard">
              <DashboardOverview />
            </TabsContent>
          )}
          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>
          {(isAdmin || isDeveloper) && (
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          )}
          {(isAdmin || isDeveloper) && (
            <TabsContent value="admin">
              <AdminUsuariosPage />
            </TabsContent>
          )}
          {(isAdmin || isDeveloper) && (
            <TabsContent value="security">
              <SecurityDashboard />
            </TabsContent>
          )}
          {(isAdmin || isDeveloper) && (
            <TabsContent value="history">
              <CambiosRecientes history={history} />
            </TabsContent>
          )}
          {(isAdmin || isDeveloper) && (
            <TabsContent value="audit">
              <AuditoriaLog logs={audit} page={auditPage} total={auditTotal} onPageChange={setAuditPage} />
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Toaster />
    </div>
  )
} 