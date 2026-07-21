<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-50">
    <!-- Mobile Header -->
    <header class="md:hidden glass-panel m-4 p-4 flex justify-between items-center z-50 sticky top-4">
      <h1 class="text-xl font-extrabold text-gradient">AI Finance</h1>
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-slate-300 hover:text-white transition-colors">
        <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </header>

    <!-- Sidebar / Mobile Menu -->
    <aside 
      :class="[
        'glass-panel m-4 p-6 flex flex-col md:w-64 transition-all duration-300 ease-in-out z-40',
        'fixed md:sticky top-4 left-0 right-0 md:bottom-4 max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-2rem)]',
        mobileMenuOpen ? 'translate-y-20 opacity-100 visible' : '-translate-y-full opacity-0 invisible md:translate-y-0 md:opacity-100 md:visible'
      ]"
    >
      <div class="hidden md:block mb-8">
        <h1 class="text-2xl font-extrabold text-gradient tracking-tight">AI Finance</h1>
      </div>
      
      <nav class="flex flex-col gap-2 flex-1">
        <NuxtLink to="/" class="nav-link" @click="mobileMenuOpen = false">
          <LayoutDashboard class="w-5 h-5 mr-3 opacity-70" />
          Dashboard
        </NuxtLink>
        <NuxtLink to="/expenses" class="nav-link" @click="mobileMenuOpen = false">
          <Receipt class="w-5 h-5 mr-3 opacity-70" />
          Expenses
        </NuxtLink>
        <NuxtLink to="/insights" class="nav-link" @click="mobileMenuOpen = false">
          <LineChart class="w-5 h-5 mr-3 opacity-70" />
          Insights
        </NuxtLink>
      </nav>
      
      <div class="mt-8 pt-6 border-t border-slate-700/50" v-if="user">
        <div class="text-xs text-slate-400 mb-3 truncate px-2">{{ user.email }}</div>
        <button @click="logout" class="w-full flex items-center justify-center btn-secondary py-2">
          <LogOut class="w-4 h-4 mr-2 opacity-70" />
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
      <slot />
    </main>
    
    <!-- Mobile Backdrop -->
    <div 
      v-if="mobileMenuOpen" 
      @click="mobileMenuOpen = false"
      class="md:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-30"
    ></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Menu, X, LayoutDashboard, Receipt, LineChart, LogOut } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const mobileMenuOpen = ref(false)

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center px-4 py-3 rounded-xl text-slate-300 font-medium transition-all duration-200 hover:bg-slate-700/50 hover:text-white;
}

.router-link-active {
  @apply bg-emerald-500/10 text-emerald-400;
}

.router-link-active .lucide {
  @apply text-emerald-400 opacity-100;
}
</style>
