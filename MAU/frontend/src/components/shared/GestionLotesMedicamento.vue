<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-background-card rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-secondary-900">
            Gestión de Lotes - {{ medicamento.descripcion_medicamento }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-secondary-400 hover:text-secondary-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        
        <div class="mt-2 text-sm text-secondary-600">
          <span class="font-medium">Clave:</span> {{ medicamento.clave_medicamento }} |
          <span class="font-medium">Prescrito:</span> {{ medicamento.cantidad_prescrita }} {{ medicamento.unidad_medida }} |
          <span class="font-medium">Dispensado:</span> {{ medicamento.total_lotes_dispensados || 0 }} {{ medicamento.unidad_medida }}
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <div class="modal-scrollable p-6">
        
        <!-- Progreso de dispensación -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-secondary-700">Progreso de dispensación</span>
            <span class="text-sm text-secondary-600">
              {{ medicamento.total_lotes_dispensados || 0 }} / {{ medicamento.cantidad_prescrita }}
            </span>
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="porcentajeCompleto >= 100 ? 'bg-green-500' : 'bg-orange-500'"
              :style="{ width: Math.min(porcentajeCompleto, 100) + '%' }"
            ></div>
          </div>
          
          <div class="text-xs text-secondary-600 mt-1">
            {{ Math.round(porcentajeCompleto) }}% dispensado
          </div>
        </div>

        <!-- Información de Stock en Inventario -->
        <div class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-blue-900">Stock en Inventario</h4>
            <button 
              @click="verificarStock"
              :disabled="verificandoStock"
              class="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {{ verificandoStock ? 'Verificando...' : 'Actualizar' }}
            </button>
          </div>
          
          <div v-if="verificandoStock" class="mt-2 text-sm text-blue-600">
            Verificando disponibilidad...
          </div>
          
          <div v-else-if="stockInfo" class="mt-2">
            <div v-if="stockInfo.disponible" class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="font-medium text-blue-700">Disponible:</span>
                <div class="text-blue-900">{{ stockInfo.cantidad_disponible }} {{ stockInfo.unidad_medida }}</div>
              </div>
              <div v-if="stockInfo.lote">
                <span class="font-medium text-blue-700">Lote:</span>
                <div class="text-blue-900">{{ stockInfo.lote }}</div>
              </div>
              <div v-if="stockInfo.fecha_vencimiento">
                <span class="font-medium text-blue-700">Vencimiento:</span>
                <div class="text-blue-900">{{ new Date(stockInfo.fecha_vencimiento).toLocaleDateString('es-ES') }}</div>
              </div>
              <div>
                <span class="font-medium text-blue-700">Estado:</span>
                <div class="text-green-600 font-medium">✓ Disponible</div>
              </div>
            </div>
            <div v-else class="text-red-600 font-medium">
              ⚠️ {{ stockInfo.mensaje || 'Medicamento no disponible en inventario' }}
            </div>
          </div>
          
          <div v-else class="mt-2 text-sm text-gray-600">
            Clave de medicamento no disponible para verificar stock
          </div>
        </div>

        <!-- Formulario para agregar nuevo lote -->
        <div v-if="cantidadPendiente > 0" class="card mb-6">
          <div class="card-header">
            <h3 class="text-lg font-medium text-secondary-900">Agregar Nuevo Lote</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="agregarLote" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Cantidad a Surtir -->
                <div>
                  <label class="form-label">
                    Cantidad a Surtir <span class="text-accent-600">*</span>
                  </label>
                  <input
                    v-model.number="nuevoLote.cantidad_dispensada"
                    type="number"
                    :min="1"
                    :max="cantidadPendiente"
                    class="form-input"
                    :class="{ 'border-accent-500': nuevoLote.cantidad_dispensada > cantidadPendiente }"
                    placeholder="Cantidad"
                    required
                  />
                  <p class="text-xs text-secondary-600 mt-1">
                    Máximo: {{ cantidadPendiente }} {{ medicamento.unidad_medida }}
                  </p>
                  <p v-if="nuevoLote.cantidad_dispensada > cantidadPendiente" class="text-xs text-accent-600 mt-1">
                    Solo quedan {{ cantidadPendiente }} {{ medicamento.unidad_medida }} por dispensar
                  </p>
                </div>

                <!-- Lote -->
                <div>
                  <label class="form-label">
                    Lote <span class="text-accent-600">*</span>
                  </label>
                  <input
                    v-model="nuevoLote.numero_lote"
                    type="text"
                    class="form-input"
                    placeholder="Lote del medicamento"
                    required
                  />
                  <p v-if="errorLoteDuplicado" class="text-xs text-accent-600 mt-1">
                    Este lote ya existe para este medicamento
                  </p>
                </div>

                <!-- Fecha de Caducidad -->
                <div>
                  <label class="form-label">
                    Fecha de Caducidad <span class="text-accent-600">*</span>
                  </label>
                  <input
                    v-model="nuevoLote.fecha_caducidad"
                    type="date"
                    class="form-input"
                    :min="fechaMinima"
                    required
                  />
                </div>

                <!-- Laboratorio -->
                <div>
                  <label class="form-label">Laboratorio</label>
                  <input
                    v-model="nuevoLote.laboratorio"
                    type="text"
                    class="form-input"
                    placeholder="Laboratorio fabricante"
                  />
                </div>
              </div>

              <!-- Observaciones -->
              <div>
                <label class="form-label">Observaciones</label>
                <textarea
                  v-model="nuevoLote.observaciones"
                  class="form-input"
                  rows="3"
                  placeholder="Observaciones específicas para este lote..."
                ></textarea>
              </div>

              <!-- Botón para agregar -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="isSubmitting || cantidadPendiente <= 0 || nuevoLote.cantidad_dispensada > cantidadPendiente"
                  class="btn btn-primary"
                >
                  <span v-if="isSubmitting">Agregando...</span>
                  <span v-else>Agregar Lote</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Mensaje para medicamento completamente dispensado -->
        <div v-else class="card mb-6">
          <div class="card-body">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="text-sm">
                  <p class="text-green-800 font-medium">Medicamento completamente dispensado</p>
                  <p class="text-green-700">Este medicamento ya ha sido dispensado en su totalidad. No se pueden agregar más lotes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de lotes existentes -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-secondary-900">
              Lotes Dispensados ({{ lotesExistentes.length }})
            </h3>
          </div>
          <div class="card-body">
            <div v-if="lotesExistentes.length === 0" class="text-center py-8 text-secondary-500">
              No hay lotes dispensados aún
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="lote in lotesExistentes"
                :key="lote.id"
                class="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="font-medium text-secondary-700">Lote:</span>
                    <div class="text-secondary-900">{{ lote.numero_lote }}</div>
                  </div>
                  
                  <div>
                    <span class="font-medium text-secondary-700">Cantidad:</span>
                    <div class="text-secondary-900">{{ lote.cantidad_dispensada }} {{ medicamento.unidad_medida }}</div>
                  </div>
                  
                  <div>
                    <span class="font-medium text-secondary-700">Caducidad:</span>
                    <div class="text-secondary-900">{{ formatDate(lote.fecha_caducidad) }}</div>
                  </div>
                  
                  <div>
                    <span class="font-medium text-secondary-700">Dispensado:</span>
                    <div class="text-secondary-900">{{ lote.fecha_dispensacion_formatted }}</div>
                    <div class="text-xs text-secondary-600">por {{ lote.dispensado_por_name }}</div>
                  </div>
                </div>
                
                <div v-if="lote.laboratorio" class="mt-2 text-sm">
                  <span class="font-medium text-secondary-700">Laboratorio:</span>
                  <span class="text-secondary-900">{{ lote.laboratorio }}</span>
                </div>
                
                <div v-if="lote.observaciones" class="mt-2 text-sm">
                  <span class="font-medium text-secondary-700">Observaciones:</span>
                  <span class="text-secondary-900">{{ lote.observaciones }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con botón de cerrar -->
      <div class="px-6 py-4 border-t border-gray-200 flex-shrink-0">
        <div class="flex justify-between items-center">
          <div class="text-sm text-secondary-600">
            <span v-if="cantidadPendiente > 0" class="text-orange-600">
              Pendiente por dispensar: {{ cantidadPendiente }} {{ medicamento.unidad_medida }}
            </span>
            <span v-else class="text-green-600">
              ✓ Medicamento completamente dispensado
            </span>
          </div>
          
          <button
            @click="$emit('close')"
            class="btn btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import apiService from '../../services/api'

// Props
const props = defineProps({
  medicamento: {
    type: Object,
    required: true
  },
  recetaId: {
    type: [String, Number],
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'loteAgregado'])

// Estado reactivo
const lotesExistentes = ref([])
const isSubmitting = ref(false)
const errorLoteDuplicado = ref(false)
const stockInfo = ref(null)
const verificandoStock = ref(false)

// Nuevo lote
const nuevoLote = ref({
  cantidad_dispensada: null,
  numero_lote: '',
  fecha_caducidad: '',
  laboratorio: '',
  observaciones: ''
})

// Computed
const porcentajeCompleto = computed(() => {
  if (!props.medicamento.cantidad_prescrita) return 0
  const dispensado = props.medicamento.total_lotes_dispensados || 0
  return (dispensado / props.medicamento.cantidad_prescrita) * 100
})

const cantidadPendiente = computed(() => {
  const dispensado = props.medicamento.total_lotes_dispensados || 0
  return Math.max(0, props.medicamento.cantidad_prescrita - dispensado)
})

const fechaMinima = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Métodos
const cargarLotes = async () => {
  try {
    const response = await apiService.get(`/recetas/${props.recetaId}/detalles/${props.medicamento.id}/lotes/list/`)
    lotesExistentes.value = response.data
  } catch (error) {
    console.error('Error al cargar lotes:', error)
  }
}

const verificarStock = async () => {
  if (!props.medicamento.clave_medicamento) return
  
  verificandoStock.value = true
  try {
    const response = await apiService.get(`/prescriptions/stock/${props.medicamento.clave_medicamento}/`)
    stockInfo.value = response.data
  } catch (error) {
    console.error('Error al verificar stock:', error)
    stockInfo.value = null
  } finally {
    verificandoStock.value = false
  }
}

const agregarLote = async () => {
  if (isSubmitting.value) return
  
  // Verificar cantidad pendiente
  if (nuevoLote.value.cantidad_dispensada > cantidadPendiente.value) {
    alert(`No puedes dispensar más de ${cantidadPendiente.value} ${props.medicamento.unidad_medida}. Solo quedan ${cantidadPendiente.value} por dispensar.`)
    return
  }
  
  // Verificar stock disponible si tenemos información
  if (stockInfo.value && stockInfo.value.disponible) {
    if (nuevoLote.value.cantidad_dispensada > stockInfo.value.cantidad_disponible) {
      alert(`Stock insuficiente. Solo hay ${stockInfo.value.cantidad_disponible} ${stockInfo.value.unidad_medida || props.medicamento.unidad_medida} disponibles en inventario.`)
      return
    }
  }
  
  // Verificar lote duplicado
  if (lotesExistentes.value.some(lote => lote.numero_lote === nuevoLote.value.numero_lote)) {
    errorLoteDuplicado.value = true
    return
  }
  
  errorLoteDuplicado.value = false
  isSubmitting.value = true
  
  try {
    const response = await apiService.post(
      `/recetas/${props.recetaId}/detalles/${props.medicamento.id}/lotes/`,
      nuevoLote.value
    )
    
    // Agregar el nuevo lote a la lista
    lotesExistentes.value.unshift(response.data)
    
    // Actualizar el total de lotes dispensados en el medicamento
    const totalDispensado = lotesExistentes.value.reduce((total, lote) => total + lote.cantidad_dispensada, 0)
    
    // Resetear formulario
    nuevoLote.value = {
      cantidad_dispensada: null,
      numero_lote: '',
      fecha_caducidad: '',
      laboratorio: '',
      observaciones: ''
    }
    
    // Actualizar stock después de dispensar
    await verificarStock()
    
    // Emitir evento para actualizar el componente padre con la información actualizada
    emit('loteAgregado', { 
      ...response.data,
      medicamentoActualizado: {
        ...props.medicamento,
        total_lotes_dispensados: totalDispensado,
        is_completely_dispensed: totalDispensado >= props.medicamento.cantidad_prescrita
      }
    })
    
  } catch (error) {
    console.error('Error al agregar lote:', error)
    if (error.response?.data?.error) {
      alert(error.response.data.error)
    } else {
      alert('Error al agregar el lote. Por favor intenta nuevamente.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('es-ES')
  } catch {
    return dateString
  }
}

// Lifecycle
onMounted(() => {
  cargarLotes()
  verificarStock()
})
</script>

<style scoped>
.modal-scrollable {
  overflow-y: auto;
  flex: 1;
  max-height: calc(90vh - 160px);
}
</style>
