<template>
  <div class="relative">
    <!-- Selector simple para códigos del paciente -->
    <div v-if="patientCodes.length > 0">
      <select
        v-model="selectedPatientCode"
        @change="onPatientCodeSelect"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm bg-white shadow-sm hover:border-gray-400"
        :class="{ 'border-red-400 focus:ring-red-500 focus:border-red-500': hasError }"
      >
        <option value="" class="text-gray-500">
          Seleccionar código CIE-10 del paciente
        </option>
        <option
          v-for="code in patientCodes"
          :key="code.codigo"
          :value="code.codigo"
          class="py-2"
        >
          {{ code.codigo }} - {{ code.descripcion_corta }}
          {{ code.es_principal ? ' (Principal)' : '' }}
        </option>
      </select>
      
      <!-- Código seleccionado mejorado -->
      <div v-if="selectedCode" class="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-3">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                {{ selectedCode.codigo }}
              </span>
              <span v-if="selectedCode.es_principal" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Principal
              </span>
            </div>
            <h4 class="font-semibold text-gray-900 mb-2 text-base">
              {{ selectedCode.descripcion_corta }}
            </h4>
            <p v-if="selectedCode.descripcion !== selectedCode.descripcion_corta" class="text-sm text-gray-600 leading-relaxed">
              {{ selectedCode.descripcion }}
            </p>
          </div>
          
          <!-- Botón para cambiar -->
          <button
            @click="clearSelection"
            type="button"
            class="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors duration-200"
            title="Cambiar selección"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Información adicional -->
        <div class="mt-4 pt-3 border-t border-blue-200">
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="flex items-center space-x-1">
              <span class="font-medium text-blue-700">Tipo:</span>
              <span class="text-blue-600">{{ getTipoDisplay(selectedCode.tipo) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="font-medium text-blue-700">Género:</span>
              <span class="text-blue-600">{{ getGeneroDisplay(selectedCode.genero_aplicable) }}</span>
            </div>
            <div v-if="selectedCode.fecha_diagnostico" class="flex items-center space-x-1">
              <span class="font-medium text-blue-700">Diagnóstico:</span>
              <span class="text-blue-600">{{ formatDate(selectedCode.fecha_diagnostico) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <span class="font-medium text-blue-700">Aplicabilidad:</span>
              <span class="text-blue-600">
                {{ selectedCode.es_morbilidad ? 'Morbilidad' : '' }}{{ selectedCode.es_mortalidad && selectedCode.es_morbilidad ? ', ' : '' }}{{ selectedCode.es_mortalidad ? 'Mortalidad' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fallback: Campo de búsqueda si no hay códigos del paciente -->
    <div v-else>
      <!-- Campo de entrada con búsqueda -->
      <div class="relative">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          @focus="showDropdown = true"
          @blur="handleBlur"
          type="text"
          :placeholder="placeholder || 'Buscar código CIE-10...'"
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors"
          :class="{ 'border-accent-500': hasError }"
        />
        
        <!-- Icono de búsqueda -->
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Dropdown de resultados -->
      <div
        v-if="showDropdown && (filteredCodes.length > 0 || isLoading)"
        class="absolute z-50 w-full mt-1 bg-white border border-secondary-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <!-- Estado de carga -->
        <div v-if="isLoading" class="p-4 text-center text-secondary-600">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-2">Buscando códigos...</p>
        </div>

        <!-- Resultados -->
        <div v-else>
          <!-- Resultados de búsqueda -->
          <div
            v-for="code in filteredCodes"
            :key="code.codigo"
            @click="selectCode(code)"
            class="px-4 py-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-100 last:border-b-0 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-mono text-sm font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                    {{ code.codigo }}
                  </span>
                  <span class="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded">
                    Cap. {{ code.capitulo }}
                  </span>
                </div>
                <p class="text-sm font-medium text-secondary-900 mt-1">
                  {{ code.descripcion_corta }}
                </p>
                <p class="text-xs text-secondary-600 mt-1 line-clamp-2">
                  {{ code.descripcion }}
                </p>
              </div>
              
              <!-- Indicadores adicionales -->
              <div class="flex flex-col items-end space-y-1 ml-2">
                <span v-if="code.genero_aplicable !== 'AMBOS'" 
                      class="text-xs px-2 py-1 rounded text-white"
                      :class="code.genero_aplicable === 'MASCULINO' ? 'bg-blue-500' : 'bg-pink-500'">
                  {{ code.genero_aplicable === 'MASCULINO' ? '♂' : '♀' }}
                </span>
                <span v-if="code.es_mortalidad" 
                      class="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                  Mortalidad
                </span>
              </div>
            </div>
          </div>

          <!-- Sin resultados -->
          <div v-if="filteredCodes.length === 0 && searchQuery" 
               class="px-4 py-3 text-center text-secondary-500">
            <p>No se encontraron códigos CIE-10</p>
            <p class="text-sm">Intenta con otros términos de búsqueda</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <p v-if="hasError" class="mt-1 text-sm text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

export default {
  name: 'SelectorCIE10',
  props: {
    modelValue: {
      type: [String, Object],
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Buscar código CIE-10...'
    },
    required: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    },
    patient: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'code-selected', 'fill-patologia'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const searchQuery = ref('')
    const showDropdown = ref(false)
    const isLoading = ref(false)
    const filteredCodes = ref([])
    const selectedCode = ref(null)
    const searchTimeout = ref(null)
    const patientCodes = ref([])
    const selectedPatientCode = ref('')

    // Computed properties
    const hasError = computed(() => props.errorMessage && props.errorMessage.length > 0)

    // Métodos
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      
      searchTimeout.value = setTimeout(() => {
        if (searchQuery.value.trim().length >= 2) {
          searchCodes()
        } else {
          filteredCodes.value = []
        }
      }, 300)
    }

    const searchCodes = async () => {
      if (!searchQuery.value.trim()) return
      
      isLoading.value = true
      try {
        const response = await api.get(`/pacientes/cie10/buscar/?q=${encodeURIComponent(searchQuery.value.trim())}`)
        filteredCodes.value = response.data.results || []
      } catch (error) {
        console.error('Error buscando códigos CIE-10:', error)
        toast.error('Error al buscar códigos CIE-10')
        filteredCodes.value = []
      } finally {
        isLoading.value = false
      }
    }

    const selectCode = (code) => {
      selectedCode.value = code
      searchQuery.value = code.codigo
      showDropdown.value = false
      emit('update:modelValue', code.codigo)
      emit('code-selected', code)
      
      // Emitir evento para llenar patología principal
      emit('fill-patologia', code.descripcion_mostrar || code.descripcion_corta || code.descripcion)
      
      toast.success(`Código CIE-10 seleccionado: ${code.codigo}`)
    }

    const clearSelection = () => {
      selectedCode.value = null
      searchQuery.value = ''
      selectedPatientCode.value = ''
      emit('update:modelValue', '')
      emit('code-selected', null)
      
      // Limpiar patología principal
      emit('fill-patologia', '')
    }

    const onPatientCodeSelect = () => {
      if (!selectedPatientCode.value) {
        clearSelection()
        return
      }

      // Encontrar el código completo del paciente
      const code = patientCodes.value.find(c => c.codigo === selectedPatientCode.value)
      if (code) {
        selectedCode.value = code
        emit('update:modelValue', code.codigo)
        emit('code-selected', code)
        
        // Emitir evento para llenar patología principal
        emit('fill-patologia', code.descripcion_mostrar || code.descripcion_corta || code.descripcion)
        
        toast.success(`Código CIE-10 seleccionado: ${code.codigo}`)
      }
    }

    const handleBlur = () => {
      // Pequeño delay para permitir que se ejecute el click en los resultados
      setTimeout(() => {
        showDropdown.value = false
      }, 150)
    }

    const getTipoDisplay = (tipo) => {
      const tipos = {
        'ENFERMEDAD': 'Enfermedad',
        'TRAUMATISMO': 'Traumatismo',
        'FACTOR_EXTERNO': 'Causa externa',
        'FACTOR_SALUD': 'Factor de salud'
      }
      return tipos[tipo] || tipo
    }

    const getGeneroDisplay = (genero) => {
      const generos = {
        'AMBOS': 'Ambos géneros',
        'MASCULINO': 'Solo masculino',
        'FEMENINO': 'Solo femenino'
      }
      return generos[genero] || genero
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'No especificado'
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch (error) {
        return 'No especificado'
      }
    }

    const loadPatientCodes = () => {
      if (!props.patient || !props.patient.cie10_codes) {
        patientCodes.value = []
        return
      }

      // Formatear códigos del paciente para que coincidan con la estructura esperada
      patientCodes.value = props.patient.cie10_codes.map(code => ({
        codigo: code.cie10,
        descripcion_corta: code.cie10_info?.descripcion_corta || code.cie10_info?.descripcion || 'Descripción no disponible',
        descripcion: code.cie10_info?.descripcion || code.cie10_info?.descripcion_corta || 'Descripción no disponible',
        es_principal: code.es_principal,
        fecha_diagnostico: code.fecha_diagnostico,
        capitulo: code.cie10_info?.capitulo || 'N/A',
        genero_aplicable: code.cie10_info?.genero_aplicable || 'AMBOS',
        es_mortalidad: code.cie10_info?.es_mortalidad || false,
        es_morbilidad: code.cie10_info?.es_morbilidad || true,
        tipo: code.cie10_info?.tipo || 'ENFERMEDAD'
      }))

      // Ordenar códigos: principal primero, luego por fecha más reciente
      patientCodes.value.sort((a, b) => {
        if (a.es_principal && !b.es_principal) return -1
        if (!a.es_principal && b.es_principal) return 1
        return new Date(b.fecha_diagnostico) - new Date(a.fecha_diagnostico)
      })
    }

    // Inicializar con valor existente
    const initializeWithValue = async () => {
      if (props.modelValue && typeof props.modelValue === 'string') {
        // Primero verificar si el código está en los códigos del paciente
        if (patientCodes.value.length > 0) {
          const patientCode = patientCodes.value.find(code => code.codigo === props.modelValue)
          if (patientCode) {
            selectedCode.value = patientCode
            selectedPatientCode.value = patientCode.codigo
            return
          }
        }

        // Si no está en los códigos del paciente, buscar en el catálogo general
        try {
          const response = await api.get(`/pacientes/cie10/buscar/?q=${props.modelValue}`)
          const codes = response.data.results || []
          const foundCode = codes.find(code => code.codigo === props.modelValue)
          if (foundCode) {
            selectedCode.value = foundCode
            searchQuery.value = foundCode.codigo
          }
        } catch (error) {
          console.error('Error inicializando código CIE-10:', error)
        }
      }
    }

    // Watchers
    watch(() => props.modelValue, (newValue) => {
      if (newValue && !selectedCode.value) {
        initializeWithValue()
      }
    })

    watch(() => props.patient, () => {
      loadPatientCodes()
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
      loadPatientCodes()
      if (props.modelValue) {
        initializeWithValue()
      }
    })

    return {
      searchQuery,
      showDropdown,
      isLoading,
      filteredCodes,
      selectedCode,
      patientCodes,
      selectedPatientCode,
      hasError,
      handleSearch,
      selectCode,
      clearSelection,
      onPatientCodeSelect,
      handleBlur,
      getTipoDisplay,
      getGeneroDisplay,
      formatDate
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
