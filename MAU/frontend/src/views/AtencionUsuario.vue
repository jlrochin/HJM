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
              Atención al Usuario
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- El botón "Nuevo Paciente" se eliminó del header ya que está duplicado -->
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Barra de búsqueda -->
        <div class="card mb-6">
          <div class="card-header">
            <h2 class="text-xl font-bold text-secondary-900">
              Gestión de Pacientes
            </h2>
            <p class="text-sm text-secondary-600 mt-1">
              Busca, registra y gestiona la información de los pacientes
            </p>
          </div>
          <div class="card-body">
            <BuscarPaciente 
              @patient-selected="onPatientSelected"
              @new-patient="showCreatePatient = true"
              @search-state-changed="onSearchStateChanged"
            />
          </div>
        </div>

        <!-- Información del paciente seleccionado -->
        <div v-if="selectedPatient">
          <DetallePaciente 
            :patient="selectedPatient"
            :isVisible="true"
            @edit-patient="onEditPatient"
            @view-history="onViewHistory"
            @addRecipe="onAddRecipe"
            @close="selectedPatient = null"
          />
        </div>

        <!-- Modal de creación de paciente -->
        <FormularioPaciente 
          v-if="showCreatePatient"
          :patient="null"
          :isVisible="true"
          @close="closePatientModal"
          @saved="onPatientSaved"
        />

        <!-- Modal de edición de paciente -->
        <FormularioPaciente 
          v-if="editingPatient"
          :patient="editingPatient"
          :isVisible="true"
          @close="closePatientModal"
          @saved="onPatientSaved"
        />

        <!-- Modal de historial del paciente -->
        <HistorialPaciente 
          v-if="showHistory && historyPatient"
          :patient="historyPatient"
          :isVisible="true"
          @close="closeHistoryModal"
        />

        <!-- Modal para crear receta -->
        <FormularioReceta
          v-if="showCreateRecipe"
          :patient="selectedPatient"
          @close="closeRecipeModal"
          @saved="onRecipeSaved"
        />


        <!-- Estadísticas de pacientes -->
        <div v-if="!selectedPatient && !isSearchActive" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-accent-600 mb-2">
                <UserGroupIcon class="h-8 w-8 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-1">Total Pacientes</h3>
              <p class="text-2xl font-bold text-primary-600">{{ stats.total.toLocaleString() }}</p>
              <p class="text-sm text-secondary-600">Pacientes activos</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-success-600 mb-2">
                <PlusIcon class="h-8 w-8 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-1">Nuevos Hoy</h3>
              <p class="text-2xl font-bold text-success-600">{{ stats.nuevosHoy }}</p>
              <p class="text-sm text-secondary-600">Registrados hoy</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-body text-center">
              <div class="text-3xl font-bold text-warning-600 mb-2">
                <ClockIcon class="h-8 w-8 mx-auto" />
              </div>
              <h3 class="text-lg font-semibold text-secondary-900 mb-1">Pendientes</h3>
              <p class="text-2xl font-bold text-warning-600">{{ stats.pendientes }}</p>
              <p class="text-sm text-secondary-600">Con recetas pendientes</p>
            </div>
          </div>
        </div>

        <!-- Lista de pacientes recientes -->
        <div v-if="!selectedPatient && !isSearchActive" class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-secondary-900">
              Pacientes Recientes
            </h3>
            <p class="text-sm text-secondary-600 mt-1">
              Últimos pacientes registrados en el sistema
            </p>
          </div>
          <div class="card-body">
            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            
            <div v-else-if="recentPatients.length === 0" class="text-center py-8">
              <UserGroupIcon class="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <p class="text-secondary-600">No hay pacientes registrados</p>
              <button
                @click="showCreatePatient = true"
                class="btn-primary mt-4"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Registrar Primer Paciente
              </button>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="patient in recentPatients"
                :key="patient.expediente"
                @click="onPatientSelected(patient)"
                class="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-primary-700 font-semibold text-sm">
                      {{ patient.nombre.charAt(0) }}{{ patient.apellido_paterno.charAt(0) }}
                    </span>
                  </div>
                  <div>
                    <h4 class="font-medium text-secondary-900">
                      {{ patient.nombre }} {{ patient.apellido_paterno }} {{ patient.apellido_materno || '' }}
                    </h4>
                    <p class="text-sm text-secondary-600">
                      Expediente: {{ patient.expediente }} • CURP: {{ patient.curp }}
                    </p>
                    <p class="text-xs text-secondary-500">
                      Registrado: {{ formatDate(patient.created_at) }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {{ patient.genero === 'M' ? 'Masculino' : patient.genero === 'F' ? 'Femenino' : 'Otro' }}
                  </span>
                  <ChevronRightIcon class="h-4 w-4 text-secondary-400" />
                </div>
              </div>
            </div>
            
            <div v-if="recentPatients.length > 0" class="mt-4 text-center">
              <button
                @click="loadMorePatients"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver más pacientes
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>


  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import {
  ArrowLeftIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'

// Importar componentes
import BuscarPaciente from '@/components/atencion-usuario/BuscarPaciente.vue'
import DetallePaciente from '@/components/shared/DetallePaciente.vue'
import FormularioPaciente from '@/components/atencion-usuario/FormularioPaciente.vue'
import HistorialPaciente from '@/components/shared/HistorialPaciente.vue'
import FormularioReceta from '@/components/shared/FormularioReceta.vue'

// Importar servicios
import { patientsService } from '@/services/patients'

export default {
  name: 'AtencionUsuario',
  components: {
    ArrowLeftIcon,
    PlusIcon,
    UserGroupIcon,
    ClockIcon,
    ChevronRightIcon,
    BuscarPaciente,
    DetallePaciente,
    FormularioPaciente,
    HistorialPaciente,
    FormularioReceta
  },
  setup() {
    const toast = useToast()
    
    const selectedPatient = ref(null)
    const showCreatePatient = ref(false)
    const editingPatient = ref(null)
    const showHistory = ref(false)
    const historyPatient = ref(null)
    const showCreateRecipe = ref(false)
    const loading = ref(false)
    const recentPatients = ref([])
    const isSearchActive = ref(false)
    const stats = ref({
      total: 0,
      nuevosHoy: 0,
      pendientes: 0
    })
    
    // Cargar estadísticas
    const loadStats = async () => {
      try {
        const statsData = await patientsService.getPatientStats()
        stats.value = statsData
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
        toast.error('Error al cargar estadísticas: ' + (error.response?.data?.detail || error.message))
        
        // Intentar cargar datos básicos como fallback
        try {
          const basicResponse = await patientsService.getPatients({ page_size: 1 })
          stats.value = {
            total: basicResponse.count || 0,
            nuevosHoy: 0,
            pendientes: 0
          }
        } catch (fallbackError) {
          console.error('Error en fallback:', fallbackError)
          stats.value = { total: 0, nuevosHoy: 0, pendientes: 0 }
        }
      }
    }
    
    // Cargar pacientes recientes
    const loadRecentPatients = async () => {
      try {
        loading.value = true
        const response = await patientsService.getPatients({
          page_size: 5,
          ordering: '-created_at'
        })
        recentPatients.value = response.results || []
      } catch (error) {
        console.error('Error cargando pacientes recientes:', error)
        toast.error('Error al cargar pacientes recientes: ' + (error.response?.data?.detail || error.message))
        recentPatients.value = []
      } finally {
        loading.value = false
      }
    }
    
    // Cargar más pacientes
    const loadMorePatients = async () => {
      try {
        const currentCount = recentPatients.value.length
        const response = await patientsService.getPatients({
          page_size: currentCount + 5,
          ordering: '-created_at'
        })
        recentPatients.value = response.results || []
      } catch (error) {
        console.error('Error cargando más pacientes:', error)
        toast.error('Error al cargar más pacientes')
      }
    }
    
    // Formatear fecha
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    const onPatientSelected = async (patient) => {
      try {
        // Obtener datos completos del paciente al seleccionarlo
        const fullPatient = await patientsService.getPatientByExpediente(patient.expediente)
        
        // Asignar el paciente completo
        selectedPatient.value = fullPatient
      } catch (error) {
        console.error('Error obteniendo datos completos del paciente al seleccionarlo:', error)
        toast.error('Error al cargar datos del paciente')
        // Usar los datos disponibles como fallback
        selectedPatient.value = patient
      }
    }
    
    const onSearchStateChanged = (isActive) => {
      isSearchActive.value = isActive
    }
    
    const onEditPatient = async (patient) => {
      try {
        // Cerrar todos los modales primero
        selectedPatient.value = null
        showHistory.value = false
        historyPatient.value = null
        
        // Obtener datos completos del paciente antes de editar
        const fullPatient = await patientsService.getPatientByExpediente(patient.expediente)
        
        // Luego abrir el modal de edición con datos completos
        editingPatient.value = fullPatient
      } catch (error) {
        console.error('Error obteniendo datos completos del paciente:', error)
        toast.error('Error al cargar datos del paciente')
        // Usar los datos disponibles como fallback
        editingPatient.value = patient
      }
    }
    
    const onViewHistory = () => {
      // Guardar el paciente para el historial
      historyPatient.value = selectedPatient.value
      // Cerrar todos los modales primero
      selectedPatient.value = null
      editingPatient.value = null
      // Luego abrir el modal de historial
      showHistory.value = true
    }

    const onAddRecipe = () => {
      // Abrir el modal de receta manteniendo el paciente seleccionado
      showCreateRecipe.value = true
    }

    const closeRecipeModal = () => {
      showCreateRecipe.value = false
    }
    
    const closeAllModals = () => {
      selectedPatient.value = null
      showCreatePatient.value = false
      editingPatient.value = null
      showHistory.value = false
      historyPatient.value = null
      showCreateRecipe.value = false
    }
    
    const closePatientModal = () => {
      showCreatePatient.value = false
      editingPatient.value = null
      // Asegurar que no haya otros modales abiertos
      showHistory.value = false
      historyPatient.value = null
    }
    
    const closeHistoryModal = () => {
      showHistory.value = false
      historyPatient.value = null
      // Asegurar que no haya otros modales abiertos
      editingPatient.value = null
    }
    
    const onPatientSaved = async (patient) => {
      try {
        // Obtener datos frescos del paciente después de guardar
        const freshPatient = await patientsService.getPatientByExpediente(patient.expediente)
        
        // Actualizar selectedPatient con los datos frescos
        selectedPatient.value = freshPatient
        
        closePatientModal()
        toast.success('Paciente guardado correctamente')
        
        // Recargar datos
        await Promise.all([
          loadStats(),
          loadRecentPatients()
        ])
      } catch (error) {
        console.error('Error obteniendo datos frescos del paciente:', error)
        // Usar los datos del paciente guardado como fallback
        selectedPatient.value = patient
        closePatientModal()
        toast.success('Paciente guardado correctamente')
        
        // Recargar datos
        await Promise.all([
          loadStats(),
          loadRecentPatients()
        ])
      }
    }

    const onRecipeSaved = async () => {
      try {
        // Recargar datos
        await Promise.all([
          loadStats(),
          loadRecentPatients()
        ])
        toast.success('Receta guardada correctamente')
        closeRecipeModal()
      } catch (error) {
        console.error('Error al guardar la receta:', error)
        toast.error('Error al guardar la receta: ' + (error.response?.data?.detail || error.message))
      }
    }
    
    // Cargar datos al montar el componente
    onMounted(async () => {
      await Promise.all([
        loadStats(),
        loadRecentPatients()
      ])
    })
    
    return {
      selectedPatient,
      showCreatePatient,
      editingPatient,
      showHistory,
      historyPatient,
      showCreateRecipe,
      loading,
      recentPatients,
      stats,
      // authStore, // Eliminado
      onPatientSelected,
      onSearchStateChanged,
      onEditPatient,
      onViewHistory,
      onAddRecipe,
      closePatientModal,
      closeHistoryModal,
      closeAllModals,
      onPatientSaved,
      loadMorePatients,
      formatDate,
      isSearchActive,
      closeRecipeModal,
      onRecipeSaved
    }
  }
}
</script>
