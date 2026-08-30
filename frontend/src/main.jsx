import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext' // 🔥 নতুন ইম্পোর্ট

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider> {/* 🔥 এখানে র‍্যাপ করুন */}
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
