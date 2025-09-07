<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-main to-gray-200">
    <div class="max-w-md w-full space-y-8">
      <div class="card">
        <div class="card-header text-center">
          <h2 class="text-3xl font-bold text-secondary-900">
            MAU Hospital
          </h2>
          <p class="mt-2 text-sm text-secondary-600">
            Sistema de Gestión de Recetas
          </p>
        </div>
        
        <div class="card-body">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="username" class="form-label">
                Usuario
              </label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                class="form-input"
                placeholder="Ingresa tu usuario"
                :disabled="isLoading"
              />
              <p v-if="errors.username" class="form-error">
                {{ errors.username }}
              </p>
            </div>

            <div>
              <label for="password" class="form-label">
                Contraseña
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="form-input"
                placeholder="Ingresa tu contraseña"
                :disabled="isLoading"
              />
              <p v-if="errors.password" class="form-error">
                {{ errors.password }}
              </p>
            </div>

            <!-- reCAPTCHA eliminado -->

            <div v-if="loginError" class="text-center">
              <p class="form-error">{{ loginError }}</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary w-full flex items-center justify-center"
              :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
            >
              <svg
                v-if="isLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-xs text-secondary-600">
              Sistema desarrollado para MAU Hospital
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'Login',
  components: {},
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    
    const isLoading = ref(false)
    const loginError = ref('')
  // reCAPTCHA eliminado
    
    const form = reactive({
      username: '',
      password: ''
    })
    
    const errors = reactive({
      username: '',
      password: ''
    })
    
    const validateForm = () => {
      errors.username = ''
      errors.password = ''
      
      if (!form.username.trim()) {
        errors.username = 'El usuario es requerido'
        return false
      }
      
      if (!form.password.trim()) {
        errors.password = 'La contraseña es requerida'
        return false
      }
      
      if (form.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres'
        return false
      }
      
  // reCAPTCHA eliminado
      
      return true
    }
    
  // reCAPTCHA eliminado
    
    const handleSubmit = async () => {
      if (!validateForm()) return
      
      try {
        isLoading.value = true
        loginError.value = ''
        
        const loginData = {
          username: form.username,
          password: form.password
        }
        
        const result = await authStore.login(loginData)
        
        if (result.success) {
          toast.success(`¡Bienvenido, ${result.user.first_name}!`)
          router.push('/')
        } else {
          loginError.value = result.error
          // reCAPTCHA eliminado
        }
      } catch (error) {
        console.error('Error en login:', error)
        loginError.value = 'Error inesperado. Inténtalo de nuevo.'
  // reCAPTCHA eliminado
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      form,
      errors,
      isLoading,
      loginError,
      
      handleSubmit,
      
    }
  }
}
</script>
