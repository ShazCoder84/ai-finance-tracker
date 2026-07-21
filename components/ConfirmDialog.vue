<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
    <div class="glass-panel w-full max-w-sm p-6 relative animate-fade-in mx-4">
      
      <div class="flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
          <AlertTriangle class="w-6 h-6 text-red-500" />
        </div>
        
        <h3 class="text-xl font-bold text-slate-100 mb-2">{{ title }}</h3>
        <p class="text-slate-400 text-sm mb-6">{{ message }}</p>
        
        <div class="flex gap-3 w-full">
          <button @click="$emit('cancel')" class="btn-secondary flex-1" :disabled="loading">
            Cancel
          </button>
          <button @click="$emit('confirm')" class="btn-primary flex-1 !bg-gradient-to-r !from-red-500 !to-red-600 hover:!from-red-400 hover:!to-red-500 !shadow-red-500/30" :disabled="loading">
            {{ loading ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed? This action cannot be undone.'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['confirm', 'cancel'])
</script>
