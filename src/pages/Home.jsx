import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StickerArt from '../components/StickerArt'
import ProductVisual, { stickerKind } from '../components/ProductVisual'
import Icon, { WA_URL, waLink } from '../components/Icon'
import { useTheme } from '../context/ThemeContext'
import { API, CATEGORY_LABELS, fetchWithRetry, formatPrice, materialLabel } from '../lib/catalog'

const STEPS = [
  { n: '1', title: 'בוחרים וכותבים', body: 'בוחרים פריט, כותבים שם, תאריך או ברכה, או מעלים לוגו. רואים איך זה נראה על המוצר עוד באתר.' },
  { n: '2', title: 'מקבלים שרטוט לאישור', body: 'שולחים לכם את הקובץ הסופי, בלי עלות. משהו לא יושב? מתקנים עד שזה מדויק.' },
  { n: '3', title: 'חורטים ושולחים', body: 'רק אחרי שאמרתם כן, הלייזר נדלק. 5–7 ימי עסקים מהאישור ועד הבית.' },
]

const BUSINESS_ITEMS = [
  { title: 'שילוט לחנות ולמשרד', body: 'שלטי כניסה, שמות על דלתות, לוחות תפריט. עץ, מתכת או אקריליק.' },
  { title: 'מתנות ללקוחות ולעובדים', body: 'סדרה ממותגת בכל כמות, ואם רוצים, שם אישי על כל פריט.' },
  { title: 'הלוגו שלכם על מה שאתם שולחים', body: 'ארנקים, מחזיקי מפתחות, כוסות תרמיות וקופסאות מתנה.' },
]

const FAQ_ITEMS = [
  { q: 'כמה זמן לוקחת הזמנה?', a: '5–7 ימי עסקים מרגע שאישרתם את השרטוט, כולל משלוח עד הבית. יש תאריך קרוב? כתבו לנו ונבדוק מה אפשר.' },
  { q: 'על אילו חומרים אתם חורטים?', a: 'עץ, עור ומתכת, וגם אקריליק. יש לכם חומר אחר בראש? שלחו תמונה ונבדוק אם הלייזר מסתדר איתו.' },
  { q: 'מה צריך לשלוח לכם?', a: 'טקסט, לוגו או תמונה. גם רעיון כללי מספיק: נחזור אליכם ונחדד ביחד עד שהקובץ מדויק.' },
  { q: 'יש מינימום הזמנה?', a: 'אין. אפשר פריט אחד למתנה ואפשר סדרה שלמה לעסק.' },
  { q: 'אפשר לראות איך זה ייראה לפני החריטה?', a: 'כן, תמיד. שולחים לכם שרטוט לאישור, והלייזר נדלק רק אחרי שאמרתם כן.' },
]

const MARQUEE = ['פריט אחד או סדרה לעסק', 'בלי מינימום', 'שרטוט לפני לייזר', '5–7 ימי עסקים', 'עץ, עור ומתכת']

// Hero sticker layout (desktop): position, size and tilt of each sticker.
const HERO_SLOTS = [
  { kind: 'clock', sample: 'בית לוי', style: { left: '0%', top: '0%', width: '46%' }, tilt: -7 },
  { kind: 'wallet', sample: 'ד.כ', style: { left: '50%', top: '4%', width: '44%' }, tilt: 7 },
  { kind: 'cup', sample: 'ל-אבא', style: { left: '12%', top: '50%', width: '27%' }, tilt: -4 },
  { kind: 'keychain', sample: 'חותם', style: { left: '56%', top: '56%', width: '24%' }, tilt: 12 },
]

function Misprint({ as: Tag = 'h2', text, className = '', style, light = false }) {
  return (
    <Tag className={`font-display m-0 misprint ${light ? 'misprint-light' : ''} ${className}`} data-text={text} style={{ whiteSpace: 'pre-line', ...style }}>
      {text}
    </Tag>
  )
}

