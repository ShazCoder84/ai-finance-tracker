<template>
  <div class="glass-panel p-6 animate-fade-in mt-6 md:mt-0">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold flex items-center">
        <span class="mr-2">✨</span> AI Insights
      </h3>
      <button @click="fetchInsights" class="btn-secondary text-sm px-4 py-1.5" :disabled="loading">
        {{ loading ? 'Analyzing...' : 'Refresh Insights' }}
      </button>
    </div>
    
    <div v-if="insights" class="flex flex-col gap-6">
      <p class="text-lg text-slate-200 leading-relaxed">{{ insights.summary }}</p>
      
      <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl">
        <h4 class="text-emerald-400 font-bold mb-2 flex items-center">
          <span class="mr-2">💡</span> Personalized Advice
        </h4>
        <p class="text-slate-300 leading-relaxed m-0">{{ insights.advice }}</p>
      </div>
    </div>
    <div v-else-if="loading" class="text-indigo-400 text-center py-8 animate-pulse font-medium">
      Analyzing your recent spending patterns...
    </div>
    <div v-else class="text-slate-400 text-center py-8">
      Click 'Refresh Insights' to get AI-powered financial advice based on your expenses.
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => []
  }
})

const insights = ref(null)
const loading = ref(false)

const fetchInsights = async () => {
  if (!props.expenses || props.expenses.length === 0) return
  
  try {
    loading.value = true
    const { data } = await useFetch('/api/insights', {
      method: 'POST',
      body: { expenses: props.expenses }
    })
    
    if (data.value && data.value.insights) {
      insights.value = data.value.insights
    }
  } catch (err) {
    console.error("Failed to fetch insights", err)
  } finally {
    loading.value = false
  }
}
</script>
