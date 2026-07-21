<template>
  <div class="glass-panel p-6 flex flex-col h-full animate-fade-in">
    <h3 class="text-xl font-bold mb-6">Spending Trend (Last 7 Days)</h3>
    <div class="flex-1 min-h-[280px] flex items-center justify-center relative">
      <LineChart v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="text-slate-400 text-center flex flex-col items-center gap-2">
        <div class="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-2">
          <span class="text-2xl opacity-50">📈</span>
        </div>
        No data available yet.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line as LineChart } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  // Get last 7 days
  const days = 7;
  const labels = [];
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // format as Jan 01
    labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    
    const dayTotal = props.expenses
      .filter(exp => exp.date === dateStr)
      .reduce((sum, exp) => sum + exp.amount, 0);
      
    data.push(dayTotal);
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Daily Spend',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        borderWidth: 3,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#059669',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4, // smooth curves
        data: data
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        padding: 10,
        callback: function(value) {
          return '₹' + value;
        }
      }
    },
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        color: '#94a3b8',
        padding: 10
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context) {
          return 'Spend: ' + new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
        }
      }
    }
  }
}
</script>
