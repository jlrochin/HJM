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
        <select v-model="selectedPriority" @change="loadRecipes" class="form-input">
          <option value="">Todas las prioridades</option>
          <option value="URGENTE">Urgente</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>
      
      <div>
        <select v-model="sortBy" @change="loadRecipes" class="form-input">
          <option value="prioridad">Ordenar por prioridad</option>
          <option value="fecha_validacion">Fecha de validación</option>
          <option value="fecha_vencimiento">Fecha de vencimiento</option>
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

    <!-- Estadísticas locales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-blue-500 bg-opacity-10 rounded-lg p-4">
        <div class="flex items-center">
          <ClockIcon class="h-6 w-6 text-blue-500 mr-3" />
          <div>
            <p class="text-sm font-medium text-blue-500">Por Dispensar</p>
            <p class="text-2xl font-bold text-blue-500">{{ recipes.length }}</p>
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
      
      <div class="bg-warning bg-opacity-10 rounded-lg p-4">
        <div class="flex items-center">
          <ClockIcon class="h-6 w-6 text-warning mr-3" />
          <div>
            <p class="text-sm font-medium text-warning">Próximas a Vencer</p>
            <p class="text-2xl font-bold text-warning">{{ expiringSoonCount }}</p>
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
      <BeakerIcon class="mx-auto h-12 w-12 text-secondary-400" />
      <h3 class="mt-2 text-lg font-medium text-secondary-900">No hay recetas para dispensar</h3>
      <p class="mt-1 text-secondary-600">
        No hay recetas de farmacia validadas en este momento.
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="recipe in recipes"
        :key="recipe.folio_receta"
        class="card hover:shadow-lg transition-shadow duration-200"
        :class="{
          'border-l-4 border-accent-600': recipe.prioridad === 'URGENTE',
          'border-l-4 border-orange-500': recipe.prioridad === 'ALTA',
          'border-l-4 border-warning': isExpiringSoon(recipe.fecha_vencimiento)
        }"
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
                
                <span class="badge bg-blue-500 text-white">
                  FARMACIA
                </span>

                <span v-if="isExpiringSoon(recipe.fecha_vencimiento)" class="badge bg-warning text-white">
                  <ClockIcon class="h-3 w-3 mr-1" />
                  Próxima a vencer
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
                    <span class="font-medium">Validada:</span> 
                    {{ formatDate(recipe.fecha_validacion) }}
                  </p>
                  <p class="text-secondary-600">
                    <span class="font-medium">Medicamentos:</span> 
                    {{ recipe.total_medicamentos }}
                  </p>
                  <p v-if="recipe.fecha_vencimiento" class="text-secondary-600">
                    <span class="font-medium">Vence:</span> 
                    <span :class="{ 'text-warning font-bold': isExpiringSoon(recipe.fecha_vencimiento) }">
                      {{ formatDate(recipe.fecha_vencimiento) }}
                    </span>
                  </p>
                </div>
              </div>

              <!-- Indicadores especiales -->
              <div v-if="hasSpecialConditions(recipe)" class="mt-3 flex space-x-2">
                <span v-if="recipe.prioridad === 'URGENTE'" class="text-xs bg-accent-600 text-white px-2 py-1 rounded">
                  <ExclamationTriangleIcon class="h-3 w-3 inline mr-1" />
                  URGENTE
                </span>
                <span v-if="isExpiringSoon(recipe.fecha_vencimiento)" class="text-xs bg-warning text-white px-2 py-1 rounded">
                  <ClockIcon class="h-3 w-3 inline mr-1" />
                  VENCE PRONTO
                </span>
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
                @click="startDispensing(recipe)"
                :disabled="dispensingRecipes.has(recipe.folio_receta)"
                class="btn-success text-sm"
              >
                <ShoppingBagIcon class="h-4 w-4 mr-1" />
                {{ dispensingRecipes.has(recipe.folio_receta) ? 'Dispensando...' : 'Dispensar' }}
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

    <!-- Modal de dispensación -->
    <DispensarReceta
      v-if="dispensingRecipe"
      :recipe="dispensingRecipe"
      type="FARMACIA"
      @close="dispensingRecipe = null"
      @dispensed="onRecipeDispensed"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import api from '@/services/api'
