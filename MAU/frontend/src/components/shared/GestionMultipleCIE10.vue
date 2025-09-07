<template>
  <div class="space-y-4">
    <!-- Título de la sección -->
    <div class="flex items-center justify-between">
      <h4 class="text-lg font-medium text-secondary-900">
        Códigos CIE-10 del Paciente
      </h4>
      <button
        @click="showAddForm = true"
        type="button"
        class="btn-primary text-sm px-4 py-2"
      >
        <PlusIcon class="h-4 w-4 mr-2" />
        Agregar Código
      </button>
    </div>

    <!-- Lista de códigos CIE-10 -->
    <div v-if="cie10Codes.length > 0" class="space-y-3">
      <div
        v-for="(code, index) in cie10Codes"
        :key="code.id || index"
        class="bg-white border border-secondary-200 rounded-lg p-4 shadow-sm"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <!-- Código principal -->
              <span
                v-if="code.es_principal"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-white"
              >
                <StarIcon class="h-3 w-3 mr-1" />
                Principal
              </span>
              
              <!-- Código CIE-10 -->
              <span class="font-mono text-lg font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded border">
                {{ code.codigo }}
              </span>
              
              <!-- Capítulo -->
              <span class="text-sm text-secondary-600 bg-secondary-100 px-2 py-1 rounded">
                Cap. {{ code.capitulo }}
              </span>
            </div>
            
            <!-- Descripción -->
            <h5 class="font-medium text-secondary-900 mb-1">
              {{ code.descripcion_corta }}
            </h5>
            
            <!-- Fecha de diagnóstico -->
            <div class="flex items-center space-x-4 text-sm text-secondary-600">
              <span>
                <CalendarIcon class="h-4 w-4 inline mr-1" />
                {{ formatDate(code.fecha_diagnostico) }}
              </span>
              
              <!-- Observaciones -->
              <span v-if="code.observaciones" class="flex items-center">
                <DocumentTextIcon class="h-4 w-4 inline mr-1" />
                {{ code.observaciones }}
              </span>
            </div>
          </div>
          
          <!-- Acciones -->
          <div class="flex items-center space-x-2 ml-4">
            <!-- Marcar como principal -->
            <button
              v-if="!code.es_principal"
              @click="marcarComoPrincipal(code)"
              type="button"
              class="btn-secondary text-xs px-3 py-1"
              title="Marcar como diagnóstico principal"
            >
              <StarIcon class="h-3 w-3 mr-1" />
              Principal
            </button>
            
            <!-- Editar -->
            <button
              @click="editarCodigo(code)"
              type="button"
              class="btn-secondary text-xs px-3 py-1"
              title="Editar código"
            >
              <PencilIcon class="h-3 w-3 mr-1" />
              Editar
            </button>
            
            <!-- Eliminar -->
            <button
              @click="eliminarCodigo(code)"
              type="button"
              class="btn-danger text-xs px-3 py-1"
              title="Eliminar código"
            >
              <TrashIcon class="h-3 w-3 mr-1" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="text-center py-8 text-secondary-500">
      <DocumentTextIcon class="h-12 w-12 mx-auto mb-3 text-secondary-300" />
      <p class="text-lg font-medium">No hay códigos CIE-10 registrados</p>
      <p class="text-sm">Agrega el primer código CIE-10 para este paciente</p>
    </div>

    <!-- Modal para agregar/editar código -->
    <ModalCIE10
      v-if="showAddForm"
      :cie10-code="editingCode"
      :paciente-expediente="pacienteExpediente"
      @close="closeModal"
      @saved="handleCodeSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { patientsService } from '@/services/patients'
import {
  PlusIcon,
  StarIcon,
  CalendarIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import ModalCIE10 from './ModalCIE10.vue'

export default {
  name: 'GestionMultipleCIE10',
  components: {
    PlusIcon,
    StarIcon,
    CalendarIcon,
    DocumentTextIcon,
    PencilIcon,
    TrashIcon,
    ModalCIE10
  },
  props: {
    pacienteExpediente: {
      type: String,
      required: true
    },
    initialCodes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['updated'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const cie10Codes = ref([])
    const showAddForm = ref(false)
    const editingCode = ref(null)
    const isLoading = ref(false)

    // Cargar códigos iniciales
    onMounted(async () => {
      if (props.initialCodes.length > 0) {
        cie10Codes.value = [...props.initialCodes]
      } else {
        await cargarCodigos()
      }
    })

    const cargarCodigos = async () => {
      try {
        isLoading.value = true
        const response = await patientsService.getPatientCIE10(props.pacienteExpediente)
        cie10Codes.value = response.cie10_codes || []
        emit('updated', cie10Codes.value)
      } catch (error) {
        console.error('Error cargando códigos CIE-10:', error)
        toast.error('Error al cargar los códigos CIE-10')
      } finally {
        isLoading.value = false
      }
    }

    const marcarComoPrincipal = async (code) => {
      try {
        await patientsService.markAsPrincipal(props.pacienteExpediente, code.id)
        toast.success('Diagnóstico principal actualizado')
        await cargarCodigos()
      } catch (error) {
        console.error('Error marcando como principal:', error)
        toast.error('Error al actualizar el diagnóstico principal')
      }
    }

    const editarCodigo = (code) => {
      editingCode.value = { ...code }
      showAddForm.value = true
    }

    const eliminarCodigo = async (code) => {
      if (!confirm(`¿Estás seguro de que quieres eliminar el código ${code.codigo}?`)) {
        return
      }

      try {
        await patientsService.deletePatientCIE10(props.pacienteExpediente, code.id)
        toast.success('Código CIE-10 eliminado correctamente')
        await cargarCodigos()
      } catch (error) {
        console.error('Error eliminando código:', error)
        toast.error('Error al eliminar el código CIE-10')
      }
    }

    const closeModal = () => {
      showAddForm.value = false
      editingCode.value = null
    }

    const handleCodeSaved = async () => {
      closeModal()
      await cargarCodigos()
      toast.success('Código CIE-10 guardado correctamente')
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'No especificada'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    return {
      cie10Codes,
      showAddForm,
      editingCode,
      isLoading,
      marcarComoPrincipal,
      editarCodigo,
      eliminarCodigo,
      closeModal,
      handleCodeSaved,
      formatDate
    }
  }
}
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors;
}

.btn-secondary {
  @apply inline-flex items-center px-3 py-2 border border-secondary-300 text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors;
}

.btn-danger {
  @apply inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-colors;
}
</style>
