<template>
  <div class="min-h-screen bg-background-main">
    <!-- Header sticky -->
    <header class="sticky-header">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="text-secondary-600 hover:text-primary-600">
              <ArrowLeftIcon class="h-6 w-6" />
            </router-link>
            <h1 class="text-xl font-bold text-secondary-900">
              Prescripción de Recetas
            </h1>
          </div>
          

        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Barra de búsqueda de paciente -->
        <div class="card mb-6">
          <div class="card-body">
            <BuscarPaciente 
              @patient-selected="onPatientSelected"
              @new-patient="showCreatePatient = true"
            />
          </div>
        </div>




      </div>
    </main>

    <!-- Modal para crear receta -->
    <FormularioReceta
      v-if="showCreateRecipe && selectedPatient"
      :patient="selectedPatient"
      @close="showCreateRecipe = false"
      @saved="onRecipeSaved"
    />

    <!-- Modal para crear/editar paciente -->
    <FormularioPaciente
      v-if="showCreatePatient || editingPatient"
      :patient="editingPatient"
      @close="closePatientModal"
      @saved="onPatientSaved"
    />

    <!-- Modal para historial del paciente -->
    <HistorialPaciente
      v-if="showHistory && selectedPatient"
      :patient="selectedPatient"
      @close="showHistory = false"
    />

    <!-- Modal de detalles del paciente -->
    <DetallePaciente
      v-if="selectedPatient && showPatientDetails"
      :patient="selectedPatient"
      :isVisible="showPatientDetails"
      @edit-patient="onEditPatient"
      @view-history="onViewHistory"
      @addRecipe="onAddRecipe"
      @close="closePatientDetails"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import {
  ArrowLeftIcon,
  PlusIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

// Importar componentes
import BuscarPaciente from '@/components/atencion-usuario/BuscarPaciente.vue'
import DetallePaciente from '@/components/shared/DetallePaciente.vue'
import FormularioPaciente from '@/components/atencion-usuario/FormularioPaciente.vue'
import FormularioReceta from '@/components/shared/FormularioReceta.vue'
import HistorialPaciente from '@/components/shared/HistorialPaciente.vue'

// Importar servicios
import { patientsService } from '@/services/patients'

export default {
  name: 'Prescripcion',
  components: {
    ArrowLeftIcon,
    PlusIcon,
    UserIcon,
    EyeIcon,
    BuscarPaciente,
    DetallePaciente,
    FormularioPaciente,
    FormularioReceta,
    HistorialPaciente
  },
  setup() {
    const toast = useToast()
    
    const selectedPatient = ref(null)
    const showCreateRecipe = ref(false)
    const showCreatePatient = ref(false)
    const editingPatient = ref(null)
    const showHistory = ref(false)
    const showPatientDetails = ref(false)
    
    const onPatientSelected = async (patient) => {
      try {
        // Validar que el paciente tenga expediente
        if (!patient || !patient.expediente) {
          toast.error('Error: Paciente sin expediente válido')
          return
        }
        
        // Obtener datos completos del paciente al seleccionarlo
        const fullPatient = await patientsService.getPatientByExpediente(patient.expediente)
        
        // Asignar el paciente completo
        selectedPatient.value = fullPatient
        showPatientDetails.value = true
      } catch (error) {
        toast.error('Error al cargar datos del paciente')
        // Usar los datos disponibles como fallback
        selectedPatient.value = patient
        showPatientDetails.value = true
      }
    }
    
    const onEditPatient = async (patient) => {
      try {
        // Validar que el paciente tenga expediente
        if (!patient || !patient.expediente) {
          toast.error('Error: Paciente sin expediente válido')
          return
        }
        
        // Obtener datos completos del paciente antes de editar
        const fullPatient = await patientsService.getPatientByExpediente(patient.expediente)
        
        // Abrir el modal de edición con datos completos
        editingPatient.value = fullPatient
      } catch (error) {
        toast.error('Error al cargar datos del paciente')
        // Usar los datos disponibles como fallback
        editingPatient.value = patient
      }
    }
    
    const onViewHistory = () => {
      showHistory.value = true
    }
    
    const onAddRecipe = () => {
      // Cerrar el modal de detalles del paciente y abrir el formulario de receta
      showPatientDetails.value = false
      showCreateRecipe.value = true
    }
    
    const closePatientModal = () => {
      showCreatePatient.value = false
      editingPatient.value = null
    }
    
    const closePatientDetails = () => {
      showPatientDetails.value = false
      selectedPatient.value = null
    }
    
    const onPatientSaved = async (patient) => {
      try {
        // Validar que el paciente tenga expediente
        if (!patient || !patient.expediente) {
          toast.error('Error: Paciente sin expediente válido')
          closePatientModal()
          return
        }
        
        // Obtener datos frescos del paciente después de guardar
        const freshPatient = await patientsService.getPatientByExpediente(patient.expediente)
        
        // Actualizar selectedPatient con los datos frescos
        selectedPatient.value = freshPatient
        
        closePatientModal()
        // No mostrar toast aquí, ya se muestra en FormularioPaciente
      } catch (error) {
        // Usar los datos del paciente guardado como fallback
        selectedPatient.value = patient
        closePatientModal()
        // No mostrar toast aquí, ya se muestra en FormularioPaciente
      }
    }
    
    const onRecipeSaved = (recipe) => {
      showCreateRecipe.value = false
      toast.success(`Receta #${recipe.folio_receta} creada correctamente`)
    }
    
    return {
      selectedPatient,
      showCreateRecipe,
      showCreatePatient,
      editingPatient,
      showHistory,
      showPatientDetails,
      onPatientSelected,
      onEditPatient,
      onViewHistory,
      onAddRecipe,
      closePatientModal,
      closePatientDetails,
      onPatientSaved,
      onRecipeSaved
    }
  }
}
</script>
