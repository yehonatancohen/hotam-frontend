import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = 'http://localhost:3001/api'

// Curated Unsplash photos – laser/wood/craft theme
const HERO_BG = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1800&q=80&fit=crop'
const PROCESS_IMGS = [
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80&fit=crop',
]
const PRODUCT_IMGS = {
  drinkware: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop',
  signage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80&fit=crop',
  home_decor: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop',
  gifts: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80&fit=crop',
  mixed: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&fit=crop',
}
const ABOUT_IMG = 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80&fit=crop'

export default function Home() {
  const [products, setProducts] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${API}/products`)
      .then(r => setProducts(r.data.data || []))
      .catch(() => setProducts([]))
  }, [])

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#080c10]">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BG}
            alt="לייזר בפעולה"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Subtle grid overlay for depth */}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }}
        />

        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="max-w-4xl text-right mr-auto">
            <h1 className="font-headline font-black text-6xl md:text-9xl text-white mb-8 leading-[1.0] hero-text-shadow">
              דיוק של <br />
              <span className="text-primary-fixed-dim">טכנולוגיה</span>,<br />
              <span className="opacity-90">נשמה של עץ.</span>
            </h1>

            <p className="font-body text-xl md:text-2xl text-white/80 mb-12 max-w-2xl leading-relaxed font-light">
              סטודיו לאמנות הלייזר. חריטה מדויקת על עץ, עור ומתכת — לכל מתנה, כל סיפור, כל רגע שמגיע להישמר.
            </p>

            <div className="flex flex-row-reverse gap-4 md:gap-6">
              <Link to="/customizer" className="btn-primary px-10 md:px-14 py-4 md:py-5 text-lg">
                הזמינו עכשיו
              </Link>
              <a
                href="#products"
                onClick={e => { e.preventDefault(); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}
                className="btn-ghost px-10 md:px-14 py-4 md:py-5 text-lg cursor-pointer"
              >
                גלריית עבודות
              </a>
            </div>
          </div>
        </div>

        {/* Side decoration */}
        <div className="absolute left-0 top-0 h-full w-16 xl:w-20 border-r border-white/5 hidden xl:flex flex-col justify-center items-center gap-12 text-white/20">
          <span className="text-xs tracking-[1em] uppercase" style={{ writingMode: 'vertical-rl' }}>Est. 2024</span>
          <span className="text-xs tracking-[1em] uppercase" style={{ writingMode: 'vertical-rl' }}>High Definition Craft</span>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent animate-float" />
        </div>
      </section>

      {/* ── Process strip ── */}
      <section className="py-12 bg-inverse-surface overflow-hidden">
        <div className="flex gap-0 max-w-full">
          {PROCESS_IMGS.map((src, i) => (
            <div key={i} className="flex-1 min-h-[180px] overflow-hidden relative">
              <img src={src} alt="" className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity duration-500 hover:scale-105 transform" style={{ minHeight: 180 }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
        </div>
      </section>

      {/* ── Products Bento Grid ── */}
      <section id="products" className="py-24 md:py-32 px-6 md:px-8 bg-surface scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row-reverse justify-between items-end mb-16 md:mb-20 gap-6">
            <div className="max-w-2xl">
              <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface mb-4 tracking-tight">
                קולקציית המוצרים
              </h2>
              <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-light">
                כל פריט נבחר בקפידה ומקבל זהות חדשה תחת קרן הלייזר. מהמתנה האישית המושלמת ועד למיתוג עסקי יוקרתי.
              </p>
            </div>
            <div className="hidden md:block h-px flex-grow bg-outline-variant/30 mx-8 mb-3" />
            <Link
              to="/products"
              className="text-primary font-bold flex items-center gap-2 group text-lg whitespace-nowrap"
            >
              לכל המוצרים
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              {products[0] && <ProductCard product={products[0]} className="md:col-span-7" large />}
              {products[1] && <ProductCard product={products[1]} className="md:col-span-5" />}
              {products[2] && <ProductCard product={products[2]} className="md:col-span-12" wide />}
              {products.slice(3, 6).map(p => (
                <ProductCard key={p.id} product={p} className="md:col-span-4" />
              ))}
            </div>
          ) : (
            <ProductSkeleton />
          )}
        </div>
      </section>

      {/* ── Technology / About (dark) ── */}
      <section id="about" className="py-24 bg-inverse-surface text-inverse-on-surface overflow-hidden relative scroll-mt-16">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{ background: 'radial-gradient(circle at center, #005e97 0%, transparent 70%)' }} />
        </div>
        <div className="container mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-16 md:gap-20 items-center">
          {/* Photo */}
          <div className="relative order-2 md:order-1">
            <div className="aspect-square rounded-xl overflow-hidden shadow-2xl">
              <img
                src={ABOUT_IMG}
                alt="הסטודיו שלנו"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 rounded-xl border border-primary/20" />
            </div>
            {/* floating stat card */}
            <div className="absolute -bottom-6 -right-6 bg-surface-container-lowest/10 backdrop-blur-md border border-white/10 rounded-xl p-5 text-white">
              <div className="font-headline font-black text-4xl text-primary-fixed-dim">1200 <span className="text-lg">DPI</span></div>
              <div className="text-xs text-white/50 mt-0.5 uppercase tracking-widest">רזולוציית חריטה</div>
            </div>
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-secondary/20 rounded-full blur-3xl z-[-1]" />
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <p className="text-primary-fixed-dim font-label text-xs uppercase tracking-[0.25em] mb-4">אודותינו</p>
            <h2 className="font-headline font-extrabold text-4xl md:text-5xl mb-6 leading-tight tracking-tight text-white">
              הטכנולוגיה<br />שמאחורי הרגש.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10 font-light">
              חתם נוסד מתוך אמונה שטכנולוגיה וחומרים טבעיים יכולים לחיות יחד בהרמוניה מושלמת. כל פריט שאנחנו מייצרים הוא שילוב בין דיוק מיקרוסקופי לבין חמימות אורגנית.
            </p>
            <ul className="space-y-8">
              {[
                { icon: 'precision_manufacturing', title: 'דיוק מיקרוסקופי', text: 'חריטה ברזולוציה של 1200DPI — אפילו תמונות ופרטים דקים ביותר נשמרים בשלמות.' },
                { icon: 'eco', title: 'חומרים טבעיים בלבד', text: 'עץ מלא, עור אמיתי, מתכות בגימורים טבעיים — ללא ציפויים מלאכותיים.' },
                { icon: 'local_shipping', title: 'משלוח מהיר לכל הארץ', text: 'כל הזמנה ארוזה בקפידה ומגיעה תוך 5–7 ימי עסקים עם מעקב מלא.' },
              ].map(item => (
                <li key={item.icon} className="flex flex-row-reverse items-start gap-5">
                  <div className="bg-primary-container/30 p-3.5 rounded-xl text-primary-fixed border border-primary/20 shrink-0">
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-xl mb-1.5 text-white">{item.title}</h4>
                    <p className="text-white/60 leading-relaxed font-light">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Gallery strip ── */}
      <section className="py-20 bg-surface-container-low px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-right mb-10">
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">מגלריית העבודות</h2>
            <p className="text-on-surface-variant mt-2">כמה מהפריטים שיצאו מהסטודיו שלנו</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80&fit=crop', label: 'עץ ולייזר' },
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80&fit=crop', label: 'חריטה דקה' },
              { src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80&fit=crop', label: 'ארנק עור' },
              { src: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80&fit=crop', label: 'כוס תרמית' },
            ].map((item, i) => (
              <div key={i} className="group aspect-square rounded-xl overflow-hidden relative cursor-pointer">
                <img src={item.src} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-0 right-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-white font-label text-sm font-semibold">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-surface px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-right mb-12">
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">מה הלקוחות אומרים</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'מיכל כ.', text: 'קיבלתי ארנק עם חריטה אישית לאבי ליום הולדתו. הוא בכה. המוצר מושלם, הפרטים מדהימים.', product: 'ארנק עור' },
              { name: 'יאיר ב.', text: 'הזמנתי שילוט לחלל המשרד שלנו. התוצאה עלתה על כל הציפיות — מקצועי, מדויק, יוצא מן הכלל.', product: 'שילוט אקריליק' },
              { name: 'שירה א.', text: 'שירות מהיר, תקשורת מצוינת, והמוצר הגיע שלם ויפה. אחזור בוודאות לפריטים נוספים.', product: 'כוס תרמית' },
            ].map((t, i) => (
              <div key={i} className="bg-surface-container-low rounded-xl p-7 flex flex-col gap-4 border border-outline-variant/10">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-on-surface font-body leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                  <span className="font-headline font-bold text-on-surface text-sm">{t.name}</span>
                  <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">{t.product}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative py-20 overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at 30% 50%, white 0%, transparent 70%)' }} />
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="font-headline font-black text-4xl md:text-5xl text-white mb-6 tracking-tight">
            מוכנים ליצור משהו מיוחד?
          </h2>
          <p className="font-body text-white/80 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            הזינו את הטקסט שלכם, בחרו חומר — ואנחנו ניצור עבורכם פריט שיחיה לנצח.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-14 py-5 text-xl bg-white text-primary font-headline font-bold rounded-lg shadow-xl hover:bg-white/90 active:scale-95 transition-all"
          >
            בחרו מוצר
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-6 md:px-8 bg-surface-container-low scroll-mt-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-primary font-label text-xs uppercase tracking-[0.25em] mb-4">צרו קשר</p>
            <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-6 tracking-tight">נשמח לשמוע מכם</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
              שאלות על מוצר? רוצים הצעת מחיר לפרויקט? הצוות שלנו כאן בשבילכם — בדרך כלל מגיבים תוך שעה.
            </p>
            <div className="space-y-5">
              {[
                { icon: 'phone', label: 'טלפון', value: '050-000-0000' },
                { icon: 'email', label: 'דוא"ל', value: 'studio@hatam-laser.co.il' },
                { icon: 'location_on', label: 'כתובת', value: 'תל אביב, ישראל' },
                { icon: 'schedule', label: 'שעות פתיחה', value: 'א׳–ה׳  09:00–18:00' },
              ].map(item => (
                <div key={item.icon} className="flex flex-row-reverse items-center gap-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-widest font-label">{item.label}</div>
                    <div className="font-headline font-semibold text-on-surface">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-10">
              {[
                { icon: 'camera_alt', label: 'אינסטגרם' },
                { icon: 'groups', label: 'פייסבוק' },
              ].map(s => (
                <a key={s.label} href="#" className="flex items-center gap-2 px-5 py-2.5 bg-surface-container rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all text-sm font-label font-semibold">
                  <span className="material-symbols-outlined text-base">{s.icon}</span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  )
}

// ── Sub-components ──

function ProductCard({ product, className = '', large, wide }) {
  const src = (product.image_url
    ? (product.image_url.startsWith('/') ? `http://localhost:3001${product.image_url}` : product.image_url)
    : PRODUCT_IMGS[product.category] || PRODUCT_IMGS.mixed)

  if (wide) {
    return (
      <Link to={`/products/${product.id}`} className={`${className} flex flex-col md:flex-row bg-surface-container rounded-xl overflow-hidden group border border-outline-variant/10`}>
        <div className="md:w-1/2 relative min-h-[280px] md:min-h-[360px] overflow-hidden">
          <img src={src} alt={product.name_he} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
        </div>
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <div className="mb-3 text-secondary font-bold tracking-[0.2em] text-xs uppercase">
            {categoryLabel(product.category)}
          </div>
          <h3 className="font-headline font-bold text-3xl md:text-4xl mb-5 text-on-surface group-hover:text-primary transition-colors">{product.name_he}</h3>
          <p className="text-on-surface-variant text-lg mb-8 leading-relaxed font-light">{product.description_he}</p>
          <div className="flex items-center gap-6">
            <span className="btn-primary px-8 py-3 text-base">בחר מוצר</span>
            <span className="text-primary font-headline font-black text-2xl">₪{product.price}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/products/${product.id}`} className={`${className} bg-surface-container-low rounded-xl overflow-hidden group border border-outline-variant/10 flex flex-col hover:shadow-monolith transition-all`}>
      <div className={`relative overflow-hidden ${large ? 'aspect-video' : 'aspect-square'}`}>
        <img src={src} alt={product.name_he} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="p-7 flex-1 flex flex-col">
        <h3 className="font-headline font-bold text-xl md:text-2xl mb-3 text-on-surface group-hover:text-primary transition-colors">{product.name_he}</h3>
        <p className="text-on-surface-variant mb-5 font-light text-base flex-1">{product.description_he}</p>
        <div className="flex items-center justify-between">
          <span className="btn-primary px-5 py-2 text-sm">בחר מוצר</span>
          <span className="text-primary font-headline font-bold text-xl">₪{product.price}</span>
        </div>
      </div>
    </Link>
  )
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-pulse">
      {[7, 5, 12, 4, 4, 4].map((span, i) => (
        <div key={i} className={`md:col-span-${span} bg-surface-container-low rounded-xl overflow-hidden`}>
          <div className="aspect-video bg-surface-container-high" />
          <div className="p-7 space-y-3">
            <div className="h-5 bg-surface-container rounded w-2/3" />
            <div className="h-4 bg-surface-container rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-surface-container-lowest rounded-xl p-8 shadow-monolith border border-outline-variant/10">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">שם מלא</label>
        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="ישראל ישראלי" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">דוא"ל</label>
        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field" placeholder="israel@example.com" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">הודעה</label>
        <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} className="input-field resize-none" placeholder="ספרו לנו על הפרויקט שלכם..." required />
      </div>
      <button type="submit" className="btn-primary w-full py-4 text-base">
        {sent ? '✓ ההודעה נשלחה!' : 'שליחה'}
      </button>
    </form>
  )
}

function categoryLabel(cat) {
  return { drinkware: 'כלי שתייה', accessories: 'אביזרים', signage: 'שילוט', home_decor: 'עיצוב הבית', gifts: 'מתנות', mixed: 'מגוון' }[cat] || cat
}
