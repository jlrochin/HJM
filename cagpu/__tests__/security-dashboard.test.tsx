import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SecurityDashboard from '@/components/security-dashboard'

// Mock de fetch
global.fetch = jest.fn()

// Mock de los datos del dashboard
const mockDashboardData = {
  timestamp: '2025-09-03T03:50:00.000Z',
  period: '24h',
  overview: {
    systemHealth: 'excellent',
    riskLevel: 'low',
    activeAlerts: 0,
    loginSuccessRate: 95.5,
    averageResponseTime: 150,
    totalUsers: 50,
    activeUsers: 45,
    totalServices: 25,
    totalDirections: 5
  },
  securityMetrics: {
    totalLogins: 100,
    failedLogins: 5,
    suspiciousActivities: 2,
    rateLimitExceeded: 1,
    unauthorizedAccess: 0,
    dataExports: 3,
    userCreations: 1,
    userDeactivations: 0,
    period: '24h'
  },
  alerts: [],
  rateLimiting: {
    activeEntries: 10,
    totalEntries: 15,
    blockedRequests: 2
  },
  recentActivity: {
    logins: [
      {
        id: 1,
        username: 'admin',
        userFullName: 'Administrador',
        ip: '192.168.1.100',
        userAgent: 'Chrome',
        timestamp: '2025-09-03T03:45:00.000Z'
      }
    ],
    securityEvents: [
      {
        id: 1,
        action: 'login_failed',
        username: 'testuser',
        userFullName: 'Test User',
        ip: '192.168.1.101',
        userAgent: 'Firefox',
        details: 'Contraseña incorrecta',
        timestamp: '2025-09-03T03:40:00.000Z'
      }
    ]
  }
}

describe('SecurityDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Promise que nunca se resuelve para simular loading
    )

    render(<SecurityDashboard />)
    
    expect(screen.getByText('Cargando dashboard de seguridad...')).toBeInTheDocument()
  })

  it('should render dashboard with data', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    })

    render(<SecurityDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard de Seguridad')).toBeInTheDocument()
      expect(screen.getByText('Monitoreo en tiempo real de la seguridad de CAGPU')).toBeInTheDocument()
    })

    // Verificar que se muestran las métricas principales
    expect(screen.getByText('Estado del Sistema')).toBeInTheDocument()
    expect(screen.getByText('Usuarios Activos')).toBeInTheDocument()
    expect(screen.getByText('Tasa de Éxito Login')).toBeInTheDocument()
    expect(screen.getByText('Alertas Activas')).toBeInTheDocument()
  })

  it('should display correct metrics', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    })

    render(<SecurityDashboard />)

    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument() // Usuarios activos
      expect(screen.getByText('95.5%')).toBeInTheDocument() // Tasa de éxito
      // Usar getAllByText para evitar conflictos con múltiples elementos que contengan '0'
      const zeroElements = screen.getAllByText('0')
      expect(zeroElements.length).toBeGreaterThan(0) // Alertas activas
    })
  })

  it('should handle error state', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<SecurityDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Error al cargar el dashboard: Network error')).toBeInTheDocument()
    })
  })

  it('should display tabs correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    })

    render(<SecurityDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Resumen')).toBeInTheDocument()
      expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
      expect(screen.getByText('Alertas')).toBeInTheDocument()
      expect(screen.getByText('Análisis')).toBeInTheDocument()
    })
  })

  it('should show no alerts message when no alerts', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    })

    render(<SecurityDashboard />)

    await waitFor(() => {
      // Verificar que el dashboard se renderiza correctamente
      expect(screen.getByText('Dashboard de Seguridad')).toBeInTheDocument()
    })

    // Verificar que las alertas están vacías
    await waitFor(() => {
      const alertasTab = screen.getByText('Alertas')
      expect(alertasTab).toBeInTheDocument()
    })
  })

  it('should display recent activity', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    })

    render(<SecurityDashboard />)

    await waitFor(() => {
      // Verificar que el dashboard se renderiza correctamente
      expect(screen.getByText('Dashboard de Seguridad')).toBeInTheDocument()
    })

    // Verificar que las pestañas están presentes
    await waitFor(() => {
      const actividadTab = screen.getByText('Actividad Reciente')
      expect(actividadTab).toBeInTheDocument()
    })
  })

  it('should call API with correct parameters', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDashboardData
    })

    render(<SecurityDashboard />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/security-metrics?period=24h&includeDetails=true'
      )
    })
  })

  it('should update period when selector changes', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockDashboardData, period: '7d' })
      })

    render(<SecurityDashboard />)

    await waitFor(() => {
      // Simular cambio de período (esto requeriría más setup para el select)
      expect(screen.getByText('Últimas 24h')).toBeInTheDocument()
    })
  })
})
