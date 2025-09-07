<template>
  <div id="app" class="min-h-screen bg-background-main">
    <!-- Loading spinner mientras se inicializa la autenticación -->
    <div v-if="isInitializing" class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-secondary-600">Inicializando aplicación...</p>
      </div>
    </div>
    
    <!-- Contenido principal -->
    <router-view v-else />

    <!-- Controlador de tours - Solo mostrar cuando el usuario esté autenticado -->
    <TourController 
      v-if="!isInitializing && authStore.isAuthenticated"
      :auto-start-welcome="true"
      :show-button="true"
    />

    <!-- Modal de advertencia de inactividad -->
    <InactivityWarning
      v-if="!isInitializing && authStore.isAuthenticated"
      :is-visible="inactivityWarning.isWarningVisible.value"
      :format-time-remaining="inactivityWarning.formatTimeRemaining"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import TourController from '@/components/TourController.vue'
import InactivityWarning from '@/components/InactivityWarning.vue'
import { useInactivityTimer } from '@/composables/useInactivityTimer'

export default {
  name: 'App',
  components: {
    TourController,
    InactivityWarning
  },
  setup() {
    const authStore = useAuthStore()
    const toast = useToast()
    const isInitializing = ref(true)

    // Inicializar timer de inactividad (60 segundos total con advertencia a los 20 segundos)
    const inactivityWarning = useInactivityTimer(60, 20)

    const initializeApp = async () => {
      try {
        await authStore.initializeAuth()
      } catch (error) {
        console.error('Error initializing auth:', error)
        // No mostrar error si no hay token (usuario no logueado)
        if (authStore.tokens.access) {
          toast.error('Error al inicializar la sesión')
        }
      } finally {
        isInitializing.value = false
      }
    }

    // Vigilar cambios en el estado de autenticación
    watch(() => authStore.isAuthenticated, (isAuthenticated) => {
      if (isAuthenticated) {
        // Usuario se logueó - iniciar monitoring
        inactivityWarning.startMonitoring()
      } else {
        // Usuario se deslogueó - detener monitoring
        inactivityWarning.stopMonitoring()
      }
    })

    onMounted(() => {
      initializeApp()
    })

    return {
      authStore,
      isInitializing,
      inactivityWarning
    }
  }
}
</script>
