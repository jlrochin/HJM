<template>
  <div class="min-h-screen bg-background-main">
    <!-- Header sticky -->
    <header class="sticky-header">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-secondary-600 hover:text-primary-600">
              <ArrowLeftIcon class="h-6 w-6" />
            </router-link>
            <h1 class="text-xl font-bold text-secondary-900">
              Registro de Movimientos
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="refreshData"
              :disabled="loading"
              class="btn-secondary"
            >
              <ArrowPathIcon class="h-5 w-5 mr-2" :class="{ 'animate-spin': loading }" />
              Actualizar
            </button>
            
            <button
              @click="exportData"
              class="btn-primary"
            >
              <ArrowDownTrayIcon class="h-5 w-5 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Filtros y búsqueda -->
        <div class="card mb-6">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-secondary-900">
              Filtros y Búsqueda
            </h2>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Búsqueda por texto -->
              <div>
                <label class="form-label">Buscar</label>
                <input
                  v-model="filters.search"
                  type="text"
                  class="form-input"
                  placeholder="Buscar en descripción, usuario, entidad..."
                  @input="applyFilters"
                />
              </div>
              
              <!-- Filtro por tipo de movimiento -->
              <div>
                <label class="form-label">Tipo de Movimiento</label>
                <select v-model="filters.actionType" @change="applyFilters" class="form-input">
                  <option value="">Todos los tipos</option>
                  <option value="CREATE">Creación</option>
                  <option value="UPDATE">Actualización</option>
                  <option value="DELETE">Eliminación</option>
                  <option value="LOGIN">Inicio de sesión</option>
                  <option value="LOGOUT">Cierre de sesión</option>
                </select>
              </div>
              
              <!-- Filtro por entidad -->
              <div>
                <label class="form-label">Entidad</label>
                <select v-model="filters.entityType" @change="applyFilters" class="form-input">
                  <option value="">Todas las entidades</option>
                  <option value="Paciente">Pacientes</option>
                  <option value="Receta">Recetas</option>
                  <option value="Medicamento">Medicamentos</option>
                  <option value="Usuario">Usuarios</option>
                  <option value="CIE10">Códigos CIE-10</option>
                </select>
              </div>
              
              <!-- Filtro por fecha -->
              <div>
                <label class="form-label">Rango de Fechas</label>
                <select v-model="filters.dateRange" @change="applyFilters" class="form-input">
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="quarter">Este trimestre</option>
                  <option value="year">Este año</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
            </div>
            
            <!-- Fechas personalizadas -->
            <div v-if="filters.dateRange === 'custom'" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="form-label">Fecha desde</label>
                <input
                  v-model="filters.dateFrom"
                  type="date"
                  class="form-input"
                  @change="applyFilters"
                />
              </div>
              <div>
                <label class="form-label">Fecha hasta</label>
                <input
                  v-model="filters.dateTo"
                  type="date"
                  class="form-input"
                  @change="applyFilters"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas de movimientos -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-primary-600 mb-2">
                <DocumentTextIcon class="h-8 w-8 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-1">Total Movimientos</h3>
              <p class="text-2xl font-bold text-primary-600">{{ stats.totalMovements }}</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-success-600 mb-2">
                <PlusIcon class="h-8 w-8 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-1">Creaciones</h3>
              <p class="text-2xl font-bold text-success-600">{{ stats.creations }}</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-warning-600 mb-2">
                <PencilIcon class="h-8 w-8 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-1">Actualizaciones</h3>
              <p class="text-2xl font-bold text-warning-600">{{ stats.updates }}</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-accent-600 mb-2">
                <TrashIcon class="h-8 w-8 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-1">Eliminaciones</h3>
              <p class="text-2xl font-bold text-accent-600">{{ stats.deletions }}</p>
            </div>
          </div>
        </div>

        <!-- Lista de movimientos -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">
                Historial de Movimientos
              </h3>
              <div class="text-sm text-secondary-600">
                {{ filteredMovements.length }} de {{ movements.length }} movimientos
              </div>
            </div>
          </div>
          
          <div class="card-body">
            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            
            <div v-else-if="filteredMovements.length === 0" class="text-center py-8">
              <DocumentTextIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p class="text-secondary-600">No se encontraron movimientos con los filtros aplicados</p>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="movement in paginatedMovements"
                :key="movement.id"
                class="flex items-start justify-between p-4 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <!-- Icono y tipo de acción -->
                <div class="flex items-start space-x-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="getActionIconClass(movement.actionType)">
                    <component :is="getActionIcon(movement.actionType)" class="h-5 w-5 text-white" />
                  </div>
                  
                  <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                      <span class="font-medium text-secondary-900">
                        {{ getActionDisplayName(movement.actionType) }}
                      </span>
                      <span class="text-sm text-secondary-600">
                        {{ movement.entityType }}
                      </span>
                      <span v-if="movement.entityId" class="text-xs px-2 py-1 bg-secondary-100 text-secondary-700 rounded">
                        ID: {{ movement.entityId }}
                      </span>
                    </div>
                    
                    <p class="text-sm text-secondary-700 mb-2">
                      {{ movement.description }}
                    </p>
                    
                    <div class="flex items-center space-x-4 text-xs text-secondary-500">
                      <span>
                        <UserIcon class="h-3 w-3 inline mr-1" />
                        {{ movement.user?.username || 'Usuario desconocido' }}
                      </span>
                      <span>
                        <ClockIcon class="h-3 w-3 inline mr-1" />
                        {{ formatDate(movement.timestamp) }}
                      </span>
                      <span v-if="movement.ipAddress">
                        <ComputerDesktopIcon class="h-3 w-3 inline mr-1" />
                        {{ movement.ipAddress }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Detalles adicionales -->
                <div class="flex items-center space-x-2">
                  <button
                    @click="showMovementDetails(movement)"
                    class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Paginación -->
            <div v-if="totalPages > 1" class="mt-6 flex justify-center">
              <div class="flex space-x-2">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="px-3 py-2 text-sm border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <span class="px-3 py-2 text-sm text-secondary-600">
                  Página {{ currentPage }} de {{ totalPages }}
                </span>
                
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-2 text-sm border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de detalles del movimiento -->
    <div
      v-if="selectedMovement"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-secondary-900">
              Detalles del Movimiento
            </h3>
            <button
              @click="selectedMovement = null"
              class="text-secondary-400 hover:text-secondary-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Tipo de Acción</label>
                <p class="text-secondary-900">{{ getActionDisplayName(selectedMovement.actionType) }}</p>
              </div>
              <div>
                <label class="form-label">Entidad</label>
                <p class="text-secondary-900">{{ selectedMovement.entityType }}</p>
              </div>
              <div>
                <label class="form-label">Usuario</label>
                <p class="text-secondary-900">{{ selectedMovement.user?.username || 'N/A' }}</p>
              </div>
              <div>
                <label class="form-label">Fecha y Hora</label>
                <p class="text-secondary-900">{{ formatDate(selectedMovement.timestamp) }}</p>
              </div>
              <div>
                <label class="form-label">IP Address</label>
                <p class="text-secondary-900">{{ selectedMovement.ipAddress || 'N/A' }}</p>
              </div>
              <div>
                <label class="form-label">User Agent</label>
                <p class="text-secondary-900 text-sm">{{ selectedMovement.userAgent || 'N/A' }}</p>
              </div>
            </div>
            
            <div>
              <label class="form-label">Descripción</label>
              <p class="text-secondary-900">{{ selectedMovement.description }}</p>
            </div>
            
            <div v-if="selectedMovement.changes">
              <label class="form-label">Cambios Realizados</label>
              <div class="bg-secondary-50 rounded-lg p-4">
                <pre class="text-sm text-secondary-700 whitespace-pre-wrap">{{ JSON.stringify(selectedMovement.changes, null, 2) }}</pre>
              </div>
            </div>
            
            <div v-if="selectedMovement.metadata">
              <label class="form-label">Metadatos Adicionales</label>
              <div class="bg-secondary-50 rounded-lg p-4">
                <pre class="text-sm text-secondary-700 whitespace-pre-wrap">{{ JSON.stringify(selectedMovement.metadata, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ClockIcon,
  ComputerDesktopIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'RegistroMovimientos',
  components: {
    ArrowLeftIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    ClockIcon,
    ComputerDesktopIcon,
    XMarkIcon
  },
  setup() {
    const toast = useToast()
    
    const loading = ref(false)
    const movements = ref([])
    const selectedMovement = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = 20
    
    const filters = ref({
      search: '',
      actionType: '',
      entityType: '',
      dateRange: 'month',
      dateFrom: '',
      dateTo: ''
    })
    
    const stats = ref({
      totalMovements: 0,
      creations: 0,
      updates: 0,
      deletions: 0
    })
    
    // Datos de ejemplo (en producción vendrían del backend)
    const sampleMovements = [
      {
        id: 1,
        actionType: 'CREATE',
        entityType: 'Paciente',
        entityId: 'EXP001',
        description: 'Nuevo paciente registrado: Juan Carlos Pérez García',
        user: { username: 'maria.gonzalez' },
        timestamp: new Date('2024-01-15T10:30:00'),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        changes: { expediente: 'EXP001', nombre: 'Juan Carlos', apellido_paterno: 'Pérez' },
        metadata: { session_id: 'abc123', module: 'atencion_usuario' }
      },
      {
        id: 2,
        actionType: 'UPDATE',
        entityType: 'Receta',
        entityId: 'REC002',
        description: 'Receta actualizada: Cambio en dosis de medicamento',
        user: { username: 'luis.rodriguez' },
        timestamp: new Date('2024-01-15T11:15:00'),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        changes: { dosis: 'Cambio de 10mg a 15mg' },
        metadata: { session_id: 'def456', module: 'prescripcion' }
      },
      {
        id: 3,
        actionType: 'DELETE',
        entityType: 'Medicamento',
        entityId: 'MED003',
        description: 'Medicamento eliminado del inventario: Paracetamol vencido',
        user: { username: 'carlos.martinez' },
        timestamp: new Date('2024-01-15T12:00:00'),
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Linux x86_64) AppleWebKit/537.36',
        changes: { motivo: 'Vencimiento de fecha', cantidad: '50 unidades' },
        metadata: { session_id: 'ghi789', module: 'inventario' }
      },
      {
        id: 4,
        actionType: 'LOGIN',
        entityType: 'Usuario',
        entityId: 'user001',
        description: 'Usuario inició sesión en el sistema',
        user: { username: 'ana.lopez' },
        timestamp: new Date('2024-01-15T08:00:00'),
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        changes: null,
        metadata: { session_id: 'jkl012', module: 'autenticacion' }
      }
    ]
    
    // Computed properties
    const filteredMovements = computed(() => {
      let filtered = [...movements.value]
      
      // Filtro por búsqueda
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(movement => 
          movement.description.toLowerCase().includes(search) ||
          movement.entityType.toLowerCase().includes(search) ||
          movement.user?.username.toLowerCase().includes(search)
        )
      }
      
      // Filtro por tipo de acción
      if (filters.value.actionType) {
        filtered = filtered.filter(movement => movement.actionType === filters.value.actionType)
      }
      
      // Filtro por entidad
      if (filters.value.entityType) {
        filtered = filtered.filter(movement => movement.entityType === filters.value.entityType)
      }
      
      // Filtro por fecha
      if (filters.value.dateRange === 'custom' && filters.value.dateFrom && filters.value.dateTo) {
        const fromDate = new Date(filters.value.dateFrom)
        const toDate = new Date(filters.value.dateTo)
        filtered = filtered.filter(movement => {
          const movementDate = new Date(movement.timestamp)
          return movementDate >= fromDate && movementDate <= toDate
        })
      } else if (filters.value.dateRange !== 'custom') {
        const now = new Date()
        let startDate = new Date()
        
        switch (filters.value.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }
        
        filtered = filtered.filter(movement => new Date(movement.timestamp) >= startDate)
      }
      
      return filtered
    })
    
    const totalPages = computed(() => Math.ceil(filteredMovements.value.length / itemsPerPage))
    
    const paginatedMovements = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage
      const end = start + itemsPerPage
      return filteredMovements.value.slice(start, end)
    })
    
    // Methods
    const loadMovements = async () => {
      try {
        loading.value = true
        // En producción, aquí se haría la llamada al backend
        // const response = await movementsService.getMovements()
        // movements.value = response.data
        
        // Por ahora, usar datos de ejemplo
        movements.value = sampleMovements
        
        // Calcular estadísticas
        calculateStats()
        
      } catch (error) {
        console.error('Error cargando movimientos:', error)
        toast.error('Error al cargar los movimientos')
      } finally {
        loading.value = false
      }
    }
    
    const calculateStats = () => {
      const total = movements.value.length
      const creations = movements.value.filter(m => m.actionType === 'CREATE').length
      const updates = movements.value.filter(m => m.actionType === 'UPDATE').length
      const deletions = movements.value.filter(m => m.actionType === 'DELETE').length
      
      stats.value = { totalMovements: total, creations, updates, deletions }
    }
    
    const applyFilters = () => {
      currentPage.value = 1 // Resetear a la primera página
    }
    
    const refreshData = async () => {
      await loadMovements()
      toast.success('Datos actualizados')
    }
    
    const exportData = () => {
      // Implementar exportación a CSV/Excel
      toast.info('Funcionalidad de exportación en desarrollo')
    }
    
    const showMovementDetails = (movement) => {
      selectedMovement.value = movement
    }
    
    const getActionIcon = (actionType) => {
      const icons = {
        'CREATE': PlusIcon,
        'UPDATE': PencilIcon,
        'DELETE': TrashIcon,
        'LOGIN': UserIcon,
        'LOGOUT': UserIcon
      }
      return icons[actionType] || DocumentTextIcon
    }
    
    const getActionIconClass = (actionType) => {
      const classes = {
        'CREATE': 'bg-success-500',
        'UPDATE': 'bg-warning-500',
        'DELETE': 'bg-accent-500',
        'LOGIN': 'bg-blue-500',
        'LOGOUT': 'bg-gray-500'
      }
      return classes[actionType] || 'bg-secondary-500'
    }
    
    const getActionDisplayName = (actionType) => {
      const names = {
        'CREATE': 'Creación',
        'UPDATE': 'Actualización',
        'DELETE': 'Eliminación',
        'LOGIN': 'Inicio de Sesión',
        'LOGOUT': 'Cierre de Sesión'
      }
      return names[actionType] || actionType
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // Lifecycle
    onMounted(() => {
      loadMovements()
    })
    
    return {
      loading,
      movements,
      selectedMovement,
      currentPage,
      filters,
      stats,
      filteredMovements,
      totalPages,
      paginatedMovements,
      applyFilters,
      refreshData,
      exportData,
      showMovementDetails,
      getActionIcon,
      getActionIconClass,
      getActionDisplayName,
      formatDate
    }
  }
}
</script>
