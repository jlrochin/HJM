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
              Farmacia
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-secondary-600">
              Dispensación de Medicamentos
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Estadísticas rápidas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                  <ClockIcon class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Por Dispensar</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ stats.pendientes }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-accent-600 bg-opacity-20">
                  <ExclamationTriangleIcon class="h-6 w-6 text-accent-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Urgentes</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ stats.urgentes }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-success bg-opacity-20">
                  <CheckCircleIcon class="h-6 w-6 text-success" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Dispensadas Hoy</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ stats.dispensadasHoy }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-primary-600 bg-opacity-20">
                  <BeakerIcon class="h-6 w-6 text-primary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total Farmacia</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ stats.totalFarmacia }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cola de dispensación -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-bold text-secondary-900">
              Cola de Dispensación - Farmacia
            </h2>
            <p class="text-sm text-secondary-600 mt-1">
              Recetas validadas listas para dispensar
            </p>
          </div>
          <div class="card-body">
            <ColaDispensacionFarmacia 
              @recipe-dispensed="onRecipeDispensed"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Modal para dispensar receta -->
    <DispensarReceta
      v-if="dispensingRecipe"
      :recipe="dispensingRecipe"
      type="FARMACIA"
      @close="dispensingRecipe = null"
      @dispensed="onRecipeDispensed"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import {
  ArrowLeftIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BeakerIcon
} from '@heroicons/vue/24/outline'

// Importar componentes
import ColaDispensacionFarmacia from '@/components/farmacia/ColaDispensacionFarmacia.vue'
import DispensarReceta from '@/components/shared/DispensarReceta.vue'

export default {
  name: 'Farmacia',
  components: {
    ArrowLeftIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BeakerIcon,
    ColaDispensacionFarmacia,
    DispensarReceta
  },
  setup() {
    const toast = useToast()
    
    const stats = ref({
      pendientes: 0,
      urgentes: 0,
      dispensadasHoy: 0,
      totalFarmacia: 0
    })
    
    const dispensingRecipe = ref(null)
    
    const loadStats = async () => {
      try {
        const response = await api.get('/recetas/estadisticas/')
        const data = response.data
        
        // Calcular estadísticas específicas para farmacia
        stats.value = {
          pendientes: data.validadas || 0, // Recetas validadas listas para dispensar
          urgentes: data.por_prioridad?.urgente || 0,
          dispensadasHoy: data.surtidas || 0, // Simplificado, en producción sería solo las de hoy
          totalFarmacia: data.farmacia || 0
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    
    const onRecipeDispensed = (recipe) => {
      dispensingRecipe.value = null
      loadStats() // Recargar estadísticas
      toast.success(`Receta #${recipe.folio_receta} dispensada correctamente`)
    }
    
    onMounted(() => {
      loadStats()
    })
    
    return {
      stats,
      dispensingRecipe,
      onRecipeDispensed
    }
  }
}
</script>
