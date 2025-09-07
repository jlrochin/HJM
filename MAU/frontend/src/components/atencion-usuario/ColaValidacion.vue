<template>
  <div class="space-y-4">
    <!-- Filtros -->
    <div class="flex flex-wrap gap-4 items-center">
      <div class="flex-1 min-w-64">
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="Buscar por folio, expediente o servicio..."
          @input="loadRecipes"
        />
      </div>
      
      <div>
        <select v-model="selectedService" @change="loadRecipes" class="form-input">
          <option value="">Todos los servicios</option>
          <option value="Oncología">Oncología</option>
          <option value="Medicina Interna">Medicina Interna</option>
          <option value="Urgencias">Urgencias</option>
          <option value="Cardiología">Cardiología</option>
          <option value="Neurología">Neurología</option>
          <option value="Pediatría">Pediatría</option>
        </select>
      </div>
      
      <div>
        <select v-model="selectedPriority" @change="loadRecipes" class="form-input">
          <option value="">Todas las prioridades</option>
          <option value="URGENTE">Urgente</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>
      
      <button
        @click="loadRecipes"
        :disabled="isLoading"
        class="btn-primary"
      >
        <ArrowPathIcon class="h-5 w-5 mr-2" />
        Actualizar
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-warning bg-opacity-10 rounded-lg p-4">
        <div class="flex items-center">
          <ClockIcon class="h-6 w-6 text-warning mr-3" />
          <div>
            <p class="text-sm font-medium text-warning">Pendientes</p>
            <p class="text-2xl font-bold text-warning">{{ pendingCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-accent-600 bg-opacity-10 rounded-lg p-4">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="h-6 w-6 text-accent-600 mr-3" />
          <div>
            <p class="text-sm font-medium text-accent-600">Urgentes</p>
            <p class="text-2xl font-bold text-accent-600">{{ urgentCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-primary-600 bg-opacity-10 rounded-lg p-4">
        <div class="flex items-center">
          <DocumentTextIcon class="h-6 w-6 text-primary-600 mr-3" />
          <div>
            <p class="text-sm font-medium text-primary-600">Total</p>
            <p class="text-2xl font-bold text-primary-600">{{ recipes.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de recetas -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Cargando recetas...
      </div>
    </div>

    <div v-else-if="recipes.length === 0" class="text-center py-12">
      <DocumentTextIcon class="mx-auto h-12 w-12 text-secondary-400" />
      <h3 class="mt-2 text-lg font-medium text-secondary-900">No hay recetas pendientes</h3>
      <p class="mt-1 text-secondary-600">
        No hay recetas que requieran validación en este momento.
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="recipe in recipes"
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
                  :class="getPriorityClass(recipe.prioridad)"
                >
                  {{ recipe.prioridad }}
                </span>
                
                <span class="badge bg-gray-100 text-secondary-900">
                  {{ recipe.tipo_receta }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="text-secondary-600">
                    <span class="font-medium">Paciente:</span>
                    <div class="ml-4 mt-1">
                      <div class="text-sm">
                        <span class="font-medium">{{ recipe.paciente_info?.nombre }}</span>
                        <span class="font-medium ml-1">{{ recipe.paciente_info?.apellido_paterno }}</span>
                        <span class="font-medium ml-1">{{ recipe.paciente_info?.apellido_materno || '' }}</span>
                      </div>
                    </div>
                  </div>
                  <p class="text-secondary-600">
                    <span class="font-medium">Expediente:</span> 
                    {{ recipe.paciente_info?.expediente }}
                  </p>
                  <p class="text-secondary-600">
                    <span class="font-medium">Servicio:</span> 
                    {{ recipe.servicio_solicitante }}
                  </p>
                </div>
                
                <div>
                  <p class="text-secondary-600">
                    <span class="font-medium">Fecha:</span> 
                    {{ formatDate(recipe.fecha_creacion) }}
                  </p>
                  <p class="text-secondary-600">
                    <span class="font-medium">Prescrito por:</span> 
                    {{ recipe.prescrito_por_name }}
                  </p>
                  <p class="text-secondary-600">
                    <span class="font-medium">Medicamentos:</span> 
                    {{ recipe.total_medicamentos }}
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
              
              <button
                @click="validateRecipe(recipe)"
                :disabled="validatingRecipes.has(recipe.folio_receta)"
                class="btn-success text-sm"
              >
                <CheckCircleIcon class="h-4 w-4 mr-1" />
                {{ validatingRecipes.has(recipe.folio_receta) ? 'Validando...' : 'Validar' }}
              </button>
              
              <button
                @click="showRejectModal(recipe)"
                class="btn-accent text-sm"
              >
                <XCircleIcon class="h-4 w-4 mr-1" />
                Rechazar
              </button>
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

    <!-- Modal de rechazo -->
    <ModalRechazo
      v-if="rejectingRecipe"
      :recipe="rejectingRecipe"
      @close="rejectingRecipe = null"
      @confirmed="onRecipeRejected"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '@/services/api'
import {
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

import DetalleReceta from '@/components/shared/DetalleReceta.vue'
import ModalRechazo from '@/components/shared/ModalRechazo.vue'

export default {
  name: 'ColaValidacion',
  components: {
    ArrowPathIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    DetalleReceta,
    ModalRechazo
  },
  emits: ['recipe-validated'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const recipes = ref([])
    const isLoading = ref(false)
    const searchQuery = ref('')
    const selectedService = ref('')
    const selectedPriority = ref('')
    const selectedRecipe = ref(null)
    const rejectingRecipe = ref(null)
    const validatingRecipes = ref(new Set())
    
    const pendingCount = computed(() => 
      recipes.value.filter(r => r.estado === 'PENDIENTE').length
    )
    
    const urgentCount = computed(() => 
      recipes.value.filter(r => r.prioridad === 'URGENTE').length
    )
    
    const loadRecipes = async () => {
      try {
        isLoading.value = true
        
        const params = {
          estado: 'PENDIENTE'
        }
        
        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }
        
        if (selectedService.value) {
          params.servicio_solicitante = selectedService.value
        }
        
        if (selectedPriority.value) {
          params.prioridad = selectedPriority.value
        }
        
        const response = await api.get('/recetas/cola-validacion/', { params })
        recipes.value = response.data.recetas
        
      } catch (error) {
        console.error('Error loading recipes:', error)
        toast.error('Error al cargar las recetas')
      } finally {
        isLoading.value = false
      }
    }
    
    const validateRecipe = async (recipe) => {
      try {
        validatingRecipes.value.add(recipe.folio_receta)
        
        const response = await api.post(
          `/recetas/${recipe.folio_receta}/actualizar-estado/`,
          {
            estado: 'VALIDADA',
            observaciones: 'Receta validada por Atención al Usuario'
          }
        )
        
        // Remover de la lista
        recipes.value = recipes.value.filter(r => r.folio_receta !== recipe.folio_receta)
        
        toast.success(`Receta #${recipe.folio_receta} validada correctamente`)
        emit('recipe-validated', response.data)
        
      } catch (error) {
        console.error('Error validating recipe:', error)
        toast.error('Error al validar la receta')
      } finally {
        validatingRecipes.value.delete(recipe.folio_receta)
      }
    }
    
    const showRejectModal = (recipe) => {
      rejectingRecipe.value = recipe
    }
    
    const onRecipeRejected = (recipe) => {
      // Remover de la lista
      recipes.value = recipes.value.filter(r => r.folio_receta !== recipe.folio_receta)
      rejectingRecipe.value = null
      toast.success(`Receta #${recipe.folio_receta} rechazada`)
    }
    
    const viewRecipeDetails = async (recipe) => {
      try {
        // Obtener la receta completa con medicamentos
        const response = await api.get(`/recetas/${recipe.folio_receta}/`)
        selectedRecipe.value = response.data
      } catch (error) {
        console.error('Error loading recipe details:', error)
        toast.error('Error al cargar los detalles de la receta')
        // Fallback: usar la receta básica si falla la llamada
        selectedRecipe.value = recipe
      }
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
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    }
    
    onMounted(() => {
      loadRecipes()
      
      // Auto-refresh cada 30 segundos
      const interval = setInterval(loadRecipes, 30000)
      
      // Limpiar interval al desmontar
      return () => clearInterval(interval)
    })
    
    return {
      recipes,
      isLoading,
      searchQuery,
      selectedService,
      selectedPriority,
      selectedRecipe,
      rejectingRecipe,
      validatingRecipes,
      pendingCount,
      urgentCount,
      loadRecipes,
      validateRecipe,
      showRejectModal,
      onRecipeRejected,
      viewRecipeDetails,
      getPriorityClass,
      formatDate
    }
  }
}
</script>
