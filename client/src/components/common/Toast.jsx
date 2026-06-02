// client/src/components/common/Toast.jsx
import { Toaster } from 'react-hot-toast'

const ToastConfig = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    gutter={8}
    toastOptions={{
      duration: 4000,
      style: {
        background: '#1A1A2E',
        color: '#fff',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
        maxWidth: '380px',
      },
      success: {
        duration: 3000,
        iconTheme: {
          primary: '#22C55E',
          secondary: '#FFFFFF',
        },
      },
      error: {
        duration: 5000,
        iconTheme: {
          primary: '#EF4444',
          secondary: '#FFFFFF',
        },
      },
    }}
  />
)

export { ToastConfig }
