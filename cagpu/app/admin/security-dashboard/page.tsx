import { redirect } from 'next/navigation'
import SecurityDashboard from '@/components/security-dashboard'

// ============================================================================
// PÁGINA: DASHBOARD DE SEGURIDAD PARA ADMINISTRADORES
// ============================================================================
// Página protegida que solo pueden acceder usuarios con rol 'admin'
// ============================================================================

export default function SecurityDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <SecurityDashboard />
    </div>
  )
}