export default function Home() {
  const { visitorName, setVisitorName } = useTheme()
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [openFaq, setOpenFaq] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', material: '', desc: '' })
  const [sent, setSent] = useState(false)
  const [draft, setDraft] = useState(visitorName)
  const [printed, setPrinted] = useState(visitorName)

  const load = () => {
    setStatus('loading')
    fetchWithRetry(`${API}/products`, 2, 1500)
      .then(r => { setProducts(r.data.data || []); setStatus('ready') })
      .catch(() => setStatus('error'))
  }
  useEffect(load, [])

  // Print pass: stickers reprint a moment after typing stops, not on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => { setPrinted(draft.trim()); setVisitorName(draft.trim()) }, 450)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const byKind = (kind) => products.find(p => stickerKind(p) === kind)

  const contactMessage = () => [
    `היי חותם, זה ${form.name}.`,
    form.material && `חומר: ${form.material}.`,
    form.desc,
    form.phone && `טלפון: ${form.phone}`,
  ].filter(Boolean).join('\n')

  const onContact = (e) => {
    e.preventDefault()
    window.open(waLink(contactMessage()), '_blank', 'noopener')
    setSent(true)
  }

  return (
    <div>
      {/* ── First viewport ── */}
      <section className="wrap pt-2 md:pt-6 pb-14 md:pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <Misprint as="h1" text={'חורטים\nלכם שם'} style={{ fontSize: 'clamp(104px, 16vw, 232px)', lineHeight: 0.82, whiteSpace: 'pre' }} />
            <p className="m-0 mt-7 text-[clamp(18px,1.6vw,22px)] font-medium leading-relaxed max-w-[32ch]">
              חמישה חברים, לייזר אחד. חורטים על עץ, עור ומתכת — כל פריט יוצא עם החותם שלנו עליו. <span className="hl">ותמיד שולחים שרטוט לאישור</span> לפני שהלייזר נדלק.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/products" className="btn btn-pink">לבחור מה לחרוט <Icon name="arrowBack" size={18} /></Link>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line"><Icon name="whatsapp" size={18} /> וואטסאפ</a>
            </div>

            <div className="mt-10 max-w-md">
              <label htmlFor="print-name" className="field-label">מה לחרוט? כתבו, וזה יודפס על כל המוצרים באתר</label>
              <input
                id="print-name"
                className="field text-[19px] font-semibold"
                value={draft}
                maxLength={18}
                onChange={e => setDraft(e.target.value)}
                placeholder="למשל: דנה ויואב"
                autoComplete="off"
                enterKeyHint="done"
              />
            </div>
          </div>

          {/* Stickers: scattered on desktop, a neat 2×2 on phones */}
          <div className="relative hidden lg:block" style={{ height: 600 }}>
            {HERO_SLOTS.map(slot => {
              const p = byKind(slot.kind)
              const word = printed || slot.sample
              const inner = (
                <>
                  <StickerArt key={word} kind={slot.kind} text={word} className="sticker-hover" style={{ transform: `rotate(${slot.tilt}deg)` }} />
                  {p && (
                    <span className="sticker-tag" style={{ right: '50%', bottom: -30, transform: `translateX(50%) rotate(${-slot.tilt / 3}deg)` }}>
                      {p.name_he.split(' - ')[0]} · <span className="text-pink-deep">{formatPrice(p.price)}</span>
                    </span>
                  )}
                </>
              )
              return p ? (
                <Link key={slot.kind} to={`/products/${p.id}`} className="group absolute" style={slot.style} aria-label={`${p.name_he}, ${formatPrice(p.price)}`}>{inner}</Link>
              ) : (
                <div key={slot.kind} className="absolute" style={slot.style}>{inner}</div>
              )
            })}
            <svg className="absolute" style={{ left: '40%', top: '42%' }} width="70" height="70" viewBox="0 0 80 80" aria-hidden="true"><path d="M40 4 L46 34 L76 40 L46 46 L40 76 L34 46 L4 40 L34 34Z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="3" /></svg>
            <svg className="absolute" style={{ left: '88%', top: '48%' }} width="40" height="40" viewBox="0 0 80 80" aria-hidden="true"><path d="M40 4 L46 34 L76 40 L46 46 L40 76 L34 46 L4 40 L34 34Z" fill="var(--pink)" /></svg>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:hidden">
            {HERO_SLOTS.map((slot, i) => {
              const word = printed || slot.sample
              return (
                <div key={slot.kind} className="grid place-items-center">
                  <StickerArt key={word} kind={slot.kind} text={word} style={{ transform: `rotate(${i % 2 ? 5 : -5}deg)`, width: slot.kind === 'keychain' || slot.kind === 'cup' ? '70%' : '100%' }} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>{m} <span className="star">✺</span></span>
          ))}
        </div>
      </div>

      {/* ── Catalog: the sticker sheet ── */}
      <section id="catalog" className="wrap pt-24 md:pt-32 pb-20 md:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Misprint text="מה אפשר לחרוט" style={{ fontSize: 'clamp(72px, 9vw, 132px)' }} />
          <Link to="/products" className="btn btn-line">כל המוצרים <Icon name="arrowBack" size={18} /></Link>
        </div>
        <p className="m-0 mt-5 text-[17px] text-ink-2 max-w-[56ch]">
          כל מה שיש לנו כרגע. הציורים מראים את {printed ? <strong className="text-ink">״{printed}״</strong> : 'הכיתוב שלכם'} על המוצר. צילומים אמיתיים בדרך.
        </p>

        {status === 'loading' && (
          <p className="mt-12 flex items-center gap-3 text-ink-3" role="status"><Icon name="spinner" size={20} /> טוענים את המוצרים…</p>
        )}
        {status === 'error' && (
          <div className="sheet mt-12 px-6 py-12 text-center">
            <p className="m-0 font-display text-[42px]">לא הצלחנו לטעון את המוצרים</p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <button type="button" onClick={load} className="btn btn-pink"><Icon name="refresh" size={18} /> לנסות שוב</button>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line">לשאול בוואטסאפ</a>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <ul className="list-none m-0 p-0 mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <li key={p.id}>
                <Link to={`/products/${p.id}`} className="group block">
                  <ProductVisual product={p} className="aspect-[5/4]" tilt={[-4, 3, -2, 5, -3, 2][i % 6]} zoom />
                  <div className="mt-2 flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="m-0 text-[19px] font-bold leading-snug"><span className="group-hover:hl">{p.name_he}</span></h3>
                      <p className="m-0 mt-1 text-[14.5px] text-ink-3">{[materialLabel(p.materials), CATEGORY_LABELS[p.category]].filter(Boolean).join(' · ')}</p>
                    </div>
                    <p className="m-0 font-display text-[40px] leading-none tabular text-blue shrink-0">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── How it works ── */}
      <section id="how" className="wrap pb-20 md:pb-28">
        <div className="sheet" style={{ padding: 'clamp(32px, 5vw, 72px)' }}>
          <Misprint text={'הלייזר נדלק רק\nאחרי שאמרתם כן.'} style={{ fontSize: 'clamp(60px, 7.5vw, 112px)' }} />
          <ol className="list-none m-0 p-0 mt-12 grid gap-10 md:grid-cols-3 md:gap-10">
            {STEPS.map(s => (
              <li key={s.n}>
                <span className="stepnum misprint block" data-text={s.n} aria-hidden="true">{s.n}</span>
                <h3 className="m-0 mt-3 text-[22px] font-bold">{s.title}</h3>
                <p className="m-0 mt-2 text-ink-2 text-[16.5px] max-w-[34ch]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Business ── */}
      <section id="business" className="wrap pb-20 md:pb-28">
        <div className="slab grid gap-10 lg:grid-cols-[1.15fr_1fr] items-center" style={{ padding: 'clamp(36px, 5vw, 72px)' }}>
          <div>
            <Misprint light text="חותם לעסקים" style={{ fontSize: 'clamp(72px, 9vw, 128px)', '--mx': '-0.04em', '--my': '0.03em' }} />
            <p className="m-0 mt-5 text-[18px] text-on-blue-2 max-w-[44ch]">
              המיתוג שלכם, חרוט על מה שאתם נותנים ללקוחות, לעובדים ולדלת של המשרד — כדי שגם החותם שלכם ישאיר רושם. בלי מינימום, ועם שרטוט לאישור לפני כל סדרה.
            </p>
            <ul className="list-none m-0 p-0 mt-9 border-t-2 border-white/40">
              {BUSINESS_ITEMS.map(it => (
                <li key={it.title} className="py-5 border-b-2 border-white/40">
                  <h3 className="m-0 text-[20px] font-bold text-white">{it.title}</h3>
                  <p className="m-0 mt-1 text-on-blue-2">{it.body}</p>
                </li>
              ))}
            </ul>
            <a href={waLink('היי חותם, אנחנו עסק ורוצים לשמוע על חריטה ממותגת.')} target="_blank" rel="noopener noreferrer" className="btn btn-paper mt-10">
              <Icon name="whatsapp" size={18} /> לדבר על הזמנה לעסק
            </a>
          </div>
          <div className="relative hidden md:block" style={{ height: 420 }} aria-hidden="true">
            <StickerArt kind="acrylic" text="הלוגו שלכם" style={{ position: 'absolute', width: '82%', left: '4%', top: '6%', transform: 'rotate(-5deg)' }} />
            <StickerArt kind="keychain" text="הצוות" style={{ position: 'absolute', width: '30%', left: '58%', top: '56%', transform: 'rotate(12deg)' }} />
            <StickerArt kind="cup" text="לקוחות" style={{ position: 'absolute', width: '26%', left: '8%', top: '50%', transform: 'rotate(-8deg)' }} />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="wrap pb-20 md:pb-28 grid gap-10 lg:grid-cols-[1fr_1.6fr] items-start">
        <Misprint text={'לפני\nשמזמינים'} style={{ fontSize: 'clamp(72px, 8.5vw, 120px)' }} />
        <div className="border-t-[3px] border-ink">
          {FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i
            return (
              <div key={item.q} className="border-b-[3px] border-ink">
                <h3 className="m-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    aria-expanded={open}
                    aria-controls={`faq-${i}`}
                    className="w-full flex items-center justify-between gap-6 bg-transparent border-0 cursor-pointer text-start py-5 text-[20px] font-bold text-ink"
                  >
                    <span className={open ? 'hl' : ''}>{item.q}</span>
                    <span
                      className="grid place-items-center shrink-0 w-10 h-10 rounded-full transition-transform duration-300"
                      style={{ background: open ? 'var(--pink)' : 'var(--sheet)', boxShadow: 'inset 0 0 0 2.5px var(--ink)', transform: open ? 'rotate(45deg)' : 'none' }}
                      aria-hidden="true"
                    >
                      <Icon name="plus" size={18} strokeWidth={2.4} />
                    </span>
                  </button>
                </h3>
                <div id={`faq-${i}`} hidden={!open}>
                  <p className="m-0 pb-6 pe-14 text-[17px] text-ink-2 max-w-[62ch]">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="wrap pb-20 md:pb-28 grid gap-10 lg:grid-cols-[1fr_1.6fr] items-start">
        <div>
          <Misprint text={'ספרו לנו\nמה צריך'} style={{ fontSize: 'clamp(72px, 8.5vw, 120px)' }} />
          <p className="m-0 mt-5 text-[17px] text-ink-2 max-w-[40ch]">
            ממלאים, ואנחנו מכינים לכם הודעת וואטסאפ מוכנה לשליחה. עונים בימים א׳–ה׳ בין 9:00 ל־18:00.
          </p>
          <p className="m-0 mt-4 text-[17px]">
            או ישר: <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="link-u font-bold" dir="ltr">052-948-8077</a>
          </p>
        </div>

        <div className="sheet tape" style={{ padding: 'clamp(28px, 4vw, 48px)' }}>
          {sent ? (
            <div role="status">
              <p className="font-display m-0 text-[60px] text-blue">ההודעה מחכה בוואטסאפ.</p>
              <p className="m-0 mt-3 text-ink-2 max-w-[48ch]">פתחנו לכם צ׳אט עם ההודעה כתובה. רק ללחוץ שליחה. לא נפתח?</p>
              <div className="flex flex-wrap gap-4 mt-6">
                <a href={waLink(contactMessage())} target="_blank" rel="noopener noreferrer" className="btn btn-pink"><Icon name="whatsapp" size={18} /> לפתוח שוב</a>
                <button type="button" className="btn btn-line" onClick={() => setSent(false)}>לערוך את ההודעה</button>
              </div>
            </div>
          ) : (
            <form onSubmit={onContact} className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="field-label">שם</label>
                  <input id="c-name" className="field" required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="c-phone" className="field-label">טלפון (לא חובה)</label>
                  <input id="c-phone" className="field" type="tel" dir="ltr" autoComplete="tel" placeholder="050-000-0000" style={{ textAlign: 'right' }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label htmlFor="c-material" className="field-label">על מה חורטים?</label>
                <select id="c-material" className="field" value={form.material} onChange={e => setForm({ ...form, material: e.target.value })}>
                  <option value="">בחרו חומר</option>
                  {['עץ', 'עור', 'מתכת', 'עוד לא יודע/ת'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-desc" className="field-label">מה אתם מחפשים?</label>
                <textarea id="c-desc" className="field" rows={4} required placeholder="מתנה ליום הולדת, 30 מחזיקי מפתחות עם לוגו, שלט לדלת…" style={{ resize: 'vertical' }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
              </div>
              <div><button type="submit" className="btn btn-pink"><Icon name="whatsapp" size={18} /> להכין הודעת וואטסאפ</button></div>
            </form>
          )}
        </div>
      </section>

      {/* ── Close ── */}
      <section className="wrap pb-24">
        <div className="slab-pink text-center" style={{ padding: 'clamp(52px, 7vw, 96px) clamp(24px, 5vw, 64px)' }}>
          <p className="font-display m-0 mx-auto misprint" data-text={'חריטה אחת טובה\nמשאירה חותם.'} style={{ fontSize: 'clamp(64px, 8.5vw, 124px)', whiteSpace: 'pre-line', color: 'var(--ink)', '--under': 'var(--blue)', '--mx': '0.035em', '--my': '0.03em' }}>
            {'חריטה אחת טובה\nמשאירה חותם.'}
          </p>
          <Link to="/products" className="btn btn-blue mt-10">לבחור מה לחרוט <Icon name="arrowBack" size={18} /></Link>
        </div>
      </section>

      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="כתבו לנו בוואטסאפ"
        className="sm:hidden fixed z-40 grid place-items-center rounded-full text-white"
        style={{ insetInlineEnd: 16, bottom: 16, width: 56, height: 56, background: '#25D366', boxShadow: '4px 4px 0 var(--ink)' }}
      >
        <Icon name="whatsapp" size={28} />
      </a>
    </div>
  )
}
