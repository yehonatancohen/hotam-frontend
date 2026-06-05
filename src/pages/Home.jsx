import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const API = import.meta.env.VITE_API_URL
const STATIC_BASE = import.meta.env.VITE_STATIC_BASE

const PROCESS_IMGS = [
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80&fit=crop',
]

const PRODUCT_FALLBACK_IMGS = {
  drinkware: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80&fit=crop',
  accessories: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop',
  signage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80&fit=crop',
  home_decor: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop',
  gifts: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80&fit=crop',
  mixed: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80&fit=crop',
}

const REVIEWS = [
  { name: 'מיכל ל.', role: 'לקוחה פרטית', q: 'הזמנתי לוח עץ עם שם הבן שלי לצד שישי. הגיע מוקדם, האריזה הייתה מושלמת. ממליצה בחום!' },
  { name: 'רועי מ.', role: 'מנהל עסקי', q: 'הכנסנו מתנות מחורטות ללקוחות הגדולים שלנו. הרושם היה פנומנלי — אנשים עדיין מדברים על זה.' },
  { name: 'שירה ד.', role: 'בעלת עסק', q: 'הזמנתי שלט לחנות. שירות מהיר, מחיר הוגן, תוצאה מדויקת בדיוק כמו שרציתי.' },
]

const STEPS = [
  { n: '01', t: 'שולחים לנו רעיון', d: 'טקסט, לוגו, תמונה — גם רעיון גס מספיק. ניצור איתכם קשר ונחדד ביחד.' },
  { n: '02', t: 'אנחנו מייצרים', d: 'כל פריט נוצר אחד לאחד על הלייזר שלנו, בדיוק מרבי ואהבה לפרטים.' },
  { n: '03', t: 'מגיע אליכם', d: 'אריזה מוקפדת ומשלוח מהיר עד הדלת תוך 5-7 ימי עסקים.' },
]

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

