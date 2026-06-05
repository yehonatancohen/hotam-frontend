import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { label: 'ראשי',    href: '/', hash: null,      matchPath: (p) => p === '/', matchHash: null },
  { label: 'מוצרים', href: '/products', hash: null, matchPath: (p) => p.startsWith('/products'), matchHash: null },
  { label: 'אודות',  href: '/', hash: 'about',    matchPath: () => false, matchHash: 'about' },
  { label: 'צרו קשר', href: '/', hash: 'contact', matchPath: () => false, matchHash: 'contact' },
]

function smoothScrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHash, setActiveHash] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { cartItem } = useCart()
  const { theme: t } = useTheme()

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Track which section is in view when on the home page
  useEffect(() => {
    if (location.pathname !== '/') { setActiveHash(null); return }
    const sections = ['contact', 'about']
    const observers = sections.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveHash(id) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      return obs
    })
    const onScroll = () => {
      if (window.scrollY < 200) setActiveHash(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observers.forEach(o => o?.disconnect())
      window.removeEventListener('scroll', onScroll)
    }
  }, [location.pathname])

  const isActive = (link) => {
    if (link.matchHash && location.pathname === '/') return activeHash === link.matchHash
    if (link.matchPath(location.pathname)) return !activeHash
    return false
  }

  const handleClick = (link, e) => {
    e.preventDefault()
    setMenuOpen(false)

    if (link.hash) {
      if (location.pathname === '/') {
        smoothScrollTo(link.hash)
      } else {
        navigate('/')
        setTimeout(() => smoothScrollTo(link.hash), 150)
      }
      return
    }

    if (link.href === '/') {
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
    <nav 
      className="sticky top-0 z-50 transition-all duration-350"
      style={{
        background: scrolled ? t.navBg : 'transparent',
        borderBottom: scrolled ? `1px solid ${t.border}` : 'none',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
      }}
    >
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
            className="h-9 w-auto object-contain transition-all"
            style={t.id === 'dark' ? { filter: 'brightness(0) invert(1) opacity(0.9)' } : {}}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-row-reverse items-center gap-8">
          {NAV.map(link => {
            const active = isActive(link)
            return (
              <a
                key={link.label}
                href={link.hash ? `#${link.hash}` : link.href}
                onClick={(e) => handleClick(link, e)}
                className="font-headline font-bold text-sm tracking-tight transition-all duration-200 cursor-pointer select-none pb-0.5"
                style={{
                  color: active ? t.accent : t.textSub,
                  borderBottom: active ? `2px solid ${t.accent}` : '2px solid transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.color = t.text}
                onMouseLeave={e => e.currentTarget.style.color = active ? t.accent : t.textSub}
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
            className="relative p-2 rounded-full transition-all duration-200"
            style={{ color: t.accent }}
            onMouseEnter={e => e.currentTarget.style.background = t.accentSubtle}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            aria-label="עגלת קניות"
          >
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            {cartItem && (
              <span 
                className="absolute -top-0.5 -left-0.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse"
                style={{ background: t.accent, color: t.accentText }}
              >
                1
              </span>
            )}
          </button>

          <button
            className="md:hidden p-2 rounded-full"
            style={{ color: t.text }}
            onMouseEnter={e => e.currentTarget.style.background = t.accentSubtle}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="תפריט"
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div 
          className="md:hidden border-t px-6 py-2 transition-colors duration-300"
          style={{ background: t.bgCard, borderColor: t.border }}
        >
          {NAV.map(link => {
            const active = isActive(link)
            return (
              <a
                key={link.label}
                href={link.hash ? `#${link.hash}` : link.href}
                onClick={(e) => handleClick(link, e)}
                className="block font-headline font-bold text-base py-3.5 border-b last:border-0 cursor-pointer transition-colors text-right"
                style={{
                  color: active ? t.accent : t.textSub,
                  borderColor: t.border,
                }}
                onMouseEnter={e => e.currentTarget.style.color = t.text}
                onMouseLeave={e => e.currentTarget.style.color = active ? t.accent : t.textSub}
              >
                {link.label}
              </a>
            )
          })}
        </div>
      )}
    </nav>
  )
}

