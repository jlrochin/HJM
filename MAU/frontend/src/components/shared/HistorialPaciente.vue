<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
    <div class="bg-background-card rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="sticky-header">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-secondary-900">
                Historial del Paciente
              </h2>
              <div class="mt-1 text-sm text-secondary-700">
                <span class="font-medium">{{ patient.nombre }}</span>
                <span class="font-medium ml-1">{{ patient.apellido_paterno }}</span>
                <span class="font-medium ml-1">{{ patient.apellido_materno || '' }}</span>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="text-secondary-400 hover:text-secondary-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <div class="mt-2 text-sm text-secondary-600">
            <span class="font-medium">Expediente:</span> {{ patient.expediente }} |
            <span class="font-medium">CURP:</span> {{ patient.curp }}
          </div>
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <div class="scrollable-content p-6">
        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-primary-600 bg-opacity-10 rounded-lg p-4">
            <div class="flex items-center">
              <DocumentTextIcon class="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p class="text-sm font-medium text-primary-600">Total Recetas</p>
                <p class="text-2xl font-bold text-primary-600">{{ historyData?.total_recetas || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-warning bg-opacity-10 rounded-lg p-4">
            <div class="flex items-center">
              <ClockIcon class="h-6 w-6 text-warning mr-3" />
              <div>
                <p class="text-sm font-medium text-warning">Pendientes</p>
                <p class="text-2xl font-bold text-warning">{{ historyData?.recetas_pendientes || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-blue-500 bg-opacity-10 rounded-lg p-4">
            <div class="flex items-center">
              <CheckCircleIcon class="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p class="text-sm font-medium text-blue-500">Validadas</p>
                <p class="text-2xl font-bold text-blue-500">{{ historyData?.recetas_validadas || 0 }}</p>
              </div>
            </div>
          </div>

          <div class="bg-success bg-opacity-10 rounded-lg p-4">
            <div class="flex items-center">
              <ShoppingBagIcon class="h-6 w-6 text-success mr-3" />
              <div>
                <p class="text-sm font-medium text-success">Surtidas</p>
                <p class="text-2xl font-bold text-success">{{ historyData?.recetas_surtidas || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex flex-wrap gap-4 items-center mb-6">
          <div class="flex-1 min-w-64">
            <input
              v-model="searchQuery"
              type="text"
              class="form-input"
              placeholder="Buscar por folio o servicio..."
              @input="filterRecipes"
            />
          </div>
          
          <div>
            <select v-model="selectedStatus" @change="filterRecipes" class="form-input">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="VALIDADA">Validada</option>
              <option value="SURTIDA">Surtida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          
          <div>
            <select v-model="selectedType" @change="filterRecipes" class="form-input">
              <option value="">Todos los tipos</option>
              <option value="FARMACIA">Farmacia</option>
              <option value="CMI">CMI</option>
            </select>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando historial...
          </div>
        </div>

        <!-- Lista de recetas -->
        <div v-else-if="filteredRecipes.length === 0" class="text-center py-12">
          <DocumentTextIcon class="mx-auto h-12 w-12 text-secondary-400" />
          <h3 class="mt-2 text-lg font-medium text-secondary-900">Sin recetas</h3>
          <p class="mt-1 text-secondary-600">
            {{ searchQuery || selectedStatus || selectedType 
                ? 'No hay recetas que coincidan con los filtros.' 
                : 'Este paciente no tiene recetas registradas.' }}
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.folio_receta"
            class="card hover:shadow-lg transition-shadow duration-200"
          >
            <div class="card-body">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-3">
                    <h3 class="text-lg font-semibold text-secondary-900">
                      Receta #{{ recipe.folio_receta }}
                    </h3>
                    
                    <span
                      class="badge"
                      :class="getStatusClass(recipe.estado)"
                    >
                      {{ recipe.estado }}
                    </span>
                    
                    <span class="badge bg-gray-100 text-secondary-900">
                      {{ recipe.tipo_receta }}
                    </span>
                    
                    <span
                      v-if="recipe.prioridad"
                      class="badge"
                      :class="getPriorityClass(recipe.prioridad)"
                    >
                      {{ recipe.prioridad }}
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-secondary-600">
                        <span class="font-medium">Servicio:</span> 
                        {{ recipe.servicio_solicitante }}
                      </p>
                      <p class="text-secondary-600">
                        <span class="font-medium">Fecha:</span> 
                        {{ formatDate(recipe.fecha_creacion) }}
                      </p>
                      <p class="text-secondary-600">
                        <span class="font-medium">Prescrito por:</span> 
                        {{ recipe.prescrito_por_name }}
                      </p>
                    </div>
                    
                    <div>
                      <p class="text-secondary-600">
                        <span class="font-medium">Medicamentos:</span> 
                        {{ recipe.total_medicamentos }}
                      </p>
                      <p v-if="recipe.fecha_vencimiento" class="text-secondary-600">
                        <span class="font-medium">Vence:</span> 
                        {{ formatDate(recipe.fecha_vencimiento) }}
                      </p>
                      <p v-if="recipe.estado === 'SURTIDA' && recipe.fecha_dispensacion" class="text-secondary-600">
                        <span class="font-medium">Surtida:</span> 
                        {{ formatDate(recipe.fecha_dispensacion) }}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-col space-y-2 ml-4">
                  <button
                    @click="viewRecipeDetails(recipe)"
                    class="btn-secondary text-sm"
                  >
                    <EyeIcon class="h-4 w-4 mr-1" />
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalles de receta -->
    <DetalleReceta
      v-if="selectedRecipe"
      :recipe="selectedRecipe"
      @close="selectedRecipe = null"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { patientsService } from '@/services/patients'
import {
  XMarkIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

import DetalleReceta from './DetalleReceta.vue'

export default {
  name: 'HistorialPaciente',
  components: {
    XMarkIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ShoppingBagIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    DetalleReceta
  },
  props: {
    patient: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const historyData = ref(null)
    const isLoading = ref(false)
    const searchQuery = ref('')
    const selectedStatus = ref('')
    const selectedType = ref('')
    const selectedRecipe = ref(null)
    
    const filteredRecipes = computed(() => {
      if (!historyData.value?.recetas) return []
      
      let recipes = [...historyData.value.recetas]
      
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        recipes = recipes.filter(recipe => 
          recipe.folio_receta?.toLowerCase().includes(query) ||
          recipe.servicio_solicitante?.toLowerCase().includes(query)
        )
      }
      
      if (selectedStatus.value) {
        recipes = recipes.filter(recipe => recipe.estado === selectedStatus.value)
      }
      
      if (selectedType.value) {
        recipes = recipes.filter(recipe => recipe.tipo_receta === selectedType.value)
      }
      
      return recipes
    })
    
    const loadHistory = async () => {
      try {
        isLoading.value = true
        
        const response = await patientsService.getPatientHistory(props.patient.expediente)
        historyData.value = response
        
      } catch (error) {
        console.error('Error loading patient history:', error)
        toast.error('Error al cargar el historial del paciente')
      } finally {
        isLoading.value = false
      }
    }
    
    const filterRecipes = () => {
      // La función de filtrado se maneja automáticamente por el computed
    }
    
    const viewRecipeDetails = async (recipe) => {
      try {
        // Por ahora, usar la receta básica del historial
        // En el futuro, se podría implementar un endpoint específico para recetas
        selectedRecipe.value = recipe
      } catch (error) {
        console.error('Error loading recipe details:', error)
        toast.error('Error al cargar los detalles de la receta')
        // Fallback: usar la receta básica si falla la llamada
        selectedRecipe.value = recipe
      }
    }
    
    const getStatusClass = (status) => {
      const classes = {
        'PENDIENTE': 'status-pendiente',
        'VALIDADA': 'status-validada',
        'PARCIALMENTE_SURTIDA': 'status-parcialmente-surtida',
        'SURTIDA': 'status-surtida',
        'CANCELADA': 'status-cancelada'
      }
      return classes[status] || 'bg-gray-500 text-white'
    }
    
    const getPriorityClass = (priority) => {
      const classes = {
        'URGENTE': 'bg-accent-600 text-white',
        'ALTA': 'bg-orange-500 text-white',
        'MEDIA': 'bg-blue-500 text-white',
        'BAJA': 'bg-gray-500 text-white'
      }
      return classes[priority] || 'bg-gray-500 text-white'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
      } catch (error) {
        return dateString
      }
    }
    
    onMounted(() => {
      loadHistory()
    })
    
    return {
      historyData,
      isLoading,
      searchQuery,
      selectedStatus,
      selectedType,
      selectedRecipe,
      filteredRecipes,
      filterRecipes,
      viewRecipeDetails,
      getStatusClass,
      getPriorityClass,
      formatDate
    }
  }
}
</script>
