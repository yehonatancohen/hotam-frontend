import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { LivePreview, CATEGORY_CONFIG, FONT_DEFS, SIZE_DEFS, getPreviewImage } from './Customizer'

const API = import.meta.env.VITE_API_URL

// ── Payment method logo components ──

function BitLogo() {
  return (
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #ff3366 100%)' }}>
      <svg viewBox="0 0 40 20" className="w-10 h-auto">
        <text x="2" y="16" fontFamily="Arial" fontWeight="900" fontSize="16" fill="white">bit</text>
      </svg>
    </div>
  )
}

function CreditCardLogos() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Visa */}
      <div className="w-12 h-8 bg-[#1a1f71] rounded-md flex items-center justify-center px-1.5">
        <svg viewBox="0 0 60 20" className="w-full">
          <text x="2" y="15" fontFamily="Arial" fontWeight="900" fontSize="14" fill="white" fontStyle="italic">VISA</text>
        </svg>
      </div>
      {/* Mastercard */}
      <div className="w-12 h-8 bg-[#252525] rounded-md flex items-center justify-center px-1">
        <svg viewBox="0 0 38 24" className="w-7 h-auto">
          <circle cx="13" cy="12" r="10" fill="#EB001B" />
          <circle cx="25" cy="12" r="10" fill="#F79E1B" />
          <path d="M19 5.3a10 10 0 0 1 0 13.4A10 10 0 0 1 19 5.3z" fill="#FF5F00" />
        </svg>
      </div>
      {/* Amex */}
      <div className="w-12 h-8 bg-[#007bc1] rounded-md flex items-center justify-center px-1">
        <svg viewBox="0 0 48 20" className="w-full">
          <text x="1" y="14" fontFamily="Arial" fontWeight="700" fontSize="8" fill="white">AMEX</text>
        </svg>
      </div>
    </div>
  )
}

function ApplePayLogo() {
  return (
    <div className="w-20 h-10 bg-black rounded-xl flex items-center justify-center gap-1.5 px-3 shrink-0">
      {/* Apple mark */}
      <svg viewBox="0 0 14 17" className="w-3.5 h-auto fill-white">
        <path d="M13.3 13.1c-.3.6-.6 1.2-1 1.7-.5.7-1 1.1-1.5 1.1-.4 0-.9-.1-1.5-.4-.6-.3-1.1-.4-1.6-.4-.5 0-1-.4-1.5-1.1C3 14.3 2.5 13.5 2 12.6 1.5 11.6 1 10.3 1 9c0-1.2.3-2.3.8-3.1.4-.7 1-1.2 1.7-1.5.7-.3 1.5-.5 2.4-.5.5 0 1 .1 1.7.3.7.2 1.1.3 1.3.3.2 0 .7-.1 1.5-.4.8-.2 1.5-.4 2.1-.3 1.5.1 2.6.8 3.3 2-1.3.8-2 2-2 3.5 0 1.3.5 2.4 1.5 3.3zM9.5 1.1C9.5 2 9.2 2.9 8.6 3.6c-.7.8-1.5 1.3-2.3 1.2 0-.1 0-.2 0-.3 0-.8.3-1.7.9-2.4.3-.3.7-.6 1.1-.9.5-.2.9-.3 1.2-.3 0 .1 0 .1 0 .2z"/>
      </svg>
      <span className="text-white text-xs font-semibold tracking-tight">Pay</span>
    </div>
  )
}

