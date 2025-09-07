<template>
  <div class="tour-controller">
    <!-- Botón flotante para mostrar ayuda -->
    <Transition name="fade">
      <div 
        v-if="showHelpButton"
        class="fixed bottom-6 right-6 z-50"
      >
        <div class="relative">
          <!-- Botón principal de ayuda -->
          <button
            @click="toggleMenu"
            :class="[
              'bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg',
              'transition-all duration-300 transform hover:scale-110',
              'focus:outline-none focus:ring-4 focus:ring-blue-300',
              { 'rotate-45': isMenuOpen }
            ]"
            :aria-label="isMenuOpen ? 'Cerrar menú de ayuda' : 'Abrir menú de ayuda'"
          >
            <svg 
              class="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <!-- Menú desplegable -->
          <Transition name="scale">
            <div 
              v-if="isMenuOpen"
              class="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64 py-2"
            >
              <!-- Tour de bienvenida -->
              <button
                @click="startWelcomeTour"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div class="bg-green-100 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900">Tour de Bienvenida</div>
                  <div class="text-sm text-gray-500">Introducción al sistema</div>
                </div>
              </button>

              <!-- Tour de recetas -->
              <button
                @click="startPrescriptionsTour"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div class="bg-blue-100 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900">Gestión de Recetas</div>
                  <div class="text-sm text-gray-500">Cómo manejar recetas</div>
                </div>
              </button>

              <!-- Tour de dispensación -->
              <button
                @click="startDispensingTour"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div class="bg-purple-100 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900">Dispensación</div>
                  <div class="text-sm text-gray-500">Proceso de dispensación</div>
                </div>
              </button>

              <!-- Tour de nuevo paciente -->
              <button
                @click="startNewPatientTour"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div class="bg-emerald-100 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900">Nuevo Paciente</div>
                  <div class="text-sm text-gray-500">Cómo registrar pacientes</div>
                </div>
              </button>

              <hr class="my-2">

              <!-- Botón para reiniciar tours -->
              <button
                @click="resetTours"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-600"
              >
                <div class="bg-gray-100 p-2 rounded-lg">
                  <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Reiniciar Tours</div>
                  <div class="text-sm text-gray-400">Volver a mostrar tours</div>
                </div>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- Indicador de progreso del tour -->
    <Transition name="slide-up">
      <div 
        v-if="isActive && currentStep > 0"
        class="fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 z-40"
      >
        <div class="flex items-center gap-3">
          <div class="text-sm font-medium text-gray-700">
            Paso {{ currentStep }} de {{ totalSteps }}
          </div>
          <div class="bg-gray-200 rounded-full h-2 w-24">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
            ></div>
          </div>
          <button
            @click="stopCurrentTour"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Detener tour"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDriver, useOnboarding } from '@/composables/useDriver.js'
import { useRoute } from 'vue-router'

// Props
const props = defineProps({
  showButton: {
    type: Boolean,
    default: true
  },
  autoStartWelcome: {
    type: Boolean,
    default: false
  }
})

// Composables
const { isActive, currentStep, totalSteps, tours, stopTour } = useDriver()
const { startOnboarding, resetOnboarding } = useOnboarding()
const route = useRoute()

// Estado local
const isMenuOpen = ref(false)

// Computed
const showHelpButton = computed(() => props.showButton && !isActive.value)

// Métodos
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const startWelcomeTour = () => {
  closeMenu()
  tours.welcome()
}

const startPrescriptionsTour = () => {
  closeMenu()
  tours.prescriptions()
}

const startDispensingTour = () => {
  closeMenu()
  tours.dispensing()
}

const startNewPatientTour = () => {
  closeMenu()
  tours.newPatient()
}

const stopCurrentTour = () => {
  stopTour()
}

const resetTours = () => {
  closeMenu()
  resetOnboarding()
  // Mostrar mensaje de confirmación
  console.log('Tours reiniciados. Podrás volver a ver el tour de bienvenida.')
}

// Cerrar menú al hacer clic fuera
const handleClickOutside = (event) => {
  if (isMenuOpen.value && !event.target.closest('.tour-controller')) {
    closeMenu()
  }
}

onMounted(() => {
  // Auto-iniciar tour de bienvenida si está habilitado
  if (props.autoStartWelcome) {
    setTimeout(() => {
      startOnboarding()
    }, 1000) // Esperar 1 segundo para que cargue la página
  }

  // Agregar listener para cerrar menú
  document.addEventListener('click', handleClickOutside)
})

// Limpiar event listener
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Transiciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.2s ease;
  transform-origin: bottom right;
}

.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
