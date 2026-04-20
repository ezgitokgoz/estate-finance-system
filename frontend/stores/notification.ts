import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [] as { id: number; message: string; type: 'success' | 'error' | 'info' }[]
    }),
    actions: {
        notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
            const id = Date.now()
            this.notifications.push({ id, message, type })
            
            // Automatically remove notification after 5 seconds
            setTimeout(() => {
                this.remove(id)
            }, 5000)
        },
        remove(id: number) {
            this.notifications = this.notifications.filter(n => n.id !== id)
        }
    }
})
