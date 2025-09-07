<template>
  <div class="min-h-screen bg-background-main">
    <!-- Header sticky -->
    <header class="sticky-header">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-bold text-secondary-900">
              MAU Hospital - Sistema de Gestión de Recetas
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Selector de rol para admin -->
            <div v-if="user?.role === 'ADMIN'" class="mr-4">
              <label class="block text-xs text-secondary-600 mb-1">Simular Vista:</label>
              <select 
                v-model="selectedSimulatedRole"
                @change="handleRoleSimulation"
                class="text-sm border border-secondary-300 rounded px-2 py-1 bg-white"
              >
                <option value="">Vista Admin</option>
                <option value="ATENCION_USUARIO">Atención al Usuario</option>
                <option value="FARMACIA">Farmacia</option>
                <option value="CMI">Centro de Mezclas</option>
                <option value="MEDICO">Médico</option>
              </select>
            </div>
            
            <div class="text-sm text-secondary-600">
              <span class="font-medium">{{ user?.first_name }} {{ user?.last_name }}</span>
              <span class="block text-xs">
                {{ getRoleDisplayName(effectiveRole) }}
                <span v-if="isSimulating" class="text-warning ml-1">(Simulando)</span>
              </span>
            </div>
            
            <button
              @click="handleLogout"
              class="btn-secondary text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Bienvenida -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-secondary-900 mb-2">
            Bienvenido, {{ user?.first_name }}
          </h2>
          <p class="text-secondary-600">
            Selecciona un módulo para comenzar a trabajar
          </p>
        </div>

        <!-- Estadísticas rápidas -->
        <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-warning bg-opacity-20">
                  <ClockIcon class="h-6 w-6 text-warning" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Recetas Pendientes</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ statistics.pendientes }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                  <CheckCircleIcon class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Recetas Validadas</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ statistics.validadas }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-success bg-opacity-20">
                  <ShoppingBagIcon class="h-6 w-6 text-success" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Recetas Surtidas</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ statistics.surtidas }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-primary-600 bg-opacity-20">
                  <DocumentTextIcon class="h-6 w-6 text-primary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total Recetas</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ statistics.total_recetas }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Módulos disponibles -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <router-link
            v-for="route in availableRoutes"
            :key="route.name"
            :to="{ name: route.name }"
            class="card hover:shadow-xl transition-shadow duration-300 group"
          >
            <div class="card-body p-8">
              <div class="flex flex-col items-center text-center">
                <div class="p-4 rounded-lg bg-primary-600 bg-opacity-10 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  <component :is="getIcon(route.icon)" class="h-12 w-12 text-primary-600 group-hover:text-white" />
                </div>
                <h3 class="mt-4 text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors duration-300">
                  {{ route.title }}
                </h3>
                <p class="mt-2 text-sm text-secondary-600">
                  {{ getModuleDescription(route.name) }}
                </p>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Mensaje si no hay módulos disponibles -->
        <div v-if="availableRoutes.length === 0" class="text-center py-12">
          <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-secondary-400" />
          <h3 class="mt-2 text-lg font-medium text-secondary-900">No hay módulos disponibles</h3>
          <p class="mt-1 text-secondary-600">Contacta al administrador para obtener acceso a los módulos del sistema.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import {
  ClockIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/vue/24/outline'

// Import available icons
import { BeakerIcon as FlaskIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'Dashboard',
  components: {
    ClockIcon,
    CheckCircleIcon,
    ShoppingBagIcon,
    DocumentTextIcon,
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    BeakerIcon,
    FlaskIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    CubeIcon,
    ShieldCheckIcon,
    BellIcon
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    
    const statistics = ref(null)
    
    const user = computed(() => authStore.user)
    const effectiveRole = computed(() => authStore.effectiveRole)
    const isSimulating = computed(() => authStore.isSimulating)
    const availableRoutes = computed(() => authStore.getAvailableRoutes())
    
    const selectedSimulatedRole = ref('')
    
    const getIcon = (iconName) => {
      const icons = {
        UserGroupIcon,
        ClipboardDocumentCheckIcon,
        BeakerIcon,
        FlaskConicalIcon: FlaskIcon, // Usar FlaskIcon para CMI
        DocumentTextIcon,
        CheckCircleIcon,
        ChartBarIcon,
        CubeIcon,
        ShieldCheckIcon,
        BellIcon
      }
      return icons[iconName] || DocumentTextIcon
    }
    
    const getRoleDisplayName = (role) => {
      const roles = {
        'ATENCION_USUARIO': 'Atención al Usuario',
        'FARMACIA': 'Farmacia',
        'CMI': 'Centro de Mezclas',
        'MEDICO': 'Médico',
        'ADMIN': 'Administrador'
      }
      return roles[role] || role
    }
    
    const getModuleDescription = (moduleName) => {
      const descriptions = {
        'atencion-usuario': 'Gestión y registro de pacientes',
        'validacion': 'Validación de recetas médicas',
        'farmacia': 'Dispensación de medicamentos',
        'cmi': 'Preparación de mezclas especializadas',
        'prescripcion': 'Prescripción de recetas médicas',
        'recetas-completadas': 'Historial de recetas dispensadas',
        'reportes': 'Estadísticas y reportes del sistema',
        'inventario': 'Control de stock y medicamentos',
        'auditoria': 'Seguimiento de actividades del sistema',
        'notificaciones': 'Alertas y notificaciones en tiempo real'
      }
      return descriptions[moduleName] || ''
    }
    
    const loadStatistics = async () => {
      try {
        // Cargar estadísticas básicas
        const basicResponse = await api.get('/recetas/estadisticas/')
        
        // Si es admin o puede validar, cargar también estadísticas avanzadas
        if (effectiveRole.value === 'ADMIN' || authStore.canValidateRecipes) {
          try {
            const advancedResponse = await api.get('/reports/dashboard/')
            statistics.value = {
              ...basicResponse.data,
              advanced: advancedResponse.data
            }
          } catch (advancedError) {
            console.warn('Error loading advanced statistics:', advancedError)
            statistics.value = basicResponse.data
          }
        } else {
          statistics.value = basicResponse.data
        }
      } catch (error) {
        console.error('Error loading statistics:', error)
      }
    }
    
    const handleLogout = () => {
      authStore.logout()
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
    }
    
    const handleRoleSimulation = () => {
      if (selectedSimulatedRole.value) {
        authStore.setSimulatedRole(selectedSimulatedRole.value)
        toast.info(`Simulando vista de ${getRoleDisplayName(selectedSimulatedRole.value)}`)
      } else {
        authStore.clearSimulatedRole()
        toast.info('Volviendo a vista de administrador')
      }
    }
    
    onMounted(() => {
      loadStatistics()
    })
    
    return {
      user,
      effectiveRole,
      isSimulating,
      statistics,
      availableRoutes,
      selectedSimulatedRole,
      getIcon,
      getRoleDisplayName,
      getModuleDescription,
      handleLogout,
      handleRoleSimulation
    }
  }
}
</script>
