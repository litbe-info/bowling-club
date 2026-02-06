'use client'

import { toast as sonnerToast } from 'sonner'

export function useToast() {
  return {
    success: (message: string) => {
      sonnerToast.success(message, {
        duration: 3000,
        position: 'top-center',
      })
    },
    error: (message: string) => {
      sonnerToast.error(message, {
        duration: 4000,
        position: 'top-center',
      })
    },
    loading: (message: string) => {
      return sonnerToast.loading(message, {
        position: 'top-center',
      })
    },
    dismiss: (id?: string | number) => {
      sonnerToast.dismiss(id)
    },
  }
}
