import api from './api'

export const movementsService = {
    // Obtener lista de movimientos con filtros
    async getMovements(params = {}) {
        const response = await api.get('/movements/', { params })
        return response.data
    },

    // Obtener movimientos por entidad
    async getMovementsByEntity(entityType, entityId) {
        const response = await api.get(`/movements/entity/${entityType}/${entityId}/`)
        return response.data
    },

    // Obtener movimientos por usuario
    async getMovementsByUser(userId) {
        const response = await api.get(`/movements/user/${userId}/`)
        return response.data
    },

    // Obtener movimientos por rango de fechas
    async getMovementsByDateRange(startDate, endDate, params = {}) {
        const response = await api.get('/movements/date-range/', {
            params: {
                start_date: startDate,
                end_date: endDate,
                ...params
            }
        })
        return response.data
    },

    // Obtener estadísticas de movimientos
    async getMovementStats(params = {}) {
        const response = await api.get('/movements/stats/', { params })
        return response.data
    },

    // Exportar movimientos a CSV
    async exportMovementsToCSV(params = {}) {
        const response = await api.get('/movements/export/csv/', {
            params,
            responseType: 'blob'
        })
        return response.data
    },

    // Exportar movimientos a Excel
    async exportMovementsToExcel(params = {}) {
        const response = await api.get('/movements/export/excel/', {
            params,
            responseType: 'blob'
        })
        return response.data
    },

    // Obtener tipos de entidades disponibles
    async getEntityTypes() {
        const response = await api.get('/movements/entity-types/')
        return response.data
    },

    // Obtener tipos de acciones disponibles
    async getActionTypes() {
        const response = await api.get('/movements/action-types/')
        return response.data
    },

    // Crear un nuevo registro de movimiento (para logging automático)
    async createMovement(movementData) {
        const response = await api.post('/movements/', movementData)
        return response.data
    },

    // Obtener movimientos en tiempo real (para websockets en el futuro)
    async getRealTimeMovements() {
        const response = await api.get('/movements/realtime/')
        return response.data
    }
}

export default movementsService
