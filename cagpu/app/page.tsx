'use client'

// ============================================================================
// PÁGINA PRINCIPAL DE LA APLICACIÓN CAGPU
// ============================================================================
// Esta página es el punto de entrada principal de la aplicación
// Incluye:
// - Sistema de autenticación basado en roles
// - Dashboard para administradores
// - Gestión de servicios para usuarios
// - Navegación por pestañas
// ============================================================================

import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { DashboardOverview } from "@/components/dashboard-overview"
import { Header } from "@/components/header"
import { ServiceManagement } from "@/components/service-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AdminUsuariosPage from "./admin/usuarios/page"

// ============================================================================
// FUNCIÓN: OBTENER ROL DEL USUARIO
// ============================================================================
// Recupera el rol del usuario desde localStorage
// Retorna 'user' por defecto si no hay rol definido
function getRole(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('role') || 'user'
  }
  return 'user'
}

// ============================================================================
// COMPONENTE: ACCESO DENEGADO
// ============================================================================
// Muestra un mensaje de error cuando el usuario no tiene permisos
// para acceder a una sección específica
function AccessDenied({ onGoToServices }: { onGoToServices: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <span className="text-8xl">🚫</span>
      <h2 className="text-4xl font-extrabold text-red-500">
        ¡Acceso denegado!
      </h2>
      <p className="text-2xl text-muted-foreground text-center max-w-xl">
        No tienes permiso para ver esta sección.<br />
        <span className="text-lg">
          (Error 403: Solo admins pueden entrar aquí. ¡Ups! 😅)
        </span>
      </p>
      <Button
        onClick={onGoToServices}
        className="mt-4 px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        Ir a Servicios
      </Button>
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL: PÁGINA DE INICIO
// ============================================================================
export default function Home() {
  // Estado para el rol del usuario y la pestaña activa
  const [role, setRole] = React.useState<string>('user')
  const [tab, setTab] = React.useState<string>('admin')

  // Efecto para inicializar el rol y la pestaña por defecto
  React.useEffect(() => {
    const userRole = getRole()
    setRole(userRole)

    // Configurar pestaña por defecto según el rol
    if (userRole === 'user') {
      setTab('services')
    } else {
      setTab('dashboard')
    }
  }, [])

  // Manejador para navegar a la pestaña de servicios
  const handleGoToServices = () => setTab('services')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Encabezado de la aplicación */}
      <Header />

      {/* Contenido principal */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <Tabs
          value={tab}
          onValueChange={setTab}
          defaultValue={role === 'user' ? 'services' : 'dashboard'}
          className="space-y-6"
        >
          {/* Navegación por pestañas */}
          <div className="flex justify-between items-center">
            <TabsList className="bg-muted/80 p-1">
              <TabsTrigger
                value="dashboard"
                className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                Servicios
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contenido del Dashboard (solo para administradores) */}
          <TabsContent value="dashboard" className="mt-0 space-y-0">
            {role === 'user' ? (
              <AccessDenied onGoToServices={handleGoToServices} />
            ) : (
              <DashboardOverview />
            )}
          </TabsContent>

          {/* Contenido de Servicios (para todos los usuarios) */}
          <TabsContent value="services" className="mt-0 space-y-0">
            <ServiceManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Sistema de notificaciones toast */}
      <Toaster />
    </div>
  )
}