export default function Home() {
  const [products, setProducts] = useState([])
  const { theme: t } = useTheme()
  const [contactForm, setContactForm] = useState({ name: '', phone: '', type: '', desc: '' })
  const [contactSent, setContactSent] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    fetchWithRetry(`${API}/products`)
      .then(r => setProducts(r.data.data || []))
      .catch(() => setProducts([]))
  }, [])

  const handleContactSubmit = (e) => {
    e.preventDefault()
    setContactSent(true)
    setTimeout(() => {
      setContactSent(false)
      setContactForm({ name: '', phone: '', type: '', desc: '' })
    }, 5000)
  }

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '14px 18px',
    borderRadius: 10,
    border: `1.5px solid ${focusedField === fieldName ? t.accent : t.border}`,
    background: t.bgCard,
    color: t.text,
    fontSize: 16,
    fontFamily: 'Heebo, sans-serif',
    outline: 'none',
    transition: 'all 0.2s',
    direction: 'rtl',
  })

  return (
    <div dir="rtl" className="transition-colors duration-300" style={{ background: t.bg, color: t.text }}>
      
      {/* ── Hero ── */}
      <section className="flex flex-col lg:flex-row min-h-[90vh] items-stretch">
        {/* Text Panel */}
        <div className="flex-1 lg:flex-[1.25] flex flex-col justify-center px-6 md:px-16 py-20 lg:pt-[120px] lg:pr-[15%] lg:pb-[80px] lg:pl-[48px]" style={{ background: t.bg }}>
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-6" style={{ color: t.accent }}>
              חריטת לייזר · ישראל
            </div>
            <h1 
              className="font-headline font-black mb-6 leading-[1.08] tracking-tight"
              style={{ fontSize: 'clamp(44px, 5.2vw, 76px)', color: t.text }}
            >
              חריטה<br />שמשאירה<br />
              <span style={{ color: t.accent }}>חותם</span>
            </h1>
            <p className="text-base md:text-lg mb-10 font-light leading-relaxed" style={{ color: t.textSub }}>
              חריטת לייזר אישית על עץ, עור ומתכת. מתנות שאי אפשר לשכוח, שילוט עסקי ומיתוג ייחודי — כל פריט נוצר בדיוק רב.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link 
                to="/products"
                className="px-8 py-4 rounded-xl font-headline font-bold text-base text-center transition-all duration-200"
                style={{ background: t.accent, color: t.accentText }}
                onMouseEnter={e => { e.currentTarget.style.background = t.accentHover; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.transform = '' }}
              >
                להזמנה אישית ←
              </Link>
              <a 
                href="https://wa.me/972529488077" 
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 rounded-xl font-headline font-medium text-sm text-center border transition-all duration-200 flex items-center gap-2"
                style={{ borderColor: t.borderStrong, color: t.text }}
                onMouseEnter={e => { e.currentTarget.style.background = t.accentSubtle; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = '' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        
        {/* Image Panel */}
        <div className="flex-1 lg:flex-[0.75] relative overflow-hidden min-h-[350px] lg:min-h-0">
          <img 
            src="/hero.jpg" 
            alt="לוח עץ מחורט" 
            className="w-full h-full object-cover object-center display-block" 
          />
          {/* Desktop gradient fade overlay to blend with the text panel */}
          <div 
            className="hidden lg:block absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to left, ${t.bg} 0%, transparent 60%)`
            }}
          />
          <div 
            className="absolute bottom-6 right-6 p-4 rounded-xl shadow-lg border text-right"
            style={{ background: t.bgCard, borderColor: t.border, boxShadow: t.shadow }}
          >
            <div className="font-headline font-bold text-sm mb-1" style={{ color: t.text }}>מוצרים אישיים ומיתוג עסק</div>
            <div className="text-xs font-light" style={{ color: t.textMuted }}>חריטת לייזר איכותית ומדויקת</div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section 
        className="py-12 px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-b transition-colors duration-300"
        style={{ background: t.bgAlt, borderColor: t.border }}
      >
        {[
          { v: '500+', l: 'פריטים מחורטים' },
          { v: '100%', l: 'לקוחות מרוצים' },
          { v: '5-7 ימים', l: 'משלוח מהיר עד הבית' },
          { v: 'ייצור מקומי', l: 'עבודת יד מוקפדת' },
        ].map(i => (
          <div key={i.l}>
            <div className="font-headline font-black text-3xl md:text-4xl mb-2" style={{ color: t.accent }}>{i.v}</div>
            <div className="text-xs" style={{ color: t.textMuted }}>{i.l}</div>
          </div>
        ))}
      </section>

      {/* ── Products Section ── */}
      <section id="products" className="py-24 px-6 md:px-16" style={{ background: t.bg }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.18em] block mb-3" style={{ color: t.accent }}>הקולקציה שלנו</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl mb-4" style={{ color: t.text }}>המוצרים המובילים</h2>
            <p className="text-base font-light" style={{ color: t.textSub }}>בחרו מוצר והתחילו בעיצוב אישי אונליין</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(p => {
              const src = p.image_url
                ? (p.image_url.startsWith('/') ? `${STATIC_BASE}${p.image_url}` : p.image_url)
                : PRODUCT_FALLBACK_IMGS[p.category] || PRODUCT_FALLBACK_IMGS.mixed;

              return (
                <div 
                  key={p.id}
                  className="rounded-2xl p-6 flex flex-col transition-all duration-300 group"
                  style={{
                    background: t.bgCard,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = t.shadow;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/50 mb-6 relative" style={{ background: t.bgAlt }}>
                    <img 
                      src={src} 
                      alt={p.name_he} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                    />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: t.accent }}>
                    {p.category === 'drinkware' ? 'כלי שתייה' : p.category === 'accessories' ? 'אביזרים' : p.category === 'signage' ? 'שילוט' : p.category === 'home_decor' ? 'עיצוב הבית' : 'מתנות'}
                  </div>
                  <h3 className="font-headline font-bold text-xl mb-3" style={{ color: t.text }}>{p.name_he}</h3>
                  <p className="text-sm font-light mb-6 flex-1 leading-relaxed" style={{ color: t.textSub }}>{p.description_he}</p>
                  
                  <div className="flex items-center justify-between mt-auto border-t pt-4" style={{ borderColor: t.border }}>
                    <div className="text-right">
                      <span className="text-[10px] block" style={{ color: t.textMuted }}>החל מ-</span>
                      <span className="font-headline font-bold text-xl" style={{ color: t.accent }}>₪{p.price}</span>
                    </div>
                    <Link 
                      to={`/products/${p.id}`}
                      className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                      style={{ background: t.accent, color: t.accentText }}
                      onMouseEnter={e => e.currentTarget.style.background = t.accentHover}
                      onMouseLeave={e => e.currentTarget.style.background = t.accent}
                    >
                      בחר מוצר
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 md:px-16 transition-colors duration-300 border-t border-b" style={{ background: t.bgAlt, borderColor: t.border }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.18em] block mb-3" style={{ color: t.accent }}>תהליך העבודה</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl" style={{ color: t.text }}>איך זה עובד?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-10 right-[17%] left-[17%] h-px opacity-40" style={{ background: t.borderStrong }} />
            {STEPS.map(s => (
              <div key={s.n} className="text-center relative z-10">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center font-headline font-bold text-lg mb-6 mx-auto shadow-sm"
                  style={{ background: t.accent, color: t.accentText }}
                >
                  {s.n}
                </div>
                <h3 className="font-headline font-bold text-xl mb-3" style={{ color: t.text }}>{s.t}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: t.textSub }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 md:px-16 transition-colors duration-300" style={{ background: t.bg }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.18em] block mb-3" style={{ color: t.accent }}>מה אומרים עלינו</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl" style={{ color: t.text }}>ביקורות לקוחות</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((r, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl p-8 transition-colors duration-300"
                style={{ background: t.bgCard, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-[#cfa052] text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm italic font-light mb-6 leading-relaxed" style={{ color: t.textSub }}>"{r.q}"</p>
                <div className="border-t pt-4" style={{ borderColor: t.border }}>
                  <div className="font-headline font-bold text-sm" style={{ color: t.text }}>{r.name}</div>
                  <div className="text-xs" style={{ color: t.textMuted }}>{r.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="py-24 px-6 md:px-16 transition-colors duration-300 border-t border-b" style={{ background: t.bgAlt, borderColor: t.border }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] block mb-3" style={{ color: t.accent }}>קצת עלינו</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl mb-6" style={{ color: t.text }}>לייזר, אהבה ותשומת לב לפרטים</h2>
            <p className="text-base font-light mb-6 leading-relaxed" style={{ color: t.textSub }}>
              חותם הוא סטודיו לחריטת לייזר שנולד מאהבה לאומנות ולחומרים. אנחנו מאמינים שכל פריט מחורט הוא יותר ממוצר — הוא זיכרון, מסר, חותם אישי שנשאר.
            </p>
            <p className="text-base font-light mb-8 leading-relaxed" style={{ color: t.textSub }}>
              עובדים with לקוחות פרטיים שמחפשים מתנה שתיזכר, ועם עסקים שרוצים שהמיתוג שלהם ידבר בעצמו — על כל פריט שהם שולחים.
            </p>
            <a 
              href="https://wa.me/972529488077" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-headline font-bold text-sm transition-all duration-200"
              style={{ background: t.accent, color: t.accentText }}
              onMouseEnter={e => e.currentTarget.style.background = t.accentHover}
              onMouseLeave={e => e.currentTarget.style.background = t.accent}
            >
              שוחח איתנו עכשיו ב-WhatsApp
            </a>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-square lg:aspect-auto lg:h-[450px] border" style={{ borderColor: t.border }}>
            <img 
              src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80&fit=crop" 
              alt="הסטודיו שלנו" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </section>

      {/* ── Order/Contact Form ── */}
      <section id="contact" className="py-24 px-6 md:px-16 transition-colors duration-300" style={{ background: t.bg }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.18em] block mb-3" style={{ color: t.accent }}>הזמינו עכשיו</span>
            <h2 className="font-headline font-extrabold text-3xl md:text-5xl mb-4" style={{ color: t.text }}>בואו נדבר</h2>
            <p className="text-base font-light" style={{ color: t.textSub }}>מלאו את הפרטים ונחזור אליכם תוך שעות ספורות בימי עסקים</p>
          </div>

          {contactSent ? (
            <div className="text-center py-12 border p-8 bg-white/40 rounded-2xl" style={{ borderColor: t.border }}>
              <div className="font-headline font-bold text-4xl mb-4" style={{ color: t.accent }}>✓ קיבלנו!</div>
              <p className="text-base font-light mb-8" style={{ color: t.textSub }}>נחזור אליכם בהקדם. ניתן גם לפנות ישירות ב-WhatsApp.</p>
              <a 
                href="https://wa.me/972529488077" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-headline font-bold text-sm text-white"
                style={{ background: '#25D366' }}
              >
                פתח WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: t.textSub }}>שם מלא</label>
                  <input 
                    value={contactForm.name} 
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    onFocus={() => setFocusedField('name')} 
                    onBlur={() => setFocusedField(null)}
                    placeholder="ישראל ישראלי" 
                    required 
                    style={inputStyle('name')} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: t.textSub }}>טלפון / WhatsApp</label>
                  <input 
                    value={contactForm.phone} 
                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    onFocus={() => setFocusedField('phone')} 
                    onBlur={() => setFocusedField(null)}
                    placeholder="050-000-0000" 
                    required 
                    type="tel" 
                    style={inputStyle('phone')} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: t.textSub }}>סוג הפריט לחריטה</label>
                <select 
                  value={contactForm.type} 
                  onChange={e => setContactForm({ ...contactForm, type: e.target.value })}
                  onFocus={() => setFocusedField('type')} 
                  onBlur={() => setFocusedField(null)}
                  required 
                  style={{ ...inputStyle('type'), cursor: 'pointer' }}
                >
                  <option value="">בחרו חומר...</option>
                  <option value="wood">חריטה על עץ</option>
                  <option value="leather">חריטה על עור</option>
                  <option value="metal">חריטה על מתכת</option>
                  <option value="other">לא בטוח / אחר</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: t.textSub }}>תיאור ההזמנה</label>
                <textarea 
                  value={contactForm.desc} 
                  onChange={e => setContactForm({ ...contactForm, desc: e.target.value })}
                  onFocus={() => setFocusedField('desc')} 
                  onBlur={() => setFocusedField(null)}
                  placeholder="ספרו לנו מה אתם מחפשים — מתנה, שילוט, כמות, כל מה שתרצו לשתף..."
                  rows={4} 
                  style={{ ...inputStyle('desc'), resize: 'vertical' }} 
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-xl font-headline font-bold text-base border-0 cursor-pointer transition-all duration-200"
                  style={{ background: t.accent, color: t.accentText }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.accentHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.transform = '' }}
                >
                  שלחו הודעה ←
                </button>
                <a 
                  href="https://wa.me/972529488077" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 rounded-xl font-headline font-medium text-sm text-center border transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ borderColor: t.borderStrong, color: t.text, background: t.bgCard }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.text}
                  onMouseLeave={e => e.currentTarget.style.borderColor = t.borderStrong}
                >
                  WhatsApp
                </a>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── WhatsApp FAB ── */}
      <a 
        href="https://wa.me/972529488077" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
        style={{ background: '#25D366', color: '#fff', boxShadow: '0 4px 18px rgba(37,211,102,0.45)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(37,211,102,0.6)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(37,211,102,0.45)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  )
}
