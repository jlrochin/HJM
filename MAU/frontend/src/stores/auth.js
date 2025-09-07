import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    // Estado
    const user = ref(null)
    const tokens = ref({
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token')
    })
    const isLoading = ref(false)

    // Estado para simulación de roles (solo para admin)
    const simulatedRole = ref(null)
    const isSimulating = ref(false)

    // Getters computados
    const isAuthenticated = computed(() => {
        return !!tokens.value.access && !!user.value
    })

    const userRole = computed(() => {
        return user.value?.role || null
    })

    const effectiveRole = computed(() => {
        // Si es admin y está simulando, usar el rol simulado
        if (user.value?.role === 'ADMIN' && isSimulating.value && simulatedRole.value) {
            return simulatedRole.value
        }
        return user.value?.role || null
    })

    const canCreatePatients = computed(() => {
        return effectiveRole.value === 'ATENCION_USUARIO' || effectiveRole.value === 'ADMIN'
    })

    const canEditPatients = computed(() => {
        return effectiveRole.value === 'ATENCION_USUARIO' || effectiveRole.value === 'ADMIN'
    })

    const canValidateRecipes = computed(() => {
        return effectiveRole.value === 'ATENCION_USUARIO' || effectiveRole.value === 'ADMIN'
    })

    const canDispensePharmacy = computed(() => {
        return effectiveRole.value === 'FARMACIA' || effectiveRole.value === 'ADMIN'
    })

    const canDispenseCMI = computed(() => {
        return effectiveRole.value === 'CMI' || effectiveRole.value === 'ADMIN'
    })

    const canCreateRecipes = computed(() => {
        return ['MEDICO', 'ATENCION_USUARIO', 'ADMIN'].includes(effectiveRole.value)
    })

    // Acciones
    const login = async (credentials) => {
        try {
            isLoading.value = true
            const response = await api.post('/auth/login/', credentials)

            const { user: userData, tokens: userTokens } = response.data

            // Guardar en estado
            user.value = userData
            tokens.value = userTokens

            // Guardar en localStorage
            localStorage.setItem('access_token', userTokens.access)
            localStorage.setItem('refresh_token', userTokens.refresh)

            // Configurar token en api
            api.defaults.headers.common['Authorization'] = `Bearer ${userTokens.access}`

            return { success: true, user: userData }
        } catch (error) {
            console.error('Error en login:', error)
            return {
                success: false,
                error: error.response?.data?.detail || 'Error de autenticación'
            }
        } finally {
            isLoading.value = false
        }
    }

    const logout = () => {
        // Limpiar estado
        user.value = null
        tokens.value = { access: null, refresh: null }

        // Limpiar simulación
        simulatedRole.value = null
        isSimulating.value = false

        // Limpiar localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // Limpiar header de autorización
        delete api.defaults.headers.common['Authorization']
    }

    const refreshToken = async () => {
        try {
            if (!tokens.value.refresh) {
                throw new Error('No refresh token available')
            }

            const response = await api.post('/auth/refresh/', {
                refresh: tokens.value.refresh
            })

            const newAccessToken = response.data.access
            tokens.value.access = newAccessToken
            localStorage.setItem('access_token', newAccessToken)
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`

            return true
        } catch (error) {
            console.error('Error refreshing token:', error)
            logout()
            return false
        }
    }

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile/')
            user.value = response.data
            return response.data
        } catch (error) {
            console.error('Error fetching profile:', error)
            if (error.response?.status === 401) {
                logout()
            }
            throw error
        }
    }

    const updateProfile = async (profileData) => {
        try {
            const response = await api.patch('/auth/profile/update/', profileData)
            user.value = response.data
            return { success: true, data: response.data }
        } catch (error) {
            console.error('Error updating profile:', error)
            return {
                success: false,
                error: error.response?.data || 'Error al actualizar perfil'
            }
        }
    }

    const initializeAuth = async () => {
        const accessToken = localStorage.getItem('access_token')

        if (accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            tokens.value.access = accessToken

            try {
                await fetchProfile()
            } catch (error) {
                // Si falla, intentar refresh
                const refreshSuccess = await refreshToken()
                if (refreshSuccess) {
                    await fetchProfile()
                }
            }
        }
    }

    // Verificar permisos específicos
    const hasPermission = (permission) => {
        const permissions = {
            'create_patients': canCreatePatients.value,
            'edit_patients': canEditPatients.value,
            'validate_recipes': canValidateRecipes.value,
            'dispense_pharmacy': canDispensePharmacy.value,
            'dispense_cmi': canDispenseCMI.value,
            'create_recipes': canCreateRecipes.value
        }

        return permissions[permission] || false
    }

    // Obtener rutas disponibles según rol
    const getAvailableRoutes = () => {
        const routes = []

        if (canCreatePatients.value || canEditPatients.value) {
            routes.push({
                name: 'atencion-usuario',
                title: 'Atención al Usuario',
                icon: 'UserGroupIcon'
            })
        }

        if (canValidateRecipes.value) {
            routes.push({
                name: 'validacion',
                title: 'Validación de Recetas',
                icon: 'ClipboardDocumentCheckIcon'
            })
        }

        if (canDispensePharmacy.value) {
            routes.push({
                name: 'farmacia',
                title: 'Farmacia',
                icon: 'BeakerIcon'
            })
        }

        if (canDispenseCMI.value) {
            routes.push({
                name: 'cmi',
                title: 'Centro de Mezclas',
                icon: 'FlaskConicalIcon'
            })
        }

        if (canCreateRecipes.value) {
            routes.push({
                name: 'prescripcion',
                title: 'Prescripción',
                icon: 'DocumentTextIcon'
            })
        }

        // Recetas completadas - disponible para todos los roles que pueden dispensar o validar
        if (canValidateRecipes.value || canDispensePharmacy.value || canDispenseCMI.value) {
            routes.push({
                name: 'recetas-completadas',
                title: 'Recetas Completadas',
                icon: 'CheckCircleIcon'
            })
        }

        // Nuevas funcionalidades avanzadas (disponibles para admin y algunos roles específicos)
        if (effectiveRole.value === 'ADMIN' || canValidateRecipes.value) {
            routes.push({
                name: 'reportes',
                title: 'Reportes y Estadísticas',
                icon: 'ChartBarIcon'
            })
        }

        if (effectiveRole.value === 'ADMIN' || canValidateRecipes.value) {
            routes.push({
                name: 'registro-movimientos',
                title: 'Registro de Movimientos',
                icon: 'DocumentTextIcon'
            })
        }

        if (effectiveRole.value === 'ADMIN' || canDispensePharmacy.value) {
            routes.push({
                name: 'inventario',
                title: 'Gestión de Inventario',
                icon: 'CubeIcon'
            })
        }

        if (effectiveRole.value === 'ADMIN') {
            routes.push({
                name: 'auditoria',
                title: 'Auditoría Avanzada',
                icon: 'ShieldCheckIcon'
            })
        }

        if (effectiveRole.value === 'ADMIN' || canValidateRecipes.value || canDispensePharmacy.value || canDispenseCMI.value) {
            routes.push({
                name: 'notificaciones',
                title: 'Centro de Notificaciones',
                icon: 'BellIcon'
            })
        }

        return routes
    }

    // Acciones para simulación de roles (solo admin)
    const setSimulatedRole = (role) => {
        if (user.value?.role === 'ADMIN') {
            simulatedRole.value = role
            isSimulating.value = true
        }
    }

    const clearSimulatedRole = () => {
        simulatedRole.value = null
        isSimulating.value = false
    }

    return {
        // Estado
        user,
        tokens,
        isLoading,
        simulatedRole,
        isSimulating,
        // Getters
        isAuthenticated,
        userRole,
        effectiveRole,
        canCreatePatients,
        canEditPatients,
        canValidateRecipes,
        canDispensePharmacy,
        canDispenseCMI,
        canCreateRecipes,
        // Acciones
        login,
        logout,
        refreshToken,
        fetchProfile,
        updateProfile,
        initializeAuth,
        hasPermission,
        getAvailableRoutes,
        setSimulatedRole,
        clearSimulatedRole
    }
})
