import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
import { ThemeProvider, useTheme, THEMES } from './context/ThemeContext'

function TwemojiParser() {
  const location = useLocation()
  useEffect(() => {
    if (window.twemoji) {
      window.twemoji.parse(document.body, { folder: 'svg', ext: '.svg' })
    }
  }, [location.pathname])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  const { theme: t } = useTheme()
  if (dismissed) return null
  return (
    <div 
      className="text-sm py-2 px-4 flex items-center justify-center gap-3 relative transition-colors duration-300" 
      style={{ background: t.accent, color: t.accentText }}
      dir="rtl"
    >
      <span>המוצרים שלנו בקרוב! הירשמו לרשימת ההמתנה וקבלו עדכון ראשונים</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors p-1"
        style={{ color: t.accentText, opacity: 0.7 }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
        aria-label="סגור"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}

function AppContent() {
  const { theme: t } = useTheme()

  return (
    <div 
      className="flex flex-col min-h-screen transition-colors duration-300"
      style={{ background: t.bg, color: t.text }}
    >
      <ScrollToTop />
      <TwemojiParser />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/customizer/:productId" element={<Customizer />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

