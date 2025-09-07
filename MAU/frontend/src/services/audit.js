import api from './api'

export const auditService = {
  /**
   * Obtener todos los registros de auditoría
   */
  async getAuditLogs(params = {}) {
    try {
      const response = await api.get('/audit/', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas de auditoría
   */
  async getAuditStats() {
    try {
      const response = await api.get('/audit/stats/')
      return response.data
    } catch (error) {
      console.error('Error fetching audit stats:', error)
      throw error
    }
  },

  /**
   * Obtener resumen de auditoría
   */
  async getAuditSummary() {
    try {
      const response = await api.get('/audit/summary/')
      return response.data
    } catch (error) {
      console.error('Error fetching audit summary:', error)
      throw error
    }
  },

  /**
   * Exportar registros de auditoría
   */
  async exportAuditLogs(params = {}) {
    try {
      const response = await api.get('/audit/export/', { params })
      return response.data
    } catch (error) {
      console.error('Error exporting audit logs:', error)
      throw error
    }
  }
}
