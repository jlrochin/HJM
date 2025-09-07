<template>
  <div class="space-y-4">
    <div class="flex space-x-4">
      <div class="flex-1">
        <label class="form-label">
          Buscar Paciente
        </label>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            class="form-input pl-10"
            placeholder="Buscar por expediente, CURP o nombre..."
            @input="onSearchInput"
            @keydown.enter="performSearch"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-secondary-400" />
          </div>
        </div>
      </div>
      
      <div class="flex items-end space-x-2">
        <button
          @click="performSearch"
          :disabled="!searchQuery.trim() || isLoading"
          class="btn-primary"
        >
          <MagnifyingGlassIcon class="h-5 w-5 mr-2" />
          Buscar
        </button>
        
        <button
          @click="$emit('new-patient')"
          class="btn-secondary"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Nuevo
        </button>
      </div>
    </div>

    <!-- Indicador de carga -->
    <div v-if="isLoading" class="text-center py-4">
      <div class="inline-flex items-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Buscando pacientes...
      </div>
    </div>

    <!-- Tabla de resultados -->
    <div v-if="searchResults.length > 0 && !isLoading" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-secondary-900">
          Resultados de búsqueda ({{ searchResults.length }})
        </h3>
        <button
          @click="clearSearch"
          class="text-sm text-secondary-600 hover:text-secondary-800 underline"
        >
          Limpiar búsqueda
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider border-b border-gray-200">
                Paciente
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider border-b border-gray-200">
                Expediente
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider border-b border-gray-200">
                CURP
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider border-b border-gray-200">
                Edad
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider border-b border-gray-200">
                Patología
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider border-b border-gray-200">
                Género
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="patient in searchResults"
              :key="patient.expediente"
              @click="showPatientDetails(patient)"
              class="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <td class="px-4 py-3">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-700">
                        {{ patient.nombre.charAt(0) }}{{ patient.apellido_paterno.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-secondary-900">
                      {{ patient.nombre }} {{ patient.apellido_paterno }} {{ patient.apellido_materno || '' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-secondary-900 font-mono">
                {{ patient.expediente }}
              </td>
              <td class="px-4 py-3 text-sm text-secondary-900 font-mono">
                {{ patient.curp }}
              </td>
              <td class="px-4 py-3 text-sm text-secondary-900">
                {{ patient.edad }} años
              </td>
              <td class="px-4 py-3 text-sm text-secondary-900">
                {{ patient.patologia }}
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="patient.genero === 'MASCULINO' ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'">
                  {{ patient.genero === 'MASCULINO' ? 'M' : 'F' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mensaje cuando no hay resultados -->
    <div v-if="showNoResults && !isLoading" class="text-center py-8">
      <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-secondary-400" />
      <h3 class="mt-2 text-lg font-medium text-secondary-900">No se encontraron pacientes</h3>
      <p class="mt-1 text-secondary-600">
        No hay pacientes que coincidan con tu búsqueda.
      </p>
      <div class="mt-4 space-x-3">
        <button
          @click="clearSearch"
          class="btn-secondary"
        >
          Limpiar búsqueda
        </button>
        <button
          @click="$emit('new-patient')"
          class="btn-primary"
        >
          Crear nuevo paciente
        </button>
      </div>
    </div>

    <!-- Duplicados encontrados (solo en modo verificación) -->
    <div v-if="duplicates.length > 0" class="bg-warning bg-opacity-10 border border-warning rounded-lg p-4">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-warning" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-warning">
            Pacientes duplicados encontrados
          </h3>
          <div class="mt-2 text-sm text-warning">
            <p>Se encontraron pacientes con información similar:</p>
            <ul class="mt-1 list-disc list-inside">
              <li v-for="duplicate in duplicates" :key="duplicate.paciente.expediente">
                {{ duplicate.paciente.nombre }} {{ duplicate.paciente.apellido_paterno }} {{ duplicate.paciente.apellido_materno || '' }} 
                ({{ duplicate.campo.toUpperCase() }}: {{ duplicate.valor }})
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { patientsService } from '@/services/patients'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'BuscarPaciente',
  components: {
    MagnifyingGlassIcon,
    PlusIcon,
    ExclamationTriangleIcon
  },
  emits: ['patient-selected', 'new-patient', 'search-state-changed'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const searchQuery = ref('')
    const searchResults = ref([])
    const duplicates = ref([])
    const isLoading = ref(false)
    const hasSearched = ref(false)
    
    const showNoResults = computed(() => {
      return hasSearched.value && searchResults.value.length === 0 && searchQuery.value.trim()
    })
    
    let searchTimeout = null
    
    const onSearchInput = () => {
      clearTimeout(searchTimeout)
      
      // Si hay texto en la búsqueda, emitir que la búsqueda está activa
      if (searchQuery.value.trim()) {
        emit('search-state-changed', true)
      } else {
        emit('search-state-changed', false)
      }
      
      searchTimeout = setTimeout(performSearch, 500)
    }
    
    const performSearch = async () => {
      if (!searchQuery.value.trim()) {
        searchResults.value = []
        hasSearched.value = false
        emit('search-state-changed', false)
        return
      }
      
      try {
        isLoading.value = true
        const response = await patientsService.searchPatient(searchQuery.value.trim())
        
        searchResults.value = response.results || []
        hasSearched.value = true
        
        if (searchResults.value.length === 0) {
          toast.info('No se encontraron pacientes con esos criterios')
        }
      } catch (error) {
        toast.error('Error al buscar pacientes')
        searchResults.value = []
      } finally {
        isLoading.value = false
      }
    }
    
    const showPatientDetails = (patient) => {
      // Validar que el paciente tenga expediente antes de emitir
      if (!patient || !patient.expediente) {
        toast.error('Error: Paciente sin expediente válido')
        return
      }
      emit('patient-selected', patient)
    }
    
    // Método para verificar duplicados (usado desde componentes padre)
    const checkDuplicates = async (expediente, curp) => {
      try {
        const response = await patientsService.checkDuplicates(expediente, curp)
        
        duplicates.value = response.duplicados || []
        return response.duplicados_encontrados
      } catch (error) {
        return false
      }
    }
    
    const clearSearch = () => {
      searchQuery.value = ''
      searchResults.value = []
      duplicates.value = []
      hasSearched.value = false
      emit('search-state-changed', false)
    }
    
    return {
      searchQuery,
      searchResults,
      duplicates,
      isLoading,
      showNoResults,
      onSearchInput,
      performSearch,
      showPatientDetails,
      checkDuplicates,
      clearSearch
    }
  }
}
</script>
