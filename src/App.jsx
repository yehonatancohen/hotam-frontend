import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
import { ThemeProvider } from './context/ThemeContext'
import { StickerDefs } from './components/StickerArt'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-paper text-ink" dir="rtl" lang="he">
      <ScrollToTop />
      <StickerDefs />
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
