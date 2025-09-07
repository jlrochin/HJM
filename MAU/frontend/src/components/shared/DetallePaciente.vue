<template>
  <!-- Modal de detalles del paciente -->
  <div v-if="isVisible" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4">
    <div class="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
      <!-- Header del modal - sticky -->
      <div class="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 rounded-t-xl z-10">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-secondary-900">
            Información del Paciente
          </h2>
          <div class="flex items-center space-x-3">
            <button
              @click="$emit('edit-patient', patient)"
              class="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <PencilIcon class="h-4 w-4 mr-2" />
              Editar
            </button>
            <button
              @click="handleAddRecipe"
              class="inline-flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Nueva Receta
            </button>
            <button
              @click="$emit('view-history')"
              class="inline-flex items-center px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <ClockIcon class="h-4 w-4 mr-2" />
              Historial
            </button>
            <button
              @click="$emit('close')"
              class="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Contenido del modal - scrolleable -->
      <div class="flex-1 overflow-auto px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Información básica -->
          <div class="space-y-5">
            <h3 class="text-lg font-semibold text-secondary-900 border-b border-gray-200 pb-3">
              Información Básica
            </h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Expediente:</span>
                <span class="text-secondary-900 bg-gray-50 px-3 py-1.5 rounded-md text-sm">{{ patient.expediente }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">CURP:</span>
                <span class="text-secondary-900 bg-gray-50 px-3 py-1.5 rounded-md text-sm">{{ patient.curp }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Nombre(s):</span>
                <span class="text-secondary-900 text-sm">{{ patient.nombre }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Apellido Paterno:</span>
                <span class="text-secondary-900 text-sm">{{ patient.apellido_paterno }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Apellido Materno:</span>
                <span class="text-secondary-900 text-sm">{{ patient.apellido_materno || 'No especificado' }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Edad:</span>
                <span class="text-secondary-900 text-sm">{{ patient.edad }} años</span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Fecha de Nacimiento:</span>
                <span class="text-secondary-900 text-sm">
                  {{ formatDate(patient.fecha_nacimiento) || 'No especificado' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Género:</span>
                <span class="px-3 py-1.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                  {{ getGenderDisplay(patient.genero) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Tipo de Sangre:</span>
                <span class="px-3 py-1.5 rounded-full text-xs font-medium bg-accent-600 text-white">
                  {{ getBloodTypeDisplay(patient.tipo_sangre) }}
                </span>
              </div>
            </div>
          </div>

                    <!-- Información Médica -->
          <div class="space-y-5">
            <h3 class="text-lg font-semibold text-secondary-900 border-b border-gray-200 pb-3">
              Información Médica
            </h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Patología:</span>
                <span class="text-secondary-900 text-sm bg-gray-50 px-3 py-1.5 rounded-md">
                  {{ getPrincipalPathology() || 'No especificado' }}
                </span>
              </div>
              
              <!-- Código CIE-10 principal -->
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">CIE-10 Principal:</span>
                <span class="text-secondary-900 text-sm bg-blue-50 px-3 py-1.5 rounded-md">
                  {{ getPrincipalCIE10() || patient.cie10 || 'No especificado' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Fecha Diagnóstico:</span>
                <span class="text-secondary-900 text-sm">
                  {{ getPrincipalDiagnosisDate() || formatDate(patient.fecha_diagnostico) || 'No especificado' }}
                </span>
              </div>
              
              <div v-if="patient.cie10_codes && patient.cie10_codes.filter(c => !c.es_principal).length > 0" class="py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm block mb-3">Códigos CIE-10 Adicionales:</span>
                <div class="space-y-3">
                  <div
                    v-for="code in patient.cie10_codes.filter(c => !c.es_principal)"
                    :key="code.id || code.cie10"
                    class="bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                      <span class="font-medium text-secondary-600 text-sm">CIE-10 Adicional:</span>
                      <span class="text-secondary-900 text-sm bg-blue-50 px-3 py-1.5 rounded-md">
                        {{ code.cie10 || code.codigo || 'N/A' }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                      <span class="font-medium text-secondary-600 text-sm">Patología:</span>
                      <span class="text-secondary-900 text-sm bg-gray-50 px-3 py-1.5 rounded-md">
                        {{ code.cie10_info?.descripcion_corta || code.cie10_info?.descripcion || 'No especificado' }}
                      </span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="font-medium text-secondary-600 text-sm">Fecha Diagnóstico:</span>
                      <span class="text-secondary-900 text-sm">
                        {{ formatDate(code.fecha_diagnostico) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="patient.alergias" class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Alergias:</span>
                <span class="text-secondary-900 text-sm bg-orange-50 px-3 py-1.5 rounded-md">
                  {{ patient.alergias }}
                </span>
              </div>
            </div>
          </div>



          <!-- Información de contacto -->
          <div class="space-y-5">
            <h3 class="text-lg font-semibold text-secondary-900 border-b border-gray-200 pb-3">
              Contacto y Seguro
            </h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Teléfono:</span>
                <span class="text-secondary-900 text-sm">{{ patient.telefono || 'No especificado' }}</span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Dirección:</span>
                <span class="text-secondary-900 text-sm bg-gray-50 px-3 py-1.5 rounded-md">
                  {{ patient.direccion || 'No especificado' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Contacto Emergencia:</span>
                <div class="text-right">
                  <span class="text-secondary-900 text-sm block">
                    {{ patient.contacto_emergencia_nombre || 'No especificado' }}
                  </span>
                  <span v-if="patient.contacto_emergencia_telefono" class="text-xs text-secondary-600 block mt-1">
                    {{ patient.contacto_emergencia_telefono }}
                  </span>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">NSS:</span>
                <span class="text-secondary-900 text-sm bg-gray-50 px-3 py-1.5 rounded-md">
                  {{ patient.numero_seguro_social || 'No especificado' }}
                </span>
              </div>
              
              <div class="flex justify-between items-center py-3 border-b border-gray-100">
                <span class="font-medium text-secondary-600 text-sm">Institución:</span>
                <span class="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                  {{ patient.institucion_seguro || 'No especificado' }}
                </span>
              </div>
            </div>
          </div>

        </div>

        <!-- Estado del paciente -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <div class="flex flex-wrap items-center gap-6">
            <div class="flex items-center space-x-3">
              <span class="font-medium text-secondary-600 text-sm">Estado:</span>
              <span
                class="px-3 py-1.5 rounded-full text-xs font-medium"
                :class="patient.is_active ? 'bg-success text-white' : 'bg-gray-400 text-white'"
              >
                {{ patient.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            
            <div class="flex items-center space-x-3">
              <span class="font-medium text-secondary-600 text-sm">Registrado:</span>
              <span class="text-secondary-700 bg-gray-50 px-3 py-1.5 rounded-md text-sm">
                {{ formatDate(patient.created_at) || 'No disponible' }}
              </span>
            </div>
            
            <div v-if="patient.updated_at && patient.updated_at !== patient.created_at" class="flex items-center space-x-3">
              <span class="font-medium text-secondary-600 text-sm">Última actualización:</span>
              <span class="text-secondary-700 bg-gray-50 px-3 py-1.5 rounded-md text-sm">
                {{ formatDate(patient.updated_at) || 'No disponible' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    

  </div>
</template>

<script>
import { computed } from 'vue'

import {
  PencilIcon,
  ClockIcon,
  XMarkIcon,
  StarIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'


export default {
  name: 'DetallePaciente',
  components: {
    PencilIcon,
    ClockIcon,
    XMarkIcon,
    StarIcon,
    CalendarIcon,
    DocumentTextIcon,
    PlusIcon,

  },
  props: {
    patient: {
      type: Object,
      required: true
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'edit-patient', 'view-history', 'addRecipe'],
  setup(props, { emit }) {
    const formatDate = (dateString) => {
      if (!dateString) return 'No especificado'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const getGenderDisplay = (gender) => {
      const genderMap = {
        'M': 'Masculino',
        'F': 'Femenino',
        'O': 'Otro'
      }
      return genderMap[gender] || gender
    }
    
    const getBloodTypeDisplay = (bloodType) => {
      const bloodTypeMap = {
        'A+': 'A+',
        'A-': 'A-',
        'B+': 'B+',
        'B-': 'B-',
        'AB+': 'AB+',
        'AB-': 'AB-',
        'O+': 'O+',
        'O-': 'O-',
        'ND': 'No Determinado'
      }
      return bloodTypeMap[bloodType] || bloodType
    }
    
    const getPrincipalCIE10 = () => {
      if (!props.patient.cie10_codes || !Array.isArray(props.patient.cie10_codes)) {
        return null;
      }
      const principalCode = props.patient.cie10_codes.find(code => code.es_principal);
      return principalCode ? principalCode.cie10 : null;
    };

    const getPrincipalDiagnosisDate = () => {
      if (!props.patient.cie10_codes || !Array.isArray(props.patient.cie10_codes)) {
        return null;
      }
      const principalCode = props.patient.cie10_codes.find(code => code.es_principal);
      return principalCode ? formatDate(principalCode.fecha_diagnostico) : null;
    };

    const getPrincipalPathology = () => {
      if (!props.patient.cie10_codes || !Array.isArray(props.patient.cie10_codes)) {
        return null;
      }
      const principalCode = props.patient.cie10_codes.find(code => code.es_principal);
      return principalCode?.cie10_info?.descripcion_corta || props.patient.patologia;
    };

    const handleAddRecipe = () => {
      console.log('handleAddRecipe ejecutado, emitiendo addRecipe')
      emit('addRecipe')
    }
    
    return {
      formatDate,
      getGenderDisplay,
      getBloodTypeDisplay,
      getPrincipalCIE10,
      getPrincipalDiagnosisDate,
      getPrincipalPathology,
      handleAddRecipe,
    }
  }
}
</script>
