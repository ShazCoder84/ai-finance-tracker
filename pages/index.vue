<template>
  <div class="pt-2 md:pt-4 relative">
    <div class="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
      <div>
        <h2 class="text-3xl font-extrabold text-gradient mb-2">Dashboard</h2>
        <p class="text-slate-400">Welcome back! Here's an overview of your finances.</p>
      </div>
      <button @click="openAddModal" class="btn-primary flex items-center justify-center gap-2">
        <Plus class="w-5 h-5" />
        Add Expense
      </button>
    </div>

    <DashboardKPIs :expenses="expenses" />

    <div class="flex flex-col gap-8">
      <CategoryChart :expenses="expenses" />
      
      <div class="glass-panel p-6 animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Recent Transactions</h3>
          <NuxtLink to="/expenses" class="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors" v-if="expenses.length > 5">
            View all &rarr;
          </NuxtLink>
        </div>
        
        <div v-if="loading" class="text-indigo-400 animate-pulse font-medium">Loading expenses...</div>
        <div v-else-if="expenses.length === 0" class="text-slate-400 italic">No expenses logged yet. Start by adding one!</div>
        <div v-else class="flex flex-col gap-3">
          <div v-for="expense in expenses.slice(0, 5)" :key="expense.id" class="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:bg-slate-700/30 transition-colors group">
            <div class="flex flex-col gap-1.5">
              <div class="font-semibold text-slate-200">{{ expense.description }}</div>
              <div class="flex flex-wrap items-center gap-3">
                <span class="badge bg-slate-700 text-slate-300">{{ expense.category }}</span>
                <span class="badge bg-purple-500/15 text-purple-400 border border-purple-500/30" v-if="expense.is_ai_categorized">✨ AI</span>
                <span class="badge bg-slate-600/30 text-slate-400 border border-slate-600/50" v-else>✍️ Manual</span>
                <span class="text-xs text-slate-500">{{ formatDate(expense.date) }}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="text-xl font-bold text-white mr-2">
                ₹{{ expense.amount.toFixed(2) }}
              </div>
              
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                <button @click="openEditModal(expense)" class="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors" title="Edit">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(expense)" class="p-2 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg border border-slate-700 hover:border-red-500/50 transition-colors" title="Delete">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <ExpenseForm 
      :is-open="isFormOpen" 
      :expense-to-edit="selectedExpense" 
      @close="isFormOpen = false" 
      @expense-saved="fetchExpenses" 
    />
    
    <ConfirmDialog
      :is-open="isConfirmOpen"
      :loading="isDeleting"
      title="Delete Expense"
      message="Are you sure you want to delete this expense? This action cannot be undone."
      @cancel="isConfirmOpen = false"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const expenses = ref([])
const loading = ref(true)

// Modal state
const isFormOpen = ref(false)
const selectedExpense = ref(null)

const isConfirmOpen = ref(false)
const isDeleting = ref(false)
const expenseToDelete = ref(null)

watchEffect(() => {
  if (!user.value) {
    router.push('/login')
  }
})

const fetchExpenses = async () => {
  if (!user.value) return
  
  loading.value = true
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.value.id)
    .order('date', { ascending: false })
    .limit(10)
    
  if (error) {
    console.error('Error fetching expenses', error)
  } else {
    expenses.value = data || []
  }
  loading.value = false
}

onMounted(() => {
  if (user.value) {
    fetchExpenses()
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString(undefined, { 
    month: 'short', day: 'numeric', year: 'numeric' 
  })
}

const openAddModal = () => {
  selectedExpense.value = null
  isFormOpen.value = true
}

const openEditModal = (expense) => {
  selectedExpense.value = expense
  isFormOpen.value = true
}

const confirmDelete = (expense) => {
  expenseToDelete.value = expense
  isConfirmOpen.value = true
}

const executeDelete = async () => {
  if (!expenseToDelete.value) return
  
  isDeleting.value = true
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseToDelete.value.id)
    
  isDeleting.value = false
  isConfirmOpen.value = false
  expenseToDelete.value = null
  
  if (!error) {
    fetchExpenses()
  } else {
    console.error("Failed to delete", error)
  }
}
</script>
