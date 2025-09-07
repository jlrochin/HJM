<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            Gestión de Códigos CIE-10 - {{ paciente.nombre }} {{ paciente.apellido_paterno }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        
        <div class="mt-2 text-sm text-gray-600">
          <span class="font-medium">Expediente:</span> {{ paciente.expediente }} |
          <span class="font-medium">Total de códigos:</span> {{ (paciente.cie10_codes || []).length + (paciente.cie10 ? 1 : 0) }} |
          <span class="font-medium">Principal:</span> {{ paciente.cie10 || 'No asignado' }}
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <div class="modal-scrollable p-6">
        
        <!-- Resumen de códigos -->
        <div class="mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ (paciente.cie10_codes || []).length + (paciente.cie10 ? 1 : 0) }}</div>
              <div class="text-sm text-blue-700">Total de códigos</div>
            </div>
            <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ paciente.cie10 ? '1' : '0' }}</div>
              <div class="text-sm text-green-700">Código principal</div>
            </div>
            <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ (paciente.cie10_codes || []).length }}</div>
              <div class="text-sm text-orange-700">Códigos adicionales</div>
            </div>
          </div>
        </div>

        <!-- Formulario para agregar nuevo código -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">Agregar Nuevo Código CIE-10</h3>
          </div>
          <div class="card-body">
            <form class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Código CIE-10 -->
                <div>
                  <label class="form-label">
                    Código CIE-10 <span class="text-red-600">*</span>
                  </label>
                  <SelectorCIE10
                    v-model="nuevoCodigo.cie10"
                    placeholder="Buscar código CIE-10..."
                    @code-selected="handleCodigoSelected"
                  />
                </div>

                <!-- Fecha de Diagnóstico -->
                <div>
                  <label class="form-label">
                    Fecha de Diagnóstico <span class="text-red-600">*</span>
                  </label>
                  <input
                    v-model="nuevoCodigo.fecha_diagnostico"
                    type="date"
                    class="form-input"
                    :max="fechaMaxima"
                    required
                  />
                </div>

                <!-- Es Principal -->
                <div class="flex items-center space-x-2 pt-6">
                  <input
                    v-model="nuevoCodigo.es_principal"
                    type="checkbox"
                    id="nuevo_principal"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="nuevo_principal" class="text-sm text-gray-700">
                    Marcar como diagnóstico principal
                  </label>
                </div>
              </div>

              <!-- Botón de agregar -->
              <div class="flex justify-end">
                <!-- Debug info -->
                <div class="text-xs text-gray-500 mb-2">
                  Debug: cie10="{{ nuevoCodigo.cie10 }}", fecha="{{ nuevoCodigo.fecha_diagnostico }}"
                </div>
                <button
                  type="button"
                  class="btn-primary px-4 py-2"
                  :disabled="!nuevoCodigo.cie10 || !nuevoCodigo.fecha_diagnostico"
                  @click="agregarCodigo"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Agregar Código CIE-10
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Lista de códigos existentes -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-gray-900">
              Códigos Asignados ({{ (paciente.cie10_codes || []).length }})
            </h3>
          </div>
          <div class="card-body">
            <div v-if="(paciente.cie10_codes || []).length === 0" class="text-center py-8 text-gray-500">
              <DocumentTextIcon class="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p class="text-sm">No hay códigos CIE-10 asignados</p>
              <p class="text-xs mt-1">Agrega el primer código usando el formulario de arriba</p>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="(codigo, index) in paciente.cie10_codes"
                :key="index"
                class="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Código:</span>
                    <div class="text-gray-900 font-mono font-bold text-lg">{{ codigo.cie10 }}</div>
                  </div>
                  
                  <div>
                    <span class="font-medium text-gray-700">Fecha:</span>
                    <div class="text-gray-900">{{ formatDate(codigo.fecha_diagnostico) }}</div>
                  </div>
                  
                  <div>
                    <span class="font-medium text-gray-700">Estado:</span>
                    <div v-if="codigo.es_principal" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                      <StarIcon class="h-3 w-3 mr-1" />
                      Principal
                    </div>
                    <div v-else class="text-gray-600">Secundario</div>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button
                      @click="togglePrincipal(index)"
                      type="button"
                      class="text-gray-600 hover:text-blue-600 p-1"
                      :title="codigo.es_principal ? 'Quitar como principal' : 'Marcar como principal'"
                    >
                      <StarIcon 
                        class="h-4 w-4" 
                        :class="codigo.es_principal ? 'text-green-600' : 'text-gray-400'"
                      />
                    </button>
                    <button
                      @click="eliminarCodigo(index)"
                      type="button"
                      class="text-red-600 hover:text-red-700 p-1"
                      title="Eliminar código"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con botón de cerrar -->
      <div class="px-6 py-4 border-t border-gray-200 flex-shrink-0">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600">
            <span class="text-blue-600">
              Total de códigos: {{ (paciente.cie10_codes || []).length + (paciente.cie10 ? 1 : 0) }}
            </span>
          </div>
          
          <button
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { XMarkIcon, PlusIcon, StarIcon, TrashIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import SelectorCIE10 from '@/components/shared/SelectorCIE10.vue'

// Props
const props = defineProps({
  paciente: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'updated'])

// Estado reactivo
const nuevoCodigo = ref({
  cie10: '',
  fecha_diagnostico: '',
  es_principal: false
})

// Computed
const fechaMaxima = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Métodos
const handleCodigoSelected = (code) => {
  // Validar que code no sea null o undefined
  if (!code) {
    nuevoCodigo.value.cie10 = ''
    nuevoCodigo.value.observaciones = ''
    return
  }
  
  nuevoCodigo.value.cie10 = code.codigo
  // Solo capturar campos que existen en el modelo del backend
  nuevoCodigo.value.observaciones = nuevoCodigo.value.observaciones || ''
}

const agregarCodigo = () => {
  if (!nuevoCodigo.value.cie10 || !nuevoCodigo.value.fecha_diagnostico) {
    return
  }

  // Si este es principal, desmarcar otros
  if (nuevoCodigo.value.es_principal) {
    if (props.paciente.cie10_codes) {
      props.paciente.cie10_codes.forEach(c => c.es_principal = false)
    }
    props.paciente.cie10 = nuevoCodigo.value.cie10
    props.paciente.fecha_diagnostico = nuevoCodigo.value.fecha_diagnostico
  }

  // Agregar el nuevo código
  if (!props.paciente.cie10_codes) {
    props.paciente.cie10_codes = []
  }
  
  props.paciente.cie10_codes.push({
    cie10: nuevoCodigo.value.cie10,
    fecha_diagnostico: nuevoCodigo.value.fecha_diagnostico,
    es_principal: nuevoCodigo.value.es_principal,
    observaciones: nuevoCodigo.value.observaciones || ''
  })

  // Limpiar formulario
  nuevoCodigo.value.cie10 = ''
  nuevoCodigo.value.fecha_diagnostico = ''
  nuevoCodigo.value.es_principal = false

  // Emitir actualización
  emit('updated', props.paciente.cie10_codes)
}

const togglePrincipal = (index) => {
  // Desmarcar todos los códigos como principales
  props.paciente.cie10_codes.forEach((c, i) => {
    c.es_principal = (i === index)
  })
  
  // Actualizar el código principal del paciente
  const codigoPrincipal = props.paciente.cie10_codes[index]
  if (codigoPrincipal) {
    props.paciente.cie10 = codigoPrincipal.cie10
    props.paciente.fecha_diagnostico = codigoPrincipal.fecha_diagnostico
    // La patología se actualiza desde el backend cuando se guarda
  } else {
    props.paciente.cie10 = ''
    props.paciente.fecha_diagnostico = ''
  }

  // Emitir actualización
  emit('updated', props.paciente.cie10_codes)
}

const eliminarCodigo = (index) => {
  const codigoEliminado = props.paciente.cie10_codes[index]
  
  // Si se elimina el código principal, limpiar el campo principal
  if (codigoEliminado.es_principal) {
    props.paciente.cie10 = ''
    props.paciente.fecha_diagnostico = ''
  }
  
  props.paciente.cie10_codes.splice(index, 1)

  // Emitir actualización
  emit('updated', props.paciente.cie10_codes)
}

const formatDate = (dateString) => {
  if (!dateString) return 'No especificado'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.modal-scrollable {
  flex: 1;
  overflow-y: auto;
}

.card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-body {
  padding: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  outline: none;
}

.form-input:focus {
  border-color: #4b5563;
  box-shadow: 0 0 0 3px rgba(75, 85, 99, 0.1);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: white;
  background-color: #4b5563;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #374151;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: #374151;
  background-color: white;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}
</style>
