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
              Centro de Mezclas (CMI)
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-secondary-600">
              Preparación de Mezclas Especializadas
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
                  <p class="text-sm font-medium text-secondary-600">Por Preparar</p>
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
                  <p class="text-sm font-medium text-secondary-600">Preparadas Hoy</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ stats.preparadasHoy }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-primary-600 bg-opacity-20">
                  <svg class="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total CMI</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ stats.totalCMI }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cola de preparación -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-bold text-secondary-900">
              Cola de Preparación - CMI
            </h2>
            <p class="text-sm text-secondary-600 mt-1">
              Recetas validadas listas para preparar mezclas
            </p>
          </div>
          <div class="card-body">
            <ColaDispensacionCMI 
              @recipe-dispensed="onRecipeDispensed"
            />
          </div>
        </div>
      </div>
    </main>
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
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

// Importar componente
import ColaDispensacionCMI from '@/components/cmi/ColaDispensacionCMI.vue'

export default {
  name: 'CMI',
  components: {
    ArrowLeftIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ColaDispensacionCMI
  },
  setup() {
    const toast = useToast()
    
    const stats = ref({
      pendientes: 0,
      urgentes: 0,
      preparadasHoy: 0,
      totalCMI: 0
    })
    
    const loadStats = async () => {
      try {
        const response = await api.get('/recetas/estadisticas/')
        const data = response.data
        
        // Calcular estadísticas específicas para CMI
        stats.value = {
          pendientes: data.validadas || 0, // Recetas validadas listas para preparar
          urgentes: data.por_prioridad?.urgente || 0,
          preparadasHoy: data.surtidas || 0, // Simplificado, en producción sería solo las de hoy
          totalCMI: data.cmi || 0
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }
    
    const onRecipeDispensed = (recipe) => {
      loadStats() // Recargar estadísticas
      toast.success(`Mezcla #${recipe.folio_receta} preparada correctamente`)
    }
    
    onMounted(() => {
      loadStats()
    })
    
    return {
      stats,
      onRecipeDispensed
    }
  }
}
</script>
