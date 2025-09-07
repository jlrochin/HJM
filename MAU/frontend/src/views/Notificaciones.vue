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
              🔔 Centro de Notificaciones
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="markAllAsRead"
              v-if="unreadCount > 0"
              class="btn-secondary text-sm"
            >
              Marcar todo como leído
            </button>
            <button
              @click="refreshNotifications"
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
      <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- Resumen de notificaciones -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                  <BellIcon class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total Notificaciones</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ notifications.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-warning bg-opacity-20">
                  <ExclamationCircleIcon class="h-6 w-6 text-warning" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Sin Leer</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ unreadCount }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-red-500 bg-opacity-20">
                  <ExclamationTriangleIcon class="h-6 w-6 text-red-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Urgentes</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ urgentCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="card">
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Filtrar por tipo
                </label>
                <select v-model="selectedType" class="form-select w-full">
                  <option value="">Todos los tipos</option>
                  <option value="RECETA_PENDIENTE">Receta Pendiente</option>
                  <option value="STOCK_BAJO">Stock Bajo</option>
                  <option value="SISTEMA">Sistema</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Estado
                </label>
                <select v-model="readFilter" class="form-select w-full">
                  <option value="">Todas</option>
                  <option value="unread">Sin leer</option>
                  <option value="read">Leídas</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Acción
                </label>
                <button
                  @click="clearFilters"
                  class="btn-secondary w-full"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de notificaciones -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-secondary-900">Notificaciones</h3>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p class="mt-2 text-secondary-600">Cargando notificaciones...</p>
            </div>
            
            <div v-else-if="filteredNotifications.length === 0" class="p-8 text-center">
              <BellIcon class="mx-auto h-12 w-12 text-secondary-400" />
              <h3 class="mt-2 text-lg font-medium text-secondary-900">Sin notificaciones</h3>
              <p class="mt-1 text-secondary-600">No tienes notificaciones con los filtros aplicados.</p>
            </div>
            
            <div v-else class="divide-y divide-secondary-200">
              <div 
                v-for="notification in filteredNotifications" 
                :key="notification.id"
                class="p-6 hover:bg-secondary-50 transition-colors cursor-pointer"
                :class="{ 'bg-blue-50': !notification.is_read }"
                @click="markAsRead(notification)"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div 
                      class="w-10 h-10 rounded-full flex items-center justify-center"
                      :class="getNotificationIconClass(notification.type)"
                    >
                      <component :is="getNotificationIcon(notification.type)" class="h-5 w-5" />
                    </div>
                  </div>
                  
                  <div class="ml-4 flex-1">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-secondary-900">
                        {{ notification.title }}
                      </p>
                      <div class="flex items-center space-x-2">
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getTypeClass(notification.type)"
                        >
                          {{ getTypeLabel(notification.type) }}
                        </span>
                        <span v-if="!notification.is_read" class="w-2 h-2 bg-blue-500 rounded-full"></span>
                      </div>
                    </div>
                    
                    <p class="mt-1 text-sm text-secondary-600">
                      {{ notification.message }}
                    </p>
                    
                    <div class="mt-2 flex items-center justify-between">
                      <p class="text-xs text-secondary-500">
                        {{ formatDate(notification.created_at) }}
                      </p>
                      
                      <div v-if="notification.action_url" class="flex space-x-2">
                        <button
                          @click.stop="handleAction(notification)"
                          class="text-xs text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de notificaciones -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-secondary-900">Configuración de Notificaciones</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-secondary-900">Notificaciones de recetas pendientes</h4>
                  <p class="text-sm text-secondary-600">Recibe alertas cuando hay recetas pendientes de validación</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    v-model="preferences.recetas_pendientes" 
                    type="checkbox" 
                    class="sr-only peer"
                    @change="updatePreferences"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-secondary-900">Alertas de stock bajo</h4>
                  <p class="text-sm text-secondary-600">Recibe notificaciones cuando el inventario esté bajo</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    v-model="preferences.stock_bajo" 
                    type="checkbox" 
                    class="sr-only peer"
                    @change="updatePreferences"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-secondary-900">Notificaciones del sistema</h4>
                  <p class="text-sm text-secondary-600">Actualizaciones y mantenimiento del sistema</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input 
                    v-model="preferences.sistema" 
                    type="checkbox" 
                    class="sr-only peer"
                    @change="updatePreferences"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
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
import api from '@/services/api'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BellIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Notificaciones',
  components: {
    ArrowLeftIcon,
    ArrowPathIcon,
    BellIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    ClipboardDocumentListIcon,
    CubeIcon,
    CogIcon
  },
  setup() {
    const toast = useToast()
    
    const notifications = ref([])
    const isLoading = ref(false)
    
    // Filtros
    const selectedType = ref('')
    const readFilter = ref('')
    
    // Preferencias de usuario
    const preferences = ref({
      recetas_pendientes: true,
      stock_bajo: true,
      sistema: false
    })
    
    // Computed properties
    const filteredNotifications = computed(() => {
      let filtered = notifications.value
      
      if (selectedType.value) {
        filtered = filtered.filter(n => n.type === selectedType.value)
      }
      
      if (readFilter.value) {
        if (readFilter.value === 'read') {
          filtered = filtered.filter(n => n.is_read)
        } else if (readFilter.value === 'unread') {
          filtered = filtered.filter(n => !n.is_read)
        }
      }
      
      return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })
    
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.is_read).length
    })
    
    const urgentCount = computed(() => {
      return notifications.value.filter(n => n.type === 'URGENTE' && !n.is_read).length
    })
    
    // Methods
    const getNotificationIcon = (type) => {
      const icons = {
        'RECETA_PENDIENTE': ClipboardDocumentListIcon,
        'STOCK_BAJO': CubeIcon,
        'SISTEMA': CogIcon,
        'URGENTE': ExclamationTriangleIcon
      }
      return icons[type] || BellIcon
    }
    
    const getNotificationIconClass = (type) => {
      const classes = {
        'RECETA_PENDIENTE': 'bg-blue-100 text-blue-600',
        'STOCK_BAJO': 'bg-yellow-100 text-yellow-600',
        'SISTEMA': 'bg-gray-100 text-gray-600',
        'URGENTE': 'bg-red-100 text-red-600'
      }
      return classes[type] || 'bg-gray-100 text-gray-600'
    }
    
    const getTypeClass = (type) => {
      const classes = {
        'RECETA_PENDIENTE': 'bg-blue-100 text-blue-800',
        'STOCK_BAJO': 'bg-yellow-100 text-yellow-800',
        'SISTEMA': 'bg-gray-100 text-gray-800',
        'URGENTE': 'bg-red-100 text-red-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }
    
    const getTypeLabel = (type) => {
      const labels = {
        'RECETA_PENDIENTE': 'Receta',
        'STOCK_BAJO': 'Stock',
        'SISTEMA': 'Sistema',
        'URGENTE': 'Urgente'
      }
      return labels[type] || type
    }
    
    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
      } catch (error) {
        return dateString
      }
    }
    
    const loadNotifications = async () => {
      try {
        isLoading.value = true
        // Por ahora generamos datos de ejemplo
        notifications.value = generateSampleNotifications()
      } catch (error) {
        console.error('Error loading notifications:', error)
        toast.error('Error al cargar las notificaciones')
      } finally {
        isLoading.value = false
      }
    }
    
    // Función temporal para generar notificaciones de ejemplo
    const generateSampleNotifications = () => {
      const now = new Date()
      const types = ['RECETA_PENDIENTE', 'STOCK_BAJO', 'SISTEMA', 'URGENTE']
      
      return [
        {
          id: 1,
          type: 'RECETA_PENDIENTE',
          title: 'Nueva receta pendiente de validación',
          message: 'La receta #105 del paciente Juan Pérez requiere validación',
          is_read: false,
          created_at: new Date(now - 2 * 60 * 1000).toISOString(), // 2 minutos atrás
          action_url: '/validacion'
        },
        {
          id: 2,
          type: 'STOCK_BAJO',
          title: 'Stock bajo: Paracetamol 500mg',
          message: 'Quedan solo 15 unidades en inventario. Stock mínimo: 20',
          is_read: false,
          created_at: new Date(now - 15 * 60 * 1000).toISOString(), // 15 minutos atrás
          action_url: '/inventario'
        },
        {
          id: 3,
          type: 'URGENTE',
          title: 'Receta urgente sin dispensar',
          message: 'La receta #103 está marcada como urgente y lleva 2 horas sin dispensar',
          is_read: false,
          created_at: new Date(now - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
          action_url: '/farmacia'
        },
        {
          id: 4,
          type: 'SISTEMA',
          title: 'Mantenimiento programado',
          message: 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM',
          is_read: true,
          created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
          action_url: null
        },
        {
          id: 5,
          type: 'RECETA_PENDIENTE',
          title: 'Múltiples recetas pendientes',
          message: 'Hay 8 recetas pendientes de validación desde hace más de 1 hora',
          is_read: true,
          created_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
          action_url: '/validacion'
        }
      ]
    }
    
    const markAsRead = async (notification) => {
      if (!notification.is_read) {
        notification.is_read = true
        toast.success('Notificación marcada como leída')
      }
    }
    
    const markAllAsRead = async () => {
      notifications.value.forEach(n => {
        n.is_read = true
      })
      toast.success('Todas las notificaciones marcadas como leídas')
    }
    
    const handleAction = (notification) => {
      if (notification.action_url) {
        this.$router.push(notification.action_url)
      }
    }
    
    const updatePreferences = async () => {
      try {
        // Aquí se conectaría con la API para guardar las preferencias
        toast.success('Preferencias actualizadas')
      } catch (error) {
        console.error('Error updating preferences:', error)
        toast.error('Error al actualizar las preferencias')
      }
    }
    
    const refreshNotifications = () => {
      loadNotifications()
      toast.info('Actualizando notificaciones...')
    }
    
    const clearFilters = () => {
      selectedType.value = ''
      readFilter.value = ''
    }
    
    onMounted(() => {
      loadNotifications()
    })
    
    return {
      notifications,
      filteredNotifications,
      isLoading,
      selectedType,
      readFilter,
      preferences,
      unreadCount,
      urgentCount,
      getNotificationIcon,
      getNotificationIconClass,
      getTypeClass,
      getTypeLabel,
      formatDate,
      markAsRead,
      markAllAsRead,
      handleAction,
      updatePreferences,
      refreshNotifications,
      clearFilters
    }
  }
}
</script>
