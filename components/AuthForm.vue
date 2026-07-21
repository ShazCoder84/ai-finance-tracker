<template>
  <div class="flex items-center justify-center min-h-screen p-4 bg-slate-900">
    <div class="glass-panel w-full max-w-md p-10 text-center relative overflow-hidden">
      <!-- Decorative background blur -->
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
      
      <div class="relative z-10">
        <h2 class="text-3xl font-extrabold text-gradient mb-2">{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="text-slate-400 text-sm mb-8">{{ isLogin ? 'Enter your details to access your dashboard' : 'Start tracking your finances intelligently' }}</p>

        <form @submit.prevent="handleAuth" class="flex flex-col gap-5 text-left">
          <div>
            <label class="label">Email</label>
            <input v-model="email" type="email" class="input-field" placeholder="you@example.com" required />
          </div>
          
          <div>
            <label class="label">Password</label>
            <input v-model="password" type="password" class="input-field" placeholder="••••••••" required />
          </div>

          <div v-if="errorMsg" class="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg">{{ errorMsg }}</div>
          <div v-if="successMsg" class="text-emerald-400 text-sm bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-lg">{{ successMsg }}</div>

          <button type="submit" class="btn-primary w-full mt-2" :disabled="loading">
            {{ loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up') }}
          </button>
        </form>

        <div class="mt-8 text-sm">
          <span class="text-slate-400">{{ isLogin ? "Don't have an account?" : "Already have an account?" }}</span>
          <button class="ml-2 text-emerald-400 font-semibold hover:text-emerald-300 transition-colors" @click="isLogin = !isLogin">
            {{ isLogin ? 'Sign up' : 'Log in' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const supabase = useSupabaseClient()
const router = useRouter()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleAuth = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''
    
    if (isLogin.value) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      
      // Navigate to dashboard on successful login
      router.push('/')
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      
      // If user requires email confirmation, data.session will be null
      if (!data.session) {
        successMsg.value = 'Registration successful! Please check your email to verify your account.'
        // Optionally switch back to login mode
        isLogin.value = true
        password.value = ''
      } else {
        router.push('/')
      }
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>
