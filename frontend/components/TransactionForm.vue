<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTransactionStore } from '~/stores/transaction'
import { useNotificationStore } from '~/stores/notification'

const store = useTransactionStore()
const notificationStore = useNotificationStore()

const isSameAgent = ref(false)
const form = ref({
  propertyAddress: '',
  totalServiceFee: 0,
  listingAgent: '',
  sellingAgent: ''
})

watch([() => form.value.listingAgent, isSameAgent], () => {
  if (isSameAgent.value) {
    form.value.sellingAgent = form.value.listingAgent
  }
})

const submitForm = async () => {
  if (!form.value.propertyAddress || !form.value.listingAgent || !form.value.sellingAgent) {
    return notificationStore.notify('Please fill in all required fields', 'error')
  }
  await store.createTransaction({ ...form.value })
  form.value = { propertyAddress: '', totalServiceFee: 0, listingAgent: '', sellingAgent: '' }
  isSameAgent.value = false
}
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-700 font-serif">New Transaction</h2>
      <label class="flex items-center space-x-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
        <input type="checkbox" v-model="isSameAgent" class="w-4 h-4 text-blue-600 rounded">
        <span class="text-[10px] font-black text-blue-800 uppercase tracking-widest">Same Agent for Both Roles</span>
      </label>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label class="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Property Address</label>
        <input v-model="form.propertyAddress" type="text" placeholder="e.g. Sunset Blvd. 12" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Service Fee</label>
        <input v-model.number="form.totalServiceFee" type="number" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
      </div>
      <div>
        <label class="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Listing Agent</label>
        <input v-model="form.listingAgent" type="text" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
      </div>
      <div :class="{ 'opacity-40 grayscale': isSameAgent }">
        <label class="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Selling Agent</label>
        <input v-model="form.sellingAgent" type="text" :disabled="isSameAgent" class="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-sm">
      </div>
    </div>
    <button @click="submitForm" class="mt-6 bg-blue-600 text-white px-10 py-3 rounded-lg hover:bg-blue-700 transition font-black uppercase text-xs shadow-lg active:scale-95">
      Start Process
    </button>
  </div>
</template>
