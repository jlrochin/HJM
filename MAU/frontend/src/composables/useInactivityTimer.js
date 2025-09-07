import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

/**
 * Composable para manejar el cierre automático de sesión por inactividad
 * @param {number} timeoutSeconds - Tiempo en segundos para cerrar sesión (default: 60 = 1 minuto)
 * @param {number} warningSeconds - Tiempo en segundos para mostrar advertencia (default: 20 = 20 segundos)
 */
export function useInactivityTimer(timeoutSeconds = 60, warningSeconds = 20) {
    const authStore = useAuthStore()
    const router = useRouter()

    // Estado reactivo
    const isWarningVisible = ref(false)
    const timeRemaining = ref(0)

    // Variables internas
    let inactivityTimer = null
    let warningTimer = null
    let countdownTimer = null

    // Eventos que resetean el timer
    const resetEvents = [
        'mousedown',
        'mousemove',
        'keypress',
        'scroll',
        'touchstart',
        'click',
        'keydown'
    ]

    /**
     * Resetea el timer de inactividad
     */
    const resetTimer = () => {
        // Limpiar timers existentes
        clearTimeout(inactivityTimer)
        clearTimeout(warningTimer)
        clearTimeout(countdownTimer)

        // Ocultar advertencia si está visible
        isWarningVisible.value = false

        // Solo iniciar timer si el usuario está autenticado
        if (!authStore.isAuthenticated) {
            return
        }

        // Configurar timer de advertencia
        const warningTimeMs = (timeoutSeconds - warningSeconds) * 1000
        warningTimer = setTimeout(() => {
            showWarning()
        }, warningTimeMs)

        // Configurar timer de cierre de sesión
        const timeoutMs = timeoutSeconds * 1000
        inactivityTimer = setTimeout(() => {
            logout()
        }, timeoutMs)
    }

    /**
     * Muestra la advertencia de inactividad
     */
    const showWarning = () => {
        isWarningVisible.value = true
        timeRemaining.value = warningSeconds

        // Iniciar countdown
        countdownTimer = setInterval(() => {
            timeRemaining.value--

            if (timeRemaining.value <= 0) {
                clearInterval(countdownTimer)
                logout()
            }
        }, 1000)
    }

    /**
     * Extiende la sesión cuando el usuario confirma
     */
    const extendSession = () => {
        isWarningVisible.value = false
        clearInterval(countdownTimer)
        resetTimer()
    }

    /**
     * Cierra la sesión por inactividad
     */
    const logout = async () => {
        try {
            // Limpiar todos los timers
            clearTimeout(inactivityTimer)
            clearTimeout(warningTimer)
            clearInterval(countdownTimer)

            // Ocultar advertencia
            isWarningVisible.value = false

            // Cerrar sesión
            await authStore.logout()

            // Redirigir a login
            router.push('/login')

            console.log('Sesión cerrada por inactividad')
        } catch (error) {
            console.error('Error al cerrar sesión por inactividad:', error)
        }
    }

    /**
     * Inicia el monitoring de inactividad
     */
    const startMonitoring = () => {
        // Agregar event listeners
        resetEvents.forEach(event => {
            document.addEventListener(event, resetTimer, true)
        })

        // Iniciar timer
        resetTimer()
    }

    /**
     * Detiene el monitoring de inactividad
     */
    const stopMonitoring = () => {
        // Remover event listeners
        resetEvents.forEach(event => {
            document.removeEventListener(event, resetTimer, true)
        })

        // Limpiar timers
        clearTimeout(inactivityTimer)
        clearTimeout(warningTimer)
        clearInterval(countdownTimer)

        // Reset estado
        isWarningVisible.value = false
        timeRemaining.value = 0
    }

    /**
     * Formatea el tiempo restante en mm:ss
     */
    const formatTimeRemaining = () => {
        const minutes = Math.floor(timeRemaining.value / 60)
        const seconds = timeRemaining.value % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    // Lifecycle hooks
    onMounted(() => {
        if (authStore.isAuthenticated) {
            startMonitoring()
        }
    })

    onUnmounted(() => {
        stopMonitoring()
    })

    return {
        isWarningVisible,
        timeRemaining,
        formatTimeRemaining,
        extendSession,
        startMonitoring,
        stopMonitoring,
        resetTimer
    }
}
