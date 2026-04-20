<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactionStore } from '~/stores/transaction'

const props = defineProps<{
  transactions: any[];
  loading: boolean;
  hasMore: boolean;
  loadMoreTrigger: any;
}>()

const store = useTransactionStore()

const emit = defineEmits(['downloadPdf'])

const formatDate = (dateString: string) => {
  if (!dateString) return 'Just now'
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const statusOrder = ['agreement', 'earnest_money', 'title_deed', 'completed'];

const getStatusIndex = (status: string) => {
    return statusOrder.indexOf(status.replace(' ', '_'));
}

// Modal State
const isModalOpen = ref(false)
const selectedTransaction = ref<any>(null)

const openModal = (transaction: any) => {
  selectedTransaction.value = transaction
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTransaction.value = null
}

const handleTransition = async (id: string) => {
  await store.transition(id)
  const updatedItem = props.transactions.find(t => t._id === id)
  if (updatedItem) {
    selectedTransaction.value = updatedItem
  }
}

// Snapshot-aware percentage helpers — always reflect rates active at creation
// For legacy records (no appliedPolicy): reverse-calculate from saved amounts.
const appliedAgencyPct = computed(() => {
  const fb = selectedTransaction.value?.financialBreakdown
  if (fb?.appliedPolicy?.agencyShare !== undefined)
    return Math.round(fb.appliedPolicy.agencyShare * 100)
  const total = selectedTransaction.value?.totalServiceFee || 1
  return Math.round(((fb?.agencyEarned ?? 0) / total) * 100)
})

const appliedAgentPct = computed(() => {
  const fb = selectedTransaction.value?.financialBreakdown
  if (fb?.appliedPolicy?.agentShare !== undefined)
    return Math.round(fb.appliedPolicy.agentShare * 100)
  const total = selectedTransaction.value?.totalServiceFee || 1
  const agentTotal = fb?.totalAgentEarned ?? ((fb?.listingAgentEarned ?? 0) + (fb?.sellingAgentEarned ?? 0))
  return Math.round((agentTotal / total) * 100)
})

const appliedSplitPct = computed(() => {
  const fb = selectedTransaction.value?.financialBreakdown
  if (fb?.appliedPolicy?.splitRatio !== undefined)
    return Math.round(fb.appliedPolicy.splitRatio * 100)
  const total = selectedTransaction.value?.totalServiceFee || 1
  return Math.round(((fb?.listingAgentEarned ?? 0) / total) * 100)
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
    <table class="w-full text-left border-collapse">
      <thead class="bg-gray-50">
        <tr class="text-gray-400 text-[10px] font-black uppercase tracking-[0.15em]">
          <th class="p-4 border-b">Property Details</th>
          <th class="p-4 border-b">Date</th>
          <th class="p-4 border-b">Process Progress</th>
          <th class="p-4 border-b text-right">Service Fee</th>
          <th class="p-4 border-b text-center">Actions</th> 
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-for="t in transactions" :key="t._id" class="hover:bg-blue-50/30 transition group text-sm">
          <td class="p-4">
            <div class="font-bold text-gray-800">{{ t.propertyAddress }}</div>
            <div class="mt-1 text-[9px] font-black uppercase text-gray-400 tracking-tighter">
              ID: {{ t._id.slice(-6) }}
            </div>
          </td>
          <td class="p-4 text-[11px] text-gray-500 font-medium whitespace-nowrap">
            {{ formatDate(t.createdAt) }}
          </td>
          
          <!-- PROGRESS BAR -->
          <td class="p-4 min-w-[200px]">
            <div class="flex items-center w-full">
              <template v-for="(step, index) in statusOrder" :key="step">
                <div class="relative flex flex-col items-center">
                  <div 
                    :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 shadow-sm',
                      getStatusIndex(t.status) >= index
                        ? (step === 'agreement' ? 'bg-blue-600 border-blue-600 text-white' :
                           step === 'earnest_money' ? 'bg-yellow-500 border-yellow-500 text-white' :
                           step === 'title_deed' ? 'bg-purple-600 border-purple-600 text-white' :
                           'bg-green-500 border-green-500 text-white')
                        : 'bg-white border-gray-200 text-gray-300'
                    ]"
                  >
                    <svg v-if="getStatusIndex(t.status) > index || t.status.replace(' ', '_') === 'completed'" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span v-else class="text-[8px] font-bold">{{ index + 1 }}</span>
                  </div>
                  <div v-if="t.status.replace(' ', '_') === step" class="absolute -bottom-4 whitespace-nowrap text-[8px] font-black uppercase text-gray-500 tracking-tighter">
                    {{ step.replace('_', ' ') }}
                  </div>
                </div>
                
                <div 
                  v-if="index < 3" 
                  :class="[
                    'h-1 flex-1 -mx-0.5 transition-all duration-700',
                    getStatusIndex(t.status) > index
                      ? (index === 0 ? 'bg-blue-400' : index === 1 ? 'bg-yellow-400' : index === 2 ? 'bg-purple-400' : 'bg-green-400')
                      : 'bg-gray-100'
                  ]"
                ></div>
              </template>
            </div>
          </td>

          <td class="p-4 text-right font-medium text-gray-500">
            {{ t.totalServiceFee?.toLocaleString() }} TL
          </td>
          <td class="p-4 text-center">
            <button 
              @click="openModal(t)"
              class="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition shadow-sm"
              title="View Details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Details
            </button>
          </td>
        </tr>
        
        <tr v-if="transactions.length === 0">
          <td colspan="5" class="p-16 text-center text-gray-400 italic">
            {{ loading ? 'Searching...' : 'No matching transactions found.' }}
          </td>
        </tr>
      </tbody>
    </table>
    
    <div :ref="loadMoreTrigger" class="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-center">
      <div v-if="loading" class="flex items-center gap-3">
        <span class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">LOADING MORE...</span>
      </div>
      <div v-else class="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] italic">
        <span v-if="!hasMore">All items loaded ({{ transactions.length }})</span>
        <span v-else>Scroll down for more</span>
      </div>
    </div>

    <!-- Modal overlay -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
        <!-- Close Button -->
        <button @click="closeModal" class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Transaction Details</h3>
        
        <div v-if="selectedTransaction" class="space-y-6">
          <!-- Property Basic -->
          <div>
            <div class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Property</div>
            <div class="font-bold text-gray-800 text-lg">{{ selectedTransaction.propertyAddress }}</div>
            <div class="text-[11px] text-gray-500 mt-1">Status: <span class="font-bold text-blue-600 uppercase">{{ selectedTransaction.status.replace('_', ' ') }}</span></div>
          </div>

          <!-- Financial/Agent Breakdown -->
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Agent Commission Breakdown</div>
            <div class="space-y-3">
              <div class="flex justify-between items-center bg-white p-2.5 rounded shadow-sm border border-gray-50">
                <span class="text-sm font-semibold text-gray-600">Total Service Fee</span>
                <span class="font-bold">{{ selectedTransaction.totalServiceFee?.toLocaleString() }} TL</span>
              </div>
              <div class="flex justify-between items-center bg-white p-2.5 rounded shadow-sm border border-gray-50">
                <span class="text-sm font-semibold text-blue-600">Agency Cut ({{ appliedAgencyPct }}%)</span>
                <span class="font-bold text-blue-600">{{ selectedTransaction.financialBreakdown?.agencyEarned?.toLocaleString() }} TL</span>
              </div>
              <div v-if="selectedTransaction.financialBreakdown?.isSingleAgent" class="flex justify-between items-center bg-white p-2.5 rounded shadow-sm border border-gray-50">
                <span class="text-sm font-semibold text-gray-700">Agent (Listing &amp; Selling): {{ selectedTransaction.listingAgent }} ({{ appliedAgentPct }}%)</span>
                <span class="font-bold text-green-600">+{{ selectedTransaction.financialBreakdown?.totalAgentEarned?.toLocaleString() || selectedTransaction.financialBreakdown?.listingAgentEarned?.toLocaleString() }} TL</span>
              </div>
              <template v-else>
                <div class="flex justify-between items-center bg-white p-2.5 rounded shadow-sm border border-gray-50">
                  <span class="text-sm font-semibold text-gray-700">Listing Agent: {{ selectedTransaction.listingAgent }} ({{ appliedSplitPct }}%)</span>
                  <span class="font-bold text-green-600">+{{ selectedTransaction.financialBreakdown?.listingAgentEarned?.toLocaleString() }} TL</span>
                </div>
                <div class="flex justify-between items-center bg-white p-2.5 rounded shadow-sm border border-gray-50">
                  <span class="text-sm font-semibold text-gray-700">Selling Agent: {{ selectedTransaction.sellingAgent }} ({{ appliedSplitPct }}%)</span>
                  <span class="font-bold text-green-600">+{{ selectedTransaction.financialBreakdown?.sellingAgentEarned?.toLocaleString() }} TL</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Process / Actions -->
          <div class="pt-2">
            <div class="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Timeline & Actions</div>
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6 flex gap-2 text-xs font-medium text-gray-600 justify-between text-center overflow-x-auto">
              <div class="flex flex-col flex-1 items-center min-w-[70px]">
                <span class="text-blue-600 font-bold uppercase text-[9px] mb-1">Agreement</span>
                <span class="text-[10px]">{{ selectedTransaction.stageDates?.agreement ? formatDate(selectedTransaction.stageDates.agreement) : 'Pending' }}</span>
              </div>
              <div class="w-px bg-gray-200"></div>
              <div class="flex flex-col flex-1 items-center min-w-[70px]">
                <span class="text-yellow-600 font-bold uppercase text-[9px] mb-1">Earnest</span>
                <span class="text-[10px]">{{ selectedTransaction.stageDates?.earnest_money ? formatDate(selectedTransaction.stageDates.earnest_money) : 'Pending' }}</span>
              </div>
              <div class="w-px bg-gray-200"></div>
              <div class="flex flex-col flex-1 items-center min-w-[70px]">
                <span class="text-purple-600 font-bold uppercase text-[9px] mb-1">Title Deed</span>
                <span class="text-[10px]">{{ selectedTransaction.stageDates?.title_deed ? formatDate(selectedTransaction.stageDates.title_deed) : 'Pending' }}</span>
              </div>
              <div class="w-px bg-gray-200"></div>
              <div class="flex flex-col flex-1 items-center min-w-[70px]">
                <span class="text-green-600 font-bold uppercase text-[9px] mb-1">Completed</span>
                <span class="text-[10px]">{{ selectedTransaction.stageDates?.completed ? formatDate(selectedTransaction.stageDates.completed) : 'Pending' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button 
                v-if="selectedTransaction.status.replace(' ', '_') !== 'completed'"
                @click="handleTransition(selectedTransaction._id)"
                class="flex-1 bg-slate-800 text-white text-sm px-4 py-3 rounded-lg hover:bg-blue-600 transition font-black uppercase tracking-widest shadow-md active:scale-95 flex justify-center items-center gap-2"
              >
                <span>Next Step</span>
              </button>
              <div v-else class="flex-1 text-center text-green-600 font-black text-sm uppercase italic tracking-widest bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                Process Completed
              </div>
              
              <button 
                @click="emit('downloadPdf', selectedTransaction._id)"
                class="flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-500 border border-red-200 rounded-lg text-sm font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-300 transition shadow-sm"
                title="Download PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>
