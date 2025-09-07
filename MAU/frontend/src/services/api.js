import axios from 'axios'
import { useToast } from 'vue-toastification'

// Crear instancia de axios
const api = axios.create({
    baseURL: '/mau/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Interceptor para requests
api.interceptors.request.use(
    (config) => {
        // Validar que la URL no contenga 'undefined'
        if (config.url && config.url.includes('undefined')) {
            return Promise.reject(new Error('URL malformada: contiene undefined'))
        }

        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor para responses
api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const toast = useToast()
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                if (refreshToken) {
                    const response = await axios.post(
                        '/mau/api/auth/refresh/',
                        { refresh: refreshToken }
                    )

                    const newAccessToken = response.data.access
                    localStorage.setItem('access_token', newAccessToken)

                    // Actualizar header y reintentar request original
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                // Si el refresh falla, limpiar tokens y redirigir a login
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/mau/login'
                return Promise.reject(refreshError)
            }
        }

        // Manejar errores comunes
        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 400:
                    toast.error(data.detail || 'Datos inválidos')
                    break
                case 403:
                    toast.error('No tienes permisos para realizar esta acción')
                    break
                case 404:
                    toast.error('Recurso no encontrado')
                    break
                case 500:
                    toast.error('Error interno del servidor')
                    break
                default:
                    toast.error('Error inesperado')
            }
        } else if (error.request) {
            toast.error('Error de conexión')
        } else {
            toast.error('Error inesperado')
        }

        return Promise.reject(error)
    }
)

export default api
