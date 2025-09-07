import { ref, onMounted, onUnmounted } from 'vue'
import driverService from '@/services/driverService.js'

/**
 * Composable para usar Driver.js en componentes Vue
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Métodos y estados reactivos
 */
export function useDriver(options = {}) {
    const isActive = ref(false)
    const currentStep = ref(0)
    const totalSteps = ref(0)

    /**
     * Inicia un tour personalizado
     * @param {Array} steps - Pasos del tour
     * @param {Object} config - Configuración adicional
     */
    const startTour = (steps, config = {}) => {
        const tourConfig = {
            ...config,
            onHighlightStarted: (element, step, options) => {
                isActive.value = true
                currentStep.value = options.state.activeIndex + 1
                totalSteps.value = options.state.totalSteps

                // Llamar callback personalizado si existe
                if (config.onHighlightStarted) {
                    config.onHighlightStarted(element, step, options)
                }
            },
            onDestroyed: () => {
                isActive.value = false
                currentStep.value = 0
                totalSteps.value = 0

                // Llamar callback personalizado si existe
                if (config.onDestroyed) {
                    config.onDestroyed()
                }
            }
        }

        driverService.startTour(steps, tourConfig)
    }

    /**
     * Resalta un elemento
     * @param {String} selector - Selector CSS
     * @param {Object} options - Opciones del popover
     */
    const highlight = (selector, options = {}) => {
        driverService.highlight(selector, options)
        isActive.value = true
    }

    /**
     * Detiene el tour actual
     */
    const stopTour = () => {
        driverService.destroy()
        isActive.value = false
        currentStep.value = 0
        totalSteps.value = 0
    }

    /**
     * Tours predefinidos para fácil acceso
     */
    const tours = {
        welcome: () => {
            if (!driverService.hasCompletedWelcomeTour()) {
                driverService.startWelcomeTour()
            }
        },
        prescriptions: () => driverService.startPrescriptionsTour(),
        dispensing: () => driverService.startDispensingTour(),
        newPatient: () => driverService.startNewPatientTour()
    }    // Limpiar al desmontar el componente
    onUnmounted(() => {
        if (isActive.value) {
            stopTour()
        }
    })

    return {
        // Estados reactivos
        isActive,
        currentStep,
        totalSteps,

        // Métodos
        startTour,
        highlight,
        stopTour,
        tours,

        // Acceso directo al servicio
        driverService
    }
}

/**
 * Composable específico para tours de onboarding
 */
export function useOnboarding() {
    const { startTour, isActive, tours } = useDriver()

    /**
     * Inicia el proceso de onboarding completo
     */
    const startOnboarding = async () => {
        // Verificar si ya completó el tour
        if (driverService.hasCompletedWelcomeTour()) {
            return false
        }

        // Esperar a que el DOM esté listo
        await new Promise(resolve => setTimeout(resolve, 500))

        // Iniciar tour de bienvenida
        tours.welcome()

        return true
    }

    /**
     * Reinicia el onboarding (útil para testing o demo)
     */
    const resetOnboarding = () => {
        driverService.resetTourState()
    }

    return {
        startOnboarding,
        resetOnboarding,
        isActive,
        hasCompletedTour: driverService.hasCompletedWelcomeTour()
    }
}
