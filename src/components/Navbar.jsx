import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Icon, { WA_URL } from './Icon'
import Logo from './Logo'

const NAV = [
  { label: 'מוצרים', href: '/products' },
  { label: 'לעסקים', hash: 'business' },
  { label: 'איך זה עובד', hash: 'how' },
  { label: 'שאלות', hash: 'faq' },
  { label: 'צרו קשר', hash: 'contact' },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { cartItem } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const go = (link, e) => {
    e.preventDefault()
    setMenuOpen(false)
    if (link.hash) {
      if (location.pathname === '/') scrollToId(link.hash)
      else {
        navigate('/')
        setTimeout(() => scrollToId(link.hash), 150)
      }
      return
    }
    navigate(link.href)
  }

  const isActive = (link) => link.href && location.pathname.startsWith(link.href)

  return (
    <header
      className="sticky top-0 z-50 transition-[background-color,box-shadow] duration-300"
      style={{
        background: scrolled || menuOpen ? 'rgba(243,243,239,0.96)' : 'var(--paper)',
        boxShadow: scrolled ? '0 2.5px 0 var(--ink)' : 'none',
        backdropFilter: scrolled ? 'saturate(1.2) blur(10px)' : 'none',
      }}
    >
      <nav className="wrap flex items-center justify-between gap-6 h-[68px]" aria-label="ראשי">
        <Link
          to="/"
          onClick={e => {
            if (location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
          }}
          className="flex items-center shrink-0"
        >
          <Logo size={32} />
        </Link>

        <ul className="hidden lg:flex items-center gap-1 m-0 p-0 list-none">
          {NAV.map(link => (
            <li key={link.label}>
              <a
                href={link.hash ? `/#${link.hash}` : link.href}
                onClick={e => go(link, e)}
                aria-current={isActive(link) ? 'page' : undefined}
                className="relative block px-3.5 py-2 rounded-full text-[15px] font-medium text-ink-2 hover:text-ink hover:bg-yellow transition-colors"
              >
                {link.label}
                {isActive(link) && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-[4px] rounded-full bg-pink" aria-hidden="true" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-line btn-sm hidden sm:inline-flex"
          >
            <Icon name="whatsapp" size={17} />
            וואטסאפ
          </a>
          <button
            type="button"
            onClick={() => navigate(cartItem ? '/checkout' : '/products')}
            className="btn btn-sm relative"
            style={{ background: cartItem ? 'var(--ink)' : 'transparent', color: cartItem ? '#fff' : 'var(--ink)', boxShadow: cartItem ? 'none' : 'inset 0 0 0 2.5px var(--ink)' }}
            aria-label={cartItem ? 'להזמנה שלך (פריט אחד)' : 'עגלה ריקה, למוצרים'}
          >
            <Icon name="bag" size={19} />
            {cartItem && (
              <>
                <span className="hidden sm:inline">להזמנה</span>
                <span className="live-dot" aria-hidden="true" />
              </>
            )}
          </button>
          <button
            type="button"
            className="lg:hidden btn btn-sm"
            style={{ background: 'transparent', color: 'var(--ink)', paddingInline: 10 }}
            onClick={() => setMenuOpen(o => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="lg:hidden wrap pb-4">
          <div className="slab p-3 pt-10">
            <ul className="m-0 p-0 list-none">
              {NAV.map(link => (
                <li key={link.label}>
                  <a
                    href={link.hash ? `/#${link.hash}` : link.href}
                    onClick={e => go(link, e)}
                    className="flex items-center justify-between px-4 py-3.5 font-display text-[40px] leading-none text-white border-t border-white/25 first:border-t-0"
                  >
                    {link.label}
                    <Icon name="arrowBack" size={20} className="opacity-70" />
                  </a>
                </li>
              ))}
            </ul>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-paper w-full mt-3">
              <Icon name="whatsapp" size={18} />
              כתבו לנו בוואטסאפ
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
