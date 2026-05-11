import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
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
        <path d="M13.3 13.1c-.3.6-.6 1.2-1 1.7-.5.7-1 1.1-1.5 1.1-.4 0-.9-.1-1.5-.4-.6-.3-1.1-.4-1.6-.4-.5 0-1 .1-1.6.4-.6.3-1.1.4-1.4.4-.5 0-1-.4-1.5-1.1C3 14.3 2.5 13.5 2 12.6 1.5 11.6 1 10.3 1 9c0-1.2.3-2.3.8-3.1.4-.7 1-1.2 1.7-1.5.7-.3 1.5-.5 2.4-.5.5 0 1 .1 1.7.3.7.2 1.1.3 1.3.3.2 0 .7-.1 1.5-.4.8-.2 1.5-.4 2.1-.3 1.5.1 2.6.8 3.3 2-1.3.8-2 2-2 3.5 0 1.3.5 2.4 1.5 3.3zM9.5 1.1C9.5 2 9.2 2.9 8.6 3.6c-.7.8-1.5 1.3-2.3 1.2 0-.1 0-.2 0-.3 0-.8.3-1.7.9-2.4.3-.3.7-.6 1.1-.9.5-.2.9-.3 1.2-.3 0 .1 0 .1 0 .2z"/>
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
  const { cartItem, clearCart } = useCart()

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

  // Pricing
  const subtotal = cartItem?.price || 0
  const shipping = subtotal >= 300 ? 0 : 25
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

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!cartItem) { navigate('/customizer'); return }
    setOutOfStock(true)
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">shopping_bag</span>
          <h2 className="font-headline font-bold text-2xl text-on-surface">העגלה ריקה</h2>
          <p className="text-on-surface-variant">בחרו מוצר לפני שמגיעים לקופה</p>
          <button
            onClick={() => navigate('/customizer')}
            className="btn-primary px-8 py-3 mt-4"
          >
            לעמוד ההתאמה
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
        {/* Header */}
        <header className="mb-10 md:mb-12 text-right">
          <h1 className="font-headline text-4xl md:text-6xl font-black text-on-surface tracking-tight mb-2">
            תשלום מאובטח
          </h1>
          <p className="text-on-surface-variant font-body text-lg opacity-80">
            אנא השלם את פרטי ההזמנה שלך למטה
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Payment section */}
            <section className="lg:col-span-7 order-1 lg:order-2 space-y-7">
              {/* Customer Details */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-monolith border border-outline-variant/10">
                <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary">person</span>
                  פרטי הלקוח
                </h2>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">שם מלא *</label>
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={e => updateField('customer_name', e.target.value)}
                      className={`w-full h-12 bg-surface-container-low rounded-lg px-4 text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary ${errors.customer_name ? 'ring-2 ring-error' : ''}`}
                      placeholder="ישראל ישראלי"
                    />
                    {errors.customer_name && <p className="text-error text-xs">{errors.customer_name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">דוא"ל *</label>
                      <input
                        type="email"
                        value={form.customer_email}
                        onChange={e => updateField('customer_email', e.target.value)}
                        className={`w-full h-12 bg-surface-container-low rounded-lg px-4 text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary ${errors.customer_email ? 'ring-2 ring-error' : ''}`}
                        placeholder="israel@example.com"
                      />
                      {errors.customer_email && <p className="text-error text-xs">{errors.customer_email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">טלפון</label>
                      <input
                        type="tel"
                        value={form.customer_phone}
                        onChange={e => updateField('customer_phone', e.target.value)}
                        className="w-full h-12 bg-surface-container-low rounded-lg px-4 text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="050-000-0000"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-monolith border border-outline-variant/10">
                <h2 className="font-headline text-xl font-bold mb-7 flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  בחירת אמצעי תשלום
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.id}
                      className={`relative flex items-center justify-between p-4 md:p-5 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-2 border-primary bg-primary/5'
                          : 'border border-outline-variant/30 hover:border-primary/50 bg-surface'
                      }`}
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
                        <div>
                          <p className="font-bold text-on-surface">{method.label}</p>
                          <p className="text-xs text-on-surface-variant">{method.desc}</p>
                        </div>
                      </div>
                      <span
                        className={`material-symbols-outlined ${paymentMethod === method.id ? 'text-primary' : 'text-outline-variant'}`}
                        style={paymentMethod === method.id ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {paymentMethod === method.id ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-between p-5 md:p-6 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">תשלום בטוח ומאובטח</h3>
                    <p className="text-sm text-on-surface-variant">הנתונים שלך מוצפנים בתקן SSL המחמיר ביותר</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-on-surface-variant/40">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span className="text-xs font-bold uppercase tracking-widest">PCI-DSS</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-60"
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
            <aside className="lg:col-span-5 order-2 lg:order-1 sticky top-28">
              <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10">
                <div className="p-6 md:p-8">
                  <h2 className="font-headline text-2xl font-black mb-7 border-b border-outline-variant/15 pb-4">
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
                      sizeScale={SIZE_DEFS.find(s => s.id === cartItem.engravingSize)?.scale || 1.0}
                      placement={cartItem.placement || 'cc'}
                      uploadedImgSrc={cartItem.uploadedImgSrc}
                      compact={true}
                    />
                  </div>

                  {/* Cost breakdown */}
                  <div className="space-y-3 font-body">
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>סכום ביניים</span>
                      <span className="font-semibold">₪{subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>הנחה (קופון)</span>
                        <span className="font-semibold">−₪{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        משלוח
                        <span className="material-symbols-outlined text-sm">info</span>
                      </span>
                      <span className={shipping === 0 ? 'text-primary font-bold' : 'font-semibold'}>
                        {shipping === 0 ? 'חינם' : `₪${shipping}`}
                      </span>
                    </div>

                    <div className="pt-5 mt-5 border-t border-outline-variant/20">
                      <div className="flex justify-between items-baseline">
                        <span className="font-headline text-xl font-extrabold">סה&quot;כ לתשלום</span>
                        <div className="text-right">
                          <span className="text-3xl font-headline font-black text-primary">₪{total.toFixed(2)}</span>
                          <p className="text-[10px] text-on-surface-variant">כולל מע&quot;מ ומשלוח</p>
                        </div>
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
                        className="flex-1 h-10 bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 focus:ring-1 focus:ring-primary text-sm text-on-surface"
                        placeholder="קוד קופון"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        className="px-5 py-2 bg-inverse-surface text-inverse-on-surface rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                      >
                        החל
                      </button>
                    </div>
                    {promoError && <p className="text-error text-xs mt-1.5">{promoError}</p>}
                    {discount > 0 && <p className="text-green-600 text-xs mt-1.5 font-bold">✓ קופון הוחל בהצלחה!</p>}
                    <p className="text-on-surface-variant/50 text-xs mt-1">נסה: HATAM10 / FIRST20 / LASER50</p>
                  </div>
                </div>

                <div className="bg-secondary-fixed p-5 flex items-center justify-center gap-2 text-on-secondary-fixed border-t border-outline-variant/10">
                  <span className="material-symbols-outlined">local_shipping</span>
                  <span className="font-semibold text-sm">זמן אספקה משוער: 5-7 ימי עסקים</span>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>

      {outOfStock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative border border-outline-variant/20">
            <button onClick={() => setOutOfStock(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-error">inventory_2</span>
            </div>
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">אוי לא, המלאי אזל!</h2>
            <p className="text-on-surface-variant mb-6">
              המוצר כרגע חסר במלאי עקב ביקוש גבוה.
              השאירו מייל ונודיע לכם מיד כשהוא יחזור:
            </p>
            {waitlistSuccess ? (
              <div className="bg-success/10 text-success font-bold py-4 rounded-xl border border-success/20">
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
                  className="w-full h-12 bg-surface-container-low rounded-xl px-4 text-on-surface border border-outline-variant/30 focus:border-primary focus:outline-none"
                />
                <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
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
