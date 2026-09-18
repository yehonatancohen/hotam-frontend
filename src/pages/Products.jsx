import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductVisual from '../components/ProductVisual'
import Icon, { WA_URL } from '../components/Icon'
import { useTheme } from '../context/ThemeContext'
import { API, CATEGORY_LABELS, fetchWithRetry, formatPrice, materialLabel } from '../lib/catalog'

const BASE_TITLE = 'חותם | חריטת לייזר אישית על עץ, עור ומתכת – ישראל'
const BASE_DESC = 'סטודיו חותם – חריטת לייזר אישית על עץ, עור ומתכת. מתנות מחורטות מיוחדות, שילוט עסקי ומיתוג ייחודי.'

export default function Products() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [activeCategory, setActiveCategory] = useState('all')
  const { visitorName } = useTheme()

  useEffect(() => {
    document.title = 'כל המוצרים – חריטת לייזר אישית | חותם'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'כל מוצרי חריטת הלייזר של חותם: כלי שתייה, עור, שילוט, פריטים לבית ומתנות. כל פריט מותאם אישית.')
    return () => {
      document.title = BASE_TITLE
      if (meta) meta.setAttribute('content', BASE_DESC)
    }
  }, [])

  const load = () => {
    setStatus('loading')
    fetchWithRetry(`${API}/products`)
      .then(r => { setProducts(r.data.data || []); setStatus('ready') })
      .catch(() => setStatus('error'))
  }
  useEffect(load, [])

  const categories = ['all', ...new Set(products.map(p => p.category))]
  const filtered = activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory)
  const count = (cat) => cat === 'all' ? products.length : products.filter(p => p.category === cat).length

  return (
    <div>
      <section className="wrap pt-6 md:pt-10 pb-10">
        <div className="slab" style={{ padding: 'clamp(40px, 5vw, 64px) clamp(26px, 5vw, 64px)' }}>
          <h1 className="font-display m-0 text-white" style={{ fontSize: 'clamp(60px, 8.4vw, 114px)', lineHeight: 0.9 }}>
            כל המוצרים
          </h1>
          <p className="m-0 mt-4 text-[18px] text-on-blue-2 max-w-[48ch]">
            בוחרים פריט, כותבים מה לחרוט ורואים את זה על המוצר. שרטוט לאישור לפני כל חריטה.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <div className="sticky top-[68px] z-30 bg-paper/95 backdrop-blur-sm">
        <div className="wrap py-3 flex gap-2 overflow-x-auto" role="toolbar" aria-label="סינון לפי קטגוריה">
          {categories.map(cat => {
            const active = activeCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={active}
                className="btn btn-sm shrink-0"
                style={active
                  ? { background: 'var(--blue)', color: '#fff' }
                  : { background: 'var(--sheet)', color: 'var(--ink)', boxShadow: 'inset 0 0 0 2.5px var(--ink)' }}
              >
                {cat === 'all' ? 'הכל' : CATEGORY_LABELS[cat] || cat}
                <span className="tabular opacity-60 text-[13px]">{count(cat)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <section className="wrap py-10 md:py-14">
        {status === 'ready' && !products.some(p => p.image_url) && (
          <p className="m-0 mb-8 text-[15px] text-ink-3 max-w-[70ch]">
            עוד אין לנו צילומים, אז כל מוצר מצויר עם {visitorName ? <><strong className="text-ink">״{visitorName}״</strong> עליו</> : 'הכיתוב שלכם עליו'}.
            {!visitorName && <> אפשר לכתוב מה לחרוט <Link to="/" className="link-u">בעמוד הבית</Link>.</>}
          </p>
        )}

        {status === 'loading' && (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="טוענים מוצרים">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[5/4] rounded-[22px] bg-paper-2 animate-pulse" />
                <div className="h-5 w-2/3 mt-5 rounded bg-paper-2 animate-pulse" />
                <div className="h-4 w-1/3 mt-3 rounded bg-paper-2 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="sheet text-center px-6 py-16">
            <p className="font-display text-[38px] m-0">לא הצלחנו לטעון את המוצרים</p>
            <p className="m-0 mt-2 text-ink-2">בדרך כלל זה עובר אחרי כמה שניות.</p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button type="button" onClick={load} className="btn btn-pink"><Icon name="refresh" size={18} /> לנסות שוב</button>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line"><Icon name="whatsapp" size={18} /> לשאול אותנו</a>
            </div>
          </div>
        )}

        {status === 'ready' && filtered.length === 0 && (
          <div className="sheet text-center px-6 py-16">
            <p className="font-display text-[38px] m-0">אין כרגע מוצרים בקטגוריה הזאת</p>
            <button type="button" onClick={() => setActiveCategory('all')} className="btn btn-line mt-6">להציג הכל</button>
          </div>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <ul className="list-none m-0 p-0 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => <li key={p.id}><ProductTile product={p} tilt={[-4, 3, -2, 5, -3, 2][i % 6]} /></li>)}
          </ul>
        )}
      </section>
    </div>
  )
}

function ProductTile({ product, tilt = 0 }) {
  return (
    <Link to={`/products/${product.id}`} className="group block">
      <ProductVisual product={product} className="aspect-[5/4]" tilt={tilt} zoom />
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <h2 className="m-0 text-[19px] font-bold leading-snug"><span className="group-hover:hl">{product.name_he}</span></h2>
          <p className="m-0 mt-1 text-[14.5px] text-ink-3">
            {[materialLabel(product.materials), CATEGORY_LABELS[product.category]].filter(Boolean).join(' · ')}
          </p>
        </div>
        <p className="m-0 font-display text-[40px] leading-none tabular text-blue shrink-0">{formatPrice(product.price)}</p>
      </div>
      <p className="m-0 mt-3 inline-flex items-center gap-1.5 text-[15px] font-medium text-blue">
        לעצב ולהזמין
        <Icon name="arrowBack" size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
      </p>
    </Link>
  )
}
