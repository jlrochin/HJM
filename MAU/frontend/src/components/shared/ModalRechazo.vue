<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-background-card rounded-xl shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-secondary-900">
          Rechazar Receta #{{ recipe.folio_receta }}
        </h2>
      </div>

      <!-- Contenido -->
      <div class="p-6">
        <div class="mb-4">
          <ExclamationTriangleIcon class="mx-auto h-12 w-12 text-accent-600" />
          <h3 class="mt-2 text-lg font-medium text-secondary-900 text-center">
            ¿Está seguro de rechazar esta receta?
          </h3>
          <p class="mt-1 text-sm text-secondary-600 text-center">
            Esta acción cambiará el estado de la receta a "CANCELADA" y no podrá ser revertida.
          </p>
        </div>

        <div class="mb-4">
          <label class="form-label">
            Motivo del rechazo *
          </label>
          <textarea
            v-model="motivoRechazo"
            class="form-input"
            :class="{ 'border-accent-500': !motivoRechazo.trim() && showError }"
            rows="3"
            placeholder="Describa el motivo por el cual se rechaza esta receta..."
          ></textarea>
          <p v-if="!motivoRechazo.trim() && showError" class="form-error">
            El motivo del rechazo es requerido
          </p>
        </div>

        <!-- Información de la receta -->
        <div class="bg-gray-50 p-3 rounded mb-4">
          <p class="text-sm text-secondary-600">
            <span class="font-medium">Paciente:</span> 
            {{ recipe.paciente_info?.nombre }} {{ recipe.paciente_info?.apellido_paterno }} {{ recipe.paciente_info?.apellido_materno || '' }}
          </p>
          <p class="text-sm text-secondary-600">
            <span class="font-medium">Servicio:</span> {{ recipe.servicio_solicitante }}
          </p>
          <p class="text-sm text-secondary-600">
            <span class="font-medium">Prescrito por:</span> {{ recipe.prescrito_por_name }}
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="flex justify-end space-x-4">
          <button
            @click="$emit('close')"
            class="btn-secondary"
            :disabled="isSubmitting"
          >
            Cancelar
          </button>
          <button
            @click="confirmReject"
            :disabled="isSubmitting"
            class="btn-accent"
          >
            <span v-if="isSubmitting">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Rechazando...
            </span>
            <span v-else>
              Confirmar Rechazo
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import {
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'ModalRechazo',
  components: {
    ExclamationTriangleIcon
  },
  props: {
    recipe: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'confirmed'],
  setup(props, { emit }) {
    const toast = useToast()
    
    const motivoRechazo = ref('')
    const isSubmitting = ref(false)
    const showError = ref(false)
    
    const confirmReject = async () => {
      if (!motivoRechazo.value.trim()) {
        showError.value = true
        toast.error('El motivo del rechazo es requerido')
        return
      }
      
      try {
        isSubmitting.value = true
        
        await api.post(`/recetas/${props.recipe.folio_receta}/actualizar-estado/`, {
          estado: 'CANCELADA',
          observaciones: `Receta rechazada: ${motivoRechazo.value}`
        })
        
        emit('confirmed', {
          ...props.recipe,
          estado: 'CANCELADA'
        })
        
        toast.success('Receta rechazada correctamente')
        
      } catch (error) {
        console.error('Error rejecting recipe:', error)
        toast.error('Error al rechazar la receta')
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      motivoRechazo,
      isSubmitting,
      showError,
      confirmReject
    }
  }
}
</script>
