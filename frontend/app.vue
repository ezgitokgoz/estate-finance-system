<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useTransactionStore } from '~/stores/transaction'

const store = useTransactionStore()

// --- Shared States ---
const searchQuery = ref('')
const statusFilter = ref('all')
const sortOrder = ref('newest')
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// --- Computed ---
const filteredTransactions = computed(() => {
  return store.transactions
})

// --- Methods ---
const downloadPdf = (id: string) => {
  window.open(`http://localhost:3000/transactions/${id}/pdf`, '_blank');
}

const downloadExcel = () => {
  const url = `http://localhost:3000/transactions/export/excel?search=${searchQuery.value}&status=${statusFilter.value}`;
  window.open(url, '_blank');
}

const handleLoadMore = async () => {
  await store.fetchTransactions(store.transactions.length, searchQuery.value, statusFilter.value, sortOrder.value)
}

// --- Lifecycle & Watchers ---
onMounted(() => {
  store.fetchTransactions(0)
})

watch(loadMoreTrigger, (el) => {
  if (el) {
    if (observer) observer.disconnect()
    observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && store.hasMore && !store.loading) {
        handleLoadMore()
      }
    }, { threshold: 0.1, rootMargin: '100px' })
    observer.observe(el)
  }
}, { immediate: true })

onUnmounted(() => {
  if (observer) observer.disconnect()
})

let searchTimeout: any = null;
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    store.fetchTransactions(0, newVal, statusFilter.value, sortOrder.value);
  }, 400);
});

watch(statusFilter, (newVal) => {
  store.fetchTransactions(0, searchQuery.value, newVal, sortOrder.value);
});

watch(sortOrder, (newVal) => {
  store.fetchTransactions(0, searchQuery.value, statusFilter.value, newVal);
});
</script>

<template>
  <div class="p-8 font-sans bg-gray-50 min-h-screen text-slate-900">
    <AppHeader 
      :filtered-count="filteredTransactions.length" 
      :total-count="store.totalCount" 
    />

    <TransactionForm />

    <TransactionFilters 
      v-model:search-query="searchQuery"
      v-model:status-filter="statusFilter"
      v-model:sort-order="sortOrder"
      @download-excel="downloadExcel"
    />

    <TransactionTable 
      :transactions="filteredTransactions"
      :loading="store.loading"
      :has-more="store.hasMore"
      :load-more-trigger="(el: Element | ComponentPublicInstance | null) => loadMoreTrigger = el as HTMLElement | null"
      @download-pdf="downloadPdf"
    />

    <AppNotifications />
  </div>
</template>
