import api from './api';

/**
 * Servicio para interactuar con la API del CIE-10
 */
export const cie10Service = {
    /**
     * Buscar códigos CIE-10 por código o nombre
     * @param {string} query - Término de búsqueda
     * @param {string} type - Tipo de búsqueda: 'auto', 'codigo', 'nombre'
     * @returns {Promise} - Resultados de la búsqueda
     */
    async buscar(query, type = 'auto') {
        try {
            const response = await api.get('/patients/cie10/buscar/', {
                params: { q: query, type }
            });
            return response.data;
        } catch (error) {
            console.error('Error al buscar CIE-10:', error);
            throw error;
        }
    },

    /**
     * Obtener información completa de un código CIE-10
     * @param {string} codigo - Código CIE-10
     * @returns {Promise} - Información completa del código
     */
    async obtenerCompleto(codigo) {
        try {
            const response = await api.get(`/patients/cie10/${codigo}/`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener CIE-10 completo:', error);
            throw error;
        }
    },

    /**
     * Buscar por código específico
     * @param {string} codigo - Código CIE-10
     * @returns {Promise} - Resultados de la búsqueda
     */
    async buscarPorCodigo(codigo) {
        return this.buscar(codigo, 'codigo');
    },

    /**
     * Buscar por nombre/descripción
     * @param {string} nombre - Nombre o descripción
     * @returns {Promise} - Resultados de la búsqueda
     */
    async buscarPorNombre(nombre) {
        return this.buscar(nombre, 'nombre');
    },

    /**
     * Búsqueda inteligente que detecta automáticamente si es código o nombre
     * @param {string} query - Término de búsqueda
     * @returns {Promise} - Resultados de la búsqueda
     */
    async busquedaInteligente(query) {
        return this.buscar(query, 'auto');
    },

    /**
     * Obtener estadísticas del catálogo CIE-10
     * @returns {Promise} - Estadísticas del catálogo
     */
    async obtenerEstadisticas() {
        try {
            const response = await api.get('/patients/cie10/estadisticas/');
            return response.data;
        } catch (error) {
            console.error('Error al obtener estadísticas CIE-10:', error);
            throw error;
        }
    }
};

export default cie10Service;