import {
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  EyeIcon,
  ShoppingBagIcon
} from '@heroicons/vue/24/outline'

import DetalleReceta from '@/components/shared/DetalleReceta.vue'
import DispensarReceta from '@/components/shared/DispensarReceta.vue'

export default {
  name: 'ColaDispensacionFarmacia',
  components: {
    ArrowPathIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    BeakerIcon,
    EyeIcon,
    ShoppingBagIcon,
    DetalleReceta,
    DispensarReceta
  },
  emits: ['recipe-dispensed'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const recipes = ref([])
    const isLoading = ref(false)
    const searchQuery = ref('')
    const selectedPriority = ref('')
    const sortBy = ref('prioridad')
    const selectedRecipe = ref(null)
    const dispensingRecipe = ref(null)
    const dispensingRecipes = ref(new Set())
    
    const urgentCount = computed(() => 
      recipes.value.filter(r => r.prioridad === 'URGENTE').length
    )
    
    const expiringSoonCount = computed(() => 
      recipes.value.filter(r => isExpiringSoon(r.fecha_vencimiento)).length
    )
    
    const loadRecipes = async () => {
      try {
        isLoading.value = true
        
        const params = {
          tipo: 'FARMACIA',
          estado: 'VALIDADA'
        }
        
        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }
        
        if (selectedPriority.value) {
          params.prioridad = selectedPriority.value
        }
        
        if (sortBy.value) {
          params.sort_by = sortBy.value
        }
        
        const response = await api.get('/recetas/cola-dispensacion-farmacia/', { params })
        recipes.value = response.data.recetas
        
      } catch (error) {
        console.error('Error loading recipes:', error)
        toast.error('Error al cargar las recetas')
      } finally {
        isLoading.value = false
      }
    }
    
    const sortRecipes = () => {
      recipes.value.sort((a, b) => {
        // Siempre priorizar urgentes primero
        if (a.prioridad === 'URGENTE' && b.prioridad !== 'URGENTE') return -1
        if (b.prioridad === 'URGENTE' && a.prioridad !== 'URGENTE') return 1
        
        // Luego ordenar según criterio seleccionado
        if (sortBy.value === 'fecha_validacion') {
          return new Date(a.fecha_validacion) - new Date(b.fecha_validacion)
        } else if (sortBy.value === 'fecha_vencimiento') {
          if (!a.fecha_vencimiento && !b.fecha_vencimiento) return 0
          if (!a.fecha_vencimiento) return 1
          if (!b.fecha_vencimiento) return -1
          return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento)
        } else {
          // Ordenar por prioridad
          const prioridades = { 'URGENTE': 0, 'ALTA': 1, 'MEDIA': 2, 'BAJA': 3 }
          return prioridades[a.prioridad] - prioridades[b.prioridad]
        }
      })
    }
    
    const isExpiringSoon = (fechaVencimiento) => {
      if (!fechaVencimiento) return false
      const daysUntilExpiry = differenceInDays(new Date(fechaVencimiento), new Date())
      return daysUntilExpiry <= 3 && daysUntilExpiry >= 0
    }
    
    const hasSpecialConditions = (recipe) => {
      return recipe.prioridad === 'URGENTE' || isExpiringSoon(recipe.fecha_vencimiento)
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
    
    const startDispensing = (recipe) => {
      dispensingRecipe.value = recipe
    }
    
    const onRecipeDispensed = (recipe) => {
      // Remover de la lista
      recipes.value = recipes.value.filter(r => r.folio_receta !== recipe.folio_receta)
      dispensingRecipe.value = null
      emit('recipe-dispensed', recipe)
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
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    }
    
    onMounted(() => {
      loadRecipes()
      
      // Auto-refresh cada 60 segundos
      const interval = setInterval(loadRecipes, 60000)
      
      // Limpiar interval al desmontar
      return () => clearInterval(interval)
    })
    
    return {
      recipes,
      isLoading,
      searchQuery,
      selectedPriority,
      sortBy,
      selectedRecipe,
      dispensingRecipe,
      dispensingRecipes,
      urgentCount,
      expiringSoonCount,
      loadRecipes,
      isExpiringSoon,
      hasSpecialConditions,
      viewRecipeDetails,
      startDispensing,
      onRecipeDispensed,
      getPriorityClass,
      formatDate
    }
  }
}
</script>
