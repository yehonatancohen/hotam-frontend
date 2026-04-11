import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// hash: section id to scroll to (only valid on '/')
const NAV = [
  { label: 'ראשי',         href: '/',           hash: null,       matchPath: (p) => p === '/' },
  { label: 'מוצרים',       href: '/products',   hash: null,       matchPath: (p) => p.startsWith('/products') },
  { label: 'התאמה אישית',  href: '/customizer', hash: null,       matchPath: (p) => p.startsWith('/customizer') },
  { label: 'אודות',        href: '/',           hash: 'about',    matchPath: () => false },
  { label: 'צרו קשר',      href: '/',           hash: 'contact',  matchPath: () => false },
]

function smoothScrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { cartItem } = useCart()

  const handleClick = (link, e) => {
    e.preventDefault()
    setMenuOpen(false)

    if (link.hash) {
      // Hash section — navigate to home first if needed, then scroll
      if (location.pathname === '/') {
        smoothScrollTo(link.hash)
      } else {
        navigate('/')
        setTimeout(() => smoothScrollTo(link.hash), 150)
      }
      return
    }

    if (link.href === '/') {
      // "ראשי" — scroll to top without full reload
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        navigate('/')
      }
      return
    }

    navigate(link.href)
  }

  return (
    <nav className="bg-surface/90 glass-nav sticky top-0 z-50 border-b border-outline-variant/20 shadow-sm">
      <div className="flex flex-row-reverse justify-between items-center w-full px-6 md:px-8 py-3 max-w-full">

        {/* Logo */}
        <Link
          to="/"
          onClick={e => {
            if (location.pathname === '/') {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          className="flex items-center group"
        >
          <img
            src="/logo.png"
            alt="חותם - סטודיו לייזר"
            className="h-9 w-auto object-contain group-hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-row-reverse items-center gap-8">
          {NAV.map(link => {
            const active = link.matchPath(location.pathname)
            return (
              <a
                key={link.label}
                href={link.hash ? `#${link.hash}` : link.href}
                onClick={(e) => handleClick(link, e)}
                className={`font-headline font-bold text-sm tracking-tight transition-all duration-200 cursor-pointer select-none ${
                  active
                    ? 'text-primary border-b-2 border-primary pb-0.5'
                    : 'text-on-surface/70 hover:text-primary'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </div>

        {/* Cart + mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => cartItem ? navigate('/checkout') : navigate('/products')}
            className="relative p-2 rounded-full hover:bg-surface-container-high text-primary transition-colors"
            aria-label="עגלת קניות"
          >
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            {cartItem && (
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                1
              </span>
            )}
          </button>

          <button
            className="md:hidden p-2 rounded-full hover:bg-surface-container-high text-on-surface"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="תפריט"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-low border-t border-outline-variant/15 px-6 py-2">
          {NAV.map(link => (
            <a
              key={link.label}
              href={link.hash ? `#${link.hash}` : link.href}
              onClick={(e) => handleClick(link, e)}
              className={`block font-headline font-bold text-base py-3.5 border-b border-outline-variant/10 last:border-0 cursor-pointer transition-colors text-right ${
                link.matchPath(location.pathname) ? 'text-primary' : 'text-on-surface/80 hover:text-primary'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
