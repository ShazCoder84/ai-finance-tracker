<template>
  <div class="glass-panel p-6 flex flex-col h-full animate-fade-in">
    <h3 class="text-xl font-bold mb-6">Spending by Category</h3>
    <div class="flex-1 min-h-[280px] flex items-center justify-center relative">
      <Pie v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="text-slate-400 text-center flex flex-col items-center gap-2">
        <div class="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-2">
          <span class="text-2xl opacity-50">📊</span>
        </div>
        No data available yet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  const categories = {}
  props.expenses.forEach(exp => {
    if (categories[exp.category]) {
      categories[exp.category] += exp.amount
    } else {
      categories[exp.category] = exp.amount
    }
  })
  
  return {
    labels: Object.keys(categories),
    datasets: [
      {
        backgroundColor: [
          '#6366f1', // Indigo
          '#ec4899', // Pink
          '#14b8a6', // Teal
          '#f59e0b', // Amber
          '#8b5cf6', // Violet
          '#10b981', // Emerald
          '#f43f5e', // Rose
          '#64748b'  // Slate
        ],
        borderWidth: 0,
        data: Object.values(categories)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#f8fafc',
        font: {
          family: 'Inter, sans-serif'
        },
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
          }
          return label;
        }
      }
    }
  }
}
</script>
