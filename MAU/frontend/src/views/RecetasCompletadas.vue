<template>
  <div class="min-h-screen bg-background-main">
    <!-- Header sticky -->
    <header class="sticky-header">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="$router.go(-1)"
              class="btn-secondary"
            >
              ← Volver
            </button>
            <h1 class="text-xl font-bold text-secondary-900">
              Recetas Completadas
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-sm text-secondary-600">
              <span class="font-medium">{{ user?.first_name }} {{ user?.last_name }}</span>
              <span class="block text-xs">{{ getRoleDisplayName(user?.role) }}</span>
            </div>
            
            <router-link
              to="/"
              class="btn-secondary text-sm"
            >
              Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal scrolleable -->
    <main class="scrollable-content">
      <RecetasCompletadas />
    </main>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import RecetasCompletadas from '@/components/shared/RecetasCompletadas.vue'

export default {
  name: 'RecetasCompletadasView',
  components: {
    RecetasCompletadas
  },
  setup() {
    const authStore = useAuthStore()
    
    const user = computed(() => authStore.user)
    
    const getRoleDisplayName = (role) => {
      const roles = {
        'ATENCION_USUARIO': 'Atención al Usuario',
        'FARMACIA': 'Farmacia',
        'CMI': 'Centro de Mezclas',
        'MEDICO': 'Médico',
        'ADMIN': 'Administrador'
      }
      return roles[role] || role
    }
    
    return {
      user,
      getRoleDisplayName
    }
  }
}
</script>
