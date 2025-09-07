<template>
  <div 
    v-if="isVisible" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-center mb-6">
        <div class="bg-yellow-100 p-3 rounded-full">
          <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      
      <!-- Título -->
      <h3 class="text-xl font-semibold text-gray-900 text-center mb-4">
        Sesión a punto de expirar
      </h3>
      
      <!-- Mensaje -->
      <p class="text-gray-600 text-center mb-6">
        Su sesión se cerrará automáticamente en:
      </p>
      
      <!-- Countdown -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
          <span class="text-2xl font-bold text-red-600">
            {{ formatTimeRemaining() }}
          </span>
        </div>
      </div>
      
      <!-- Información adicional -->
      <p class="text-sm text-gray-600 text-center">
        Mueva el mouse, haga click o presione cualquier tecla para continuar su sesión
      </p>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  formatTimeRemaining: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
/* Animaciones */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bg-white {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
