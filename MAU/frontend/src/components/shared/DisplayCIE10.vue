<template>
  <div v-if="code" class="inline-flex items-center space-x-2">
    <!-- Código CIE-10 -->
    <span class="font-mono text-sm font-bold text-primary-600 bg-white px-2 py-1 rounded-xl border border-primary-100 shadow-sm">
      {{ code.codigo }}
    </span>
    
    <!-- Descripción corta -->
    <span class="text-sm text-secondary-600">
      {{ code.descripcion_corta }}
    </span>
    
    <!-- Indicadores adicionales -->
    <div class="flex items-center space-x-1">
      <span
        v-if="code.genero_aplicable && code.genero_aplicable !== 'AMBOS'"
        class="text-xs px-1.5 py-0.5 rounded-xl text-white flex items-center"
        :class="code.genero_aplicable === 'MASCULINO' ? 'bg-primary-700' : 'bg-accent-600'"
        style="font-family: inherit;"
      >
        <svg v-if="code.genero_aplicable === 'MASCULINO'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 16 16" stroke="currentColor">
          <circle cx="7" cy="9" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M10 6L14 2M14 2H11M14 2V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 16 16" stroke="currentColor">
          <circle cx="8" cy="6" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M8 9V14M8 14H5M8 14H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ code.genero_aplicable === 'MASCULINO' ? 'Masculino' : 'Femenino' }}
      </span>
      
      <span v-if="code.es_mortalidad" 
            class="text-xs px-1.5 py-0.5 rounded-xl bg-accent-600 bg-opacity-10 text-accent-600 border border-accent-600/20">
        Mortalidad
      </span>
      
      <span v-if="code.capitulo" 
            class="text-xs px-1.5 py-0.5 rounded-xl bg-primary-600 bg-opacity-10 text-primary-700 border border-primary-600/10">
        Cap. {{ code.capitulo }}
      </span>
    </div>
  </div>
  
  <!-- Estado cuando no hay código -->
  <div v-else class="text-sm text-secondary-600 italic">
    No especificado
  </div>
</template>

<script>
export default {
  name: 'DisplayCIE10',
  props: {
    code: {
      type: Object,
      default: null
    }
  }
}
</script>
