<template>
  <div class="min-h-screen bg-background-main">
    <!-- Header sticky -->
    <header class="sticky-header">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="$router.go(-1)"
              class="flex items-center text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ArrowLeftIcon class="h-5 w-5 mr-2" />
              Volver
            </button>
            <h1 class="text-xl font-bold text-secondary-900">
              📦 Gestión de Inventario
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="showAddMedicationModal = true"
              class="btn-primary text-sm"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Agregar Medicamento
            </button>
            <button
              @click="refreshInventory"
              :disabled="isLoading"
              class="btn-secondary text-sm"
            >
              <ArrowPathIcon class="h-4 w-4 mr-2" :class="{ 'animate-spin': isLoading }" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="scrollable-content p-6">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Filtros y búsqueda -->
        <div class="card">
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Buscar medicamento
                </label>
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Nombre o clave..."
                  class="form-input w-full"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Categoría
                </label>
                <select v-model="selectedCategory" class="form-select w-full">
                  <option value="">Todas las categorías</option>
                  <option value="ANALGESICO">Analgésico</option>
                  <option value="ANTIBIOTICO">Antibiótico</option>
                  <option value="CARDIOVASCULAR">Cardiovascular</option>
                  <option value="ENDOCRINO">Endócrino</option>
                  <option value="NEUROLOGICO">Neurológico</option>
                  <option value="ONCOLOGICO">Oncológico</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Estado de stock
                </label>
                <select v-model="stockFilter" class="form-select w-full">
                  <option value="">Todos</option>
                  <option value="normal">Stock normal</option>
                  <option value="bajo">Stock bajo</option>
                  <option value="agotado">Sin stock</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Acción
                </label>
                <button
                  @click="clearFilters"
                  class="btn-secondary w-full"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen de inventario -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-blue-500 bg-opacity-20">
                  <CubeIcon class="h-6 w-6 text-blue-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Total Medicamentos</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ totalMedicamentos }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-success bg-opacity-20">
                  <CheckCircleIcon class="h-6 w-6 text-success" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">En Stock</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ medicamentosEnStock }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-warning bg-opacity-20">
                  <ExclamationTriangleIcon class="h-6 w-6 text-warning" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Stock Bajo</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ medicamentosStockBajo }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-lg bg-red-500 bg-opacity-20">
                  <XCircleIcon class="h-6 w-6 text-red-500" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-600">Sin Stock</p>
                  <p class="text-3xl font-bold text-secondary-900">{{ medicamentosAgotados }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de medicamentos -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-secondary-900">Inventario de Medicamentos</h3>
          </div>
          <div class="card-body p-0">
            <div v-if="isLoading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p class="mt-2 text-secondary-600">Cargando inventario...</p>
            </div>
            
            <div v-else-if="filteredMedicamentos.length === 0" class="p-8 text-center">
              <CubeIcon class="mx-auto h-12 w-12 text-secondary-400" />
              <h3 class="mt-2 text-lg font-medium text-secondary-900">Sin resultados</h3>
              <p class="mt-1 text-secondary-600">No se encontraron medicamentos con los filtros aplicados.</p>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-secondary-200">
                <thead class="bg-secondary-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Medicamento
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Stock Actual
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Stock Mínimo
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Costo Unitario
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-secondary-200">
                  <tr v-for="medicamento in filteredMedicamentos" :key="medicamento.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-secondary-900">
                          {{ medicamento.name }}
                        </div>
                        <div class="text-sm text-secondary-600">
                          {{ medicamento.code }}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ medicamento.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {{ medicamento.current_stock || 0 }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {{ medicamento.minimum_stock }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStockStatusClass(medicamento)"
                      >
                        {{ getStockStatusLabel(medicamento) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      ${{ medicamento.unit_cost }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        @click="editMedicamento(medicamento)"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        Editar
                      </button>
                      <button
                        @click="adjustStock(medicamento)"
                        class="text-green-600 hover:text-green-900"
                      >
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Modal para agregar medicamento -->
    <div v-if="showAddMedicationModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showAddMedicationModal = false"></div>
        
        <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-secondary-900">Agregar Nuevo Medicamento</h3>
          </div>
          
          <div class="px-6 py-4">
            <form @submit.prevent="addMedicamento" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Nombre del Medicamento
                </label>
                <input
                  v-model="newMedicamento.name"
                  type="text"
                  required
                  class="form-input w-full"
                  placeholder="Ej. Paracetamol 500mg"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Código
                </label>
                <input
                  v-model="newMedicamento.code"
                  type="text"
                  required
                  class="form-input w-full"
                  placeholder="Ej. PAR-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-secondary-700 mb-2">
                  Categoría
                </label>
                <select v-model="newMedicamento.category" required class="form-select w-full">
                  <option value="">Seleccionar categoría</option>
                  <option value="ANALGESICO">Analgésico</option>
                  <option value="ANTIBIOTICO">Antibiótico</option>
                  <option value="CARDIOVASCULAR">Cardiovascular</option>
                  <option value="ENDOCRINO">Endócrino</option>
                  <option value="NEUROLOGICO">Neurológico</option>
                  <option value="ONCOLOGICO">Oncológico</option>
                </select>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">
                    Stock Mínimo
                  </label>
                  <input
                    v-model.number="newMedicamento.minimum_stock"
                    type="number"
                    min="0"
                    required
                    class="form-input w-full"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-secondary-700 mb-2">
                    Costo Unitario
                  </label>
                  <input
                    v-model.number="newMedicamento.unit_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="form-input w-full"
                  >
                </div>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="showAddMedicationModal = false"
                  class="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="isAddingMedicamento"
                  class="btn-primary"
                >
                  {{ isAddingMedicamento ? 'Agregando...' : 'Agregar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PlusIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'Inventario',
  components: {
    ArrowLeftIcon,
    ArrowPathIcon,
    PlusIcon,
    CubeIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon
  },
  setup() {
    const toast = useToast()
    
    const medicamentos = ref([])
    const estadisticas = ref({})
    const isLoading = ref(false)
    const isAddingMedicamento = ref(false)
    const showAddMedicationModal = ref(false)
    
    // Filtros
    const searchTerm = ref('')
    const selectedCategory = ref('')
    const stockFilter = ref('')
    
    // Nuevo medicamento
    const newMedicamento = ref({
      name: '',
      code: '',
      category: '',
      minimum_stock: 10,
      unit_cost: 0
    })
    
    // Computed properties
    const filteredMedicamentos = computed(() => {
      let filtered = medicamentos.value
      
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(med => 
          med.name.toLowerCase().includes(term) || 
          med.code.toLowerCase().includes(term)
        )
      }
      
      if (selectedCategory.value) {
        filtered = filtered.filter(med => med.category === selectedCategory.value)
      }
      
      if (stockFilter.value) {
        filtered = filtered.filter(med => {
          const currentStock = med.current_stock || 0
          const minimumStock = med.minimum_stock || 0
          
          switch (stockFilter.value) {
            case 'normal':
              return currentStock > minimumStock
            case 'bajo':
              return currentStock <= minimumStock && currentStock > 0
            case 'agotado':
              return currentStock === 0
            default:
              return true
          }
        })
      }
      
      return filtered
    })
    
    const totalMedicamentos = computed(() => medicamentos.value.length)
    
    const medicamentosEnStock = computed(() => {
      return medicamentos.value.filter(med => (med.current_stock || 0) > 0).length
    })
    
    const medicamentosStockBajo = computed(() => {
      return medicamentos.value.filter(med => {
        const currentStock = med.current_stock || 0
        const minimumStock = med.minimum_stock || 0
        return currentStock <= minimumStock && currentStock > 0
      }).length
    })
    
    const medicamentosAgotados = computed(() => {
      return medicamentos.value.filter(med => (med.current_stock || 0) === 0).length
    })
    
    // Methods
    const getStockStatusClass = (medicamento) => {
      const currentStock = medicamento.current_stock || 0
      const minimumStock = medicamento.minimum_stock || 0
      
      if (currentStock === 0) {
        return 'bg-red-100 text-red-800'
      } else if (currentStock <= minimumStock) {
        return 'bg-yellow-100 text-yellow-800'
      } else {
        return 'bg-green-100 text-green-800'
      }
    }
    
    const getStockStatusLabel = (medicamento) => {
      const currentStock = medicamento.current_stock || 0
      const minimumStock = medicamento.minimum_stock || 0
      
      if (currentStock === 0) {
        return 'Sin stock'
      } else if (currentStock <= minimumStock) {
        return 'Stock bajo'
      } else {
        return 'Normal'
      }
    }
    
    const loadMedicamentos = async () => {
      try {
        isLoading.value = true
        // Usar API real de inventario
        const response = await api.get('/inventory/medicamentos/', {
          params: {
            search: searchTerm.value,
            categoria: selectedCategory.value,
            stock_filter: stockFilter.value
          }
        })
        
        medicamentos.value = response.data.medicamentos || []
        estadisticas.value = response.data.estadisticas || {}
      } catch (error) {
        console.error('Error loading medicamentos:', error)
        toast.error('Error al cargar los medicamentos')
      } finally {
        isLoading.value = false
      }
    }
    
    // Función temporal para generar datos de ejemplo
    const generateSampleMedicamentos = () => {
      const categories = ['ANALGESICO', 'ANTIBIOTICO', 'CARDIOVASCULAR', 'ENDOCRINO', 'NEUROLOGICO']
      const names = [
        'Paracetamol 500mg', 'Ibuprofeno 400mg', 'Amoxicilina 500mg', 'Losartán 50mg',
        'Metformina 850mg', 'Omeprazol 20mg', 'Diclofenaco 75mg', 'Captopril 25mg',
        'Atenolol 50mg', 'Furosemida 40mg', 'Clonazepam 2mg', 'Levotiroxina 100mcg'
      ]
      
      return names.map((name, index) => ({
        id: index + 1,
        name,
        code: `MED-${String(index + 1).padStart(3, '0')}`,
        category: categories[index % categories.length],
        current_stock: Math.floor(Math.random() * 200),
        minimum_stock: 20 + Math.floor(Math.random() * 30),
        unit_cost: (Math.random() * 100 + 10).toFixed(2)
      }))
    }
    
    const addMedicamento = async () => {
      try {
        isAddingMedicamento.value = true
        
        // Simular adición - aquí se conectaría con la API real
        const newId = Math.max(...medicamentos.value.map(m => m.id)) + 1
        medicamentos.value.push({
          ...newMedicamento.value,
          id: newId,
          current_stock: 0
        })
        
        toast.success('Medicamento agregado correctamente')
        showAddMedicationModal.value = false
        
        // Limpiar formulario
        newMedicamento.value = {
          name: '',
          code: '',
          category: '',
          minimum_stock: 10,
          unit_cost: 0
        }
      } catch (error) {
        console.error('Error adding medicamento:', error)
        toast.error('Error al agregar el medicamento')
      } finally {
        isAddingMedicamento.value = false
      }
    }
    
    const editMedicamento = (medicamento) => {
      toast.info('Función de edición en desarrollo')
    }
    
    const adjustStock = (medicamento) => {
      toast.info('Función de ajuste de stock en desarrollo')
    }
    
    const refreshInventory = () => {
      loadMedicamentos()
      toast.info('Actualizando inventario...')
    }
    
    const clearFilters = () => {
      searchTerm.value = ''
      selectedCategory.value = ''
      stockFilter.value = ''
    }
    
    onMounted(() => {
      loadMedicamentos()
    })
    
    return {
      medicamentos,
      filteredMedicamentos,
      isLoading,
      isAddingMedicamento,
      showAddMedicationModal,
      searchTerm,
      selectedCategory,
      stockFilter,
      newMedicamento,
      totalMedicamentos,
      medicamentosEnStock,
      medicamentosStockBajo,
      medicamentosAgotados,
      getStockStatusClass,
      getStockStatusLabel,
      addMedicamento,
      editMedicamento,
      adjustStock,
      refreshInventory,
      clearFilters
    }
  }
}
</script>
