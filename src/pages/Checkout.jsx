import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import Icon, { waLink } from '../components/Icon'
import { LivePreview, CATEGORY_CONFIG, FONT_DEFS, getPreviewImage } from './Customizer'

const API = import.meta.env.VITE_API_URL

const PAYMENT_METHODS = [
  { id: 'bit', label: 'ביט', desc: 'העברה מהאפליקציה' },
  { id: 'credit_card', label: 'כרטיס אשראי', desc: 'נשלח פרטים אחרי האישור' },
  { id: 'apple_pay', label: 'Apple Pay', desc: 'מהטלפון' },
]

const money = (n) => `₪${Number(n).toFixed(2)}`

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItem } = useCart()

  const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '' })
  const [paymentMethod, setPaymentMethod] = useState('bit')
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState({})
  const [shippingFee, setShippingFee] = useState(25)

  // Pre-launch: orders are saved, nobody is charged, and the team follows up personally.
  const [placed, setPlaced] = useState(false)
  const [waitlistState, setWaitlistState] = useState('idle') // idle | sending | done | error

  useEffect(() => {
    axios.get(`${API}/settings`)
      .then(res => {
        if (res.data?.success && res.data.data?.shipping_fee) setShippingFee(Number(res.data.data.shipping_fee))
      })
      .catch(err => console.error('Failed to load settings', err))
  }, [])

  const subtotal = cartItem?.price || 0
  const shipping = subtotal >= 300 ? 0 : shippingFee
  const total = subtotal + shipping - discount

  const { url: productImg, zone: designZone } = cartItem ? getPreviewImage(cartItem.product) : { url: null, zone: null }
  const materials = cartItem ? (CATEGORY_CONFIG[cartItem.product.category] || CATEGORY_CONFIG.mixed).materials : []

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const applyPromo = () => {
    const CODES = { 'HATAM10': 0.1, 'FIRST20': 0.2, 'LASER50': 50 }
    const upper = promoCode.trim().toUpperCase()
    if (CODES[upper]) {
      setDiscount(upper === 'LASER50' ? 50 : subtotal * CODES[upper])
      setPromoError('')
    } else {
      setPromoError('הקוד הזה לא מוכר לנו. בדקו שאין רווח או טעות הקלדה.')
      setDiscount(0)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'צריך שם כדי לדעת למי לחרוט'
    if (!form.customer_email.trim() || !/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'לכתובת הזאת נשלח את השרטוט. בדקו שהיא נכונה'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      document.getElementById(Object.keys(errs)[0])?.focus()
      return
    }
    if (!cartItem) { navigate('/products'); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const orderPayload = {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        engraving_text: cartItem.engravingText,
        font_style: cartItem.fontStyle || 'modern',
        material: cartItem.material || 'default',
        product_id: cartItem.product.id,
        product_name: cartItem.product.name_he,
        product_price: cartItem.price,
        quantity: cartItem.quantity || 1,
        payment_method: paymentMethod,
        promo_code: promoCode,
        discount: discount,
        notes: `הערות מיוחדות: ${cartItem.specialNotes || 'אין'}. מאפיינים שנבחרו: ${JSON.stringify(cartItem.customOptions || {})}`,
        status: 'out_of_stock',
        placement: cartItem.placement,
        placement_logo: cartItem.placementLogo,
        size_scale: cartItem.sizeScale || 1.0,
        size_scale_logo: cartItem.sizeScaleLogo || 1.0,
        rotation_text: cartItem.rotationText || 0,
        rotation_logo: cartItem.rotationLogo || 0,
        text_alignment: cartItem.textAlignment || 'center',
        engraving_type: cartItem.engravingType || 'text',
        uploaded_img_data: cartItem.uploadedImgSrc || null,
        shipping: shipping,
      }
      await axios.post(`${API}/orders`, orderPayload)
      setPlaced(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError('ההזמנה לא נשלחה, כנראה בעיית חיבור. אפשר לנסות שוב, או לשלוח לנו את הפרטים בוואטסאפ.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWaitlist = async () => {
    setWaitlistState('sending')
    try {
      await axios.post(`${API}/waitlist`, { email: form.customer_email, product_id: cartItem?.product?.id })
      setWaitlistState('done')
    } catch (err) {
      setWaitlistState('error')
    }
  }

  if (!cartItem) {
    return (
      <div className="wrap py-24">
        <div className="sheet text-center px-6 py-16 max-w-xl mx-auto">
          <Icon name="bag" size={34} className="mx-auto text-ink-3" />
          <h1 className="font-display text-[44px] m-0 mt-4">עוד לא בחרתם מה לחרוט</h1>
          <p className="m-0 mt-2 text-ink-2">בוחרים מוצר, מעצבים, ורק אז מגיעים לכאן.</p>
          <Link to="/products" className="btn btn-pink mt-6">לבחירת מוצר</Link>
        </div>
      </div>
    )
  }

  const typeLabels = { text: 'טקסט', logo: 'תמונה או לוגו', both: 'טקסט ותמונה' }
  const materialName = materials.find(m => m.id === cartItem.material)?.label

  const ticket = (
    <div className="ticket">
      <div className="p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="m-0 font-display text-[32px]">כרטיס עבודה</h2>
          {placed && <span className="text-[13px] font-medium text-success">נשמר</span>}
        </div>
        <div className="mt-5 rounded-[10px] overflow-hidden">
          <LivePreview
            product={cartItem.product}
            productImg={productImg}
            designZone={designZone}
            engravingType={cartItem.engravingType}
            engravingText={cartItem.engravingText}
            engravingText2=""
            material={materials.find(m => m.id === cartItem.material)}
            font={FONT_DEFS[cartItem.fontStyle] || FONT_DEFS['modern']}
            sizeScale={cartItem.sizeScale || 1.0}
            placement={cartItem.placement || 'custom_50_50_50_30'}
            uploadedImgSrc={cartItem.uploadedImgSrc}
            compact={true}
            placementLogo={cartItem.placementLogo || 'custom_50_70_50_30'}
            sizeScaleLogo={cartItem.sizeScaleLogo || 1.0}
            rotationText={cartItem.rotationText || 0}
            rotationLogo={cartItem.rotationLogo || 0}
            textAlignment={cartItem.textAlignment || 'center'}
          />
        </div>
        <dl className="m-0 mt-5">
          <div className="ticket-row"><dt>מוצר</dt><dd>{cartItem.product.name_he}</dd></div>
          <div className="ticket-row"><dt>חריטה</dt><dd>{typeLabels[cartItem.engravingType] || 'טקסט'}</dd></div>
          {cartItem.engravingText && <div className="ticket-row"><dt>טקסט</dt><dd className="truncate max-w-[60%]">{cartItem.engravingText}</dd></div>}
          {materialName && <div className="ticket-row"><dt>חומר</dt><dd>{materialName}</dd></div>}
          <div className="ticket-row"><dt>כמות</dt><dd>{cartItem.quantity || 1}</dd></div>
        </dl>
      </div>
      <div className="ticket-cut" aria-hidden="true" />
      <div className="p-6">
        <dl className="m-0">
          <div className="ticket-row"><dt>ביניים</dt><dd>{money(subtotal)}</dd></div>
          {discount > 0 && <div className="ticket-row"><dt>קופון</dt><dd className="text-success">−{money(discount)}</dd></div>}
          <div className="ticket-row"><dt>משלוח</dt><dd>{shipping === 0 ? 'חינם' : money(shipping)}</dd></div>
        </dl>
        <div className="flex items-end justify-between mt-4 pt-4 border-t-2 border-ink">
          <span className="font-semibold">סה״כ</span>
          <span className="font-display text-[55px] leading-none tabular">{money(total)}</span>
        </div>
        {shipping > 0 && (
          <p className="m-0 mt-3 text-[13.5px] text-ink-3">משלוח חינם מעל ₪300</p>
        )}

        {!placed && (
          <div className="mt-6">
            <label htmlFor="promo" className="field-label">קוד קופון</label>
            <div className="flex gap-2">
              <input
                id="promo"
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                className="field"
                dir="ltr"
                style={{ textAlign: 'right' }}
                aria-invalid={promoError ? 'true' : undefined}
              />
              <button type="button" onClick={applyPromo} className="btn btn-line shrink-0">להפעיל</button>
            </div>
            {promoError && <p className="field-error m-0"><Icon name="alert" size={15} /> {promoError}</p>}
            {discount > 0 && <p className="m-0 mt-2 text-[14px] text-success flex items-center gap-1.5"><Icon name="check" size={16} /> הקופון הופעל</p>}
          </div>
        )}
      </div>
    </div>
  )

  if (placed) {
    return (
      <div className="wrap py-12 md:py-20 grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
        <div>
          <div className="slab" style={{ padding: 'clamp(40px, 5vw, 64px) clamp(26px, 5vw, 56px)' }}>
            <h1 className="font-display m-0 text-white" style={{ fontSize: 'clamp(54px, 6.9vw, 90px)', lineHeight: 0.9 }}>
              ההזמנה אצלנו, {form.customer_name.split(' ')[0]}.
            </h1>
            <p className="m-0 mt-5 text-[18px] text-on-blue-2 max-w-[46ch]">
              אנחנו עוד לפני פתיחה רשמית ולא גובים תשלום באתר. נחזור אליכם ל־<span dir="ltr">{form.customer_email}</span> עם שרטוט לאישור ופרטי תשלום, ורק אחרי שתאשרו נתחיל לחרוט.
            </p>
            <a
              href={waLink(`היי חותם, בדיוק שלחתי הזמנה של ${cartItem.product.name_he} על שם ${form.customer_name}.`)}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-paper mt-8"
            >
              <Icon name="whatsapp" size={18} /> לזרז אותנו בוואטסאפ
            </a>
          </div>

          <div className="sheet mt-8" style={{ padding: 'clamp(24px, 3.5vw, 36px)' }}>
            <h2 className="m-0 font-display text-[32px]">לשמוע כשנפתחים רשמית?</h2>
            <p className="m-0 mt-2 text-ink-2">מייל אחד כשהחנות נפתחת. בלי ספאם.</p>
            {waitlistState === 'done' ? (
              <p className="m-0 mt-5 font-medium text-success flex items-center gap-2" role="status"><Icon name="check" size={18} /> רשמנו. נעדכן אתכם.</p>
            ) : (
              <>
                <button type="button" onClick={handleWaitlist} disabled={waitlistState === 'sending'} className="btn btn-pink mt-5">
                  {waitlistState === 'sending' ? <><Icon name="spinner" size={18} /> שולחים…</> : <>לעדכן אותי ב־<span dir="ltr">{form.customer_email}</span></>}
                </button>
                {waitlistState === 'error' && <p className="field-error m-0 mt-3"><Icon name="alert" size={15} /> לא הצלחנו לרשום. נסו שוב עוד רגע.</p>}
              </>
            )}
          </div>

          <Link to="/products" className="inline-flex items-center gap-2 mt-8 link-u">
            להמשיך לראות מוצרים <Icon name="arrowBack" size={16} />
          </Link>
        </div>
        <aside>{ticket}</aside>
      </div>
    )
  }

  return (
    <div className="wrap py-10 md:py-16">
      <h1 className="font-display m-0" style={{ fontSize: 'clamp(54px, 6.9vw, 90px)', lineHeight: 0.9 }}>
        פרטים אחרונים
      </h1>
      <p className="m-0 mt-3 text-[17px] text-ink-2 max-w-[58ch]">
        אנחנו לפני פתיחה רשמית ועוד לא גובים תשלום באתר. שולחים את ההזמנה, ואנחנו חוזרים אליכם עם שרטוט לאישור ופרטי תשלום.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
        <div className="sheet" style={{ padding: 'clamp(22px, 3.5vw, 40px)' }}>
          <section>
            <h2 className="m-0 font-display text-[33px]">למי לחרוט</h2>
            <div className="grid gap-5 mt-5">
              <div>
                <label htmlFor="customer_name" className="field-label">שם מלא</label>
                <input
                  id="customer_name"
                  type="text"
                  autoComplete="name"
                  value={form.customer_name}
                  onChange={e => updateField('customer_name', e.target.value)}
                  className="field"
                  aria-invalid={errors.customer_name ? 'true' : undefined}
                  aria-describedby={errors.customer_name ? 'err-name' : undefined}
                />
                {errors.customer_name && <p id="err-name" className="field-error m-0"><Icon name="alert" size={15} /> {errors.customer_name}</p>}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="customer_email" className="field-label">מייל, לשם נשלח את השרטוט</label>
                  <input
                    id="customer_email"
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                    value={form.customer_email}
                    onChange={e => updateField('customer_email', e.target.value)}
                    className="field"
                    aria-invalid={errors.customer_email ? 'true' : undefined}
                    aria-describedby={errors.customer_email ? 'err-email' : undefined}
                  />
                  {errors.customer_email && <p id="err-email" className="field-error m-0"><Icon name="alert" size={15} /> {errors.customer_email}</p>}
                </div>
                <div>
                  <label htmlFor="customer_phone" className="field-label">טלפון (לא חובה)</label>
                  <input
                    id="customer_phone"
                    type="tel"
                    autoComplete="tel"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                    value={form.customer_phone}
                    onChange={e => updateField('customer_phone', e.target.value)}
                    className="field"
                    placeholder="050-000-0000"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 pt-8 border-t border-[var(--rule-strong)]">
            <h2 className="m-0 font-display text-[33px]">איך נוח לכם לשלם?</h2>
            <p className="m-0 mt-1 text-[15px] text-ink-3">לא גובים כלום עכשיו. זה רק כדי שנדע מה לשלוח לכם.</p>
            <div className="grid gap-2.5 mt-5 sm:grid-cols-3" role="radiogroup" aria-label="אמצעי תשלום">
              {PAYMENT_METHODS.map(method => (
                <label key={method.id} className={`choice cursor-pointer ${paymentMethod === method.id ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <span>
                    <span className="block font-semibold">{method.label}</span>
                    <span className="block text-[13.5px] text-ink-3">{method.desc}</span>
                  </span>
                  {paymentMethod === method.id && <span className="tick"><Icon name="check" size={13} strokeWidth={2.6} /></span>}
                </label>
              ))}
            </div>
          </section>

          <div className="mt-10 pt-8 border-t border-[var(--rule-strong)]">
            {submitError && (
              <p className="field-error m-0 mb-4" role="alert"><Icon name="alert" size={15} /> {submitError}</p>
            )}
            <button type="submit" disabled={submitting} className="btn btn-pink w-full text-[17px]" style={{ minHeight: 58 }}>
              {submitting ? <><Icon name="spinner" size={19} /> שולחים…</> : <>לשלוח את ההזמנה <Icon name="arrowBack" size={18} /></>}
            </button>
            <p className="m-0 mt-3 text-[14px] text-ink-3 text-center">
              זמן הכנה: 5–7 ימי עסקים מאישור השרטוט.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">{ticket}</aside>
      </form>
    </div>
  )
}
