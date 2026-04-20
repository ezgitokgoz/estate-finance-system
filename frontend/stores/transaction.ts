import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import { useNotificationStore } from './notification'
import type { Transaction, CreateTransactionPayload } from '../types/transaction'

export const useTransactionStore = defineStore('transaction', {
    state: () => ({
        transactions: [] as Transaction[],
        totalCount: 0,
        loading: false,
        hasMore: true,
        pageSize: 50
    }),
    actions: {
        async fetchTransactions(skip = 0, search = '', status = 'all', sort = 'newest') {
            const notification = useNotificationStore()
            if (this.loading && skip !== 0) return;
            this.loading = true;

            try {
                const config = useRuntimeConfig()
                const response = await $fetch<{ data: Transaction[], total: number }>(`${config.public.apiBase}/transactions`, {
                    params: {
                        limit: this.pageSize,
                        skip,
                        search: search || undefined,
                        status: status !== 'all' ? status : undefined,
                        sort
                    }
                });

                this.totalCount = response.total;

                if (!response.data || response.data.length < this.pageSize) {
                    this.hasMore = false;
                } else {
                    this.hasMore = true;
                }

                if (skip === 0) {
                    this.transactions = response.data;
                } else {
                    const currentIds = new Set(this.transactions.map(t => t._id));
                    const newItems = response.data.filter(t => !currentIds.has(t._id));
                    this.transactions.push(...newItems);
                }
            } catch (err: any) {
                const errorMsg = err.data?.error || 'Failed to fetch transactions'
                notification.notify(errorMsg, 'error')
                this.hasMore = false;
            } finally {
                this.loading = false;
            }
        },

        async createTransaction(payload: CreateTransactionPayload) {
            const notification = useNotificationStore()
            try {
                const config = useRuntimeConfig()
                const newTransaction = await $fetch<Transaction>(`${config.public.apiBase}/transactions`, {
                    method: 'POST',
                    body: payload
                })
                this.transactions.unshift(newTransaction)
                if (this.transactions.length > this.pageSize && this.hasMore) {
                    this.transactions.pop();
                }
                this.totalCount++;
                notification.notify('Transaction created successfully', 'success')
            } catch (err: any) {
                const errorMsg = err.data?.error || 'Failed to create transaction'
                notification.notify(errorMsg, 'error')
            }
        },

        async transition(id: string) {
            const notification = useNotificationStore()
            try {
                const config = useRuntimeConfig()
                const updatedTransaction = await $fetch<Transaction>(`${config.public.apiBase}/transactions/${id}/transition`, {
                    method: 'PATCH'
                })
                const index = this.transactions.findIndex(t => t._id === id);
                if (index !== -1) {
                    this.transactions[index] = updatedTransaction;
                }
                notification.notify('Stage updated successfully', 'success')
            } catch (err: any) {
                const errorMsg = err.data?.error || 'Failed to update stage'
                notification.notify(errorMsg, 'error')
            }
        }
    }
})