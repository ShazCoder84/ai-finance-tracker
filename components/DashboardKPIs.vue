<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
    <div class="glass-panel p-6 flex flex-col gap-4 animate-fade-in hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Spend</span>
        <div class="p-2 bg-emerald-500/10 rounded-lg">
          <Wallet class="w-5 h-5 text-emerald-400" />
        </div>
      </div>
      <div class="text-3xl font-extrabold text-white">₹{{ totalSpend.toFixed(2) }}</div>
    </div>
    
    <div class="glass-panel p-6 flex flex-col gap-4 animate-fade-in hover:-translate-y-1 hover:shadow-2xl transition-all duration-300" style="animation-delay: 0.1s">
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-sm font-semibold uppercase tracking-wider">This Month</span>
        <div class="p-2 bg-indigo-500/10 rounded-lg">
          <Calendar class="w-5 h-5 text-indigo-400" />
        </div>
      </div>
      <div class="text-3xl font-extrabold text-white">₹{{ monthSpend.toFixed(2) }}</div>
    </div>
    
    <div class="glass-panel p-6 flex flex-col gap-4 animate-fade-in hover:-translate-y-1 hover:shadow-2xl transition-all duration-300" style="animation-delay: 0.2s">
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Today</span>
        <div class="p-2 bg-rose-500/10 rounded-lg">
          <Clock class="w-5 h-5 text-rose-400" />
        </div>
      </div>
      <div class="text-3xl font-extrabold text-white">₹{{ todaySpend.toFixed(2) }}</div>
    </div>
    
    <div class="glass-panel p-6 flex flex-col gap-4 animate-fade-in hover:-translate-y-1 hover:shadow-2xl transition-all duration-300" style="animation-delay: 0.3s">
      <div class="flex justify-between items-center">
        <span class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Transactions</span>
        <div class="p-2 bg-amber-500/10 rounded-lg">
          <Activity class="w-5 h-5 text-amber-400" />
        </div>
      </div>
      <div class="text-3xl font-extrabold text-white">{{ expenses.length }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Wallet, Calendar, Clock, Activity } from 'lucide-vue-next'

const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
})

const totalSpend = computed(() => {
  return props.expenses.reduce((sum, exp) => sum + exp.amount, 0)
})

const monthSpend = computed(() => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  return props.expenses.filter(exp => {
    const d = new Date(exp.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).reduce((sum, exp) => sum + exp.amount, 0)
})

const todaySpend = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return props.expenses
    .filter(exp => exp.date === today)
    .reduce((sum, exp) => sum + exp.amount, 0)
})
</script>
