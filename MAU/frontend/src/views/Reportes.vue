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
              📊 Reportes y Estadísticas
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="refreshData"
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
        
        <!-- Métricas principales -->
        <div v-if="dashboardData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                  <UserGroupIcon class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total Pacientes</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ dashboardData.total_pacientes || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-primary-600 bg-opacity-20">
                  <ClipboardDocumentListIcon class="h-6 w-6 text-primary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total Recetas</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ dashboardData.total_recetas || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-warning bg-opacity-20">
                  <ClockIcon class="h-6 w-6 text-warning" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Pendientes</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ dashboardData.recetas_pendientes || 0 }}</p>
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
                  <p class="text-sm font-medium text-secondary-600">Completadas Hoy</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ dashboardData.recetas_completadas_hoy || 0 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Distribución por estado -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-secondary-900">Distribución por Estado</h3>
            </div>
            <div class="card-body">
              <div v-if="dashboardData?.recetas_por_estado" class="space-y-3">
                <div 
                  v-for="(count, estado) in dashboardData.recetas_por_estado" 
                  :key="estado"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <div 
                      class="w-3 h-3 rounded-full mr-3"
                      :class="getStatusColor(estado)"
                    ></div>
                    <span class="font-medium text-secondary-700">{{ getStatusLabel(estado) }}</span>
                  </div>
                  <span class="text-xl font-bold text-secondary-900">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Distribución por tipo -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-secondary-900">Distribución por Tipo</h3>
            </div>
            <div class="card-body">
              <div v-if="dashboardData?.recetas_por_tipo" class="space-y-3">
                <div 
                  v-for="(count, tipo) in dashboardData.recetas_por_tipo" 
                  :key="tipo"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center">
                    <BeakerIcon v-if="tipo === 'FARMACIA'" class="h-5 w-5 mr-3 text-blue-500" />
                    <CubeIcon v-else class="h-5 w-5 mr-3 text-purple-500" />
                    <span class="font-medium text-secondary-700">{{ tipo }}</span>
                  </div>
                  <span class="text-xl font-bold text-secondary-900">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Servicios más activos -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-secondary-900">Servicios Más Activos</h3>
          </div>
          <div class="card-body">
            <div v-if="dashboardData?.servicios_mas_activos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                v-for="(servicio, index) in dashboardData.servicios_mas_activos.slice(0, 9)" 
                :key="servicio.servicio_solicitante"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                    {{ index + 1 }}
                  </div>
                  <span class="font-medium text-secondary-700">{{ servicio.servicio_solicitante }}</span>
                </div>
                <span class="text-lg font-bold text-primary-600">{{ servicio.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Medicamentos más dispensados -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-secondary-900">Top 10 Medicamentos Más Dispensados</h3>
              <span v-if="dashboardData?.tiempo_promedio_dispensacion" class="text-sm text-secondary-600">
                Tiempo promedio: {{ dashboardData.tiempo_promedio_dispensacion }} horas
              </span>
            </div>
          </div>
          <div class="card-body">
            <div v-if="dashboardData?.medicamentos_mas_dispensados" class="space-y-3">
              <div 
                v-for="(med, index) in dashboardData.medicamentos_mas_dispensados.slice(0, 10)" 
                :key="med.medicamento"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center text-sm font-bold mr-3">
                    {{ index + 1 }}
                  </div>
                  <span class="font-medium text-secondary-700">{{ med.medicamento }}</span>
                </div>
                <span class="text-lg font-bold text-success">{{ med.cantidad }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recetas urgentes -->
        <div v-if="dashboardData?.recetas_urgentes > 0" class="card border-l-4 border-red-500">
          <div class="card-body">
            <div class="flex items-center">
              <ExclamationTriangleIcon class="h-8 w-8 text-red-500 mr-4" />
              <div>
                <h3 class="text-lg font-semibold text-red-700">Atención Requerida</h3>
                <p class="text-red-600">
                  {{ dashboardData.recetas_urgentes }} recetas requieren atención urgente
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  BeakerIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Reportes',
  components: {
    ArrowLeftIcon,
    ArrowPathIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    CheckCircleIcon,
    BeakerIcon,
    CubeIcon,
    ExclamationTriangleIcon
  },
  setup() {
    const toast = useToast()
    
    const dashboardData = ref(null)
    const isLoading = ref(false)
    
    const getStatusColor = (estado) => {
      const colors = {
        'PENDIENTE': 'bg-warning',
        'VALIDADA': 'bg-blue-500',
        'SURTIDA': 'bg-success',
        'PARCIALMENTE_SURTIDA': 'bg-yellow-500',
        'CANCELADA': 'bg-red-500'
      }
      return colors[estado] || 'bg-gray-400'
    }
    
    const getStatusLabel = (estado) => {
      const labels = {
        'PENDIENTE': 'Pendiente',
        'VALIDADA': 'Validada',
        'SURTIDA': 'Surtida',
        'PARCIALMENTE_SURTIDA': 'Parcialmente Surtida',
        'CANCELADA': 'Cancelada'
      }
      return labels[estado] || estado
    }
    
    const loadDashboardData = async () => {
      try {
        isLoading.value = true
        const response = await api.get('/reports/dashboard/')
        dashboardData.value = response.data
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Error al cargar los datos del dashboard')
      } finally {
        isLoading.value = false
      }
    }
    
    const refreshData = () => {
      loadDashboardData()
      toast.info('Actualizando datos...')
    }
    
    onMounted(() => {
      loadDashboardData()
    })
    
    return {
      dashboardData,
      isLoading,
      getStatusColor,
      getStatusLabel,
      refreshData
    }
  }
}
</script>
