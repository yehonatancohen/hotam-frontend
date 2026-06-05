import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const API = import.meta.env.VITE_API_URL

const STATUS_LABELS = {
  pending: 'ממתינה לאישור',
  confirmed: 'אושרה',
  in_production: 'בייצור',
  ready: 'מוכנה לאיסוף',
  shipped: 'נשלחה',
  delivered: 'נמסרה',
  cancelled: 'בוטלה',
}

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const { theme: t } = useTheme()

  useEffect(() => {
    if (!orderId) return
    axios.get(`${API}/orders/${orderId}`)
      .then(r => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="animate-spin material-symbols-outlined text-4xl" style={{ color: t.accent }}>autorenew</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: t.bg, color: t.text }}>
        <div className="text-center space-y-4">
          <h2 className="font-headline font-bold text-2xl">הזמנה לא נמצאה</h2>
          <Link 
            to="/" 
            className="inline-block px-8 py-3 rounded-lg font-bold border-0 cursor-pointer text-sm"
            style={{ background: t.accent, color: t.accentText }}
          >
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24 text-right transition-colors duration-300" style={{ background: t.bg, color: t.text }}>
      {/* Success animation */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ background: t.accentSubtle }}>
          <span className="material-symbols-outlined text-5xl" style={{ color: t.accent, fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h1 className="font-headline font-black text-4xl md:text-5xl mb-4" style={{ color: t.text }}>
          ההזמנה התקבלה!
        </h1>
        <p className="text-xl" style={{ color: t.textSub }}>
          תודה {order.customer_name}! אנחנו נשלח לך אישור לכתובת {order.customer_email}
        </p>
      </div>

      {/* Order details card */}
      <div 
        className="rounded-xl border overflow-hidden mb-8" 
        style={{ background: t.bgCard, borderColor: t.border, boxShadow: t.shadow }}
      >
        <div className="p-6 md:p-8 border-b" style={{ borderColor: t.border }}>
          <div className="flex justify-between items-center">
            <span 
              className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: order.status === 'pending' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(0, 94, 151, 0.15)',
                color: order.status === 'pending' ? 'rgb(161, 98, 7)' : t.accent
              }}
            >
              {STATUS_LABELS[order.status] || order.status}
            </span>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest" style={{ color: t.textMuted }}>מספר הזמנה</div>
              <div className="font-headline font-bold" style={{ color: t.text }}>{order.id}</div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'מוצר', value: order.product_name },
              { label: 'טקסט חריטה', value: order.engraving_text || '—' },
              { label: 'חומר', value: order.material },
              { label: 'כמות', value: order.quantity },
            ].map(item => (
              <div key={item.label}>
                <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: t.textMuted }}>{item.label}</div>
                <div className="font-headline font-semibold" style={{ color: t.text }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t flex justify-between items-baseline" style={{ borderColor: t.border }}>
            <span className="font-headline font-extrabold text-lg" style={{ color: t.text }}>סה&quot;כ שולם</span>
            <span className="font-headline font-black text-3xl" style={{ color: t.accent }}>₪{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="rounded-xl p-6 flex items-center gap-4 mb-8" style={{ background: t.accentSubtle }}>
        <span className="material-symbols-outlined text-3xl" style={{ color: t.accent }}>local_shipping</span>
        <div>
          <div className="font-headline font-bold" style={{ color: t.text }}>זמן אספקה משוער</div>
          <div style={{ color: t.textSub }}>5-7 ימי עסקים מרגע אישור ההזמנה</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
        <Link 
          to="/products" 
          className="px-8 py-3 text-center rounded-lg font-bold transition-all duration-200 border-0 cursor-pointer text-sm"
          style={{ background: t.accent, color: t.accentText }}
          onMouseEnter={e => e.currentTarget.style.background = t.accentHover}
          onMouseLeave={e => e.currentTarget.style.background = t.accent}
        >
          הזמינו עוד
        </Link>
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-lg border transition-colors text-sm"
          style={{ background: t.bgCard, borderColor: t.border, color: t.textSub }}
          onMouseEnter={e => e.currentTarget.style.borderColor = t.text}
          onMouseLeave={e => e.currentTarget.style.borderColor = t.border}
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
}
