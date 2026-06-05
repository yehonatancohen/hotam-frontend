import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const API = import.meta.env.VITE_API_URL
const STATIC_BASE = import.meta.env.VITE_STATIC_BASE

const FALLBACK_IMGS = {
  drinkware: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop',
  signage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80&fit=crop',
  home_decor: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop',
  gifts: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80&fit=crop',
  mixed: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&fit=crop',
}

const CATEGORY_LABELS = {
  drinkware: 'כלי שתייה', accessories: 'אביזרים', signage: 'שילוט',
  home_decor: 'עיצוב הבית', gifts: 'מתנות', mixed: 'מגוון'
}

function imgSrc(product) {
  if (!product.image_url) return FALLBACK_IMGS[product.category] || FALLBACK_IMGS.mixed
  return product.image_url.startsWith('/') ? STATIC_BASE + product.image_url : product.image_url
}

async function fetchWithRetry(url, retries = 4, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { timeout: 12000 })
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

const BASE_TITLE = 'חותם | חריטת לייזר אישית על עץ, עור ומתכת – ישראל'
const BASE_DESC = 'סטודיו חותם – חריטת לייזר אישית על עץ, עור ומתכת. מתנות מחורטות מיוחדות, שילוט עסקי ומיתוג ייחודי.'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const { theme: t } = useTheme()

  useEffect(() => {
    document.title = 'כל המוצרים – חריטת לייזר אישית | חותם'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'עיינו בכל מוצרי חריטת הלייזר של חותם – כלי שתייה, אביזרי עור, שילוט, עיצוב הבית ומתנות. כל פריט מותאם אישית.')
    return () => {
      document.title = BASE_TITLE
      if (meta) meta.setAttribute('content', BASE_DESC)
    }
  }, [])

  const load = () => {
    setLoading(true)
    setError(false)
    fetchWithRetry(`${API}/products`)
      .then(r => setProducts(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const categories = ['all', ...new Set(products.map(p => p.category))]
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory)

  return (
    <div dir="rtl" className="transition-colors duration-300" style={{ background: t.bg, color: t.text }}>
      {/* Page header */}
      <section className="py-16 md:py-24 px-6 md:px-8" style={{ background: t.bg }}>
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
            style={{ color: t.textSub }}
            onMouseEnter={e => e.currentTarget.style.color = t.text}
            onMouseLeave={e => e.currentTarget.style.color = t.textSub}
          >
            <span className="material-symbols-outlined text-base">arrow_forward</span>
            חזרה לדף הבית
          </Link>
          <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tighter mb-4" style={{ color: t.text }}>
            כל המוצרים
          </h1>
          <p className="text-xl max-w-2xl leading-relaxed font-light" style={{ color: t.textSub }}>
            בחרו מוצר, התאימו אישית וקבלו פריט שנוצר עבורכם בדיוק מיקרוסקופי.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <div 
        className="sticky top-[52px] z-40 px-6 md:px-8 py-3 border-b backdrop-blur-sm transition-colors duration-300" 
        style={{ background: t.navBg, borderColor: t.border }}
      >
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-thin pb-0.5">
          {categories.map(cat => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-label font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? t.accent : t.bgCard,
                  color: active ? t.accentText : t.textSub,
                  border: `1.5px solid ${active ? t.accent : t.border}`,
                  boxShadow: active ? `0 2px 8px ${t.accent}33` : 'none',
                }}
              >
                {cat === 'all' ? 'הכל' : CATEGORY_LABELS[cat] || cat}
                <span className="mr-1.5 opacity-60 text-xs">
                  ({cat === 'all' ? products.length : products.filter(p => p.category === cat).length})
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <section className="py-12 px-6 md:px-8" style={{ background: t.bg }}>
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div>
              <p className="text-center text-sm mb-8 animate-pulse" style={{ color: t.textMuted }}>טוען מוצרים...</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border" style={{ background: t.bgCard, borderColor: t.border }}>
                    <div className="aspect-square" style={{ background: t.bgAlt }} />
                    <div className="p-5 space-y-2">
                      <div className="h-4 rounded w-3/4" style={{ background: t.bgAlt }} />
                      <div className="h-3 rounded w-full" style={{ background: t.bgAlt }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl block mb-4" style={{ color: t.textMuted }}>wifi_off</span>
              <p className="font-headline font-bold text-xl mb-2" style={{ color: t.text }}>לא הצלחנו לטעון את המוצרים</p>
              <p className="text-sm mb-6" style={{ color: t.textMuted }}>נסו שוב בעוד רגע</p>
              <button 
                onClick={load} 
                className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                style={{ background: t.accent, color: t.accentText }}
              >
                נסה שוב
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20" style={{ color: t.textMuted }}>
              <span className="material-symbols-outlined text-5xl block mb-3">inbox</span>
              לא נמצאו מוצרים בקטגוריה זו
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product }) {
  const src = imgSrc(product)
  const { theme: t } = useTheme()

  return (
    <Link
      to={`/products/${product.id}`}
      className="group rounded-xl overflow-hidden border transition-all duration-300 flex flex-col"
      style={{
        background: t.bgCard,
        borderColor: t.border,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = t.borderStrong;
        e.currentTarget.style.boxShadow = t.shadow;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden relative" style={{ background: t.bgAlt }}>
        <img
          src={src}
          alt={product.name_he}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-3 right-3 left-3 flex justify-end opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <span 
            className="text-xs font-bold px-3 py-1.5 rounded-full shadow"
            style={{ background: t.accent, color: t.accentText }}
          >
            התחל לעצב ←
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col text-right">
        <div className="text-xs mb-1.5 font-label uppercase tracking-wider" style={{ color: t.textMuted }}>
          {CATEGORY_LABELS[product.category] || product.category}
        </div>
        <h3 
          className="font-headline font-bold text-lg leading-snug mb-2 transition-colors"
          style={{ color: t.text }}
          onMouseEnter={e => e.currentTarget.style.color = t.accent}
          onMouseLeave={e => e.currentTarget.style.color = t.text}
        >
          {product.name_he}
        </h3>
        <p className="text-sm leading-relaxed flex-1 line-clamp-2" style={{ color: t.textSub }}>
          {product.description_he}
        </p>
        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: t.border }}>
          <span className="font-headline font-black text-xl flex flex-col items-start leading-none" style={{ color: t.accent }}>
            <span>₪{product.price}</span>
            <span className="text-[10px] font-normal mt-0.5" style={{ color: t.textMuted }}>לפני משלוח</span>
          </span>
          <span className="material-symbols-outlined transition-colors" style={{ color: t.textMuted }}>arrow_back</span>
        </div>
      </div>
    </Link>
  )
}
