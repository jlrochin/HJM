import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importar vistas
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import AtencionUsuario from '@/views/AtencionUsuario.vue'
import Validacion from '@/views/Validacion.vue'
import Farmacia from '@/views/Farmacia.vue'
import CMI from '@/views/CMI.vue'
import Prescripcion from '@/views/Prescripcion.vue'
import RecetasCompletadas from '@/views/RecetasCompletadas.vue'
import Reportes from '@/views/Reportes.vue'
import Inventario from '@/views/Inventario.vue'
import Notificaciones from '@/views/Notificaciones.vue'
import Auditoria from '@/views/Auditoria.vue'
import RegistroMovimientos from '@/views/RegistroMovimientos.vue'

const routes = [
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/atencion-usuario',
        name: 'atencion-usuario',
        component: AtencionUsuario,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['create_patients', 'edit_patients']
        }
    },
    {
        path: '/validacion',
        name: 'validacion',
        component: Validacion,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['validate_recipes']
        }
    },
    {
        path: '/farmacia',
        name: 'farmacia',
        component: Farmacia,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['dispense_pharmacy']
        }
    },
    {
        path: '/cmi',
        name: 'cmi',
        component: CMI,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['dispense_cmi']
        }
    },
    {
        path: '/prescripcion',
        name: 'prescripcion',
        component: Prescripcion,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['create_recipes']
        }
    },
    {
        path: '/recetas-completadas',
        name: 'recetas-completadas',
        component: RecetasCompletadas,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['validate_recipes', 'dispense_pharmacy', 'dispense_cmi']
        }
    },
    {
        path: '/reportes',
        name: 'reportes',
        component: Reportes,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['validate_recipes'] // Admin o roles que pueden validar
        }
    },
    {
        path: '/inventario',
        name: 'inventario',
        component: Inventario,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['dispense_pharmacy'] // Admin o farmacia
        }
    },
    {
        path: '/notificaciones',
        name: 'notificaciones',
        component: Notificaciones,
        meta: {
            requiresAuth: true,
            requiredPermissions: ['validate_recipes', 'dispense_pharmacy', 'dispense_cmi']
        }
    },
    {
        path: '/auditoria',
        name: 'auditoria',
        component: Auditoria,
        meta: {
            requiresAuth: true,
            adminOnly: true // Solo para administradores
        }
    },
    {
        path: '/registro-movimientos',
        name: 'registro-movimientos',
        component: RegistroMovimientos,
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Guard de navegación
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Inicializar auth si es necesario
    if (!authStore.isAuthenticated && localStorage.getItem('access_token')) {
        try {
            await authStore.initializeAuth()
        } catch (error) {
            console.error('Error initializing auth:', error)
        }
    }

    // Verificar autenticación
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
        return
    }

    // Si ya está autenticado y va a login, redirigir al dashboard
    if (to.name === 'login' && authStore.isAuthenticated) {
        next('/')
        return
    }

    // Verificar si requiere ser admin
    if (to.meta.adminOnly && authStore.isAuthenticated) {
        if (authStore.userRole !== 'ADMIN') {
            next('/')
            return
        }
    }

    // Verificar permisos específicos
    if (to.meta.requiredPermissions && authStore.isAuthenticated) {
        const hasRequiredPermission = to.meta.requiredPermissions.some(
            permission => authStore.hasPermission(permission)
        )

        if (!hasRequiredPermission) {
            next('/')
            return
        }
    }

    next()
})

export default router
