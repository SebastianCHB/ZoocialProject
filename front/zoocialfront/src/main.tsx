import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PayPalScriptProvider options={{
      clientId: PAYPAL_CLIENT_ID,
      currency: 'USD',
      // INTENT_OMITTED - No definir intent aquí: se define en createOrder para evitar conflicto
      locale: 'es_MX',
  }}>
      <App />
    </PayPalScriptProvider>
  </StrictMode>,
)
