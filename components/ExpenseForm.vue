<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
    <!-- Click outside is disabled as requested -->
    <div class="glass-panel w-full max-w-md p-6 relative animate-fade-in flex flex-col max-h-[90vh] overflow-y-auto">
      
      <button @click="closeModal" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
        <X class="w-6 h-6" />
      </button>

      <h3 class="text-xl font-bold mb-6 text-gradient pr-8">
        {{ isEditMode ? 'Edit Expense' : 'Log New Expense' }}
      </h3>
      
      <form @submit.prevent="submitExpense" class="flex flex-col gap-5">
        <div>
          <label class="label">Amount (₹)</label>
          <div class="relative">
            <span class="absolute left-4 top-2 text-slate-400">₹</span>
            <input v-model="amount" type="number" step="0.01" class="input-field pl-8" placeholder="0.00" required />
          </div>
        </div>
        
        <div>
          <label class="label">Description</label>
          <input v-model="description" type="text" class="input-field" placeholder="e.g. Uber ride" @blur="suggestCategory" required />
        </div>

        <div class="flex gap-3 items-start">
          <div class="flex-1">
            <label class="label flex items-center justify-between">
              Category
              <span v-if="isAiCategorized" class="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">✨ AI Suggested</span>
            </label>
            <select v-model="category" class="input-field appearance-none" required>
              <option value="" disabled>Select a category...</option>
              <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div v-if="categorizing" class="text-indigo-400 text-sm font-medium mt-8 flex items-center animate-pulse">
            <span class="mr-2">✨</span> AI thinking...
          </div>
        </div>

        <div>
          <label class="label">Date</label>
          <input v-model="date" type="date" class="input-field" required />
        </div>

        <button type="submit" class="btn-primary w-full mt-2" :disabled="loading">
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Expense' : 'Add Expense') }}
        </button>
        
        <div v-if="successMsg" class="text-emerald-400 text-sm mt-2 text-center font-medium">{{ successMsg }}</div>
        <div v-if="errorMsg" class="text-red-400 text-sm mt-2 text-center font-medium">{{ errorMsg }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const emit = defineEmits(['expense-saved', 'close'])

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  expenseToEdit: {
    type: Object,
    default: null
  }
})

const amount = ref('')
const description = ref('')
const category = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const isAiCategorized = ref(false)
const isEditMode = ref(false)

const availableCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Housing', 'Health', 'Shopping', 'Other']

const categorizing = ref(false)
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const originalDescription = ref('')
const isLoadingForm = ref(false)

// Initialize form when opened
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isLoadingForm.value = true
    if (props.expenseToEdit) {
      isEditMode.value = true
      amount.value = props.expenseToEdit.amount
      description.value = props.expenseToEdit.description
      originalDescription.value = props.expenseToEdit.description
      category.value = props.expenseToEdit.category
      date.value = props.expenseToEdit.date
      isAiCategorized.value = props.expenseToEdit.is_ai_categorized
    } else {
      isEditMode.value = false
      resetForm()
    }
    // Allow watch(category) to safely ignore this programmatic change
    setTimeout(() => {
      isLoadingForm.value = false
    }, 100)
  }
})

// If user manually changes the category, it's no longer AI categorized
watch(category, (newVal, oldVal) => {
  if (!isLoadingForm.value && oldVal && newVal !== oldVal && !categorizing.value) {
    isAiCategorized.value = false
  }
})

const resetForm = () => {
  amount.value = ''
  description.value = ''
  originalDescription.value = ''
  category.value = ''
  date.value = new Date().toISOString().split('T')[0]
  isAiCategorized.value = false
  errorMsg.value = ''
  successMsg.value = ''
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const suggestCategory = async () => {
  if (!description.value) return
  // Don't auto-suggest if in edit mode and the description hasn't changed
  if (isEditMode.value && description.value === originalDescription.value && category.value !== '') return
  
  try {
    categorizing.value = true
    const { data } = await useFetch('/api/categorize', {
      method: 'POST',
      body: { description: description.value }
    })
    
    if (data.value && data.value.category) {
      category.value = data.value.category
      isAiCategorized.value = true
    }
  } catch (err) {
    console.error("Failed to categorize", err)
  } finally {
    categorizing.value = false
  }
}

const submitExpense = async () => {
  if (!user.value) return
  
  try {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''
    
    const expenseData = {
      user_id: user.value.id,
      amount: parseFloat(amount.value),
      description: description.value,
      category: category.value,
      date: date.value,
      is_ai_categorized: isAiCategorized.value
    }
    
    let error;
    
    if (isEditMode.value) {
      const result = await supabase.from('expenses')
        .update(expenseData)
        .eq('id', props.expenseToEdit.id)
      error = result.error
    } else {
      const result = await supabase.from('expenses')
        .insert(expenseData)
      error = result.error
    }
    
    if (error) throw error
    
    successMsg.value = isEditMode.value ? 'Expense updated successfully!' : 'Expense added successfully!'
    
    emit('expense-saved')
    
    setTimeout(() => {
      closeModal()
    }, 1500)
    
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
