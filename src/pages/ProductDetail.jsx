import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ProductVisual from '../components/ProductVisual'
import Icon, { waLink } from '../components/Icon'
import { API, CATEGORY_LABELS, formatPrice, imgSrc, materialLabel } from '../lib/catalog'

const SITE_URL = 'https://hatam-laser.co.il'
const BASE_TITLE = 'חותם | חריטת לייזר אישית על עץ, עור ומתכת – ישראל'
const BASE_DESC = 'סטודיו חותם – חריטת לייזר אישית על עץ, עור ומתכת. מתנות מחורטות מיוחדות, שילוט עסקי ומיתוג ייחודי.'
const OG_FALLBACK = `${SITE_URL}/logo.png`

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])

  useEffect(() => {
    setLoading(true)
    axios.get(`${API}/products/${productId}`)
      .then(r => {
        setProduct(r.data.data)
        return axios.get(`${API}/products`)
      })
      .then(r => setRelated((r.data.data || []).filter(p => p.id !== productId).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    if (!product) return
    const desc = `${product.name_he} – ${product.description_he || 'חריטת לייזר אישית'} | חותם סטודיו לייזר`
    const image = imgSrc(product) || OG_FALLBACK
    document.title = `${product.name_he} – חריטת לייזר אישית | חותם`
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', desc)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = `${SITE_URL}/products/${productId}`

    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDesc = document.querySelector('meta[property="og:description"]')
    const ogImg = document.querySelector('meta[property="og:image"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogTitle) ogTitle.setAttribute('content', `${product.name_he} | חותם`)
    if (ogDesc) ogDesc.setAttribute('content', desc)
    if (ogImg) ogImg.setAttribute('content', image)
    if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}/products/${productId}`)

    document.getElementById('product-schema')?.remove()
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'product-schema'
    script.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name_he,
        description: product.description_he || product.description,
        image,
        brand: { '@type': 'Brand', name: 'חותם' },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'ILS',
          availability: 'https://schema.org/PreOrder',
          url: `${SITE_URL}/products/${productId}`,
          seller: { '@type': 'Organization', name: 'חותם - סטודיו לייזר' },
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ראשי', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'מוצרים', item: `${SITE_URL}/products` },
          { '@type': 'ListItem', position: 3, name: product.name_he, item: `${SITE_URL}/products/${productId}` },
        ],
      },
    ])
    document.head.appendChild(script)
    return () => {
      document.title = BASE_TITLE
      if (metaDesc) metaDesc.setAttribute('content', BASE_DESC)
      canonical.href = `${SITE_URL}/`
      if (ogTitle) ogTitle.setAttribute('content', 'חותם | חריטת לייזר אישית על עץ, עור ומתכת')
      if (ogDesc) ogDesc.setAttribute('content', BASE_DESC)
      if (ogImg) ogImg.setAttribute('content', OG_FALLBACK)
      if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}/`)
      document.getElementById('product-schema')?.remove()
    }
  }, [product, productId])

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-ink-3" role="status">
        <span className="flex items-center gap-3"><Icon name="spinner" size={22} /> טוענים…</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="wrap py-24">
        <div className="sheet text-center px-6 py-16 max-w-xl mx-auto">
          <h1 className="font-display text-[44px] m-0">המוצר הזה לא נמצא</h1>
          <p className="m-0 mt-2 text-ink-2">אולי הוא ירד מהלוח. יש עוד הרבה מה לחרוט.</p>
          <Link to="/products" className="btn btn-pink mt-6">לכל המוצרים</Link>
        </div>
      </div>
    )
  }

  // "שעון קיר 'מונולית' - עץ אלון" → title plus a material subline, so no line opens with a dash.
  const [title, ...rest] = product.name_he.split(' - ')
  const subtitle = rest.join(' - ')

  // Only facts the studio entered in the dashboard; nothing invented per category.
  const features = product.features ? product.features.split(',').map(f => f.trim()).filter(Boolean) : []
  const specs = [
    ['חומר', materialLabel(product.materials)],
    ['קטגוריה', CATEGORY_LABELS[product.category]],
    ['זמן הכנה', product.production_time || '5–7 ימי עסקים מאישור השרטוט'],
  ].filter(([, v]) => v)

  return (
    <div>
      <nav className="wrap pt-6 text-[14.5px] text-ink-3" aria-label="פירורי לחם">
        <ol className="list-none m-0 p-0 flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="link-u">ראשי</Link></li>
          <li aria-hidden="true"><Icon name="chevron" size={14} /></li>
          <li><Link to="/products" className="link-u">מוצרים</Link></li>
          <li aria-hidden="true"><Icon name="chevron" size={14} /></li>
          <li className="text-ink" aria-current="page">{product.name_he}</li>
        </ol>
      </nav>

      <section className="wrap py-8 md:py-12 grid gap-10 lg:gap-16 lg:grid-cols-[1.1fr_1fr] items-start">
        <div className="lg:sticky lg:top-24">
          <div className="slab-yellow">
            <ProductVisual product={product} className="aspect-square" size="lg" tilt={-3} />
          </div>
          {!product.image_url && (
            <p className="m-0 mt-3 text-[14px] text-ink-3">זה איור של המוצר עם הכיתוב שלכם. צילום אמיתי בדרך.</p>
          )}
        </div>

        <div>
          <h1 className="font-display m-0" style={{ fontSize: 'clamp(54px, 6.6vw, 87px)', lineHeight: 0.9 }}>
            {title}
            {subtitle && <span className="block mt-2 text-ink-3" style={{ fontSize: '0.5em' }}>{subtitle}</span>}
          </h1>
          {(product.description_he || product.description) && (
            <p className="m-0 mt-5 text-[18px] text-ink-2 max-w-[52ch]">{product.description_he || product.description}</p>
          )}

          <dl className="m-0 mt-8 border-t-2 border-ink">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3.5 border-b border-[var(--rule-strong)]">
                <dt className="text-ink-3">{k}</dt>
                <dd className="m-0 font-medium text-end">{v}</dd>
              </div>
            ))}
          </dl>

          {features.length > 0 && (
            <ul className="list-none m-0 p-0 mt-6 grid gap-2.5">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-ink-2">
                  <Icon name="check" size={18} className="text-blue shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="ticket mt-10">
            <div className="p-6 md:p-7 flex items-end justify-between gap-4">
              <div>
                <p className="m-0 text-[14px] text-ink-3">מחיר ליחידה, כולל חריטה</p>
                <p className="m-0 mt-1 font-display text-[64px] leading-none tabular">{formatPrice(product.price)}</p>
              </div>
              <p className="m-0 text-[14px] text-ink-3 text-end max-w-[18ch]">משלוח חינם בהזמנה מעל ₪300</p>
            </div>
            <div className="ticket-cut" aria-hidden="true" />
            <div className="p-6 md:p-7">
              <button type="button" onClick={() => navigate(`/customizer/${product.id}`)} className="btn btn-pink w-full text-[17px]" style={{ minHeight: 56 }}>
                <Icon name="pen" size={19} />
                לעצב את החריטה
              </button>
              <p className="m-0 mt-4 text-[14.5px] text-ink-2 flex items-start gap-2">
                <Icon name="check" size={17} className="text-blue shrink-0 mt-0.5" />
                לפני שמתחילים לחרוט שולחים לכם שרטוט לאישור. בלי אישור שלכם, הלייזר לא נדלק.
              </p>
              <a
                href={waLink(`היי חותם, יש לי שאלה על ${product.name_he}.`)}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-[15px] link-u"
              >
                <Icon name="whatsapp" size={16} /> שאלה על המוצר בוואטסאפ
              </a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-[var(--rule)] bg-paper-2">
          <div className="wrap py-16 md:py-20">
            <h2 className="font-display m-0 text-[clamp(48px,5vw,72px)]">עוד דברים לחרוט</h2>
            <ul className="list-none m-0 p-0 mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-3">
              {related.map(p => (
                <li key={p.id}>
                  <Link to={`/products/${p.id}`} className="group block">
                    <ProductVisual product={p} className="aspect-[5/4]" size="sm" tilt={3} zoom />
                    <div className="mt-4 flex justify-between gap-4">
                      <span className="font-semibold group-hover:hl">{p.name_he}</span>
                      <span className="font-semibold tabular">{formatPrice(p.price)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
