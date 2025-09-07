<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-background-card rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-secondary-900">
            Nueva Receta para {{ patient.nombre }} {{ patient.apellido_paterno }} {{ patient.apellido_materno || '' }}
          </h2>
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

      <!-- Contenido scrolleable -->
      <div class="modal-scrollable p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Paso 1: Información básica de la receta -->
          <div class="card">
            <div class="card-header bg-blue-50">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 class="text-lg font-medium text-secondary-900">
                    Configuración de la Receta
                  </h3>
                  <p class="text-sm text-secondary-600">
                    Defina el tipo, prioridad y servicio que solicita la receta
                  </p>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">
                    Tipo de Receta *
                  </label>
                  <p class="text-xs text-secondary-500 mb-2">Seleccione el departamento que procesará esta receta</p>
                  <select
                    v-model="form.tipo_receta"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.tipo_receta }"
                  >
                    <option value="">Seleccionar departamento</option>
                    <option value="FARMACIA">Farmacia - Medicamentos estándar</option>
                    <option value="CMI">Centro de Mezclas (CMI) - Preparaciones especiales</option>
                  </select>
                  <p v-if="errors.tipo_receta" class="form-error">
                    {{ errors.tipo_receta }}
                  </p>
                </div>

                <div>
                  <label class="form-label">
                    Nivel de Prioridad *
                  </label>
                  <p class="text-xs text-secondary-500 mb-2">Establezca la urgencia para el procesamiento</p>
                  <select
                    v-model="form.prioridad"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.prioridad }"
                  >
                    <option value="">Seleccionar prioridad</option>
                    <option value="BAJA">Baja - Tratamiento de rutina</option>
                    <option value="MEDIA">Media - Tratamiento regular</option>
                    <option value="ALTA">Alta - Tratamiento prioritario</option>
                    <option value="URGENTE">Urgente - Atención inmediata</option>
                  </select>
                  <p v-if="errors.prioridad" class="form-error">
                    {{ errors.prioridad }}
                  </p>
                </div>

                <div>
                  <label class="form-label">
                    Servicio Solicitante *
                  </label>
                  <p class="text-xs text-secondary-500 mb-2">Departamento médico que prescribe la receta</p>
                  <select
                    v-model="form.servicio_solicitante"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.servicio_solicitante }"
                  >
                    <option value="">Seleccionar servicio médico</option>
                    <option value="Urgencias">Urgencias</option>
                    <option value="Medicina Interna">Medicina Interna</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Neurología">Neurología</option>
                    <option value="Oncología">Oncología</option>
                    <option value="Pediatría">Pediatría</option>
                    <option value="Ginecología">Ginecología</option>
                    <option value="Cirugía">Cirugía</option>
                  </select>
                  <p v-if="errors.servicio_solicitante" class="form-error">
                    {{ errors.servicio_solicitante }}
                  </p>
                </div>

                <div>
                  <label class="form-label">
                    Fecha de Vencimiento *
                  </label>
                  <p class="text-xs text-secondary-500 mb-2">Fecha límite para usar la receta</p>
                  <input
                    v-model="form.fecha_vencimiento"
                    type="date"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.fecha_vencimiento }"
                    :min="minDate"
                  />
                  <p v-if="errors.fecha_vencimiento" class="form-error">
                    {{ errors.fecha_vencimiento }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 2: Información médica -->
          <div class="card">
            <div class="card-header bg-green-50">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 class="text-lg font-medium text-secondary-900">
                    Información Médica
                  </h3>
                  <p class="text-sm text-secondary-600">
                    Proporcione el diagnóstico y código CIE-10 si está disponible
                  </p>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label class="form-label">
                    Código CIE-10 *
                  </label>
                  <p class="text-xs text-secondary-500 mb-2">Busque y seleccione el código de diagnóstico</p>
                  <SelectorCIE10
                    v-model="form.cie10"
                    :patient="patient"
                    placeholder="Buscar por código o descripción..."
                    @code-selected="handleCIE10Selected"
                    @fill-patologia="handleFillPatologia"
                  />
                  <p v-if="errors.cie10" class="form-error">
                    {{ errors.cie10 }}
                  </p>
                </div>

                <div>
                  <label class="form-label">
                    Diagnóstico del Paciente *
                  </label>
                  <p class="text-xs text-secondary-500 mb-2">Describa el diagnóstico que justifica esta receta</p>
                  <div v-if="form.cie10 && isDiagnosticoFromCIE10">
                    <textarea
                      v-model="form.diagnostico"
                      class="form-input bg-blue-50 border-blue-200 text-blue-900"
                      :class="{ 'border-accent-500': errors.diagnostico }"
                      rows="3"
                      readonly
                      placeholder="El diagnóstico se completará automáticamente al seleccionar un código CIE-10..."
                    ></textarea>
                    <p class="text-xs text-blue-600 mt-1">Diagnóstico completado automáticamente desde CIE-10</p>
                  </div>
                  <div v-else>
                    <textarea
                      v-model="form.diagnostico"
                      class="form-input"
                      :class="{ 'border-accent-500': errors.diagnostico }"
                      rows="3"
                      placeholder="Escriba el diagnóstico principal del paciente..."
                    ></textarea>
                  </div>
                  <p v-if="errors.diagnostico" class="form-error">
                    {{ errors.diagnostico }}
                  </p>
                </div>

                <div class="md:col-span-2">
                  <label class="form-label">
                    Indicaciones Generales *
                  </label>
                  <p class="text-xs text-secondary-500 mb-2">Instrucciones especiales para el tratamiento</p>
                  <textarea
                    v-model="form.indicaciones_generales"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.indicaciones_generales }"
                    rows="2"
                    placeholder="Instrucciones adicionales para el paciente o personal médico..."
                  ></textarea>
                  <p v-if="errors.indicaciones_generales" class="form-error">
                    {{ errors.indicaciones_generales }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 3: Medicamentos -->
          <div class="card">
            <div class="card-header bg-purple-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-gray-900">
                      Medicamentos Prescritos
                    </h3>
                    <p class="text-sm text-secondary-600">
                      Agregue los medicamentos necesarios para el tratamiento
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="addMedicamento"
                  class="btn-primary text-sm"
                  :disabled="!form.tipo_receta"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Agregar Medicamento
                </button>
              </div>
              <div v-if="!form.tipo_receta" class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p class="text-sm text-amber-800">
                  Para agregar medicamentos, primero debe seleccionar el tipo de receta en el paso 1
                </p>
              </div>
            </div>
            <div class="card-body">
              <div v-if="form.detalles.length === 0" class="text-center py-12 text-gray-500">
                <div v-if="!form.tipo_receta" class="mb-4">
                  <ExclamationTriangleIcon class="h-16 w-16 mx-auto text-amber-400 mb-4" />
                  <h4 class="text-lg font-medium text-gray-700 mb-2">Seleccione el tipo de receta</h4>
                  <p class="text-gray-600">
                    Debe especificar si la receta será procesada por Farmacia o Centro de Mezclas
                  </p>
                </div>
                <div v-else>
                  <PlusIcon class="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h4 class="text-lg font-medium text-gray-700 mb-2">Agregue medicamentos</h4>
                  <p class="text-gray-600 mb-4">
                    No hay medicamentos en esta receta
                  </p>
                  <button
                    type="button"
                    @click="addMedicamento"
                    class="btn-primary inline-flex items-center"
                  >
                    <PlusIcon class="h-4 w-4 mr-2" />
                    Agregar Primer Medicamento
                  </button>
                </div>
              </div>
              
              <div v-else class="space-y-6">
                <div
                  v-for="(medicamento, index) in form.detalles"
                  :key="index"
                  class="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
                >
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-medium text-sm">
                        {{ index + 1 }}
                      </div>
                      <h4 class="font-medium text-gray-900">
                        Medicamento {{ index + 1 }}
                      </h4>
                    </div>
                    <button
                      type="button"
                      @click="removeMedicamento(index)"
                      class="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar medicamento"
                    >
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                  
                  <!-- Selector de medicamento con información completa -->
                  <SelectorMedicamento
                    :tipo-receta="form.tipo_receta || 'FARMACIA'"
                    :model-value="medicamento.selector_data"
                    @update:model-value="updateMedicamento(index, $event)"
                    @medicamento-selected="onMedicamentoSelected(index, $event)"
                  />

                  <!-- Información adicional solo si es necesario -->
                  <div v-if="medicamento.selector_data" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center space-x-2 mb-2">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span class="text-sm font-medium text-blue-800">Información del Medicamento</span>
                    </div>
                    <div class="text-sm text-blue-700 space-y-1">
                      <p><span class="font-medium">Medicamento:</span> {{ medicamento.descripcion_medicamento }}</p>
                      <p><span class="font-medium">Dosis prescrita:</span> {{ medicamento.dosis }}</p>
                      <p><span class="font-medium">Cantidad:</span> {{ medicamento.cantidad_prescrita }} unidades</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paso 4: Observaciones finales -->
          <div class="card">
            <div class="card-header bg-gray-50">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  4
                </div>
                <div>
                  <h3 class="text-lg font-medium text-secondary-900">
                    Observaciones Adicionales
                  </h3>
                  <p class="text-sm text-secondary-600">
                    Agregue notas importantes sobre la receta
                  </p>
                </div>
              </div>
            </div>
            <div class="card-body">
              <label class="form-label">
                Observaciones Generales *
              </label>
              <p class="text-xs text-secondary-500 mb-2">
                Información adicional para el personal de farmacia o notas especiales
              </p>
              <textarea
                v-model="form.observaciones"
                class="form-input"
                :class="{ 'border-accent-500': errors.observaciones }"
                rows="3"
                placeholder="Escriba observaciones adicionales, contraindicaciones especiales, o instrucciones particulares..."
              ></textarea>
              <p v-if="errors.observaciones" class="form-error">
                {{ errors.observaciones }}
              </p>
            </div>
          </div>

          <!-- Resumen y validación -->
          <div class="card border-2 border-blue-200 bg-blue-50">
            <div class="card-body">
              <div class="flex items-center space-x-3 mb-4">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-blue-900">Revisar y Crear Receta</h3>
                  <p class="text-sm text-blue-700">
                    Verifique que toda la información esté correcta antes de crear la receta
                  </p>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                <div class="bg-white p-3 rounded border">
                  <p class="font-medium text-gray-700">Tipo de Receta:</p>
                  <p class="text-gray-600">{{ form.tipo_receta || 'No seleccionado' }}</p>
                </div>
                <div class="bg-white p-3 rounded border">
                  <p class="font-medium text-gray-700">Prioridad:</p>
                  <p class="text-gray-600">{{ form.prioridad || 'No seleccionada' }}</p>
                </div>
                <div class="bg-white p-3 rounded border">
                  <p class="font-medium text-gray-700">Servicio:</p>
                  <p class="text-gray-600">{{ form.servicio_solicitante || 'No seleccionado' }}</p>
                </div>
                <div class="bg-white p-3 rounded border">
                  <p class="font-medium text-gray-700">Medicamentos:</p>
                  <p class="text-gray-600">{{ form.detalles.length }} agregados</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div class="bg-white p-3 rounded border">
                  <p class="font-medium text-gray-700">Fecha de Vencimiento:</p>
                  <p class="text-gray-600">{{ form.fecha_vencimiento || 'No especificada' }}</p>
                </div>
                <div class="bg-white p-3 rounded border">
                  <p class="font-medium text-gray-700">Código CIE-10:</p>
                  <p class="text-gray-600">{{ form.cie10 || 'No seleccionado' }}</p>
                </div>
              </div>

              <div v-if="!form.tipo_receta || !form.prioridad || !form.servicio_solicitante || !form.fecha_vencimiento || !form.cie10 || !form.diagnostico || !form.indicaciones_generales || !form.observaciones || form.detalles.length === 0" class="bg-amber-100 border border-amber-300 rounded p-3 mb-4">
                <p class="text-amber-800 text-sm font-medium mb-2">
                  Campos pendientes por completar:
                </p>
                <ul class="text-amber-700 text-sm list-disc list-inside space-y-1">
                  <li v-if="!form.tipo_receta">Tipo de receta</li>
                  <li v-if="!form.prioridad">Nivel de prioridad</li>
                  <li v-if="!form.servicio_solicitante">Servicio solicitante</li>
                  <li v-if="!form.fecha_vencimiento">Fecha de vencimiento</li>
                  <li v-if="!form.cie10">Código CIE-10</li>
                  <li v-if="!form.diagnostico">Diagnóstico del paciente</li>
                  <li v-if="!form.indicaciones_generales">Indicaciones generales</li>
                  <li v-if="!form.observaciones">Observaciones generales</li>
                  <li v-if="form.detalles.length === 0">Al menos un medicamento</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-between items-center pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Paciente:</span> 
              {{ patient.nombre }} {{ patient.apellido_paterno }} {{ patient.apellido_materno || '' }}
              | <span class="font-medium">Expediente:</span> {{ patient.expediente }}
            </div>
            <div class="flex space-x-3">
              <button
                type="button"
                @click="$emit('close')"
                class="btn-secondary px-6"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || form.detalles.length === 0 || !form.tipo_receta || !form.prioridad || !form.servicio_solicitante || !form.fecha_vencimiento || !form.cie10 || !form.diagnostico || !form.indicaciones_generales || !form.observaciones"
                class="btn-primary px-6"
                :class="{ 'opacity-50 cursor-not-allowed': isSubmitting || form.detalles.length === 0 || !form.tipo_receta || !form.prioridad || !form.servicio_solicitante || !form.fecha_vencimiento || !form.cie10 || !form.diagnostico || !form.indicaciones_generales || !form.observaciones }"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando Receta...
                </span>
                <span v-else class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Crear Receta
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { format, addDays } from 'date-fns'
import api from '@/services/api'
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import SelectorMedicamento from './SelectorMedicamento.vue'
import SelectorCIE10 from './SelectorCIE10.vue'

export default {
  name: 'FormularioReceta',
  components: {
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    SelectorMedicamento,
    SelectorCIE10
  },
  props: {
    patient: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const isSubmitting = ref(false)
    const isDiagnosticoFromCIE10 = ref(false)
    
    const form = reactive({
      paciente: props.patient.expediente,
      tipo_receta: '',
      prioridad: '',
      servicio_solicitante: '',
      cie10: '',
      diagnostico: '',
      indicaciones_generales: '',
      fecha_vencimiento: '',
      observaciones: '',
      detalles: []
    })
    
    const errors = reactive({})
    
    const minDate = computed(() => {
      return format(new Date(), 'yyyy-MM-dd')
    })
    
    const addMedicamento = () => {
      form.detalles.push({
        selector_data: null,
        clave_medicamento: '',
        descripcion_medicamento: '',
        dosis: '',
        cantidad_prescrita: 1
      })
    }
    
    const updateMedicamento = (index, selectorData) => {
      const medicamento = form.detalles[index]
      medicamento.selector_data = selectorData
      
      if (selectorData) {
        // Auto-rellenar campos desde el selector
        medicamento.clave_medicamento = selectorData.medicamento.clave
        medicamento.descripcion_medicamento = selectorData.medicamento.nombre
        medicamento.dosis = selectorData.dosis
        medicamento.cantidad_prescrita = selectorData.cantidad_prescrita
      } else {
        // Limpiar campos si se deselecciona
        medicamento.clave_medicamento = ''
        medicamento.descripcion_medicamento = ''
        medicamento.dosis = ''
        medicamento.cantidad_prescrita = 1
      }
    }
    
    const onMedicamentoSelected = (index, medicamento) => {
      // El updateMedicamento ya maneja la actualización
    }

    const handleCIE10Selected = (code) => {
      if (code) {
        // Auto-completar el diagnóstico con información más detallada
        const diagnosticoTexto = code.descripcion_corta || code.descripcion || 'Diagnóstico no disponible'
        form.diagnostico = diagnosticoTexto
        isDiagnosticoFromCIE10.value = true
      } else {
        // Si se limpia el código, permitir editar diagnóstico
        isDiagnosticoFromCIE10.value = false
        if (isDiagnosticoFromCIE10.value) {
          form.diagnostico = ''
        }
      }
    }

    const handleFillPatologia = (descripcion) => {
      // Llenar automáticamente el diagnóstico y marcarlo como proveniente del CIE-10
      if (descripcion) {
        form.diagnostico = descripcion
        isDiagnosticoFromCIE10.value = true
      }
    }
    
    const removeMedicamento = (index) => {
      form.detalles.splice(index, 1)
    }
    
    const validateForm = () => {
      const newErrors = {}
      
      // Campos requeridos de la receta con mensajes más claros
      const requiredFields = {
        'tipo_receta': 'Debe seleccionar el tipo de receta (Farmacia o CMI)',
        'prioridad': 'Debe establecer la prioridad del tratamiento',
        'servicio_solicitante': 'Debe indicar el servicio médico solicitante',
        'fecha_vencimiento': 'Debe especificar la fecha de vencimiento',
        'cie10': 'Debe seleccionar un código CIE-10',
        'diagnostico': 'Debe proporcionar el diagnóstico del paciente',
        'indicaciones_generales': 'Debe incluir indicaciones generales para el tratamiento',
        'observaciones': 'Debe agregar observaciones sobre la receta'
      }
      
      Object.entries(requiredFields).forEach(([field, message]) => {
        if (!form[field]?.trim()) {
          newErrors[field] = message
        }
      })
      
      // Validar fecha de vencimiento
      if (form.fecha_vencimiento) {
        const fechaVencimiento = new Date(form.fecha_vencimiento)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        if (fechaVencimiento <= hoy) {
          newErrors.fecha_vencimiento = 'La fecha de vencimiento debe ser futura'
        }
      }
      
      // Validar que haya al menos un medicamento
      if (form.detalles.length === 0) {
        newErrors.detalles = 'La receta debe incluir al menos un medicamento'
      }
      
      // Validar cada medicamento con mensajes más específicos
      form.detalles.forEach((medicamento, index) => {
        if (!medicamento.selector_data) {
          newErrors[`medicamento_${index}_selector`] = `Medicamento ${index + 1}: Debe seleccionar un medicamento del catálogo`
        } else {
          if (!medicamento.dosis?.trim()) {
            newErrors[`medicamento_${index}_dosis`] = `Medicamento ${index + 1}: Debe especificar la dosis y frecuencia completa`
          }
          if (!medicamento.cantidad_prescrita || medicamento.cantidad_prescrita < 1) {
            newErrors[`medicamento_${index}_cantidad`] = `Medicamento ${index + 1}: La cantidad debe ser mayor a 0`
          }
        }
      })
      
      // Validar fecha de vencimiento
      if (form.fecha_vencimiento) {
        const fechaVencimiento = new Date(form.fecha_vencimiento)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        
        if (fechaVencimiento <= hoy) {
          newErrors.fecha_vencimiento = 'La fecha de vencimiento debe ser futura'
        }
      }
      
      Object.assign(errors, newErrors)
      return Object.keys(newErrors).length === 0
    }
    
    const handleSubmit = async () => {
      if (!validateForm()) {
        toast.error('Por favor complete todos los campos requeridos antes de continuar')
        return
      }
      
      try {
        isSubmitting.value = true
        
        const response = await api.post('/recetas/', form)
        
        emit('saved', response.data)
        toast.success(`Receta #${response.data.folio_receta} creada exitosamente`)
        
      } catch (error) {
        console.error('Error creating recipe:', error)
        
        if (error.response?.data) {
          const errorData = error.response.data
          
          // Manejar errores de campo específicos
          Object.keys(errorData).forEach(field => {
            if (errors.hasOwnProperty(field)) {
              errors[field] = Array.isArray(errorData[field]) 
                ? errorData[field][0] 
                : errorData[field]
            }
          })
          
          toast.error('Hay errores en los datos proporcionados. Por favor revise el formulario.')
        } else {
          toast.error('No se pudo crear la receta. Por favor intente nuevamente.')
        }
      } finally {
        isSubmitting.value = false
      }
    }
    
    // Watcher para detectar cuando se limpia el código CIE-10
    watch(() => form.cie10, (newValue) => {
      if (!newValue) {
        isDiagnosticoFromCIE10.value = false
      }
    })
    
    return {
      form,
      errors,
      isSubmitting,
      isDiagnosticoFromCIE10,
      minDate,
      addMedicamento,
      removeMedicamento,
      updateMedicamento,
      onMedicamentoSelected,
      handleCIE10Selected,
      handleFillPatologia,
      handleSubmit
    }
  }
}
</script>
