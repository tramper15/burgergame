import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import './Toast.css'

interface Toast {
  id: number
  message: string
  exiting: boolean
}

interface ToastContextType {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [nextId, setNextId] = useState(0)

  const showToast = useCallback((message: string) => {
    const id = nextId
    setNextId(prev => prev + 1)

    setToasts(prev => [...prev, { id, message, exiting: false }])

    // Start exit animation after 4 seconds
    setTimeout(() => {
      setToasts(prev =>
        prev.map(toast => toast.id === id ? { ...toast, exiting: true } : toast)
      )

      // Remove from DOM after animation completes
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, 300)
    }, 4000)
  }, [nextId])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.exiting ? 'exiting' : ''}`}>
            <p>{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
