import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL
const STATIC_BASE = import.meta.env.VITE_STATIC_BASE

const FALLBACK_IMGS = {
  drinkware: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&q=80&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80&fit=crop',
  signage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&q=80&fit=crop',
  home_decor: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80&fit=crop',
  gifts: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=900&q=80&fit=crop',
  mixed: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80&fit=crop',
}

const CATEGORY_LABELS = {
  drinkware: 'כלי שתייה', accessories: 'אביזרים', signage: 'שילוט',
  home_decor: 'עיצוב הבית', gifts: 'מתנות', mixed: 'מגוון'
}

const FEATURES_BY_CATEGORY = {
  drinkware: ['חריטה עמידה למים', 'מתאים לשטיפה במדיח', 'רזולוציה 1200 DPI', 'גימור פרימיום'],
  accessories: ['עור איכותי בדרגה A', 'חריטה מונולית', 'מתנה בקופסת מתנה', 'כתב יד / מודרני / קלאסי'],
  signage: ['אקריליק 5mm', 'עמיד UV', 'גדלים מותאמים אישית', 'עיגון קיר כלול'],
  home_decor: ['עץ אלון מלא', 'גימור שמן טבעי', 'מידות לפי בחירה', 'תלייה קלה'],
  gifts: ['קופסת מתנה מעוצבת', 'כרטיס ברכה אישי', 'ניתן לעיצוב מלא', 'משלוח מהיר'],
  mixed: ['חומרים איכותיים', 'חריטה מדויקת', 'מותאם אישית', 'אחריות מלאה'],
}

function imgSrc(product) {
  if (!product?.image_url) return FALLBACK_IMGS[product?.category] || FALLBACK_IMGS.mixed
  return product.image_url.startsWith('/') ? STATIC_BASE + product.image_url : product.image_url
}

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    axios.get(`${API}/products/${productId}`)
      .then(r => {
        setProduct(r.data.data)
        // load related
        return axios.get(`${API}/products`)
      })
      .then(r => {
        const all = r.data.data || []
        setRelatedProducts(all.filter(p => p.id !== productId).slice(0, 3))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">autorenew</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h2 className="font-headline font-bold text-2xl text-on-surface mb-4">המוצר לא נמצא</h2>
          <Link to="/products" className="btn-primary px-8 py-3 inline-block">חזרה למוצרים</Link>
        </div>
      </div>
    )
  }

  const features = FEATURES_BY_CATEGORY[product.category] || FEATURES_BY_CATEGORY.mixed

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-6 md:px-8 pt-8 pb-0 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">ראשי</Link>
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <Link to="/products" className="hover:text-primary transition-colors">מוצרים</Link>
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <span className="text-on-surface">{product.name_he}</span>
        </nav>
      </div>

      {/* Main product section */}
      <section className="py-10 md:py-16 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container-low shadow-monolith">
              <img
                src={imgSrc(product)}
                alt={product.name_he}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Category badge */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-label font-bold text-on-surface shadow">
              {CATEGORY_LABELS[product.category] || product.category}
            </div>
          </div>

          {/* Right: info + CTA */}
          <div className="flex flex-col">
            <h1 className="font-headline font-black text-4xl md:text-5xl text-on-surface tracking-tight mb-4">
              {product.name_he}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8 font-light">
              {product.description_he || product.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-surface-container-low rounded-lg px-3 py-2.5">
                  <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm text-on-surface font-label">{f}</span>
                </div>
              ))}
            </div>

            {/* Materials preview */}
            {product.materials && (
              <div className="mb-8">
                <div className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">חומרים זמינים</div>
                <p className="text-on-surface font-body">{product.materials}</p>
              </div>
            )}

            {/* Price + CTA */}
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <div className="text-xs text-on-surface-variant mb-0.5">מחיר מתחיל מ</div>
                  <div className="font-headline font-black text-4xl text-primary">₪{product.price}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">כולל מע"מ ומשלוח</div>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-base">local_shipping</span>
                  5–7 ימי עסקים
                </div>
              </div>
              <button
                onClick={() => navigate('/coming-soon')}
                className="btn-primary w-full py-4 text-xl flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">notifications_active</span>
                הודיעו לי כשחוזר למלאי
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 mt-5 text-on-surface-variant text-xs">
              {[
                { icon: 'lock', label: 'תשלום מאובטח' },
                { icon: 'replay', label: 'החזרה בתוך 30 יום' },
                { icon: 'verified', label: 'מוצר מקורי מהסטודיו' },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 px-6 md:px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-headline font-extrabold text-3xl text-on-surface mb-8 tracking-tight">מוצרים נוספים</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map(p => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:shadow-monolith transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={imgSrc(p)}
                      alt={p.name_he}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors mb-1">{p.name_he}</h3>
                    <span className="text-primary font-headline font-bold">₪{p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
