<template>
  <!-- Floating Chat Button -->
  <button
    @click="toggleChat"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-primary flex items-center justify-center shadow-xl shadow-emerald-500/20"
    :title="isOpen ? 'Close chat' : 'Chat with FinanceAI'"
  >
    <X v-if="isOpen" class="w-6 h-6" />
    <MessageCircle v-else class="w-6 h-6" />
  </button>

  <!-- Chat Window -->
  <div
    v-if="isOpen"
    class="fixed bottom-24 right-6 z-50 w-[min(92vw,380px)] glass-panel flex flex-col overflow-hidden animate-fade-in"
    style="height: min(70vh, 540px)"
  >
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/60">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20 flex-shrink-0">
          ✨
        </div>
        <div>
          <h3 class="font-bold text-slate-100 leading-tight">FinanceAI</h3>
          <p class="text-xs text-emerald-400 font-medium">Your expense assistant</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button @click="resetChat" class="p-2 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg" title="Clear chat">
          <RefreshCw class="w-4 h-4" />
        </button>
        <button @click="isOpen = false" class="p-2 text-slate-400 hover:text-white transition-colors rounded-lg" title="Close">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div ref="scrollArea" class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3.5">
      <div v-if="expensesLoading" class="text-xs text-slate-500 text-center italic mb-1">
        Syncing your expenses...
      </div>

      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- Bot message -->
        <div v-if="msg.role === 'assistant'" class="flex items-end gap-2 max-w-[85%]">
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-xs flex-shrink-0">
            ✨
          </div>
          <div class="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {{ msg.content }}
          </div>
        </div>
        <!-- User message -->
        <div v-else class="max-w-[85%] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-lg shadow-emerald-500/10">
          {{ msg.content }}
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="sending" class="flex items-end gap-2">
        <div class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-xs flex-shrink-0">
          ✨
        </div>
        <div class="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    </div>

    <!-- Quick suggestions -->
    <div v-if="messages.length <= 1" class="px-4 pb-2 flex flex-col gap-2">
      <button
        v-for="s in suggestions"
        :key="s"
        @click="askSuggestion(s)"
        class="text-left text-xs bg-slate-700/40 hover:bg-slate-700/60 border border-slate-600/40 rounded-xl px-3 py-2 text-slate-300 transition-colors"
      >
        {{ s }}
      </button>
    </div>

    <!-- Input -->
    <form @submit.prevent="sendMessage" class="p-3 border-t border-slate-700/50 flex items-center gap-2 bg-slate-800/40">
      <input
        v-model="input"
        type="text"
        class="input-field !py-2.5 text-sm"
        placeholder="Ask about your expenses..."
        autocomplete="off"
        :disabled="sending"
      />
      <button
        type="submit"
        class="btn-primary !p-2.5 rounded-lg flex-shrink-0"
        :disabled="sending || !input.trim()"
        title="Send"
      >
        <Send class="w-5 h-5" />
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { MessageCircle, X, Send, RefreshCw } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const isOpen = ref(false)
const messages = ref([])
const input = ref('')
const sending = ref(false)
const expenses = ref([])
const expensesLoading = ref(false)
const scrollArea = ref(null)

const suggestions = [
  'How much did I spend on Food?',
  'What is my biggest expense category?',
  'How can I save money?'
]

const welcomeMessage = "Hi! 👋 I'm FinanceAI, your personal expense assistant. Ask me anything about your spending — how much you've spent, where your money goes, or how to save more!"

// Welcome message on first load
if (messages.value.length === 0) {
  messages.value.push({ role: 'assistant', content: welcomeMessage })
}

const fetchExpenses = async () => {
  if (!user.value) return
  expensesLoading.value = true
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.value.id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching expenses for chat', error)
  } else {
    expenses.value = data || []
  }
  expensesLoading.value = false
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollArea.value) {
    scrollArea.value.scrollTop = scrollArea.value.scrollHeight
  }
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    // Refresh expenses each time the chat opens so answers stay current
    fetchExpenses()
  }
}

const resetChat = () => {
  messages.value = []
  messages.value.push({ role: 'assistant', content: welcomeMessage })
}

const askSuggestion = (s) => {
  input.value = s
  sendMessage()
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text || sending.value) return

  const history = messages.value.slice(-8)
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  sending.value = true
  scrollToBottom()

  try {
    const { data } = await useFetch('/api/chat', {
      method: 'POST',
      body: {
        message: text,
        expenses: expenses.value,
        history
      }
    })

    if (data.value && data.value.reply) {
      messages.value.push({ role: 'assistant', content: data.value.reply })
    } else {
      messages.value.push({ role: 'assistant', content: "I couldn't get a response. Please try again." })
    }
  } catch (err) {
    console.error('Chat request failed', err)
    messages.value.push({ role: 'assistant', content: 'Something went wrong connecting to the assistant. Please try again.' })
  } finally {
    sending.value = false
    scrollToBottom()
  }
}

// Auto-scroll on new messages
watch([messages, sending], () => scrollToBottom())
</script>

<style scoped>
.typing-dot {
  @apply w-1.5 h-1.5 rounded-full bg-slate-400;
  animation: typingBounce 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
</style>

