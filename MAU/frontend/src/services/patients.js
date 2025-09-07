import api from './api'

export const patientsService = {
    // Obtener lista de pacientes con filtros
    async getPatients(params = {}) {
        const response = await api.get('/pacientes/', { params })
        return response.data
    },

    // Buscar paciente específico
    async searchPatient(query) {
        const response = await api.get('/pacientes/buscar/', {
            params: { q: query }
        })
        return response.data
    },

    // Obtener paciente por expediente
    async getPatientByExpediente(expediente) {
        if (!expediente) {
            throw new Error('Expediente es requerido')
        }
        const response = await api.get(`/pacientes/${expediente}/`)
        return response.data
    },

    // Crear nuevo paciente
    async createPatient(patientData) {
        const response = await api.post('/pacientes/', patientData)
        return response.data
    },

    // Actualizar paciente
    async updatePatient(expediente, patientData) {
        const response = await api.patch(`/pacientes/${expediente}/`, patientData)
        return response.data
    },

    // Eliminar paciente (marcar como inactivo)
    async deletePatient(expediente) {
        const response = await api.delete(`/pacientes/${expediente}/`)
        return response.data
    },

    // Verificar duplicados antes de crear
    async checkDuplicates(expediente, curp) {
        const params = {}
        if (expediente) params.expediente = expediente
        if (curp) params.curp = curp

        const response = await api.get('/pacientes/verificar-duplicados/', { params })
        return response.data
    },

    // Obtener historial del paciente
    async getPatientHistory(expediente) {
        const response = await api.get(`/pacientes/${expediente}/historial/`)
        return response.data
    },

    // Obtener estadísticas de pacientes
    async getPatientStats() {
        try {
            const response = await api.get('/pacientes/estadisticas/')
            return response.data
        } catch (error) {
            return {
                total: 0,
                nuevosHoy: 0,
                pendientes: 0
            }
        }
    },

    // Obtener códigos CIE-10
    async getCIE10Codes(params = {}) {
        const response = await api.get('/pacientes/cie10/', { params })
        return response.data
    },

    // Buscar códigos CIE-10
    async searchCIE10(query) {
        const response = await api.get('/pacientes/cie10/buscar/', {
            params: { q: query }
        })
        return response.data
    },

    // Obtener códigos CIE-10 aplicables para un paciente
    async getCIE10ForPatient(expediente) {
        const response = await api.get(`/pacientes/${expediente}/cie10-aplicables/`)
        return response.data
    },

    // ===== NUEVOS MÉTODOS PARA MÚLTIPLES CÓDIGOS CIE-10 =====

    // Obtener todos los códigos CIE-10 de un paciente
    async getPatientCIE10(expediente) {
        const response = await api.get(`/pacientes/${expediente}/cie10/`)
        return response.data
    },

    // Agregar un nuevo código CIE-10 a un paciente
    async addPatientCIE10(expediente, cie10Data) {
        const response = await api.post(`/pacientes/${expediente}/cie10/agregar/`, cie10Data)
        return response.data
    },

    // Actualizar un código CIE-10 existente
    async updatePatientCIE10(expediente, cie10Id, cie10Data) {
        const response = await api.put(`/pacientes/${expediente}/cie10/${cie10Id}/`, cie10Data)
        return response.data
    },

    // Eliminar un código CIE-10
    async deletePatientCIE10(expediente, cie10Id) {
        const response = await api.delete(`/pacientes/${expediente}/cie10/${cie10Id}/eliminar/`)
        return response.data
    },

    // Marcar un código CIE-10 como diagnóstico principal
    async markAsPrincipal(expediente, cie10Id) {
        const response = await api.post(`/pacientes/${expediente}/cie10/${cie10Id}/principal/`)
        return response.data
    },

    // Obtener estadísticas de códigos CIE-10 por pacientes
    async getCIE10PatientStats() {
        try {
            const response = await api.get('/pacientes/cie10/estadisticas-pacientes/')
            return response.data
        } catch (error) {
            return {
                total_pacientes_cie10: 0,
                total_codigos_asignados: 0,
                estadisticas_tipo: [],
                estadisticas_capitulo: [],
                codigos_frecuentes: []
            }
        }
    }
}

export default patientsService
