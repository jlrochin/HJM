<template>
  <div class="min-h-screen bg-background-main p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Encabezado -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-secondary-900 mb-2">Recetas Completadas</h1>
        <p class="text-secondary-600">
          <span v-if="userRole === 'ATENCION_USUARIO'">Historial completo de todas las recetas dispensadas</span>
          <span v-else-if="userRole === 'FARMACIA'">Historial de recetas de farmacia dispensadas</span>
          <span v-else-if="userRole === 'CMI'">Historial de recetas de CMI dispensadas</span>
        </p>
      </div>

      <!-- Filtros -->
      <div class="card mb-6">
        <div class="card-body">
          <h3 class="text-lg font-medium text-secondary-900 mb-4">Filtros de Búsqueda</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Expediente del Paciente -->
            <div>
              <label class="form-label">Expediente del Paciente</label>
              <input
                v-model="filtros.expediente"
                type="text"
                class="form-input"
                placeholder="EXP001"
                @input="buscarRecetas"
              />
            </div>

            <!-- Fecha Desde -->
            <div>
              <label class="form-label">Fecha Desde</label>
              <input
                v-model="filtros.fechaDesde"
                type="date"
                class="form-input"
                @change="buscarRecetas"
              />
            </div>

            <!-- Fecha Hasta -->
            <div>
              <label class="form-label">Fecha Hasta</label>
              <input
                v-model="filtros.fechaHasta"
                type="date"
                class="form-input"
                @change="buscarRecetas"
              />
            </div>

            <!-- Tipo de Receta (solo para Atención al Usuario) -->
            <div v-if="userRole === 'ATENCION_USUARIO'">
              <label class="form-label">Tipo de Receta</label>
              <select
                v-model="filtros.tipoReceta"
                class="form-input"
                @change="buscarRecetas"
              >
                <option value="">Todos</option>
                <option value="FARMACIA">Farmacia</option>
                <option value="CMI">CMI</option>
              </select>
            </div>

            <!-- Botón Limpiar Filtros -->
            <div class="flex items-end">
              <button
                @click="limpiarFiltros"
                class="btn btn-outline w-full"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-primary-600">{{ totalRecetas }}</div>
            <div class="text-sm text-secondary-600">Total Completadas</div>
          </div>
        </div>
        
        <div v-if="userRole === 'ATENCION_USUARIO'" class="card">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-blue-600">{{ totalFarmacia }}</div>
            <div class="text-sm text-secondary-600">Farmacia</div>
          </div>
        </div>
        
        <div v-if="userRole === 'ATENCION_USUARIO'" class="card">
          <div class="card-body text-center">
            <div class="text-3xl font-bold text-purple-600">{{ totalCMI }}</div>
            <div class="text-sm text-secondary-600">CMI</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-8">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-secondary-600 mt-2">Cargando recetas...</p>
      </div>

      <!-- Lista de Recetas -->
      <div v-else-if="recetas.length > 0" class="space-y-4">
        <div
          v-for="receta in recetas"
          :key="receta.folio_receta"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          @click="viewRecipeDetails(receta)"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <!-- Info Principal -->
                <div class="flex items-center space-x-4 mb-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-bold text-secondary-900">
                      Receta #{{ receta.folio_receta }}
                    </span>
                    <span :class="getTypeClass(receta.tipo_receta)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ receta.tipo_receta }}
                    </span>
                  </div>
                  <div class="text-sm text-secondary-600">
                    {{ formatDate(receta.fecha_dispensacion) }}
                  </div>
                </div>

                <!-- Info del Paciente -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p class="text-sm text-secondary-600">Paciente</p>
                    <div class="font-medium text-secondary-900">
                      <div class="text-sm">
                        <span>{{ receta.paciente_info?.nombre || 'N/A' }}</span>
                        <span class="ml-1">{{ receta.paciente_info?.apellido_paterno || '' }}</span>
                        <span class="ml-1">{{ receta.paciente_info?.apellido_materno || '' }}</span>
                      </div>
                    </div>
                    <p class="text-xs text-secondary-500">
                      Expediente: {{ receta.paciente_info?.expediente || 'N/A' }}
                    </p>
                  </div>
                  
                  <div>
                    <p class="text-sm text-secondary-600">Dispensado por</p>
                    <p class="font-medium text-secondary-900">
                      {{ receta.dispensado_por_name || 'N/A' }}
                    </p>
                    <p class="text-xs text-secondary-500">
                      Servicio: {{ receta.servicio_solicitante || 'N/A' }}
                    </p>
                  </div>
                </div>

                <!-- Medicamentos (preview) -->
                <div v-if="receta.total_medicamentos" class="text-sm text-secondary-600">
                  <span class="font-medium">{{ receta.total_medicamentos }}</span>
                  {{ receta.total_medicamentos === 1 ? 'medicamento' : 'medicamentos' }} dispensados
                </div>
              </div>

              <!-- Estado y Acciones -->
              <div class="flex flex-col items-end space-y-2">
                <span class="status-badge bg-success text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Completada
                </span>
                
                <button
                  @click.stop="viewRecipeDetails(receta)"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver Detalles →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin Resultados -->
      <div v-else class="text-center py-12">
        <svg class="w-16 h-16 text-secondary-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="text-lg font-medium text-secondary-900 mb-2">No hay recetas completadas</h3>
        <p class="text-secondary-600">
          <span v-if="hayFiltrosActivos">Intenta ajustar los filtros de búsqueda</span>
          <span v-else>Aún no se han completado recetas en el sistema</span>
        </p>
      </div>
    </div>

    <!-- Modal de Detalle -->
    <DetalleReceta
      v-if="showDetailModal && selectedRecipe"
      :recipe="selectedRecipe"
      @close="closeDetailModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '@/services/api'
