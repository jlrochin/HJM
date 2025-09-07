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
              Validación de Recetas
            </h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Cola de validación -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-xl font-bold text-secondary-900">
              Cola de Validación de Recetas
            </h2>
            <p class="text-sm text-secondary-600 mt-1">
              Recetas pendientes de validación
            </p>
          </div>
          <div class="card-body">
            <ColaValidacion 
              @recipe-validated="onRecipeValidated"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification'
import {
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

import ColaValidacion from '@/components/atencion-usuario/ColaValidacion.vue'

export default {
  name: 'Validacion',
  components: {
    ArrowLeftIcon,
    ColaValidacion
  },
  setup() {
    const toast = useToast()
    
    const onRecipeValidated = () => {
      toast.success('Receta validada correctamente')
    }
    
    return {
      onRecipeValidated
    }
  }
}
</script>
