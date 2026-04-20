<script setup lang="ts">
const props = defineProps<{
  searchQuery: string;
  statusFilter: string;
  sortOrder: string;
}>()

const emit = defineEmits(['update:searchQuery', 'update:statusFilter', 'update:sortOrder', 'downloadExcel'])

const downloadExcel = () => emit('downloadExcel')
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center gap-4">
    <div class="relative flex-1 min-w-[250px]">
      <input 
        :value="searchQuery" 
        @input="e => emit('update:searchQuery', (e.target as HTMLInputElement).value)"
        type="text" 
        placeholder="Search by address or agent name (e.g. John Doe)..." 
        class="w-full border border-gray-200 p-2 pl-4 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50"
      >
    </div>
    
    <div class="flex items-center gap-2">
      <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter:</span>
      <select 
        :value="statusFilter" 
        @change="e => emit('update:statusFilter', (e.target as HTMLSelectElement).value)"
        class="border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="all">ALL RECORDS</option>
        <option value="active_only" class="text-blue-600 font-bold">ACTIVE ONLY</option>
        <option value="agreement">AGREEMENT</option>
        <option value="earnest_money">EARNEST MONEY</option>
        <option value="title_deed">TITLE DEED</option>
        <option value="completed">COMPLETED</option>
      </select>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
      <select 
        :value="sortOrder" 
        @change="e => emit('update:sortOrder', (e.target as HTMLSelectElement).value)"
        class="border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="newest">NEWEST FIRST</option>
        <option value="oldest">OLDEST FIRST</option>
      </select>
    </div>

    <button 
      @click="downloadExcel"
      class="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-green-700 transition shadow-md active:scale-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export Excel
    </button>
  </div>
</template>
