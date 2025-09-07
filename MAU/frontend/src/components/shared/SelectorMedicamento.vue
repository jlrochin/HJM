<template>
  <div class="medicamento-selector">
    <!-- Selector de medicamento con autocompletado -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Buscar Medicamento *
      </label>
      
      <div class="relative">
        <input
          ref="medicamentoInput"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, clave o principio activo..."
          class="form-input w-full pr-10"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': error }"
          @input="onSearchInput"
          @focus="showDropdown = true"
          @blur="onBlur"
          @keydown.down.prevent="navigateDown"
          @keydown.up.prevent="navigateUp"
          @keydown.enter.prevent="selectHighlighted"
          @keydown.escape="hideDropdown"
        >
        
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <MagnifyingGlassIcon v-if="!isLoading" class="h-5 w-5 text-gray-400" />
          <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
        
        <!-- Dropdown de resultados -->
        <div
          v-if="showDropdown && (filteredMedicamentos.length > 0 || searchQuery.length >= 2)"
          class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div v-if="isLoading" class="p-4 text-center text-gray-600">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Buscando medicamentos...
          </div>
          
          <div v-else-if="filteredMedicamentos.length === 0 && searchQuery.length >= 2" class="p-4 text-center text-gray-600">
            <ExclamationCircleIcon class="h-8 w-8 mx-auto mb-2 text-gray-400" />
            No se encontraron medicamentos
          </div>
          
          <div v-else>
            <div
              v-for="(medicamento, index) in filteredMedicamentos"
              :key="medicamento.id"
              class="p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
              :class="{ 'bg-blue-100': index === highlightedIndex }"
              @mousedown.prevent="selectMedicamento(medicamento)"
              @mouseenter="highlightedIndex = index"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-sm font-bold text-blue-600">{{ medicamento.clave }}</span>
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="getCategoryClass(medicamento.categoria)"
                    >
                      {{ getCategoryLabel(medicamento.categoria) }}
                    </span>
                  </div>
                  
                  <h4 class="text-sm font-medium text-gray-900 mb-1">
                    {{ medicamento.nombre }}
                  </h4>
                  
                  <div class="text-xs text-gray-600 space-y-1">
                    <div>{{ medicamento.forma_farmaceutica }} - {{ medicamento.concentracion }}</div>
                    <div v-if="medicamento.dosis_sugerida" class="text-green-600">
                      💊 {{ medicamento.dosis_sugerida }}
                    </div>
                  </div>
                </div>
                
                <CheckIcon class="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Medicamento seleccionado -->
    <div v-if="medicamentoSeleccionado" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-2">
            <CheckCircleIcon class="h-5 w-5 text-green-500" />
            <span class="font-bold text-blue-600">{{ medicamentoSeleccionado.clave }}</span>
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              :class="getCategoryClass(medicamentoSeleccionado.categoria)"
            >
              {{ getCategoryLabel(medicamentoSeleccionado.categoria) }}
            </span>
          </div>
          
          <h4 class="font-medium text-gray-900 mb-2">
            {{ medicamentoSeleccionado.nombre }}
          </h4>
          
          <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span class="font-medium">Forma:</span> {{ medicamentoSeleccionado.forma_farmaceutica }}
            </div>
            <div>
              <span class="font-medium">Concentración:</span> {{ medicamentoSeleccionado.concentracion }}
            </div>
            <div v-if="medicamentoSeleccionado.dosis_sugerida" class="col-span-2">
              <span class="font-medium">Dosis sugerida:</span> 
              <span class="text-green-600">{{ medicamentoSeleccionado.dosis_sugerida }}</span>
            </div>
          </div>
        </div>
        
        <button
          @click="limpiarSeleccion"
          class="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Limpiar selección"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Campos adicionales cuando hay medicamento seleccionado -->
    <div v-if="medicamentoSeleccionado" class="space-y-4">
      <!-- Dosis personalizada -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Dosis y Frecuencia *
        </label>
        <input
          v-model="dosisPersonalizada"
          type="text"
          placeholder="Ej: 1 tableta cada 8 horas por 7 días"
          class="form-input w-full"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': !dosisPersonalizada && showValidation }"
        >
        <p class="mt-1 text-xs text-gray-600">
          Sugerencia: {{ medicamentoSeleccionado.dosis_sugerida || 'Sin dosis sugerida' }}
        </p>
      </div>

      <!-- Cantidad prescrita -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Cantidad a Prescribir *
        </label>
        <input
          v-model.number="cantidadPrescrita"
          type="number"
          min="1"
          placeholder="Número de unidades"
          class="form-input w-full"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': !cantidadPrescrita && showValidation }"
        >
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import {
  MagnifyingGlassIcon,
  CheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'SelectorMedicamento',
  components: {
    MagnifyingGlassIcon,
    CheckIcon,
    CheckCircleIcon,
    XMarkIcon,
    ExclamationCircleIcon
  },
  props: {
    tipoReceta: {
      type: String,
      default: 'FARMACIA'
    },
    modelValue: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'medicamento-selected'],
  setup(props, { emit }) {
    const toast = useToast()
    
    // Refs
    const medicamentoInput = ref(null)
    const searchQuery = ref('')
    const medicamentoSeleccionado = ref(props.modelValue)
    const dosisPersonalizada = ref('')
    const cantidadPrescrita = ref(1)
    const showDropdown = ref(false)
    const filteredMedicamentos = ref([])
    const isLoading = ref(false)
    const error = ref('')
    const highlightedIndex = ref(-1)
    const showValidation = ref(false)
    
    // Búsqueda con debounce
    let searchTimeout = null
    
    const categoryLabels = {
      'ANALGESICO': 'Analgésico',
      'ANTIBIOTICO': 'Antibiótico',
      'ANTIINFLAMATORIO': 'Antiinflamatorio',
      'CARDIOVASCULAR': 'Cardiovascular',
      'ENDOCRINO': 'Endócrino',
      'GASTROINTESTINAL': 'Gastrointestinal',
      'NEUROLOGICO': 'Neurológico',
      'ONCOLOGICO': 'Oncológico',
      'RESPIRATORIO': 'Respiratorio',
      'OTROS': 'Otros'
    }
    
    const categoryClasses = {
      'ANALGESICO': 'bg-blue-100 text-blue-800',
      'ANTIBIOTICO': 'bg-red-100 text-red-800',
      'ANTIINFLAMATORIO': 'bg-orange-100 text-orange-800',
      'CARDIOVASCULAR': 'bg-purple-100 text-purple-800',
      'ENDOCRINO': 'bg-green-100 text-green-800',
      'GASTROINTESTINAL': 'bg-yellow-100 text-yellow-800',
      'NEUROLOGICO': 'bg-indigo-100 text-indigo-800',
      'ONCOLOGICO': 'bg-pink-100 text-pink-800',
      'RESPIRATORIO': 'bg-cyan-100 text-cyan-800',
      'OTROS': 'bg-gray-100 text-gray-800'
    }
    
    // Methods
    const getCategoryLabel = (categoria) => {
      return categoryLabels[categoria] || categoria
    }
    
    const getCategoryClass = (categoria) => {
      return categoryClasses[categoria] || 'bg-gray-100 text-gray-800'
    }
    
    const searchMedicamentos = async (query) => {
      if (query.length < 2) {
        filteredMedicamentos.value = []
        return
      }
      
      try {
        isLoading.value = true
        error.value = ''
        
        const response = await api.get('/recetas/catalogo/autocompletar/', {
          params: {
            q: query,
            tipo_receta: props.tipoReceta
          }
        })
        
        filteredMedicamentos.value = response.data.results || []
        highlightedIndex.value = -1
        
      } catch (err) {
        console.error('Error searching medications:', err)
        error.value = 'Error al buscar medicamentos'
        filteredMedicamentos.value = []
      } finally {
        isLoading.value = false
      }
    }
    
    const onSearchInput = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      
      searchTimeout = setTimeout(() => {
        searchMedicamentos(searchQuery.value)
        showDropdown.value = true
      }, 300)
    }
    
    const selectMedicamento = (medicamento) => {
      medicamentoSeleccionado.value = medicamento
      searchQuery.value = `${medicamento.clave} - ${medicamento.nombre}`
      dosisPersonalizada.value = medicamento.dosis_sugerida || ''
      showDropdown.value = false
      highlightedIndex.value = -1
      error.value = ''
      
      emitUpdate()
      emit('medicamento-selected', medicamento)
      
      toast.success(`Medicamento seleccionado: ${medicamento.nombre}`)
    }
    
    const limpiarSeleccion = () => {
      medicamentoSeleccionado.value = null
      searchQuery.value = ''
      dosisPersonalizada.value = ''
      cantidadPrescrita.value = 1
      filteredMedicamentos.value = []
      showDropdown.value = false
      error.value = ''
      showValidation.value = false
      
      emitUpdate()
      
      // Focus en el input de búsqueda
      setTimeout(() => {
        medicamentoInput.value?.focus()
      }, 100)
    }
    
    const emitUpdate = () => {
      const data = medicamentoSeleccionado.value ? {
        medicamento: medicamentoSeleccionado.value,
        dosis: dosisPersonalizada.value,
        cantidad_prescrita: cantidadPrescrita.value
      } : null
      
      emit('update:modelValue', data)
    }
    
    const onBlur = () => {
      // Delay para permitir click en dropdown
      setTimeout(() => {
        showDropdown.value = false
      }, 200)
    }
    
    const hideDropdown = () => {
      showDropdown.value = false
      highlightedIndex.value = -1
    }
    
    const navigateDown = () => {
      if (highlightedIndex.value < filteredMedicamentos.value.length - 1) {
        highlightedIndex.value++
      }
    }
    
    const navigateUp = () => {
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--
      }
    }
    
    const selectHighlighted = () => {
      if (highlightedIndex.value >= 0 && filteredMedicamentos.value[highlightedIndex.value]) {
        selectMedicamento(filteredMedicamentos.value[highlightedIndex.value])
      }
    }
    
    const validate = () => {
      showValidation.value = true
      
      if (!medicamentoSeleccionado.value) {
        error.value = 'Debe seleccionar un medicamento'
        return false
      }
      
      if (!dosisPersonalizada.value) {
        error.value = 'Debe especificar la dosis'
        return false
      }
      
      if (!cantidadPrescrita.value || cantidadPrescrita.value < 1) {
        error.value = 'La cantidad debe ser mayor a 0'
        return false
      }
      
      error.value = ''
      return true
    }
    
    // Watchers
    watch(() => props.modelValue, (newValue) => {
      if (!newValue && medicamentoSeleccionado.value) {
        limpiarSeleccion()
      }
    })
    
    watch([dosisPersonalizada, cantidadPrescrita], () => {
      if (medicamentoSeleccionado.value) {
        emitUpdate()
      }
    })
    
    // Expose validate method
    const exposed = {
      validate,
      limpiarSeleccion
    }
    
    return {
      // Refs
      medicamentoInput,
      searchQuery,
      medicamentoSeleccionado,
      dosisPersonalizada,
      cantidadPrescrita,
      showDropdown,
      filteredMedicamentos,
      isLoading,
      error,
      highlightedIndex,
      showValidation,
      
      // Methods
      getCategoryLabel,
      getCategoryClass,
      onSearchInput,
      selectMedicamento,
      limpiarSeleccion,
      onBlur,
      hideDropdown,
      navigateDown,
      navigateUp,
      selectHighlighted,
      validate,
      
      // Exposed
      ...exposed
    }
  }
}
</script>

<style scoped>
.medicamento-selector {
  position: relative;
}

.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  background-color: #ffffff;
  transition: all 0.15s ease-in-out;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.border-red-500 {
  border-color: #ef4444;
}

.form-input.border-red-500:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
</style>
