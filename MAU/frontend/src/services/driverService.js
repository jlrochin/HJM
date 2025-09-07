import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

/**
 * Servicio para manejar tours guiados con Driver.js
 */
class DriverService {
    constructor() {
        this.driverInstance = null
        this.defaultConfig = {
            animate: true,
            smoothScroll: true,
            allowClose: false,
            overlayClickNext: false,
            doneBtnText: 'Finalizar Tour',
            closeBtnText: 'Cerrar',
            nextBtnText: 'Siguiente',
            prevBtnText: 'Anterior',
            showProgress: true,
            showButtons: ['next', 'previous'],
            popoverClass: 'driverjs-theme-mau',
            stagePadding: 10,
            stageRadius: 8,
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            onHighlightStarted: (element, step, options) => {
                console.log('Elemento resaltado:', element)
                // Desplazarse suavemente al elemento
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    })
                }
            },
            onHighlighted: (element, step, options) => {
                console.log('Elemento activo:', element)
            },
            onDeselected: (element, step, options) => {
                console.log('Elemento deseleccionado:', element)
            }
        }
    }

    /**
     * Inicializa una nueva instancia de Driver.js
     * @param {Object} config - Configuración personalizada
     * @returns {Object} - Instancia de Driver.js
     */
    createDriver(config = {}) {
        const finalConfig = { ...this.defaultConfig, ...config }
        this.driverInstance = driver(finalConfig)
        return this.driverInstance
    }

    /**
     * Inicia un tour guiado
     * @param {Array} steps - Pasos del tour
     * @param {Object} config - Configuración adicional
     */
    startTour(steps, config = {}) {
        const tourConfig = {
            ...config,
            steps: steps
        }

        const driverInstance = this.createDriver(tourConfig)
        driverInstance.drive()
    }

    /**
     * Resalta un elemento específico
     * @param {String} selector - Selector CSS del elemento
     * @param {Object} options - Opciones del popover
     */
    highlight(selector, options = {}) {
        const driverInstance = this.createDriver()
        driverInstance.highlight({
            element: selector,
            popover: {
                title: options.title || '',
                description: options.description || '',
                side: options.side || 'left',
                align: options.align || 'start'
            }
        })
    }

    /**
     * Tours predefinidos para el sistema hospitalario
     */
    tours = {
        // Tour de bienvenida para nuevos usuarios
        welcome: [
            {
                element: '[data-tour="dashboard"]',
                popover: {
                    title: 'Panel Principal',
                    description: 'Aquí puedes ver un resumen de todas las actividades del sistema.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="navigation"]',
                popover: {
                    title: 'Navegación',
                    description: 'Usa este menú para navegar entre las diferentes secciones del sistema.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="notifications"]',
                popover: {
                    title: 'Notificaciones',
                    description: 'Aquí verás notificaciones importantes sobre recetas y pacientes.',
                    side: 'bottom'
                }
            }
        ],

        // Tour para el módulo de recetas
        prescriptions: [
            {
                element: '[data-tour="prescription-list"]',
                popover: {
                    title: 'Lista de Recetas',
                    description: 'Aquí se muestran todas las recetas del sistema. Puedes filtrar y buscar.',
                    side: 'top'
                }
            },
            {
                element: '[data-tour="prescription-search"]',
                popover: {
                    title: 'Búsqueda',
                    description: 'Utiliza este campo para buscar recetas por paciente, médico o medicamento.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="prescription-filters"]',
                popover: {
                    title: 'Filtros',
                    description: 'Aplica filtros para encontrar recetas específicas por estado o fecha.',
                    side: 'left'
                }
            }
        ],

        // Tour para dispensación
        dispensing: [
            {
                element: '[data-tour="dispense-button"]',
                popover: {
                    title: 'Dispensar Medicamento',
                    description: 'Haz clic aquí para dispensar un medicamento al paciente.',
                    side: 'top'
                }
            },
            {
                element: '[data-tour="quantity-input"]',
                popover: {
                    title: 'Cantidad',
                    description: 'Ingresa la cantidad exacta a dispensar. No puede exceder la cantidad prescrita.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="progress-bar"]',
                popover: {
                    title: 'Progreso',
                    description: 'Esta barra muestra el progreso de dispensación de la receta.',
                    side: 'bottom'
                }
            }
        ],

        // Tour detallado para registrar nuevo paciente
        newPatient: [
            {
                element: '[data-tour="patient-form-header"]',
                popover: {
                    title: '',
                    description: '<strong>Registro de Nuevo Paciente</strong><br>Este formulario te permite registrar un nuevo paciente en el sistema. Vamos paso a paso para completarlo correctamente.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-expediente"]',
                popover: {
                    title: '',
                    description: '<strong>Número de Expediente</strong><br>Ingresa un número de expediente único para el paciente. Este será su identificador principal en el sistema.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-nombres"]',
                popover: {
                    title: '',
                    description: '<strong>Nombre del Paciente</strong><br>Ingresa el nombre o nombres del paciente. Es importante que coincidan exactamente con sus documentos oficiales.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-apellido-paterno"]',
                popover: {
                    title: '',
                    description: '<strong>Apellido Paterno</strong><br>Ingresa el apellido paterno del paciente tal como aparece en sus documentos oficiales.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-apellido-materno"]',
                popover: {
                    title: '',
                    description: '<strong>Apellido Materno</strong><br>Ingresa el apellido materno del paciente. Este campo es opcional pero recomendado para identificación completa.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-curp"]',
                popover: {
                    title: '',
                    description: '<strong>CURP del Paciente</strong><br>La CURP debe tener exactamente 18 caracteres. El sistema la convertirá automáticamente a mayúsculas.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-basic-info"]',
                popover: {
                    title: '',
                    description: '<strong>Información Básica</strong><br>Selecciona la fecha de nacimiento y género del paciente. Esta información es fundamental para el historial médico.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="patient-medical-section"]',
                popover: {
                    title: '',
                    description: '<strong>Información Médica</strong><br>Ahora vamos a la sección médica. Aquí registrarás la patología principal y códigos CIE-10 del paciente.',
                    side: 'top'
                }
            },
            {
                element: '[data-tour="patient-cie10-search"]',
                popover: {
                    title: '',
                    description: '<strong>Búsqueda de Código CIE-10</strong><br>Busca y selecciona el código CIE-10 correspondiente al diagnóstico. Puedes buscar por código o descripción.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-cie10-date"]',
                popover: {
                    title: '',
                    description: '<strong>Fecha de Diagnóstico</strong><br>Selecciona la fecha en que se realizó el diagnóstico. No puede ser una fecha futura.',
                    side: 'bottom'
                }
            },
            {
                element: '[data-tour="patient-cie10-principal"]',
                popover: {
                    title: '',
                    description: '<strong>Diagnóstico Principal</strong><br>Marca esta casilla si este es el diagnóstico principal del paciente. Solo puede haber uno principal.',
                    side: 'right'
                }
            },
            {
                element: '[data-tour="patient-cie10-add-btn"]',
                popover: {
                    title: '',
                    description: '<strong>Agregar Código</strong><br>Haz clic aquí para agregar el código CIE-10 a la lista del paciente. Puedes agregar múltiples códigos.',
                    side: 'top'
                }
            },
            {
                element: '[data-tour="patient-additional-info"]',
                popover: {
                    title: '',
                    description: '<strong>Información Adicional</strong><br>Completa información adicional como tipo de sangre, alergias y otros datos médicos relevantes.',
                    side: 'top'
                }
            },
            {
                element: '[data-tour="patient-contact-info"]',
                popover: {
                    title: '',
                    description: '<strong>Información de Contacto</strong><br>Registra los datos de contacto del paciente y de una persona en caso de emergencia.',
                    side: 'top'
                }
            },
            {
                element: '[data-tour="patient-insurance-info"]',
                popover: {
                    title: '',
                    description: '<strong>Información del Seguro</strong><br>Si el paciente tiene seguro médico, registra el número y la institución correspondiente.',
                    side: 'top'
                }
            },
            {
                element: '[data-tour="patient-form-actions"]',
                popover: {
                    title: '',
                    description: '<strong>Finalizar Registro</strong><br>¡Perfecto! Ya completaste todos los datos. Haz clic en "Crear Paciente" para guardarlo en el sistema.',
                    side: 'top'
                }
            }
        ]
    }

    /**
     * Inicia tour de bienvenida
     */
    startWelcomeTour() {
        this.startTour(this.tours.welcome, {
            onDestroyed: () => {
                console.log('Tour de bienvenida completado')
                // Marcar que el usuario ya vio el tour
                localStorage.setItem('welcomeTourCompleted', 'true')
            }
        })
    }

    /**
     * Inicia tour del módulo de recetas
     */
    startPrescriptionsTour() {
        this.startTour(this.tours.prescriptions)
    }

    /**
     * Inicia tour de dispensación
     */
    startDispensingTour() {
        this.startTour(this.tours.dispensing)
    }

    /**
     * Inicia tour de registro de nuevo paciente
     */
    startNewPatientTour() {
        this.startTour(this.tours.newPatient, {
            onDestroyed: () => {
                console.log('Tour de nuevo paciente completado')
                localStorage.setItem('newPatientTourCompleted', 'true')
            }
        })
    }

    /**
     * Verifica si el usuario ya completó el tour de bienvenida
     */
    hasCompletedWelcomeTour() {
        return localStorage.getItem('welcomeTourCompleted') === 'true'
    }

    /**
     * Limpia el estado del tour (útil para testing)
     */
    resetTourState() {
        localStorage.removeItem('welcomeTourCompleted')
    }

    /**
     * Destruye la instancia actual de Driver.js
     */
    destroy() {
        if (this.driverInstance) {
            this.driverInstance.destroy()
            this.driverInstance = null
        }
    }
}

// Instancia singleton
const driverService = new DriverService()

export default driverService
