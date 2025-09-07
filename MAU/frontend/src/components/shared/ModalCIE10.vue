<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-secondary-900">
            {{ isEditing ? 'Editar Código CIE-10' : 'Agregar Código CIE-10' }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-secondary-400 hover:text-secondary-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Contenido -->
      <div class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Selector de código CIE-10 -->
          <div>
            <label class="form-label">
              Código CIE-10 *
            </label>
            <SelectorCIE10
              v-model="form.cie10"
              :error-message="errors.cie10"
              placeholder="Buscar código CIE-10..."
              @code-selected="handleCIE10Selected"
            />
            <p v-if="errors.cie10" class="form-error">
              {{ errors.cie10 }}
            </p>
          </div>

          <!-- Fecha de diagnóstico -->
          <div>
            <label class="form-label">
              Fecha de Diagnóstico *
            </label>
            <input
              v-model="form.fecha_diagnostico"
              type="date"
              class="form-input"
              :class="{ 'border-accent-500': errors.fecha_diagnostico }"
            />
            <p v-if="errors.fecha_diagnostico" class="form-error">
              {{ errors.fecha_diagnostico }}
            </p>
          </div>

          <!-- Es diagnóstico principal -->
          <div class="flex items-center space-x-3">
            <input
              v-model="form.es_principal"
              type="checkbox"
              id="es_principal"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label for="es_principal" class="text-sm font-medium text-secondary-900">
              Este es el diagnóstico principal
            </label>
          </div>

          <!-- Observaciones -->
          <div>
            <label class="form-label">
              Observaciones
            </label>
            <textarea
              v-model="form.observaciones"
              class="form-input"
              rows="3"
              placeholder="Notas adicionales sobre este diagnóstico..."
            ></textarea>
          </div>

          <!-- Información del código seleccionado -->
          <div v-if="selectedCodeInfo" class="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 class="font-medium text-primary-900 mb-2">Información del Código</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium text-primary-700">Capítulo:</span>
                <span class="ml-2 text-primary-600">{{ selectedCodeInfo.capitulo }}</span>
              </div>
              <div>
                <span class="font-medium text-primary-700">Tipo:</span>
                <span class="ml-2 text-primary-600">{{ selectedCodeInfo.tipo }}</span>
              </div>
              <div class="col-span-2">
                <span class="font-medium text-primary-700">Descripción:</span>
                <p class="mt-1 text-primary-600">{{ selectedCodeInfo.descripcion }}</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 flex-shrink-0">
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="btn-primary"
          >
            <span v-if="isSubmitting">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
            <span v-else>
              {{ isEditing ? 'Actualizar' : 'Agregar' }} Código
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { patientsService } from '@/services/patients'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import SelectorCIE10 from './SelectorCIE10.vue'

export default {
  name: 'ModalCIE10',
  components: {
    XMarkIcon,
    SelectorCIE10
  },
  props: {
    cie10Code: {
      type: Object,
      default: null
    },
    pacienteExpediente: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const isSubmitting = ref(false)
    const selectedCodeInfo = ref(null)
    
    const isEditing = computed(() => !!props.cie10Code)
    
    const form = reactive({
      cie10: '',
      fecha_diagnostico: '',
      es_principal: false,
      observaciones: ''
    })
    
    const errors = reactive({})
    
    // Cargar datos si está editando
    onMounted(() => {
      if (props.cie10Code) {
        form.cie10 = props.cie10Code.codigo
        form.fecha_diagnostico = formatDateForInput(props.cie10Code.fecha_diagnostico)
        form.es_principal = props.cie10Code.es_principal
        form.observaciones = props.cie10Code.observaciones || ''
        
        // Cargar información del código
        selectedCodeInfo.value = {
          capitulo: props.cie10Code.capitulo,
          tipo: props.cie10Code.tipo,
          descripcion: props.cie10Code.descripcion_corta
        }
      } else {
        // Fecha por defecto: hoy
        form.fecha_diagnostico = new Date().toISOString().split('T')[0]
      }
    })
    
    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    }
    
    const handleCIE10Selected = (code) => {
      if (code) {
        form.cie10 = code.codigo
        selectedCodeInfo.value = {
          capitulo: code.capitulo,
          tipo: code.tipo,
          descripcion: code.descripcion_corta
        }
      }
    }
    
    const validateForm = () => {
      const newErrors = {}
      
      if (!form.cie10.trim()) {
        newErrors.cie10 = 'Debe seleccionar un código CIE-10'
      }
      
      if (!form.fecha_diagnostico) {
        newErrors.fecha_diagnostico = 'La fecha de diagnóstico es requerida'
      } else {
        const diagDate = new Date(form.fecha_diagnostico)
        const today = new Date()
        if (diagDate > today) {
          newErrors.fecha_diagnostico = 'La fecha de diagnóstico no puede ser futura'
        }
      }
      
      Object.assign(errors, newErrors)
      return Object.keys(newErrors).length === 0
    }
    
    const handleSubmit = async () => {
      if (!validateForm()) {
        toast.error('Por favor corrige los errores en el formulario')
        return
      }
      
      try {
        isSubmitting.value = true
        
        let response
        if (isEditing.value) {
          // Actualizar código existente
          response = await patientsService.updatePatientCIE10(
            props.pacienteExpediente,
            props.cie10Code.id,
            {
              fecha_diagnostico: form.fecha_diagnostico,
              es_principal: form.es_principal,
              observaciones: form.observaciones
            }
          )
        } else {
          // Agregar nuevo código
          response = await patientsService.addPatientCIE10(
            props.pacienteExpediente,
            {
              cie10: form.cie10,
              fecha_diagnostico: form.fecha_diagnostico,
              es_principal: form.es_principal,
              observaciones: form.observaciones
            }
          )
        }
        
        emit('saved', response)
        
      } catch (error) {
        console.error('Error saving CIE-10 code:', error)
        
        if (error.response?.data) {
          const errorData = error.response.data
          Object.keys(errorData).forEach(field => {
            if (errors.hasOwnProperty(field)) {
              errors[field] = Array.isArray(errorData[field]) 
                ? errorData[field][0] 
                : errorData[field]
            }
          })
        }
        
        toast.error('Error al guardar el código CIE-10')
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      form,
      errors,
      isSubmitting,
      isEditing,
      selectedCodeInfo,
      handleCIE10Selected,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.form-label {
  @apply block text-sm font-medium text-secondary-700 mb-2;
}

.form-input {
  @apply w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors;
}

.form-error {
  @apply mt-1 text-sm text-accent-600;
}

.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors;
}
</style>
