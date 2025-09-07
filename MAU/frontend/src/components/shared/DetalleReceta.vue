<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-background-card rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="sticky-header">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-secondary-900">
              Detalle de Receta #{{ recipe.folio_receta }}
            </h2>
            <button
              @click="$emit('close')"
              class="text-secondary-400 hover:text-secondary-600"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido scrolleable -->
      <div class="scrollable-content p-6">
        <!-- Información de la receta -->
        <div class="card mb-6">
          <div class="card-header">
            <h3 class="text-lg font-medium text-secondary-900">
              Información General
            </h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 class="font-medium text-secondary-900 mb-2">Paciente</h4>
                <div class="text-sm text-secondary-600 space-y-1">
                  <div>
                    <span class="font-medium">Nombre(s):</span> {{ recipe.paciente_info?.nombre }}
                  </div>
                  <div>
                    <span class="font-medium">Apellido Paterno:</span> {{ recipe.paciente_info?.apellido_paterno }}
                  </div>
                  <div>
                    <span class="font-medium">Apellido Materno:</span> {{ recipe.paciente_info?.apellido_materno || 'N/A' }}
                  </div>
                </div>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Expediente:</span> {{ recipe.paciente_info?.expediente }}
                </p>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">CURP:</span> {{ recipe.paciente_info?.curp }}
                </p>
              </div>

              <div>
                <h4 class="font-medium text-secondary-900 mb-2">Receta</h4>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Folio:</span> {{ recipe.folio_receta }}
                </p>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Tipo:</span> 
                  <span class="badge ml-1" :class="getTypeClass(recipe.tipo_receta)">
                    {{ recipe.tipo_receta }}
                  </span>
                </p>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Estado:</span>
                  <span class="badge ml-1" :class="getStatusClass(recipe.estado)">
                    {{ recipe.estado }}
                  </span>
                </p>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Prioridad:</span>
                  <span class="badge ml-1" :class="getPriorityClass(recipe.prioridad)">
                    {{ recipe.prioridad }}
                  </span>
                </p>
              </div>

              <div>
                <h4 class="font-medium text-secondary-900 mb-2">Servicio</h4>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Solicitante:</span> {{ recipe.servicio_solicitante }}
                </p>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Prescrito por:</span> {{ recipe.prescrito_por_name }}
                </p>
                <p class="text-sm text-secondary-600">
                  <span class="font-medium">Fecha:</span> {{ formatDate(recipe.fecha_creacion) }}
                </p>
                <p v-if="recipe.fecha_vencimiento" class="text-sm text-secondary-600">
                  <span class="font-medium">Vence:</span> {{ formatDate(recipe.fecha_vencimiento) }}
                </p>
              </div>
            </div>

            <!-- Diagnóstico -->
            <div class="mt-4">
              <h4 class="font-medium text-secondary-900 mb-2">Diagnóstico</h4>
              <p class="text-sm text-secondary-600 bg-gray-50 p-3 rounded">
                {{ recipe.diagnostico }}
              </p>
            </div>

            <!-- Indicaciones generales -->
            <div v-if="recipe.indicaciones_generales" class="mt-4">
              <h4 class="font-medium text-secondary-900 mb-2">Indicaciones Generales</h4>
              <p class="text-sm text-secondary-600 bg-blue-50 p-3 rounded">
                {{ recipe.indicaciones_generales }}
              </p>
            </div>
          </div>
        </div>

        <!-- Medicamentos -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-medium text-secondary-900">
              Medicamentos ({{ recipe.detalles?.length || 0 }})
            </h3>
          </div>
          <div class="card-body">
            <div v-if="!recipe.detalles || recipe.detalles.length === 0" class="text-center py-8">
              <DocumentTextIcon class="mx-auto h-12 w-12 text-secondary-400" />
              <h3 class="mt-2 text-lg font-medium text-secondary-900">Sin medicamentos</h3>
              <p class="mt-1 text-secondary-600">
                Esta receta no tiene medicamentos registrados.
              </p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(medicamento, index) in recipe.detalles"
                :key="medicamento.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h4 class="font-medium text-secondary-900">
                      {{ medicamento.descripcion_medicamento }}
                    </h4>
                    <p class="text-sm text-secondary-600">
                      <span class="font-medium">Clave:</span> {{ medicamento.clave_medicamento }}
                    </p>
                  </div>
                  
                  <div class="text-right">
                    <span class="text-sm font-medium text-secondary-900">
                      {{ medicamento.cantidad_prescrita }} {{ medicamento.unidad_medida }}
                    </span>
                    <p v-if="medicamento.cantidad_surtida > 0" class="text-xs text-success">
                      Surtido: {{ medicamento.cantidad_surtida }}
                    </p>
                  </div>
                </div>

                <!-- Información detallada del medicamento -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div v-if="medicamento.concentracion">
                    <span class="font-medium text-secondary-600">Concentración:</span>
                    <p class="text-secondary-900">{{ medicamento.concentracion }}</p>
                  </div>

                  <div v-if="medicamento.forma_farmaceutica">
                    <span class="font-medium text-secondary-600">Forma:</span>
                    <p class="text-secondary-900">{{ medicamento.forma_farmaceutica }}</p>
                  </div>

                  <div v-if="medicamento.via_administracion">
                    <span class="font-medium text-secondary-600">Vía:</span>
                    <p class="text-secondary-900">{{ medicamento.via_administracion }}</p>
                  </div>

                  <div>
                    <span class="font-medium text-secondary-600">Dosis:</span>
                    <p class="text-secondary-900">{{ medicamento.dosis }}</p>
                  </div>

                  <div v-if="medicamento.frecuencia">
                    <span class="font-medium text-secondary-600">Frecuencia:</span>
                    <p class="text-secondary-900">{{ medicamento.frecuencia }}</p>
                  </div>

                  <div v-if="medicamento.duracion_tratamiento">
                    <span class="font-medium text-secondary-600">Duración:</span>
                    <p class="text-secondary-900">{{ medicamento.duracion_tratamiento }}</p>
                  </div>
                </div>

                <!-- Información de dispensación -->
                <div v-if="medicamento.lote || medicamento.fecha_caducidad || medicamento.laboratorio" class="mt-3 pt-3 border-t border-gray-200">
                  <h5 class="font-medium text-secondary-900 mb-2">Información de Dispensación</h5>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div v-if="medicamento.lote">
                      <span class="font-medium text-secondary-600">Lote:</span>
                      <p class="text-secondary-900">{{ medicamento.lote }}</p>
                    </div>

                    <div v-if="medicamento.fecha_caducidad">
                      <span class="font-medium text-secondary-600">Caducidad:</span>
                      <p class="text-secondary-900">{{ formatDate(medicamento.fecha_caducidad) }}</p>
                    </div>

                    <div v-if="medicamento.laboratorio">
                      <span class="font-medium text-secondary-600">Laboratorio:</span>
                      <p class="text-secondary-900">{{ medicamento.laboratorio }}</p>
                    </div>
                  </div>
                </div>

                <!-- Progreso de dispensación -->
                <div v-if="medicamento.cantidad_prescrita > 0" class="mt-3">
                  <div class="flex justify-between text-sm text-secondary-600 mb-1">
                    <span>Progreso de dispensación</span>
                    <span>{{ medicamento.cantidad_surtida || 0 }} / {{ medicamento.cantidad_prescrita }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300"
                      :class="getProgressColor(medicamento)"
                      :style="{ width: getProgressPercentage(medicamento) + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- Observaciones del medicamento -->
                <div v-if="medicamento.observaciones" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <span class="font-medium text-secondary-600 text-xs">Observaciones:</span>
                  <p class="text-xs text-secondary-900">{{ medicamento.observaciones }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Observaciones generales -->
        <div v-if="recipe.observaciones" class="card mt-6">
          <div class="card-header">
            <h3 class="text-lg font-medium text-secondary-900">
              Observaciones Generales
            </h3>
          </div>
          <div class="card-body">
            <p class="text-sm text-secondary-600">{{ recipe.observaciones }}</p>
          </div>
        </div>

        <!-- Historial de estados -->
        <div class="card mt-6">
          <div class="card-header">
            <h3 class="text-lg font-medium text-secondary-900">
              Historial de Estados
            </h3>
          </div>
          <div class="card-body">
            <div class="space-y-2">
              <!-- Prescrita -->
              <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span class="text-sm font-medium">Prescrita</span>
                <span class="text-sm text-secondary-600">{{ formatDate(recipe.fecha_creacion) }}</span>
              </div>
              
              <!-- Validada -->
              <div v-if="recipe.fecha_validacion" class="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span class="text-sm font-medium">Validada</span>
                <span class="text-sm text-secondary-600">
                  {{ formatDate(recipe.fecha_validacion) }}
                  <span v-if="recipe.validado_por_name" class="block text-xs">
                    por {{ recipe.validado_por_name }}
                  </span>
                </span>
              </div>
              
              <!-- Historial de dispensaciones individuales -->
              <div v-for="evento in getEventosDispensacion()" :key="evento.id" class="rounded p-3 mb-2" :class="evento.tipoClase">
                <div class="flex justify-between items-start mb-2">
                  <span class="text-sm font-medium" :class="evento.textoClase">{{ evento.titulo }}</span>
                  <span class="text-sm text-secondary-600">
                    {{ formatDate(evento.fecha) }}
                    <span v-if="evento.usuario" class="block text-xs">
                      por {{ evento.usuario }}
                    </span>
                  </span>
                </div>
                
                <!-- Detalles del evento -->
                <div class="mt-2">
                  <div class="text-xs rounded px-2 py-1" :class="evento.detalleClase">
                    <div class="flex justify-between items-center">
                      <span class="font-medium">{{ evento.medicamento }}</span>
                      <span class="flex items-center">
                        <svg v-if="evento.completado" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {{ evento.cantidad }}
                      </span>
                    </div>
                    <div v-if="evento.lote" class="mt-1 opacity-80">
                      <span class="font-medium">Lote:</span> {{ evento.lote }}
                      <span v-if="evento.caducidad" class="ml-2">
                        <span class="font-medium">Caducidad:</span> {{ evento.caducidad }}
                      </span>
                    </div>
                    <div v-if="evento.observaciones" class="mt-1 opacity-80">
                      <span class="font-medium">Observaciones:</span> {{ evento.observaciones }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Completamente Dispensada (evento final) -->
              <div v-if="recipe.fecha_dispensacion" class="bg-green-50 rounded p-3">
                <div class="flex justify-between items-start">
                  <span class="text-sm font-medium text-green-800 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Receta Completamente Dispensada
                  </span>
                  <span class="text-sm text-secondary-600">
                    {{ formatDate(recipe.fecha_dispensacion) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con botón de cerrar -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex justify-end">
          <button
            @click="$emit('close')"
            class="btn-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'DetalleReceta',
  components: {
    XMarkIcon,
    DocumentTextIcon
  },
  props: {
    recipe: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const getStatusClass = (status) => {
      const classes = {
        'PENDIENTE': 'status-pendiente',
        'VALIDADA': 'status-validada',
        'PARCIALMENTE_SURTIDA': 'status-parcialmente-surtida',
        'SURTIDA': 'status-surtida',
        'CANCELADA': 'status-cancelada'
      }
      return classes[status] || 'bg-gray-500 text-white'
    }
    
    const getTypeClass = (type) => {
      const classes = {
        'FARMACIA': 'bg-blue-500 text-white',
        'CMI': 'bg-purple-500 text-white'
      }
      return classes[type] || 'bg-gray-500 text-white'
    }
    
    const getPriorityClass = (priority) => {
      const classes = {
        'URGENTE': 'bg-accent-600 text-white',
        'ALTA': 'bg-orange-500 text-white',
        'MEDIA': 'bg-blue-500 text-white',
        'BAJA': 'bg-gray-500 text-white'
      }
      return classes[priority] || 'bg-gray-500 text-white'
    }
    
    const getProgressPercentage = (medicamento) => {
      if (!medicamento.cantidad_prescrita) return 0
      return Math.min(100, ((medicamento.cantidad_surtida || 0) / medicamento.cantidad_prescrita) * 100)
    }
    
    const getProgressColor = (medicamento) => {
      const percentage = getProgressPercentage(medicamento)
      if (percentage === 100) return 'bg-success'
      if (percentage > 50) return 'bg-blue-500'
      if (percentage > 0) return 'bg-warning'
      return 'bg-gray-300'
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      
      try {
        return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
      } catch (error) {
        return dateString
      }
    }
    
    // Función para generar eventos individuales de dispensación
    const getEventosDispensacion = () => {
      const eventos = []
      
      if (!props.recipe?.detalles) return eventos
      
      // Recopilar todos los eventos de dispensación
      props.recipe.detalles.forEach(medicamento => {
        // Eventos de lotes múltiples
        if (medicamento.lotes && medicamento.lotes.length > 0) {
          medicamento.lotes.forEach(lote => {
            const esCompleto = lote.cantidad_dispensada >= medicamento.cantidad_prescrita
            eventos.push({
              id: `lote-${lote.id}`,
              fecha: lote.fecha_dispensacion,
              usuario: lote.dispensado_por_name,
              titulo: esCompleto ? 'Medicamento Dispensado Completo' : 'Dispensación Parcial',
              medicamento: medicamento.descripcion_medicamento,
              cantidad: `${lote.cantidad_dispensada} / ${medicamento.cantidad_prescrita} ${medicamento.unidad_medida}`,
              lote: lote.numero_lote,
              caducidad: lote.fecha_caducidad ? formatDate(lote.fecha_caducidad).split(' ')[0] : null,
              observaciones: lote.observaciones,
              completado: esCompleto,
              tipoClase: esCompleto ? 'bg-green-50' : 'bg-orange-50',
              textoClase: esCompleto ? 'text-green-800' : 'text-orange-800',
              detalleClase: esCompleto ? 'bg-white bg-opacity-60' : 'bg-white bg-opacity-60'
            })
          })
        }
        // Evento de dispensación tradicional (sin lotes múltiples)
        else if (medicamento.cantidad_surtida > 0) {
          const esCompleto = medicamento.is_completely_dispensed
          // Usar la fecha de la receta como aproximación para dispensación tradicional
          const fechaDispensacion = props.recipe.fecha_dispensacion_parcial || props.recipe.updated_at
          
          eventos.push({
            id: `tradicional-${medicamento.id}`,
            fecha: fechaDispensacion,
            usuario: props.recipe.dispensado_por_name,
            titulo: esCompleto ? 'Medicamento Dispensado Completo' : 'Dispensación Parcial',
            medicamento: medicamento.descripcion_medicamento,
            cantidad: `${medicamento.cantidad_surtida} / ${medicamento.cantidad_prescrita} ${medicamento.unidad_medida}`,
            lote: medicamento.lote,
            caducidad: medicamento.fecha_caducidad ? formatDate(medicamento.fecha_caducidad).split(' ')[0] : null,
            observaciones: medicamento.observaciones,
            completado: esCompleto,
            tipoClase: esCompleto ? 'bg-green-50' : 'bg-orange-50',
            textoClase: esCompleto ? 'text-green-800' : 'text-orange-800',
            detalleClase: esCompleto ? 'bg-white bg-opacity-60' : 'bg-white bg-opacity-60'
          })
        }
      })
      
      // Ordenar eventos por fecha (más recientes primero)
      return eventos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    }
    
    return {
      getStatusClass,
      getTypeClass,
      getPriorityClass,
      getProgressPercentage,
      getProgressColor,
      formatDate,
      getEventosDispensacion
    }
  }
}
</script>
