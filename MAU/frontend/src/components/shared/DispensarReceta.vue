<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-background-card rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-secondary-900">
            Dispensar Receta #{{ recipe.folio_receta }} - {{ type }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-secondary-400 hover:text-secondary-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        
        <div class="mt-2 text-sm text-secondary-600">
          <span class="font-medium">Paciente:</span> 
          {{ recipe.paciente_info?.nombre }} {{ recipe.paciente_info?.apellido_paterno }} {{ recipe.paciente_info?.apellido_materno || '' }} |
          <span class="font-medium">Expediente:</span> {{ recipe.paciente_info?.expediente }}
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <div class="modal-scrollable p-6">
        <!-- Información de la receta -->
        <div class="card mb-6">
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p><span class="font-medium">Servicio:</span> {{ recipe.servicio_solicitante }}</p>
                <p><span class="font-medium">Prioridad:</span> 
                  <span class="badge" :class="getPriorityClass(recipe.prioridad)">
                    {{ recipe.prioridad }}
                  </span>
                </p>
              </div>
              <div>
                <p><span class="font-medium">Prescrito por:</span> {{ recipe.prescrito_por_name }}</p>
                <p><span class="font-medium">Validada:</span> {{ formatDate(recipe.fecha_validacion) }}</p>
              </div>
              <div>
                <p v-if="recipe.fecha_vencimiento"><span class="font-medium">Vence:</span> {{ formatDate(recipe.fecha_vencimiento) }}</p>
                <p><span class="font-medium">Total medicamentos:</span> {{ medicamentos.length }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de medicamentos para dispensar -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-secondary-900">
            Medicamentos a Dispensar
          </h3>

          <!-- Mensaje de permisos - TEMPORAL: Comentado para testing -->
          <!-- <div v-if="!tienePermisos && authStore.userRole !== 'ADMIN'" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <div class="text-sm">
                <p class="text-red-800 font-medium">Sin permisos de dispensación</p>
                <p class="text-red-700">No tienes permisos para dispensar medicamentos de {{ type }}. Contacta con tu administrador.</p>
              </div>
            </div>
          </div> -->

          <div v-if="isLoading" class="text-center py-8">
            <div class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando medicamentos...
            </div>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="medicamento in medicamentos"
              :key="medicamento.id"
              class="card"
            >
              <div class="card-body">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1">
                    <h4 class="font-medium text-secondary-900">
                      {{ medicamento.descripcion_medicamento }}
                    </h4>
                    <p class="text-sm text-secondary-600">
                      <span class="font-medium">Clave:</span> {{ medicamento.clave_medicamento }}
                    </p>
                    <p v-if="medicamento.concentracion" class="text-sm text-secondary-600">
                      <span class="font-medium">Concentración:</span> {{ medicamento.concentracion }}
                    </p>
                  </div>
                  
                  <div class="text-right">
                    <p class="text-sm font-medium text-secondary-900">
                      Prescrito: {{ medicamento.cantidad_prescrita }} {{ medicamento.unidad_medida }}
                    </p>
                    <p v-if="medicamento.total_lotes_dispensados > 0" class="text-xs text-orange-600 font-medium">
                      Pendiente: {{ medicamento.cantidad_prescrita - (medicamento.total_lotes_dispensados || 0) }} {{ medicamento.unidad_medida }}
                    </p>
                    <p class="text-xs text-secondary-600">
                      {{ medicamento.dosis }}
                    </p>
                  </div>
                </div>

                <!-- Indicador de progreso -->
                <div class="mb-4">
                  <div class="flex justify-between text-sm text-secondary-600 mb-1">
                    <span>Progreso de dispensación</span>
                    <span>{{ medicamento.total_lotes_dispensados || medicamento.cantidad_surtida || 0 }} / {{ medicamento.cantidad_prescrita }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300"
                      :class="getProgressColor(medicamento)"
                      :style="{ width: getProgressPercentage(medicamento) + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- Formulario de dispensación tradicional -->
                <div v-if="!medicamento.is_completely_dispensed && !medicamento.gestionLotesAbierta" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label class="form-label">
                      Cantidad a Surtir *
                    </label>
                    <input
                      v-model.number="medicamento.cantidad_surtida"
                      type="number"
                      :max="medicamento.cantidad_prescrita - (medicamento.total_lotes_dispensados || 0)"
                      min="0"
                      class="form-input"
                      :class="{ 'border-accent-500': errors[`medicamento_${medicamento.id}_cantidad`] }"
                      @input="validateMedicamento(medicamento)"
                    />
                    <p v-if="errors[`medicamento_${medicamento.id}_cantidad`]" class="form-error">
                      {{ errors[`medicamento_${medicamento.id}_cantidad`] }}
                    </p>
                  </div>

                  <div>
                    <label class="form-label">
                      Lote *
                    </label>
                    <input
                      v-model="medicamento.lote"
                      type="text"
                      class="form-input"
                      :class="{ 'border-accent-500': errors[`medicamento_${medicamento.id}_lote`] }"
                      placeholder="Lote del medicamento"
                      @input="validateMedicamento(medicamento)"
                    />
                    <p v-if="errors[`medicamento_${medicamento.id}_lote`]" class="form-error">
                      {{ errors[`medicamento_${medicamento.id}_lote`] }}
                    </p>
                  </div>

                  <div>
                    <label class="form-label">
                      Fecha de Caducidad *
                    </label>
                    <input
                      v-model="medicamento.fecha_caducidad"
                      type="date"
                      class="form-input"
                      :class="{ 'border-accent-500': errors[`medicamento_${medicamento.id}_caducidad`] }"
                      @input="validateMedicamento(medicamento)"
                    />
                    <p v-if="errors[`medicamento_${medicamento.id}_caducidad`]" class="form-error">
                      {{ errors[`medicamento_${medicamento.id}_caducidad`] }}
                    </p>
                  </div>

                  <div>
                    <label class="form-label">
                      Laboratorio
                    </label>
                    <input
                      v-model="medicamento.laboratorio"
                      type="text"
                      class="form-input"
                      placeholder="Laboratorio fabricante"
                    />
                  </div>
                </div>

                <!-- Gestión de lotes integrada -->
                <div v-if="medicamento.gestionLotesAbierta && !medicamento.is_completely_dispensed" class="pt-4 border-t border-gray-200">
                  <!-- Formulario para agregar nuevo lote -->
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 class="text-sm font-medium text-blue-900 mb-3">Agregar Nuevo Lote</h5>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label class="form-label text-xs">
                          Cantidad a Surtir *
                        </label>
                        <input
                          v-model.number="medicamento.nuevoLote.cantidad_dispensada"
                          type="number"
                          :min="1"
                          :max="medicamento.cantidad_prescrita - (medicamento.total_lotes_dispensados || 0)"
                          class="form-input"
                          placeholder="Cantidad"
                        />
                        <p class="text-xs text-secondary-600 mt-1">
                          Máximo: {{ medicamento.cantidad_prescrita - (medicamento.total_lotes_dispensados || 0) }} {{ medicamento.unidad_medida }}
                        </p>
                      </div>

                      <div>
                        <label class="form-label text-xs">
                          Lote *
                        </label>
                        <input
                          v-model="medicamento.nuevoLote.lote"
                          type="text"
                          class="form-input"
                          placeholder="Lote del medicamento"
                        />
                      </div>

                      <div>
                        <label class="form-label text-xs">
                          Fecha de Caducidad *
                        </label>
                        <input
                          v-model="medicamento.nuevoLote.fecha_caducidad"
                          type="date"
                          :min="fechaMinima"
                          class="form-input"
                        />
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="form-label text-xs">Observaciones</label>
                      <textarea
                        v-model="medicamento.nuevoLote.observaciones"
                        class="form-input"
                        rows="2"
                        placeholder="Observaciones específicas para este lote..."
                      ></textarea>
                    </div>

                    <div class="flex justify-end">
                      <button
                        @click="agregarLote(medicamento)"
                        :disabled="!puedeAgregarLote(medicamento) || isSubmitting"
                        class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="isSubmitting">Agregando...</span>
                        <span v-else>Agregar Lote</span>
                      </button>
                    </div>
                  </div>

                  <!-- Lista de lotes existentes -->
                  <div v-if="medicamento.lotesExistentes && medicamento.lotesExistentes.length > 0" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 class="text-sm font-medium text-gray-900 mb-3">
                      Lotes Dispensados ({{ medicamento.lotesExistentes.length }})
                    </h5>
                    
                    <div class="space-y-2">
                      <div
                        v-for="lote in medicamento.lotesExistentes"
                        :key="lote.id"
                        class="border border-gray-300 rounded-lg p-3 bg-white"
                      >
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <span class="font-medium text-gray-700">Lote:</span>
                            <div class="text-gray-900">{{ lote.numero_lote }}</div>
                          </div>
                          
                          <div>
                            <span class="font-medium text-gray-700">Cantidad:</span>
                            <div class="text-gray-900">{{ lote.cantidad_dispensada }} {{ medicamento.unidad_medida }}</div>
                          </div>
                          
                          <div>
                            <span class="font-medium text-gray-700">Caducidad:</span>
                            <div class="text-gray-900">{{ formatDate(lote.fecha_caducidad) }}</div>
                          </div>
                          
                          <div>
                            <span class="font-medium text-gray-700">Dispensado:</span>
                            <div class="text-gray-900">{{ lote.fecha_dispensacion_formatted }}</div>
                          </div>
                        </div>
                        
                        <div v-if="lote.laboratorio" class="mt-1 text-xs">
                          <span class="font-medium text-gray-700">Laboratorio:</span>
                          <span class="text-gray-900">{{ lote.laboratorio }}</span>
                        </div>
                        
                        <div v-if="lote.observaciones" class="mt-1 text-xs">
                          <span class="font-medium text-gray-700">Observaciones:</span>
                          <span class="text-gray-900">{{ lote.observaciones }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Mensaje para medicamentos completamente dispensados -->
                <div v-else-if="medicamento.is_completely_dispensed" class="pt-4 border-t border-gray-200">
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div class="text-sm">
                        <p class="text-green-800 font-medium">Medicamento completamente dispensado</p>
                        <p class="text-green-700">Este medicamento ya ha sido dispensado en su totalidad y no se puede modificar.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Observaciones específicas del medicamento -->
                <div v-if="!medicamento.is_completely_dispensed && !medicamento.gestionLotesAbierta" class="mt-4">
                  <label class="form-label">
                    Observaciones
                  </label>
                  <textarea
                    v-model="medicamento.observaciones"
                    class="form-input"
                    rows="2"
                    placeholder="Observaciones específicas para este medicamento..."
                  ></textarea>
                </div>

                <!-- Botones de gestión -->
                <div class="mt-4 flex justify-between items-center">
                  <div class="flex space-x-2">
                    <button
                      @click="toggleGestionLotes(medicamento)"
                      type="button"
                      :disabled="medicamento.is_completely_dispensed"
                      :class="[
                        'text-sm',
                        medicamento.is_completely_dispensed 
                          ? 'btn btn-disabled cursor-not-allowed opacity-50' 
                          : medicamento.gestionLotesAbierta 
                            ? 'btn btn-secondary'
                            : 'btn btn-outline'
                      ]"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      {{ medicamento.gestionLotesAbierta ? 'Cerrar Gestión de Lotes' : 'Gestionar Múltiples Lotes' }}
                    </button>
                  </div>

                  <div v-if="medicamento.gestionLotesAbierta" class="text-xs text-secondary-600">
                    <span v-if="(medicamento.cantidad_prescrita - (medicamento.total_lotes_dispensados || 0)) > 0" class="text-orange-600">
                      Pendiente: {{ medicamento.cantidad_prescrita - (medicamento.total_lotes_dispensados || 0) }} {{ medicamento.unidad_medida }}
                    </span>
                    <span v-else class="text-green-600">
                      ✓ Completamente dispensado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Observaciones generales -->
        <div class="card mt-6">
          <div class="card-body">
            <label class="form-label">
              Observaciones Generales de Dispensación
            </label>
            <textarea
              v-model="observacionesGenerales"
              class="form-input"
              rows="3"
              placeholder="Observaciones generales sobre la dispensación de esta receta..."
            ></textarea>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancelar
          </button>
          
          <button
            @click="dispensarParcial"
            :disabled="!canDispenseParcial || isSubmitting"
            :class="[
              'btn-primary',
              (!canDispenseParcial) ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            Dispensar Parcial
          </button>
          
          <button
            @click="dispensarCompleta"
            :disabled="!canDispenseComplete || isSubmitting"
            :class="[
              'btn-success',
              (!canDispenseComplete) ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <span v-if="isSubmitting">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Dispensando...
            </span>
            <span v-else>
              Dispensar Completa
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de gestión de lotes -->
    <GestionLotesMedicamento
      v-if="mostrarGestionLotes"
      :medicamento="medicamentoSeleccionado"
      :receta-id="recipe.folio_receta"
      @close="cerrarGestionLotes"
      @lote-agregado="onLoteAgregado"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import {
  XMarkIcon
} from '@heroicons/vue/24/outline'
import GestionLotesMedicamento from './GestionLotesMedicamento.vue'

export default {
  name: 'DispensarReceta',
  components: {
    XMarkIcon,
    GestionLotesMedicamento
  },
  props: {
    recipe: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: value => ['FARMACIA', 'CMI'].includes(value)
    }
  },
  emits: ['close', 'dispensed', 'recetaActualizada'],
  setup(props, { emit }) {
    const toast = useToast()
    const authStore = useAuthStore()
    
    const medicamentos = ref([])
    const isLoading = ref(false)
    const isSubmitting = ref(false)
    const observacionesGenerales = ref('')
    const errors = reactive({})
    
    // Estado para gestión de lotes
    const mostrarGestionLotes = ref(false)
    const medicamentoSeleccionado = ref(null)
    
    // Verificar permisos según el tipo de receta
    const tienePermisos = computed(() => {
      console.log('[DispensarReceta] Debug permisos:', {
        userRole: authStore.userRole,
        effectiveRole: authStore.effectiveRole,
        isSimulating: authStore.isSimulating,
        type: props.type,
        hasDispensePharmacy: authStore.hasPermission('dispense_pharmacy'),
        hasDispenseCMI: authStore.hasPermission('dispense_cmi')
      })
      
      // TEMPORAL: Siempre permitir para admins, sin importar simulación
      if (authStore.userRole === 'ADMIN') {
        console.log('[DispensarReceta] Admin detectado, permisos otorgados')
        return true
      }
      
      // TEMPORAL: También permitir si el effective role es ADMIN
      if (authStore.effectiveRole === 'ADMIN') {
        console.log('[DispensarReceta] Effective role ADMIN, permisos otorgados')
        return true
      }
      
      // Para otros roles, verificar permisos específicos
      if (props.type === 'FARMACIA') {
        return authStore.hasPermission('dispense_pharmacy')
      } else if (props.type === 'CMI') {
        return authStore.hasPermission('dispense_cmi')
      }
      return false
    })
    
    // Función para limpiar estado
    const clearState = () => {
      medicamentos.value = []
      observacionesGenerales.value = ''
      Object.keys(errors).forEach(key => delete errors[key])
      mostrarGestionLotes.value = false
      medicamentoSeleccionado.value = null
      isLoading.value = false
      isSubmitting.value = false
    }
    
    const canDispenseParcial = computed(() => {
      // TEMPORAL: Siempre permitir para testing
      // if (!tienePermisos.value || medicamentos.value.length === 0) return false
      if (medicamentos.value.length === 0) return false
      
      return medicamentos.value.some(m => {
        // Solo considerar medicamentos que no estén completamente dispensados
        if (m.is_completely_dispensed) return false
        
        const cantidadDispensada = m.total_lotes_dispensados || 0
        const cantidadPendiente = m.cantidad_prescrita - cantidadDispensada
        
        // Si está usando gestión de lotes múltiples, verificar si hay lotes agregados
        if (m.gestionLotesAbierta && m.lotesExistentes && m.lotesExistentes.length > 0) {
          return true
        }
        
        // Para dispensación tradicional, verificar campos básicos
        const tieneErrores = errors[`medicamento_${m.id}_cantidad`] ||
                            errors[`medicamento_${m.id}_lote`] ||
                            errors[`medicamento_${m.id}_caducidad`]
        
        return m.cantidad_surtida > 0 && 
               m.cantidad_surtida <= cantidadPendiente &&
               m.lote && 
               m.fecha_caducidad &&
               !tieneErrores
      })
    })
    
    const canDispenseComplete = computed(() => {
      // TEMPORAL: Siempre permitir para testing
      // if (!tienePermisos.value || medicamentos.value.length === 0) return false
      if (medicamentos.value.length === 0) return false
      
      return medicamentos.value.every(m => {
        // Verificar si el medicamento está completamente dispensado
        const cantidadDispensada = m.total_lotes_dispensados || m.cantidad_surtida || 0
        const estaCompleto = cantidadDispensada >= m.cantidad_prescrita
        
        // Si ya está completamente dispensado, está OK
        if (estaCompleto) return true
        
        // Si usa lotes múltiples (total_lotes_dispensados > 0), debe estar completo
        const usaLotesMultiples = m.total_lotes_dispensados > 0
        
        if (usaLotesMultiples) {
          // Para lotes múltiples, solo verificar que esté completamente dispensado
          return estaCompleto
        } else {
          // Para dispensación tradicional, verificar todos los campos
          const tieneErrores = errors[`medicamento_${m.id}_cantidad`] ||
                              errors[`medicamento_${m.id}_lote`] ||
                              errors[`medicamento_${m.id}_caducidad`]
          
          return estaCompleto && 
                 m.lote && 
                 m.fecha_caducidad &&
                 !tieneErrores
        }
      })
    })
    
    const loadMedicamentos = async () => {
      try {
        isLoading.value = true
        
        // Limpiar estado antes de cargar nuevos datos
        clearState()
        isLoading.value = true // Reestablecer después del clear
        
        console.log(`[DispensarReceta] Cargando medicamentos para receta #${props.recipe.folio_receta}`)
        
        const response = await api.get(`/recetas/${props.recipe.folio_receta}/`)
        const recetaCompleta = response.data
        
        console.log(`[DispensarReceta] Receta cargada:`, {
          folio: recetaCompleta.folio_receta,
          detalles: recetaCompleta.detalles?.length || 0,
          detallesIds: recetaCompleta.detalles?.map(d => d.id) || []
        })
        
        // Validar que los datos pertenecen a la receta correcta
        if (recetaCompleta.folio_receta !== props.recipe.folio_receta) {
          throw new Error(`Discrepancia de datos: esperaba receta #${props.recipe.folio_receta}, recibió #${recetaCompleta.folio_receta}`)
        }
        
        // Inicializar medicamentos con valores por defecto para dispensación
        medicamentos.value = recetaCompleta.detalles.map(detalle => ({
          ...detalle,
          cantidad_surtida: detalle.cantidad_surtida || 0,
          lote: detalle.lote || '',
          fecha_caducidad: detalle.fecha_caducidad || '',
          observaciones: detalle.observaciones_dispensacion || '',
          // Nuevos campos para gestión de lotes integrada
          gestionLotesAbierta: false,
          lotesExistentes: [],
          nuevoLote: {
            cantidad_dispensada: null,
            lote: '',
            fecha_caducidad: '',
            observaciones: ''
          }
        }))
        
        console.log(`[DispensarReceta] Medicamentos inicializados:`, medicamentos.value.length)
        
      } catch (error) {
        console.error('[DispensarReceta] Error loading medicamentos:', error)
        toast.error(`Error al cargar los medicamentos: ${error.message || 'Error desconocido'}`)
        clearState()
      } finally {
        isLoading.value = false
      }
    }
    
    const validateMedicamento = (medicamento) => {
      if (!medicamento || !medicamento.id) {
        console.warn('[DispensarReceta] Intento de validar medicamento inválido:', medicamento)
        return
      }
      
      const baseKey = `medicamento_${medicamento.id}`
      
      // Limpiar errores previos
      delete errors[`${baseKey}_cantidad`]
      delete errors[`${baseKey}_lote`]
      delete errors[`${baseKey}_caducidad`]
      
      // Si el medicamento está completamente dispensado, no validar
      if (medicamento.is_completely_dispensed) {
        return
      }
      
      // Calcular cantidad pendiente considerando lotes ya dispensados
      const cantidadYaDispensada = medicamento.total_lotes_dispensados || 0
      const cantidadPendiente = medicamento.cantidad_prescrita - cantidadYaDispensada
      
      // Validar cantidad solo si hay cantidad a surtir
      if (medicamento.cantidad_surtida > 0) {
        if (medicamento.cantidad_surtida < 0) {
          errors[`${baseKey}_cantidad`] = 'La cantidad no puede ser negativa'
        } else if (medicamento.cantidad_surtida > cantidadPendiente) {
          errors[`${baseKey}_cantidad`] = `Solo quedan ${cantidadPendiente} ${medicamento.unidad_medida || 'unidades'} por dispensar`
        } else if (medicamento.cantidad_surtida > medicamento.cantidad_prescrita) {
          errors[`${baseKey}_cantidad`] = 'No puede exceder la cantidad prescrita'
        }
        
        // Validar lote si hay cantidad a surtir
        if (!medicamento.lote || !medicamento.lote.trim()) {
          errors[`${baseKey}_lote`] = 'El lote es requerido'
        }
        
        // Validar fecha de caducidad
        if (!medicamento.fecha_caducidad) {
          errors[`${baseKey}_caducidad`] = 'La fecha de caducidad es requerida'
        } else {
          const fechaCaducidad = new Date(medicamento.fecha_caducidad)
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          
          if (fechaCaducidad <= hoy) {
            errors[`${baseKey}_caducidad`] = 'El medicamento no puede estar caducado'
          }
        }
      }
    }
    
    const validateAllMedicamentos = () => {
      // Limpiar errores previos
      Object.keys(errors).forEach(key => {
        if (key.startsWith('medicamento_')) {
          delete errors[key]
        }
      })
      
      // Validar cada medicamento
      medicamentos.value.forEach(medicamento => {
        if (medicamento && medicamento.id) {
          validateMedicamento(medicamento)
        }
      })
      
      // Verificar si hay errores
      const hasErrors = Object.keys(errors).some(key => key.startsWith('medicamento_'))
      return !hasErrors
    }
    
    const dispensarParcial = async () => {
      // TEMPORAL: Comentar validación de permisos
      // if (!tienePermisos.value) {
      //   toast.error(`No tienes permisos para dispensar medicamentos de ${props.type}`)
      //   return
      // }
      
      if (!validateAllMedicamentos()) {
        toast.error('Por favor corrige los errores en el formulario')
        return
      }
      
      await procesarDispensacion(false)
    }
    
    const dispensarCompleta = async () => {
      // TEMPORAL: Comentar validación de permisos
      // if (!tienePermisos.value) {
      //   toast.error(`No tienes permisos para dispensar medicamentos de ${props.type}`)
      //   return
      // }
      
      if (!validateAllMedicamentos()) {
        toast.error('Por favor corrige los errores en el formulario')
        return
      }
      
      await procesarDispensacion(true)
    }
    
    const procesarDispensacion = async (esCompleta) => {
      try {
        isSubmitting.value = true
        
        // Actualizar cada medicamento
        const medicamentosADispenser = medicamentos.value.filter(m => m.cantidad_surtida > 0)
        
        console.log(`[DispensarReceta] Dispensando ${medicamentosADispenser.length} medicamentos:`, 
          medicamentosADispenser.map(m => ({ id: m.id, descripcion: m.descripcion_medicamento })))
        
        const promises = medicamentosADispenser.map(async (medicamento) => {
          console.log(`[DispensarReceta] Actualizando medicamento ID ${medicamento.id}`)
          
          try {
            const response = await api.patch(`/recetas/detalles/${medicamento.id}/`, {
              cantidad_surtida: medicamento.cantidad_surtida,
              lote: medicamento.lote,
              fecha_caducidad: medicamento.fecha_caducidad,
              observaciones_dispensacion: medicamento.observaciones || ''
            })
            console.log(`[DispensarReceta] Medicamento ID ${medicamento.id} actualizado exitosamente`)
            return response
          } catch (error) {
            console.error(`[DispensarReceta] Error actualizando medicamento ID ${medicamento.id}:`, error)
            throw error
          }
        })
        
        await Promise.all(promises)
        
        // El backend automáticamente actualiza el estado de la receta
        // cuando todos los medicamentos están completamente dispensados
        
        const message = esCompleta ? 'Receta dispensada completamente' : 'Dispensación parcial registrada'
        toast.success(message)
        
        emit('dispensed', {
          ...props.recipe,
          estado: esCompleta ? 'SURTIDA' : 'VALIDADA'
        })
        
      } catch (error) {
        console.error('Error dispensing recipe:', error)
        toast.error('Error al procesar la dispensación')
      } finally {
        isSubmitting.value = false
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
    
    const getProgressPercentage = (medicamento) => {
      if (!medicamento.cantidad_prescrita) return 0
      
      // Usar total de lotes dispensados si existen, sino usar cantidad_surtida tradicional
      const cantidadRealDispensada = medicamento.total_lotes_dispensados || medicamento.cantidad_surtida || 0
      
      return Math.min(100, (cantidadRealDispensada / medicamento.cantidad_prescrita) * 100)
    }
    
    const getProgressColor = (medicamento) => {
      const percentage = getProgressPercentage(medicamento)
      if (percentage === 100) return 'bg-success'
      if (percentage > 50) return 'bg-blue-500'
      if (percentage > 0) return 'bg-warning'
      return 'bg-gray-300'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    }
    
    // Funciones para gestión de lotes integrada
    const fechaMinima = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })
    
    const toggleGestionLotes = async (medicamento) => {
      medicamento.gestionLotesAbierta = !medicamento.gestionLotesAbierta
      
      if (medicamento.gestionLotesAbierta && medicamento.lotesExistentes.length === 0) {
        await cargarLotesMedicamento(medicamento)
      }
    }
    
    const cargarLotesMedicamento = async (medicamento) => {
      try {
        console.log(`[DispensarReceta] Cargando lotes para medicamento ID ${medicamento.id}`)
        const response = await api.get(`/recetas/${props.recipe.folio_receta}/detalles/${medicamento.id}/lotes/list/`)
        medicamento.lotesExistentes = response.data
        console.log(`[DispensarReceta] Lotes cargados:`, response.data.length)
      } catch (error) {
        console.error('Error al cargar lotes:', error)
        toast.error('Error al cargar los lotes del medicamento')
      }
    }
    
    const puedeAgregarLote = (medicamento) => {
      const nuevoLote = medicamento.nuevoLote
      const cantidadPendiente = medicamento.cantidad_prescrita - (medicamento.total_lotes_dispensados || 0)
      
      return nuevoLote.cantidad_dispensada > 0 &&
             nuevoLote.lote.trim() &&
             nuevoLote.fecha_caducidad &&
             nuevoLote.cantidad_dispensada <= cantidadPendiente
    }
    
    const agregarLote = async (medicamento) => {
      // TEMPORAL: Comentar validación de permisos
      // if (!tienePermisos.value) {
      //   toast.error(`No tienes permisos para dispensar medicamentos de ${props.type}`)
      //   return
      // }
      
      if (!puedeAgregarLote(medicamento)) {
        toast.error('Por favor completa todos los campos requeridos')
        return
      }
      
      // Verificar lote duplicado
      if (medicamento.lotesExistentes.some(lote => lote.lote === medicamento.nuevoLote.lote)) {
        toast.error('Este lote ya existe para este medicamento')
        return
      }
      
      try {
        isSubmitting.value = true
        
        const response = await api.post(
          `/recetas/${props.recipe.folio_receta}/detalles/${medicamento.id}/lotes/`,
          medicamento.nuevoLote
        )
        
        // Agregar el nuevo lote a la lista
        medicamento.lotesExistentes.unshift(response.data)
        
        // Actualizar el total de lotes dispensados en el medicamento
        const totalDispensado = medicamento.lotesExistentes.reduce((total, lote) => total + lote.cantidad_dispensada, 0)
        medicamento.total_lotes_dispensados = totalDispensado
        medicamento.is_completely_dispensed = totalDispensado >= medicamento.cantidad_prescrita
        
        // Resetear formulario
        medicamento.nuevoLote = {
          cantidad_dispensada: null,
          lote: '',
          fecha_caducidad: '',
          observaciones: ''
        }
        
        toast.success('Lote agregado correctamente')
        
        // Emitir evento para actualizar el componente padre
        emit('recetaActualizada')
        
      } catch (error) {
        console.error('Error al agregar lote:', error)
        if (error.response?.data?.error) {
          toast.error(error.response.data.error)
        } else {
          toast.error('Error al agregar el lote. Por favor intenta nuevamente.')
        }
      } finally {
        isSubmitting.value = false
      }
    }
    
    // Funciones para gestión de lotes (modal antiguo - mantener por compatibilidad)
    const abrirGestionLotes = (medicamento) => {
      medicamentoSeleccionado.value = medicamento
      mostrarGestionLotes.value = true
    }
    
    const cerrarGestionLotes = () => {
      mostrarGestionLotes.value = false
      medicamentoSeleccionado.value = null
    }
    
    const onLoteAgregado = async (datosLote) => {
      try {
        // Si tenemos los datos actualizados del medicamento, actualizarlos inmediatamente
        if (datosLote.medicamentoActualizado) {
          const medicamentoIndex = medicamentos.value.findIndex(m => m.id === datosLote.medicamentoActualizado.id)
          if (medicamentoIndex !== -1) {
            // Actualizar el medicamento específico en la lista
            medicamentos.value[medicamentoIndex] = {
              ...medicamentos.value[medicamentoIndex],
              ...datosLote.medicamentoActualizado
            }
          }
        }
        
        // Recargar los medicamentos para obtener los datos más recientes del servidor
        await loadMedicamentos()
        
        // También emitir evento al componente padre para que actualice la receta
        emit('recetaActualizada')
        
        toast.success('Lote agregado correctamente')
      } catch (error) {
        console.error('Error al procesar lote agregado:', error)
        // Intentar recargar de todos modos
        await loadMedicamentos()
        toast.success('Lote agregado correctamente')
      }
    }
    
    // Watcher para detectar cambios en la receta
    watch(
      () => props.recipe?.folio_receta,
      async (newFolio, oldFolio) => {
        if (newFolio && newFolio !== oldFolio) {
          console.log(`[DispensarReceta] Cambio de receta detectado: ${oldFolio} → ${newFolio}`)
          await nextTick()
          await loadMedicamentos()
        }
      },
      { immediate: false }
    )
    
    onMounted(() => {
      console.log(`[DispensarReceta] Componente montado para receta #${props.recipe?.folio_receta}`)
      loadMedicamentos()
    })
    
    return {
      medicamentos,
      isLoading,
      isSubmitting,
      observacionesGenerales,
      errors,
      tienePermisos,
      canDispenseParcial,
      canDispenseComplete,
      validateMedicamento,
      dispensarParcial,
      dispensarCompleta,
      getPriorityClass,
      getProgressPercentage,
      getProgressColor,
      formatDate,
      // Gestión de lotes integrada
      fechaMinima,
      toggleGestionLotes,
      cargarLotesMedicamento,
      puedeAgregarLote,
      agregarLote,
      // Gestión de lotes modal (compatibilidad)
      mostrarGestionLotes,
      medicamentoSeleccionado,
      abrirGestionLotes,
      cerrarGestionLotes,
      onLoteAgregado
    }
  }
}
</script>
