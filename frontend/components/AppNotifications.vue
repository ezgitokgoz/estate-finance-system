<script setup lang="ts">
import { useNotificationStore } from '~/stores/notification'

const notificationStore = useNotificationStore()
</script>

<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    <div 
      v-for="n in notificationStore.notifications" 
      :key="n.id"
      :class="[
        'px-6 py-3 rounded-lg shadow-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 transform translate-x-0 flex items-center gap-4',
        n.type === 'success' ? 'bg-green-600 border-green-400 text-white' : 
        n.type === 'error' ? 'bg-red-600 border-red-400 text-white' : 
        'bg-blue-600 border-blue-400 text-white'
      ]"
    >
      <span>{{ n.message }}</span>
      <button @click="notificationStore.remove(n.id)" class="hover:scale-125 transition opacity-70">✕</button>
    </div>
  </div>
</template>
