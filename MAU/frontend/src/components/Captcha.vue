<template>
  <div class="recaptcha-container">
    <label class="form-label mb-2 block">
      Verificación de seguridad
    </label>
    
    <!-- reCAPTCHA v2 -->
    <div 
      id="recaptcha-container" 
      class="recaptcha-wrapper"
      :class="{ 'error': hasError }"
    >
      <div ref="recaptchaElement"></div>
    </div>
    
    <p v-if="hasError" class="form-error mt-1">
      Por favor, completa la verificación reCAPTCHA
    </p>
    
    <p v-if="isVerified" class="text-green-600 text-sm mt-1">
      ✓ Verificación completada correctamente
    </p>
    
    <!-- Fallback para desarrollo/testing -->
    <div v-if="showFallback" class="fallback-captcha mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-yellow-800 text-sm mb-2">
        <strong>Modo desarrollo:</strong> reCAPTCHA no disponible
      </p>
      <label class="flex items-center">
        <input 
          type="checkbox" 
          v-model="fallbackVerified"
          @change="onFallbackChange"
          class="mr-2"
        >
        <span class="text-sm">Soy humano (verificación de desarrollo)</span>
      </label>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'RecaptchaComponent',
  props: {
    siteKey: {
      type: String,
      default: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    },
    theme: {
      type: String,
      default: 'light',
      validator: (value) => ['light', 'dark'].includes(value)
    },
    size: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'compact'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['verified', 'expired', 'error'],
  setup(props, { emit }) {
    const recaptchaElement = ref(null)
    const isVerified = ref(false)
    const hasError = ref(false)
    const showFallback = ref(false)
    const fallbackVerified = ref(false)
    const recaptchaWidgetId = ref(null)
    
    // Cargar script de reCAPTCHA
    const loadRecaptchaScript = () => {
      return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (window.grecaptcha) {
          resolve(window.grecaptcha)
          return
        }
        
        // Crear script
        const script = document.createElement('script')
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit'
        script.async = true
        script.defer = true
        
        // Callback global para cuando se carga reCAPTCHA
        window.onRecaptchaLoad = () => {
          resolve(window.grecaptcha)
        }
        
        script.onerror = () => {
          console.warn('No se pudo cargar reCAPTCHA, usando modo fallback')
          showFallback.value = true
          reject(new Error('reCAPTCHA script failed to load'))
        }
        
        document.head.appendChild(script)
        
        // Timeout para fallback
        setTimeout(() => {
          if (!window.grecaptcha) {
            console.warn('reCAPTCHA timeout, usando modo fallback')
            showFallback.value = true
            reject(new Error('reCAPTCHA timeout'))
          }
        }, 10000)
      })
    }
    
    // Callback cuando reCAPTCHA es verificado
    const onRecaptchaVerify = (token) => {
      isVerified.value = true
      hasError.value = false
      emit('verified', token)
    }
    
    // Callback cuando reCAPTCHA expira
    const onRecaptchaExpire = () => {
      isVerified.value = false
      hasError.value = true
      emit('expired')
    }
    
    // Callback cuando hay error en reCAPTCHA
    const onRecaptchaError = () => {
      isVerified.value = false
      hasError.value = true
      emit('error')
    }
    
    // Manejar cambio en fallback
    const onFallbackChange = () => {
      if (fallbackVerified.value) {
        isVerified.value = true
        hasError.value = false
        emit('verified', 'fallback-token')
      } else {
        isVerified.value = false
        hasError.value = false
      }
    }
    
    // Renderizar reCAPTCHA
    const renderRecaptcha = async () => {
      try {
        const grecaptcha = await loadRecaptchaScript()
        
        if (recaptchaElement.value) {
          recaptchaWidgetId.value = grecaptcha.render(recaptchaElement.value, {
            sitekey: props.siteKey,
            theme: props.theme,
            size: props.size,
            callback: onRecaptchaVerify,
            'expired-callback': onRecaptchaExpire,
            'error-callback': onRecaptchaError
          })
        }
      } catch (error) {
        console.error('Error al renderizar reCAPTCHA:', error)
        showFallback.value = true
      }
    }
    
    // Reset reCAPTCHA
    const reset = () => {
      if (window.grecaptcha && recaptchaWidgetId.value !== null) {
        window.grecaptcha.reset(recaptchaWidgetId.value)
      }
      isVerified.value = false
      hasError.value = false
      fallbackVerified.value = false
    }
    
    // Obtener respuesta
    const getResponse = () => {
      if (showFallback.value) {
        return fallbackVerified.value ? 'fallback-token' : null
      }
      
      if (window.grecaptcha && recaptchaWidgetId.value !== null) {
        return window.grecaptcha.getResponse(recaptchaWidgetId.value)
      }
      
      return null
    }
    
    // Validar estado
    const validate = () => {
      const response = getResponse()
      hasError.value = !response
      return !!response
    }
    
    // Watch para cambios en disabled
    watch(() => props.disabled, (newValue) => {
      if (newValue) {
        reset()
      }
    })
    
    // Lifecycle
    onMounted(() => {
      renderRecaptcha()
    })
    
    onUnmounted(() => {
      // Cleanup
      if (window.onRecaptchaLoad) {
        delete window.onRecaptchaLoad
      }
    })
    
    return {
      recaptchaElement,
      isVerified,
      hasError,
      showFallback,
      fallbackVerified,
      onFallbackChange,
      reset,
      validate,
      getResponse
    }
  }
}
</script>

<style scoped>
.recaptcha-container {
  margin-bottom: 1rem;
}

.recaptcha-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.recaptcha-wrapper.error {
  border: 2px solid #ef4444;
  border-radius: 0.375rem;
  padding: 0.25rem;
}

.fallback-captcha {
  background-color: #fefce8;
  border: 1px solid #fde047;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.fallback-captcha input[type="checkbox"] {
  margin-right: 0.5rem;
}

/* Responsivo para reCAPTCHA */
@media (max-width: 640px) {
  .recaptcha-wrapper {
    transform: scale(0.85);
    transform-origin: center;
  }
}
</style>
