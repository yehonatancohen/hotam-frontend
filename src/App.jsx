import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Customizer from './pages/Customizer'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import ComingSoon from './pages/ComingSoon'
import { CartProvider } from './context/CartContext'

function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="bg-inverse-surface text-inverse-on-surface text-sm py-2 px-4 flex items-center justify-center gap-3 relative" dir="rtl">
      <span>המוצרים שלנו בקרוב! הירשמו לרשימת ההמתנה וקבלו עדכון ראשונים</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors p-1"
        aria-label="סגור"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/customizer/:productId" element={<ComingSoon />} />
              <Route path="/checkout" element={<ComingSoon />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}
