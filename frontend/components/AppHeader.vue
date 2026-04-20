<script setup lang="ts">
defineProps<{
  filteredCount: number;
  totalCount: number;
}>()
</script>

<template>
  <header class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold italic tracking-tighter uppercase">
        Estate <span class="text-blue-600">Finance System</span>
      </h1>
      <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Management Dashboard</p>
    </div>
    <div class="flex items-center gap-4">
      <div class="bg-white border border-gray-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-black shadow-sm uppercase tracking-tighter">
        Showing: {{ filteredCount }} / Total: {{ totalCount }}
      </div>
    </div>
  </header>
</template>
