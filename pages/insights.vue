<template>
  <div class="pt-2 md:pt-4">
    <div class="mb-8">
      <h2 class="text-3xl font-extrabold text-gradient mb-2">AI Insights</h2>
      <p class="text-slate-400">Deep dive into your financial habits.</p>
    </div>

    <div v-if="loading" class="text-indigo-400 animate-pulse font-medium">Loading your insights...</div>
    <div v-else-if="expenses.length === 0" class="text-slate-400 italic">Add some expenses on the dashboard to see your AI insights!</div>
    <div v-else class="flex flex-col gap-8 max-w-6xl">
      <!-- Top KPIs -->
      <DashboardKPIs :expenses="expenses" />
      
      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <TrendChart :expenses="expenses" />
        </div>
        <div class="lg:col-span-1">
          <CategoryChart :expenses="expenses" />
        </div>
      </div>

      <!-- AI Insights Panel -->
      <InsightsPanel :expenses="expenses" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const expenses = ref([])
const loading = ref(true)

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
</script>
