<template>
  <div class="min-h-screen bg-background-main">
    <!-- Header sticky -->
    <header class="sticky-header">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="$router.go(-1)"
              class="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ArrowLeftIcon class="h-5 w-5 mr-2" />
              Volver
            </button>
            <h1 class="text-xl font-bold text-secondary-900">
              🛡️ Auditoría Avanzada
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="exportAuditLog"
              class="btn-secondary text-sm"
            >
              <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
              Exportar
            </button>
            <button
              @click="refreshAuditLog"
              :disabled="isLoading"
              class="btn-secondary text-sm"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Resumen de auditoría -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                  <DocumentTextIcon class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total Eventos</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ auditLogs.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-success bg-opacity-20">
                  <CheckCircleIcon class="h-6 w-6 text-success" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Hoy</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ eventosHoy }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-warning bg-opacity-20">
                  <ExclamationTriangleIcon class="h-6 w-6 text-warning" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Eventos Críticos</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ eventosCriticos }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-primary-600 bg-opacity-20">
                  <UserGroupIcon class="h-6 w-6 text-primary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Usuarios Activos</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ usuariosActivos }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros avanzados -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-secondary-900">Filtros de Auditoría</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Acción
                </label>
                <select v-model="filters.action" class="form-select w-full">
                  <option value="">Todas las acciones</option>
                  <option value="CREATE">Crear</option>
                  <option value="UPDATE">Actualizar</option>
                  <option value="DELETE">Eliminar</option>
                  <option value="LOGIN">Iniciar Sesión</option>
                  <option value="LOGOUT">Cerrar Sesión</option>
                  <option value="DISPENSE">Dispensar</option>
                  <option value="VALIDATE">Validar</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Usuario
                </label>
                <input
                  v-model="filters.user"
                  type="text"
                  placeholder="Nombre de usuario..."
                  class="form-input w-full"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha desde
                </label>
                <input
                  v-model="filters.dateFrom"
                  type="date"
                  class="form-input w-full"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Fecha hasta
                </label>
                <input
                  v-model="filters.dateTo"
                  type="date"
                  class="form-input w-full"
                >
              </div>
            </div>
            
            <div class="mt-4 flex space-x-3">
              <button
                @click="applyFilters"
                class="btn-primary"
              >
                Aplicar Filtros
              </button>
              <button
                @click="clearFilters"
                class="btn-secondary"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <!-- Log de auditoría -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-secondary-900">Registro de Auditoría</h3>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p class="mt-2 text-secondary-600">Cargando registro de auditoría...</p>
            </div>
            
            <div v-else-if="filteredAuditLogs.length === 0" class="p-8 text-center">
              <ShieldCheckIcon class="mx-auto h-12 w-12 text-secondary-400" />
              <h3 class="mt-2 text-lg font-medium text-secondary-900">Sin registros</h3>
              <p class="mt-1 text-secondary-600">No se encontraron registros de auditoría con los filtros aplicados.</p>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-secondary-200">
                <thead class="bg-secondary-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acción
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Detalles
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      IP
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-secondary-200">
                  <tr v-for="log in filteredAuditLogs" :key="log.id" class="hover:bg-secondary-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {{ formatDateTime(log.timestamp) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span class="text-xs font-medium text-primary-700">{{ getUserInitials(log.user) }}</span>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-secondary-900">{{ log.user }}</div>
                          <div class="text-xs text-secondary-600">{{ log.user_role }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getActionClass(log.action)"
                      >
                        {{ getActionLabel(log.action) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {{ log.entity_type }}
                      <span v-if="log.entity_id" class="text-secondary-600">#{{ log.entity_id }}</span>
                    </td>
                    <td class="px-6 py-4 text-sm text-secondary-600 max-w-xs truncate">
                      {{ log.details }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                      {{ log.ip_address }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(log.status)"
                      >
                        {{ getStatusLabel(log.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Actividad por usuario -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-secondary-900">Usuarios Más Activos</h3>
            </div>
            <div class="card-body">
              <div v-if="topUsers.length === 0" class="text-center py-8">
                <p class="text-secondary-600">No hay datos de actividad disponibles</p>
              </div>
              <div v-else class="space-y-3">
                <div 
                  v-for="(userStat, index) in topUsers" 
                  :key="userStat.user"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {{ index + 1 }}
                    </div>
                    <div>
                      <span class="font-medium text-secondary-700">{{ userStat.user }}</span>
                      <div class="text-xs text-secondary-600">{{ userStat.role }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-lg font-bold text-primary-600">{{ userStat.count }}</span>
                    <div class="text-xs text-secondary-600">acciones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-secondary-900">Acciones Más Frecuentes</h3>
            </div>
            <div class="card-body">
              <div v-if="topActions.length === 0" class="text-center py-8">
                <p class="text-secondary-600">No hay datos de acciones disponibles</p>
              </div>
              <div v-else class="space-y-3">
                <div 
                  v-for="(actionStat, index) in topActions" 
                  :key="actionStat.action"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-success text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {{ index + 1 }}
                    </div>
                    <span class="font-medium text-secondary-700">{{ getActionLabel(actionStat.action) }}</span>
                  </div>
                  <span class="text-lg font-bold text-success">{{ actionStat.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { auditService } from '@/services/audit'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Auditoria',
  components: {
    ArrowLeftIcon,
    ArrowPathIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    ShieldCheckIcon
  },
  setup() {
    const toast = useToast()
    
    const auditLogs = ref([])
    const isLoading = ref(false)
    
    // Filtros
    const filters = ref({
      action: '',
      user: '',
      dateFrom: '',
      dateTo: ''
    })
    
    // Computed properties
    const filteredAuditLogs = computed(() => {
      let filtered = auditLogs.value
      
      if (filters.value.action) {
        filtered = filtered.filter(log => log.action === filters.value.action)
      }
      
      if (filters.value.user) {
        const user = filters.value.user.toLowerCase()
        filtered = filtered.filter(log => 
          log.user.toLowerCase().includes(user)
        )
      }
      
      if (filters.value.dateFrom) {
        const fromDate = new Date(filters.value.dateFrom)
        filtered = filtered.filter(log => 
          new Date(log.timestamp) >= fromDate
        )
      }
      
      if (filters.value.dateTo) {
        const toDate = new Date(filters.value.dateTo + ' 23:59:59')
        filtered = filtered.filter(log => 
          new Date(log.timestamp) <= toDate
        )
      }
      
      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })
    
    const eventosHoy = computed(() => {
      const today = new Date().toDateString()
      return auditLogs.value.filter(log => 
        new Date(log.timestamp).toDateString() === today
      ).length
    })
    
    const eventosCriticos = computed(() => {
      return auditLogs.value.filter(log => 
        log.status === 'ERROR' || log.action === 'DELETE' || log.priority === 'HIGH' || log.priority === 'CRITICAL'
      ).length
    })
    
    const usuariosActivos = computed(() => {
      const uniqueUsers = new Set(auditLogs.value.map(log => log.user))
      return uniqueUsers.size
    })
    
    const topUsers = computed(() => {
      const userCounts = {}
      auditLogs.value.forEach(log => {
        if (!userCounts[log.user]) {
          userCounts[log.user] = { count: 0, role: log.user_role }
        }
        userCounts[log.user].count++
      })
      
      return Object.entries(userCounts)
        .map(([user, data]) => ({ user, count: data.count, role: data.role }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    })
    
    const topActions = computed(() => {
      const actionCounts = {}
      auditLogs.value.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
      })
      
      return Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    })
    
    // Methods
    const getActionClass = (action) => {
      const classes = {
        'CREATE': 'bg-green-100 text-green-800',
        'UPDATE': 'bg-blue-100 text-blue-800',
        'DELETE': 'bg-red-100 text-red-800',
        'LOGIN': 'bg-purple-100 text-purple-800',
        'LOGOUT': 'bg-gray-100 text-gray-800',
        'DISPENSE': 'bg-yellow-100 text-yellow-800',
        'VALIDATE': 'bg-indigo-100 text-indigo-800'
      }
      return classes[action] || 'bg-gray-100 text-gray-800'
    }
    
    const getActionLabel = (action) => {
      const labels = {
        'CREATE': 'Crear',
        'UPDATE': 'Actualizar',
        'DELETE': 'Eliminar',
        'LOGIN': 'Iniciar Sesión',
        'LOGOUT': 'Cerrar Sesión',
        'DISPENSE': 'Dispensar',
        'VALIDATE': 'Validar'
      }
      return labels[action] || action
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'SUCCESS': 'bg-green-100 text-green-800',
        'ERROR': 'bg-red-100 text-red-800',
        'WARNING': 'bg-yellow-100 text-yellow-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        'SUCCESS': 'Éxito',
        'ERROR': 'Error',
        'WARNING': 'Advertencia'
      }
      return labels[status] || status
    }
    
    const getUserInitials = (username) => {
      return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    
    const formatDateTime = (dateString) => {
      try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: es })
      } catch (error) {
        return dateString
      }
    }
    
    const loadAuditStats = async () => {
      try {
        const stats = await auditService.getAuditStats()
        // Aquí podrías usar las estadísticas del backend si las necesitas
        console.log('Estadísticas de auditoría cargadas:', stats)
      } catch (error) {
        console.error('Error loading audit stats:', error)
      }
    }
    
    const loadAuditLogs = async () => {
      try {
        isLoading.value = true
        
        // Preparar parámetros para el backend
        const params = {}
        if (filters.value.action) params.action_type = filters.value.action
        if (filters.value.user) params.user = filters.value.user
        if (filters.value.dateFrom) params.date_from = filters.value.dateFrom
        if (filters.value.dateTo) params.date_to = filters.value.dateTo
        
        const response = await auditService.getAuditLogs(params)
        auditLogs.value = response.results || response.data || []
      } catch (error) {
        console.error('Error loading audit logs:', error)
        toast.error('Error al cargar el registro de auditoría')
        auditLogs.value = []
      } finally {
        isLoading.value = false
      }
    }
    
    const applyFilters = () => {
      loadAuditLogs()
      toast.info('Filtros aplicados')
    }
    
    const clearFilters = () => {
      filters.value = {
        action: '',
        user: '',
        dateFrom: '',
        dateTo: ''
      }
      loadAuditLogs() // Re-load with no filters
      toast.info('Filtros limpiados')
    }
    
    const exportAuditLog = async () => {
      try {
        const response = await auditService.exportAuditLogs(filters.value)
        toast.success(response.message || 'Registro exportado correctamente')
      } catch (error) {
        console.error('Error exporting audit log:', error)
        toast.error('Error al exportar el registro de auditoría')
      }
    }
    
    const refreshAuditLog = async () => {
      try {
        await loadAuditLogs()
        toast.success('Registro de auditoría actualizado correctamente')
      } catch (error) {
        console.error('Error refreshing audit log:', error)
        toast.error('Error al actualizar el registro de auditoría')
      }
    }
    
    onMounted(async () => {
      await Promise.all([
        loadAuditLogs(),
        loadAuditStats()
      ])
    })
    
    return {
      auditLogs,
      filteredAuditLogs,
      isLoading,
      filters,
      eventosHoy,
      eventosCriticos,
      usuariosActivos,
      topUsers,
      topActions,
      getActionClass,
      getActionLabel,
      getStatusClass,
      getStatusLabel,
      getUserInitials,
      formatDateTime,
      applyFilters,
      clearFilters,
      exportAuditLog,
      refreshAuditLog,
      loadAuditStats
    }
  }
}
</script>