const PAYMENT_METHODS = [
  {
    id: 'bit',
    label: 'bit',
    desc: 'תשלום מהיר ומאובטח דרך האפליקציה',
    icon: BitLogo,
  },
  {
    id: 'credit_card',
    label: 'כרטיס אשראי',
    desc: 'ויזה, מאסטרקארד, אמריקן אקספרס',
    icon: CreditCardLogos,
  },
  {
    id: 'apple_pay',
    label: 'Apple Pay',
    desc: 'תשלום בנגיעה אחת',
    icon: ApplePayLogo,
  },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItem } = useCart()
  const { theme: t } = useTheme()

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('bit')
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [shippingFee, setShippingFee] = useState(25)

  useEffect(() => {
    axios.get(`${API}/settings`)
      .then(res => {
        if (res.data && res.data.success && res.data.data && res.data.data.shipping_fee) {
          setShippingFee(Number(res.data.data.shipping_fee))
        }
      })
      .catch(err => console.error('Failed to load settings', err))
  }, [])

  // Pricing
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
    const upper = promoCode.toUpperCase()
    if (CODES[upper]) {
      const disc = upper === 'LASER50' ? 50 : subtotal * CODES[upper]
      setDiscount(disc)
      setPromoError('')
    } else {
      setPromoError('קוד קופון לא תקין')
      setDiscount(0)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'שם מלא נדרש'
    if (!form.customer_email.trim() || !/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'כתובת דוא"ל לא תקינה'
    return e
  }

  const [outOfStock, setOutOfStock] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSuccess, setWaitlistSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!cartItem) { navigate('/products'); return }
    setSubmitting(true)
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
      setOutOfStock(true)
    } catch (err) {
      alert('אירעה שגיאה בבניית ההזמנה. אנא נסה שנית.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWaitlist = async (e) => {
    e.preventDefault()
    if (!waitlistEmail) return
    setSubmitting(true)
    try {
      await axios.post(`${API}/waitlist`, {
        email: waitlistEmail,
        product_id: cartItem?.product?.id
      })
      setWaitlistSuccess(true)
    } catch (err) {
      alert('אירעה שגיאה. אנא נסה שנית.')
    }
    setSubmitting(false)
  }

  if (!cartItem) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: t.bg, color: t.text }}>
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl opacity-40">shopping_bag</span>
          <h2 className="font-headline font-bold text-2xl">העגלה ריקה</h2>
          <p style={{ color: t.textSub }}>בחרו מוצר לפני שמגיעים לקופה</p>
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-3 rounded-lg font-bold text-base transition-all duration-200 border-0 cursor-pointer"
            style={{ background: t.accent, color: t.accentText }}
          >
            בחר מוצר
          </button>
        </div>
      </div>
    )
  }

  const typeLabels = { text: 'טקסט בלבד', logo: 'תמונה בלבד', both: 'טקסט + תמונה' }

  return (
    <div dir="rtl" className="transition-colors duration-300" style={{ background: t.bg, color: t.text }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
        {/* Header */}
        <header className="mb-10 md:mb-12 text-right">
          <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight mb-2" style={{ color: t.text }}>
            תשלום מאובטח
          </h1>
          <p className="text-lg opacity-80" style={{ color: t.textSub }}>
            אנא השלם את פרטי ההזמנה שלך למטה
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Payment section */}
            <section className="lg:col-span-7 order-1 lg:order-2 space-y-7">
              {/* Customer Details */}
              <div className="rounded-xl p-6 md:p-8 border shadow-sm" style={{ background: t.bgCard, borderColor: t.border }}>
                <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-2" style={{ color: t.text }}>
                  <span className="material-symbols-outlined" style={{ color: t.accent }}>person</span>
                  פרטי הלקוח
                </h2>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: t.textSub }}>שם מלא *</label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={e => updateField('customer_name', e.target.value)}
                      className={`w-full h-12 rounded-lg px-4 font-body focus:outline-none focus:ring-2 border`}
                      style={{ background: t.bgCard, borderColor: t.border, color: t.text, '--tw-ring-color': t.accent }}
                      placeholder="ישראל ישראלי"
                    />
                    {errors.customer_name && <p className="text-red-500 text-xs">{errors.customer_name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: t.textSub }}>דוא"ל *</label>
                      <input
                        type="email"
                        value={form.customer_email}
                        onChange={e => updateField('customer_email', e.target.value)}
                        className={`w-full h-12 rounded-lg px-4 font-body focus:outline-none focus:ring-2 border`}
                        style={{ background: t.bgCard, borderColor: t.border, color: t.text, '--tw-ring-color': t.accent }}
                        placeholder="israel@example.com"
                      />
                      {errors.customer_email && <p className="text-red-500 text-xs">{errors.customer_email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: t.textSub }}>טלפון</label>
                      <input
                        type="tel"
                        value={form.customer_phone}
                        onChange={e => updateField('customer_phone', e.target.value)}
                        className="w-full h-12 rounded-lg px-4 font-body focus:outline-none focus:ring-2 border"
                        style={{ background: t.bgCard, borderColor: t.border, color: t.text, '--tw-ring-color': t.accent }}
                        placeholder="050-000-0000"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="rounded-xl p-6 md:p-8 border shadow-sm" style={{ background: t.bgCard, borderColor: t.border }}>
                <h2 className="font-headline text-xl font-bold mb-7 flex items-center gap-2" style={{ color: t.text }}>
                  <span className="material-symbols-outlined" style={{ color: t.accent }}>payments</span>
                  בחירת אמצעי תשלום
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.id}
                      className="relative flex items-center justify-between p-4 md:p-5 rounded-lg cursor-pointer transition-all border"
                      style={paymentMethod === method.id 
                        ? { borderColor: t.accent, background: t.accentSubtle } 
                        : { borderColor: t.border, background: t.bgCard }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="hidden"
                      />
                      <div className="flex items-center gap-4">
                        <method.icon />
                        <div className="text-right">
                          <p className="font-bold" style={{ color: t.text }}>{method.label}</p>
                          <p className="text-xs" style={{ color: t.textMuted }}>{method.desc}</p>
                        </div>
                      </div>
                      <span
                        className="material-symbols-outlined"
                        style={{ color: paymentMethod === method.id ? t.accent : t.textMuted, fontVariationSettings: paymentMethod === method.id ? "'FILL' 1" : "" }}
                      >
                        {paymentMethod === method.id ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-between p-5 md:p-6 rounded-xl border" style={{ background: t.bgCard, borderColor: t.border }}>
                <div className="flex items-center gap-4 text-right">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm" style={{ background: t.bgAlt, color: t.accent }}>
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: t.text }}>תשלום בטוח ומאובטח</h3>
                    <p className="text-sm" style={{ color: t.textMuted }}>הנתונים שלך מוצפנים בתקן SSL המחמיר ביותר</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2" style={{ color: t.textMuted }}>
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span className="text-xs font-bold uppercase tracking-widest">PCI-DSS</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 text-xl flex items-center justify-center gap-3 rounded-lg border-0 font-bold transition-all duration-200 cursor-pointer disabled:opacity-60"
                style={{ background: t.accent, color: t.accentText }}
                onMouseEnter={e => e.currentTarget.style.background = t.accentHover}
                onMouseLeave={e => e.currentTarget.style.background = t.accent}
              >
                {submitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">autorenew</span>
                    מעבד...
                  </>
                ) : (
                  <>
                    בצע תשלום
                    <span className="material-symbols-outlined">arrow_back</span>
                  </>
                )}
              </button>
            </section>

            {/* Order Summary */}
            <aside className="lg:col-span-5 order-2 lg:order-1 lg:sticky top-28">
              <div className="rounded-xl overflow-hidden border" style={{ background: t.bgCard, borderColor: t.border }}>
                <div className="p-6 md:p-8">
                  <h2 className="font-headline text-2xl font-black mb-7 border-b pb-4 text-right" style={{ color: t.text, borderColor: t.border }}>
                    סיכום הזמנה
                  </h2>

                  {/* Product preview */}
                  <div className="mb-7">
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

                  {/* Cost breakdown */}
                  <div className="space-y-3 font-body text-right">
                    <div className="flex justify-between items-center" style={{ color: t.textSub }}>
                      <span className="font-semibold">₪{subtotal.toFixed(2)}</span>
                      <span>סכום ביניים</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-semibold">−₪{discount.toFixed(2)}</span>
                        <span>הנחה (קופון)</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center" style={{ color: t.textSub }}>
                      <span className={shipping === 0 ? 'font-bold' : 'font-semibold'} style={{ color: shipping === 0 ? t.accent : t.textSub }}>
                        {shipping === 0 ? 'חינם' : `₪${shipping}`}
                      </span>
                      <span className="flex items-center gap-1">
                        משלוח
                        <span className="material-symbols-outlined text-sm">info</span>
                      </span>
                    </div>

                    <div className="pt-5 mt-5 border-t" style={{ borderColor: t.border }}>
                      <div className="flex justify-between items-baseline">
                        <div className="text-right">
                          <span className="text-3xl font-headline font-black" style={{ color: t.accent }}>₪{total.toFixed(2)}</span>
                          <p className="text-[10px]" style={{ color: t.textMuted }}>כולל דמי משלוח</p>
                        </div>
                        <span className="font-headline text-xl font-extrabold" style={{ color: t.text }}>סה&quot;כ לתשלום</span>
                      </div>
                    </div>
                  </div>

                  {/* Promo code */}
                  <div className="mt-7">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        className="flex-1 h-10 border rounded-lg px-4 focus:ring-1 focus:outline-none text-sm"
                        style={{ background: t.bgCard, borderColor: t.border, color: t.text, '--tw-ring-color': t.accent }}
                        placeholder="קוד קופון"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        className="px-5 py-2 text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer border-0"
                        style={{ background: t.accent }}
                      >
                        החל
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs mt-1.5">{promoError}</p>}
                    {discount > 0 && <p className="text-green-600 text-xs mt-1.5 font-bold">✓ קופון הוחל בהצלחה!</p>}
                  </div>
                </div>

                <div 
                  className="p-5 flex items-center justify-center gap-2 border-t text-sm font-semibold"
                  style={{ background: t.bgAlt, borderColor: t.border, color: t.textSub }}
                >
                  <span className="material-symbols-outlined">local_shipping</span>
                  <span>זמן אספקה משוער: 5-7 ימי עסקים</span>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>

      {outOfStock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative border" style={{ background: t.bgCard, borderColor: t.border }}>
            <button onClick={() => setOutOfStock(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface" style={{ color: t.textSub }}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-red-600">inventory_2</span>
            </div>
            <h2 className="font-headline font-bold text-2xl mb-2" style={{ color: t.text }}>אוי לא, המלאי אזל!</h2>
            <p className="mb-6" style={{ color: t.textSub }}>
              המוצר כרגע חסר במלאי עקב ביקוש גבוה.
              השאירו מייל ונודיע לכם מיד כשהוא יחזור:
            </p>
            {waitlistSuccess ? (
              <div className="text-green-700 bg-green-100 font-bold py-4 rounded-xl border border-green-200">
                נרשמת בהצלחה! נעדכן אותך בקרוב.
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={e => setWaitlistEmail(e.target.value)}
                  placeholder="האימייל שלך"
                  required
                  className="w-full h-12 rounded-xl px-4 border focus:outline-none"
                  style={{ background: t.bgCard, borderColor: t.border, color: t.text, '--tw-ring-color': t.accent }}
                />
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full py-3.5 border-0 font-bold text-white rounded-xl transition-all cursor-pointer"
                  style={{ background: t.accent }}
                >
                  {submitting ? 'שולח...' : 'הודיעו לי שחוזר למלאי'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