import DetalleReceta from './DetalleReceta.vue'

export default {
  name: 'RecetasCompletadas',
  components: {
    DetalleReceta
  },
  setup() {
    const toast = useToast()
    
    // Estado reactivo
    const recetas = ref([])
    const isLoading = ref(false)
    const userRole = ref('')
    const showDetailModal = ref(false)
    const selectedRecipe = ref(null)
    
    // Filtros
    const filtros = ref({
      expediente: '',
      fechaDesde: '',
      fechaHasta: '',
      tipoReceta: ''
    })
    
    // Computed
    const totalRecetas = computed(() => recetas.value.length)
    
    const totalFarmacia = computed(() => 
      recetas.value.filter(r => r.tipo_receta === 'FARMACIA').length
    )
    
    const totalCMI = computed(() => 
      recetas.value.filter(r => r.tipo_receta === 'CMI').length
    )
    
    const hayFiltrosActivos = computed(() => {
      return filtros.value.expediente ||
             filtros.value.fechaDesde ||
             filtros.value.fechaHasta ||
             filtros.value.tipoReceta
    })
    
    // Métodos
    const buscarRecetas = async () => {
      try {
        isLoading.value = true
        
        // Construir parámetros de query
        const params = new URLSearchParams()
        
        if (filtros.value.expediente) {
          params.append('expediente', filtros.value.expediente)
        }
        if (filtros.value.fechaDesde) {
          params.append('fecha_desde', filtros.value.fechaDesde)
        }
        if (filtros.value.fechaHasta) {
          params.append('fecha_hasta', filtros.value.fechaHasta)
        }
        if (filtros.value.tipoReceta) {
          params.append('tipo_receta', filtros.value.tipoReceta)
        }
        
        const queryString = params.toString()
        const url = `/recetas/completadas/${queryString ? '?' + queryString : ''}`
        
        const response = await api.get(url)
        
        recetas.value = response.data.results
        userRole.value = response.data.user_role
        
      } catch (error) {
        console.error('Error al cargar recetas completadas:', error)
        toast.error('Error al cargar las recetas completadas')
      } finally {
        isLoading.value = false
      }
    }
    
    const limpiarFiltros = () => {
      filtros.value = {
        expediente: '',
        fechaDesde: '',
        fechaHasta: '',
        tipoReceta: ''
      }
      buscarRecetas()
    }
    
    const viewRecipeDetails = async (receta) => {
      try {
        // Obtener detalles completos de la receta
        const response = await api.get(`/recetas/${receta.folio_receta}/`)
        selectedRecipe.value = response.data
        showDetailModal.value = true
      } catch (error) {
        console.error('Error al cargar detalles de la receta:', error)
        toast.error('Error al cargar los detalles de la receta')
      }
    }
    
    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedRecipe.value = null
    }
    
    const getTypeClass = (tipo) => {
      const classes = {
        'FARMACIA': 'bg-blue-100 text-blue-800',
        'CMI': 'bg-purple-100 text-purple-800'
      }
      return classes[tipo] || 'bg-gray-100 text-gray-800'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
      } catch (error) {
        return dateString
      }
    }
    
    // Lifecycle
    onMounted(() => {
      buscarRecetas()
    })
    
    return {
      recetas,
      isLoading,
      userRole,
      filtros,
      totalRecetas,
      totalFarmacia,
      totalCMI,
      hayFiltrosActivos,
      showDetailModal,
      selectedRecipe,
      buscarRecetas,
      limpiarFiltros,
      viewRecipeDetails,
      closeDetailModal,
      getTypeClass,
      formatDate
    }
  }
}
</script>

<style scoped>
.status-badge {
  @apply inline-flex items-center;
}
</style>
