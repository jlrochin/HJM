<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
    <div class="bg-background-card rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div data-tour="patient-form-header" class="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? 'Editar Paciente' : 'Nuevo Paciente' }}
          </h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <div class="modal-scrollable p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Información Básica -->
          <div class="card">
            <div class="card-header">
                          <h3 class="text-lg font-medium text-gray-900">
              Información Básica
            </h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div data-tour="patient-expediente">
                  <label class="form-label">
                    Número de Expediente *
                  </label>
                  <input
                    v-model="form.expediente"
                    type="text"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.expediente }"
                    placeholder="Ej: EXP-2024-001"
                    :disabled="isEditing"
                    @blur="checkDuplicates"
                  />
                  <p v-if="errors.expediente" class="form-error">
                    {{ errors.expediente }}
                  </p>
                </div>

                <div data-tour="patient-curp">
                  <label class="form-label">
                    CURP *
                  </label>
                  <input
                    v-model="form.curp"
                    type="text"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.curp }"
                    placeholder="Ej: ABCD123456HMCLEF01"
                    maxlength="18"
                    @input="formatCURP"
                    @blur="checkDuplicates"
                  />
                  <p v-if="errors.curp" class="form-error">
                    {{ errors.curp }}
                  </p>
                </div>

                <div data-tour="patient-nombres">
                  <label class="form-label">
                    Nombre(s) *
                  </label>
                  <input
                    v-model="form.nombre"
                    type="text"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.nombre }"
                    placeholder="Nombre(s) del paciente"
                  />
                  <p v-if="errors.nombre" class="form-error">
                    {{ errors.nombre }}
                  </p>
                </div>

                <div data-tour="patient-apellido-paterno">
                  <label class="form-label">
                    Apellido Paterno *
                  </label>
                  <input
                    v-model="form.apellido_paterno"
                    type="text"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.apellido_paterno }"
                    placeholder="Apellido paterno"
                  />
                  <p v-if="errors.apellido_paterno" class="form-error">
                    {{ errors.apellido_paterno }}
                  </p>
                </div>

                <div data-tour="patient-apellido-materno">
                  <label class="form-label">
                    Apellido Materno
                  </label>
                  <input
                    v-model="form.apellido_materno"
                    type="text"
                    class="form-input"
                    placeholder="Apellido materno"
                  />
                </div>

                <div data-tour="patient-basic-info">
                  <label class="form-label">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    v-model="form.fecha_nacimiento"
                    type="date"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.fecha_nacimiento }"
                  />
                  <p v-if="errors.fecha_nacimiento" class="form-error">
                    {{ errors.fecha_nacimiento }}
                  </p>
                </div>

                <div data-tour="patient-basic-info">
                  <label class="form-label">
                    Género *
                  </label>
                  <select
                    v-model="form.genero"
                    class="form-input"
                    :class="{ 'border-accent-500': errors.genero }"
                  >
                    <option value="">Seleccionar género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                  <p v-if="errors.genero" class="form-error">
                    {{ errors.genero }}
                  </p>
                </div>

                <div data-tour="patient-additional-info">
                  <label class="form-label">
                    Tipo de Sangre
                  </label>
                  <select v-model="form.tipo_sangre" class="form-input">
                    <option value="ND">No Determinado</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Códigos CIE-10 -->
          <div data-tour="patient-cie10-section" class="card">
            <div class="card-header">
              <h3 class="text-lg font-medium text-gray-900">
                Códigos CIE-10
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                Gestiona los códigos de diagnóstico del paciente
              </p>
            </div>
            <div class="card-body space-y-6">
              
              <!-- Formulario para agregar nuevo código -->
              <div data-tour="patient-medical-section" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h4 class="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Código CIE-10</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Código CIE-10 -->
                  <div data-tour="patient-cie10-search">
                    <label class="form-label">
                      Código CIE-10 <span class="text-accent-600">*</span>
                    </label>
                    <SelectorCIE10
                      v-model="nuevoCodigo.cie10"
                      placeholder="Buscar código CIE-10..."
                      @code-selected="handleNuevoCodigoSelected"
                      @fill-patologia="handleFillPatologia"
                    />
                  </div>

                  <!-- Fecha de Diagnóstico -->
                  <div data-tour="patient-cie10-date">
                    <label class="form-label">
                      Fecha de Diagnóstico <span class="text-accent-600">*</span>
                    </label>
                    <input
                      v-model="nuevoCodigo.fecha_diagnostico"
                      type="date"
                      class="form-input"
                      :max="fechaMaxima"
                      required
                    />
                  </div>
                </div>
                
                <!-- Segunda fila -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <!-- Es Principal -->
                  <div data-tour="patient-cie10-principal" class="flex items-center space-x-3">
                    <input
                      v-model="nuevoCodigo.es_principal"
                      type="checkbox"
                      id="nuevo_principal"
                      class="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label for="nuevo_principal" class="text-sm font-medium text-gray-700">
                      Marcar como diagnóstico principal
                    </label>
                  </div>
                  
                  <!-- Observaciones -->
                  <div>
                    <label class="form-label">
                      Observaciones
                    </label>
                    <input
                      v-model="nuevoCodigo.observaciones"
                      type="text"
                      class="form-input"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>
                
                <!-- Tercera fila -->
                <div class="grid grid-cols-1 gap-6 mt-6">
                  <!-- Observaciones -->
                  <div>
                    <label class="form-label">
                      Observaciones
                    </label>
                    <input
                      v-model="nuevoCodigo.observaciones"
                      type="text"
                      class="form-input"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>

                <!-- Botón de agregar -->
                <div class="flex justify-end mt-6">
                  <button
                    data-tour="patient-cie10-add-btn"
                    @click="agregarCodigoCIE10"
                    type="button"
                    class="btn-primary px-6 py-2.5 text-sm font-medium"
                    :disabled="!nuevoCodigo.cie10 || !nuevoCodigo.fecha_diagnostico"
                  >
                    Agregar Código
                  </button>
                </div>
              </div>

              <!-- Lista de códigos existentes -->
              <div v-if="form.cie10_codes && form.cie10_codes.length > 0" class="space-y-4">
                <h4 class="text-lg font-medium text-gray-900">Códigos Asignados</h4>
                
                <!-- Código Principal -->
                <div v-if="form.cie10_codes.find(c => c.es_principal)" 
                     class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-3 mb-3">
                        <span class="text-2xl font-bold text-green-700">
                          {{ form.cie10_codes.find(c => c.es_principal)?.cie10 }}
                        </span>
                        <span class="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-full">
                          PRINCIPAL
                        </span>
                      </div>
                      <div class="space-y-2 text-sm text-green-800">
                        <div class="flex items-center space-x-4">
                          <span class="flex items-center space-x-2">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{{ formatDate(form.cie10_codes.find(c => c.es_principal)?.fecha_diagnostico) }}</span>
                          </span>
                        </div>
                        <div class="text-green-900 font-medium">
                          {{ form.cie10_codes.find(c => c.es_principal)?.cie10_info?.descripcion_corta || form.patologia }}
                        </div>
                        <div v-if="form.cie10_codes.find(c => c.es_principal)?.observaciones" class="text-green-700">
                          {{ form.cie10_codes.find(c => c.es_principal)?.observaciones }}
                        </div>
                      </div>
                    </div>
                    <button
                      @click="eliminarCodigoCIE10(form.cie10_codes.findIndex(c => c.es_principal))"
                      type="button"
                      class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar código principal"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Códigos Adicionales -->
                <div v-if="form.cie10_codes.filter(c => !c.es_principal).length > 0" class="space-y-3">
                  <h5 class="text-md font-medium text-gray-700 text-center py-2 border-t border-gray-200">
                    Códigos CIE-10 Adicionales
                  </h5>
                  <div v-for="(codigo, index) in form.cie10_codes.filter(c => !c.es_principal)" :key="index" 
                       class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-3">
                          <span class="text-2xl font-bold text-blue-700">{{ codigo.cie10 }}</span>
                          <span class="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                            ADICIONAL
                          </span>
                        </div>
                        <div class="space-y-2 text-sm text-blue-800">
                          <div class="flex items-center space-x-4">
                            <span class="flex items-center space-x-2">
                              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{{ formatDate(codigo.fecha_diagnostico) }}</span>
                            </span>
                          </div>
                          <div class="text-blue-900 font-medium">
                            {{ codigo.cie10_info?.descripcion_corta || codigo.cie10_info?.descripcion || 'Descripción no disponible' }}
                          </div>
                          <div v-if="codigo.observaciones" class="text-blue-700">
                            {{ codigo.observaciones }}
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button
                          @click="togglePrincipal(form.cie10_codes.indexOf(codigo))"
                          type="button"
                          class="text-xs px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                        >
                          Hacer Principal
                        </button>
                        <button
                          @click="eliminarCodigoCIE10(form.cie10_codes.indexOf(codigo))"
                          type="button"
                          class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Mensaje cuando no hay códigos -->
              <div v-else class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">No hay códigos CIE-10</h3>
                <p class="mt-2 text-sm text-gray-500">Agrega el primer código usando el formulario de arriba</p>
                <div class="mt-4 inline-flex items-center px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <svg class="h-4 w-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-xs text-yellow-700 font-medium">
                    El primer código será marcado como diagnóstico principal
                  </span>
                </div>
              </div>



              <!-- Mensaje de error para códigos CIE-10 -->
              <div v-if="errors.cie10_codes" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600 flex items-center">
                  <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ errors.cie10_codes }}
                </p>
              </div>


            </div>
          </div>

          <!-- Alergias Conocidas -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-medium text-gray-900">
                Alergias Conocidas
              </h3>
            </div>
            <div class="card-body">
              <textarea
                v-model="form.alergias"
                class="form-input"
                rows="3"
                placeholder="Describir alergias conocidas del paciente..."
              ></textarea>
            </div>
          </div>



          <!-- Información de Contacto -->
          <div data-tour="patient-contact-info" class="card">
            <div class="card-header">
                          <h3 class="text-lg font-medium text-gray-900">
              Información de Contacto
            </h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">
                    Teléfono
                  </label>
                  <input
                    v-model="form.telefono"
                    type="tel"
                    class="form-input"
                    placeholder="Ej: 5551234567"
                  />
                </div>

                <div>
                  <label class="form-label">
                    Contacto de Emergencia
                  </label>
                  <input
                    v-model="form.contacto_emergencia_nombre"
                    type="text"
                    class="form-input"
                    placeholder="Nombre del contacto de emergencia"
                  />
                </div>

                <div>
                  <label class="form-label">
                    Teléfono de Emergencia
                  </label>
                  <input
                    v-model="form.contacto_emergencia_telefono"
                    type="tel"
                    class="form-input"
                    placeholder="Teléfono del contacto de emergencia"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="form-label">
                    Dirección
                  </label>
                  <textarea
                    v-model="form.direccion"
                    class="form-input"
                    rows="2"
                    placeholder="Dirección completa del paciente..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Información del Seguro -->
          <div data-tour="patient-insurance-info" class="card">
            <div class="card-header">
                          <h3 class="text-lg font-medium text-gray-900">
              Información del Seguro Médico
            </h3>
            </div>
            <div class="card-body">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">
                    Número de Seguro Social
                  </label>
                  <input
                    v-model="form.numero_seguro_social"
                    type="text"
                    class="form-input"
                    placeholder="Número de seguro social"
                  />
                </div>

                <div>
                  <label class="form-label">
                    Institución de Seguro
                  </label>
                  <select v-model="form.institucion_seguro" class="form-input">
                    <option value="">Seleccionar institución</option>
                    <option value="IMSS">IMSS</option>
                    <option value="ISSSTE">ISSSTE</option>
                    <option value="PEMEX">PEMEX</option>
                    <option value="SEDENA">SEDENA</option>
                    <option value="SEMAR">SEMAR</option>
                    <option value="Seguro Popular">Seguro Popular</option>
                    <option value="INSABI">INSABI</option>
                    <option value="Particular">Particular</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Alertas de duplicados -->
          <div v-if="duplicateWarnings.length > 0" class="bg-warning bg-opacity-10 border border-warning rounded-lg p-4">
            <div class="flex">
              <ExclamationTriangleIcon class="h-5 w-5 text-warning" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-warning">
                  Advertencia: Posibles duplicados
                </h3>
                <div class="mt-2 text-sm text-warning">
                  <ul class="list-disc list-inside">
                    <li v-for="warning in duplicateWarnings" :key="warning.campo">
                      Ya existe un paciente con {{ warning.campo.toUpperCase() }}: {{ warning.valor }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>

      <!-- Modal de gestión de CIE-10 -->
      <GestionCIE10Modal
        v-if="showGestionCIE10"
        :paciente="form"
        @close="showGestionCIE10 = false"
        @updated="handleCIE10CodesUpdated"
      />

      <!-- Footer con botones -->
      <div data-tour="patient-form-actions" class="px-6 py-4 border-t border-gray-200 flex-shrink-0">
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
            :disabled="isSubmitting || duplicateWarnings.length > 0"
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
              {{ isEditing ? 'Actualizar' : 'Crear' }} Paciente
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
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PlusIcon,
  StarIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import SelectorCIE10 from '@/components/shared/SelectorCIE10.vue'
import GestionCIE10Modal from '@/components/shared/GestionCIE10Modal.vue'


export default {
  name: 'FormularioPaciente',
  components: {
    XMarkIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    SelectorCIE10,
    GestionCIE10Modal,
    PlusIcon,
    StarIcon,
    TrashIcon
  },
  props: {
    patient: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const isSubmitting = ref(false)
    const duplicateWarnings = ref([])
    const showGestionCIE10 = ref(false)
    
    const isEditing = computed(() => !!props.patient)
    
    const form = reactive({
      expediente: '',
      curp: '',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      genero: '',
      patologia: '',
      cie10: '',
      fecha_diagnostico: '',
      tipo_sangre: 'ND',
      alergias: '',
      telefono: '',
      direccion: '',
      contacto_emergencia_nombre: '',
      contacto_emergencia_telefono: '',
      numero_seguro_social: '',
      institucion_seguro: '',
      cie10_codes: [] // Nuevo campo para los códigos adicionales
    })
    
    const errors = reactive({})

    const nuevoCodigo = reactive({
      cie10: '',
      fecha_diagnostico: '',
      es_principal: false,
      observaciones: ''
    })
    
    // Fecha máxima para diagnósticos (hoy)
    const fechaMaxima = computed(() => {
      const today = new Date()
      return today.toISOString().split('T')[0]
    })


    
    // Cargar datos del paciente si está editando
    onMounted(() => {
      if (props.patient) {
        Object.keys(form).forEach(key => {
          if (props.patient[key] !== undefined) {
            // Manejo especial para fechas
            if (key === 'fecha_nacimiento' && props.patient[key]) {
              const fecha = new Date(props.patient[key])
              if (!isNaN(fecha.getTime())) {
                form[key] = fecha.toISOString().split('T')[0]
              }
            } else if (key === 'fecha_diagnostico' && props.patient[key]) {
              const fecha = new Date(props.patient[key])
              if (!isNaN(fecha.getTime())) {
                form[key] = fecha.toISOString().split('T')[0]
              }
            } else if (key === 'cie10_codes' && props.patient[key]) {
              console.log('CIE10 codes from DB:', props.patient[key])
              form[key] = props.patient[key].map(code => {
                console.log('Individual code:', code)
                return {
                  ...code,
                  fecha_diagnostico: code.fecha_diagnostico ? new Date(code.fecha_diagnostico).toISOString().split('T')[0] : ''
                }
              })
            } else {
              form[key] = props.patient[key]
            }
          }
        })
        
        // Después de cargar todos los datos, verificar y corregir códigos CIE-10
        if (form.cie10_codes && form.cie10_codes.length > 0) {
          // Verificar si ya hay un código marcado como principal
          const tienePrincipal = form.cie10_codes.some(code => code.es_principal)
          
          if (!tienePrincipal) {
            // Si no hay principal, marcar el primero como principal
            form.cie10_codes[0].es_principal = true
          }
        }
      }
    })
    
    const formatCURP = () => {
      form.curp = form.curp.toUpperCase()
    }

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    };
    
    const validateForm = () => {
      const newErrors = {}
      
      // Campos requeridos
      const requiredFields = [
        'expediente', 'curp', 'nombre', 'apellido_paterno',
        'fecha_nacimiento', 'genero', 'patologia', 'fecha_diagnostico'
      ]
      
      requiredFields.forEach(field => {
        if (!form[field]?.trim()) {
          newErrors[field] = 'Este campo es requerido'
        }
      })
      
      // Validación específica de CURP
      if (form.curp && !/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/.test(form.curp)) {
        newErrors.curp = 'CURP inválida'
      }
      
      // Validación de fecha de nacimiento
      if (form.fecha_nacimiento) {
        const birthDate = new Date(form.fecha_nacimiento)
        const today = new Date()
        if (birthDate > today) {
          newErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
        }
      }
      
      // Validación de fecha de diagnóstico
      if (form.fecha_diagnostico) {
        const diagDate = new Date(form.fecha_diagnostico)
        const today = new Date()
        if (diagDate > today) {
          newErrors.fecha_diagnostico = 'La fecha de diagnóstico no puede ser futura'
        }
      }
      
      // Validación de que debe haber al menos un código CIE-10
      if (!form.cie10_codes || form.cie10_codes.length === 0) {
        newErrors.cie10_codes = 'Debe haber al menos un código CIE-10'
      }
      
      // Validación de códigos CIE-10
      if (form.cie10_codes && form.cie10_codes.length > 0) {
        // Verificar si hay códigos marcados como principales
        const tienePrincipal = form.cie10_codes.some(codigo => codigo.es_principal)
        
        if (!tienePrincipal) {
          newErrors.cie10_codes = 'Al menos un código CIE-10 debe ser marcado como diagnóstico principal'
        }
        
        // Verificar que solo haya un código principal
        const principales = form.cie10_codes.filter(codigo => codigo.es_principal)
        if (principales.length > 1) {
          newErrors.cie10_codes = 'Solo puede haber un diagnóstico principal'
        }
      } else {
        // Si no hay códigos, debe haber un error
        newErrors.cie10_codes = 'Debe haber al menos un código CIE-10'
      }
      
      // Verificar que si hay patología, también debe haber fecha_diagnostico
      if (form.patologia && !form.fecha_diagnostico) {
        newErrors.fecha_diagnostico = 'La fecha de diagnóstico es requerida cuando hay una patología'
      }
      
      Object.assign(errors, newErrors)
      return Object.keys(newErrors).length === 0
    }
    
    const checkDuplicates = async () => {
      if (!form.expediente.trim() && !form.curp.trim()) return
      
      try {
        const response = await patientsService.checkDuplicates(
          form.expediente.trim(),
          form.curp.trim()
        )
        
        duplicateWarnings.value = response.duplicados || []
      } catch (error) {
        // Error checking duplicates
      }
    }
    
    const handleCIE10Selected = (code) => {
      if (code) {
        // Auto-completar la patología si está vacía
        if (!form.patologia.trim()) {
          form.patologia = code.descripcion_corta
        }
      }
    }

    const handleFillPatologia = (descripcion) => {
      // Llenar automáticamente la patología principal
      form.patologia = descripcion
    }

    const handleCIE10CodesUpdated = (codes) => {
      form.cie10_codes = codes;
      // Limpiar error de códigos CIE-10 si se resolvió
      if (errors.cie10_codes) {
        delete errors.cie10_codes;
      }
    };

    const handleNuevoCodigoSelected = (code) => {
      nuevoCodigo.cie10 = code.codigo; // Cambiar de code.cie10 a code.codigo
      
      // Auto-completar la patología principal si está vacía
      if (!form.patologia.trim()) {
        form.patologia = code.descripcion_corta || code.descripcion
      }
    };

    const agregarCodigoCIE10 = () => {
      if (nuevoCodigo.cie10 && nuevoCodigo.fecha_diagnostico) {
        // Asegurar que form.cie10_codes sea un array
        if (!Array.isArray(form.cie10_codes)) {
          form.cie10_codes = []
        }
        
        const codigo = {
          cie10: nuevoCodigo.cie10,
          fecha_diagnostico: nuevoCodigo.fecha_diagnostico,
          es_principal: nuevoCodigo.es_principal,
          observaciones: nuevoCodigo.observaciones || ''
        }
        
        // Si este es principal, desmarcar otros
        if (nuevoCodigo.es_principal) {
          form.cie10_codes.forEach(c => c.es_principal = false);
          // Actualizar la patología principal con la descripción del código CIE-10
          if (form.patologia) {
            // La patología ya se estableció en handleNuevoCodigoSelected
          }
        }
        
        form.cie10_codes.push(codigo)
        
        // Limpiar formulario
        nuevoCodigo.cie10 = '';
        nuevoCodigo.fecha_diagnostico = '';
        nuevoCodigo.es_principal = false;
        nuevoCodigo.observaciones = '';
      }
    }
    
    const eliminarCodigoCIE10 = (index) => {
      const codigoEliminado = form.cie10_codes[index];
      
      // Si se elimina el código principal, limpiar la patología principal
      if (codigoEliminado.es_principal) {
        form.patologia = '';
        form.fecha_diagnostico = '';
      }
      
      form.cie10_codes.splice(index, 1)
    }
    
    const togglePrincipal = (index) => {
      // Desmarcar todos los códigos como principales
      form.cie10_codes.forEach((c, i) => {
        c.es_principal = (i === index);
      });
      
      // Actualizar la patología principal del paciente
      const codigoPrincipal = form.cie10_codes[index];
      if (codigoPrincipal) {
        // Buscar la descripción del código CIE-10 para actualizar la patología
        // Por ahora mantenemos la patología existente, pero podríamos buscar en el catálogo
        form.patologia = form.patologia || 'Patología del código ' + codigoPrincipal.cie10;
        form.fecha_diagnostico = codigoPrincipal.fecha_diagnostico;
      } else {
        form.patologia = '';
        form.fecha_diagnostico = '';
      }
    }
    
    const handleSubmit = async () => {
      try {
        if (!validateForm()) {
          toast.error('Por favor corrige los errores en el formulario')
          return
        }
        
        if (duplicateWarnings.value.length > 0 && !isEditing.value) {
          toast.error('Hay duplicados que deben resolverse antes de continuar')
          return
        }
        
        isSubmitting.value = true
        
        // Preparar datos para envío
        const datosEnvio = { ...form }
        
        // Incluir códigos CIE-10 en el envío
        if (form.cie10_codes && form.cie10_codes.length > 0) {
          // Verificar si ya hay un código principal en cie10_codes
          let tienePrincipal = form.cie10_codes.some(codigo => codigo.es_principal)
          
          // Si no hay principal, marcar el primero como principal
          if (!tienePrincipal && form.cie10_codes.length > 0) {
            form.cie10_codes[0].es_principal = true
            tienePrincipal = true
          }
          
          // Asegurar que solo haya un código principal
          let principales = form.cie10_codes.filter(codigo => codigo.es_principal)
          if (principales.length > 1) {
            // Si hay más de uno principal, mantener solo el primero
            form.cie10_codes.forEach((codigo, index) => {
              codigo.es_principal = index === 0
            })
          }
          
          datosEnvio.cie10_codes = form.cie10_codes.map(codigo => ({
            ...codigo,
            observaciones: codigo.observaciones || ''
          }))
        } else {
          // Si no hay códigos, crear un error
          throw new Error('Debe haber al menos un código CIE-10')
        }
        

        
        let response
        if (isEditing.value) {
          if (!props.patient.expediente) {
            throw new Error('Expediente del paciente es requerido para la actualización')
          }
          response = await patientsService.updatePatient(props.patient.expediente, datosEnvio)
        } else {
          response = await patientsService.createPatient(datosEnvio)
        }
        
        // Asegurar que el response incluya el expediente
        const responseWithExpediente = {
          ...response,
          expediente: props.patient.expediente
        }
        
        emit('saved', responseWithExpediente)
        toast.success(`Paciente ${isEditing.value ? 'actualizado' : 'creado'} correctamente`)
        
      } catch (error) {
        
        if (error.message === 'Expediente del paciente es requerido para la actualización') {
          toast.error('Error: Expediente del paciente es requerido')
        } else if (error.response?.data) {
          const errorData = error.response.data
          
          // Manejar errores de campo específicos
          Object.keys(errorData).forEach(field => {
            if (errors.hasOwnProperty(field)) {
              errors[field] = Array.isArray(errorData[field]) 
                ? errorData[field][0] 
                : errorData[field]
            }
          })
          
          // Mostrar error específico del backend
          if (errorData.expediente) {
            toast.error(`Error: ${errorData.expediente[0] || errorData.expediente}`)
          } else {
            toast.error('Error al guardar el paciente')
          }
        } else {
          toast.error('Error al guardar el paciente')
        }
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      form,
      errors,
      isSubmitting,
      duplicateWarnings,
      isEditing,
      formatCURP,
      checkDuplicates,
      handleCIE10Selected,
      handleFillPatologia,
      handleCIE10CodesUpdated,
      nuevoCodigo,
      handleNuevoCodigoSelected,
      agregarCodigoCIE10,
      eliminarCodigoCIE10,
      togglePrincipal,
      handleSubmit,
      formatDate,
      showGestionCIE10,
      fechaMaxima
    }
  }
}
</script>
