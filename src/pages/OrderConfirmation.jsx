import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

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
        <span className="animate-spin material-symbols-outlined text-4xl text-primary">autorenew</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="font-headline font-bold text-2xl text-on-surface">הזמנה לא נמצאה</h2>
          <Link to="/" className="btn-primary inline-block px-8 py-3">חזרה לדף הבית</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
      {/* Success animation */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
          <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h1 className="font-headline font-black text-4xl md:text-5xl text-on-surface mb-4">
          ההזמנה התקבלה!
        </h1>
        <p className="text-on-surface-variant text-xl">
          תודה {order.customer_name}! אנחנו נשלח לך אישור לכתובת {order.customer_email}
        </p>
      </div>

      {/* Order details card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-monolith overflow-hidden mb-8">
        <div className="p-6 md:p-8 border-b border-outline-variant/10">
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
              : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
            }`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
            <div className="text-right">
              <div className="text-xs text-on-surface-variant uppercase tracking-widest">מספר הזמנה</div>
              <div className="font-headline font-bold text-on-surface">{order.id}</div>
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
                <div className="text-xs text-on-surface-variant uppercase tracking-widest mb-0.5">{item.label}</div>
                <div className="font-headline font-semibold text-on-surface">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-outline-variant/10 flex justify-between items-baseline">
            <span className="font-headline font-extrabold text-lg text-on-surface">סה&quot;כ שולם</span>
            <span className="font-headline font-black text-3xl text-primary">₪{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-secondary-fixed/30 rounded-xl p-6 flex items-center gap-4 mb-8">
        <span className="material-symbols-outlined text-3xl text-secondary">local_shipping</span>
        <div>
          <div className="font-headline font-bold text-on-surface">זמן אספקה משוער</div>
          <div className="text-on-surface-variant">5-7 ימי עסקים מרגע אישור ההזמנה</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center">
        <Link to="/customizer" className="btn-primary px-8 py-3 text-center">
          הזמינו עוד
        </Link>
        <Link to="/" className="flex items-center justify-center gap-2 px-8 py-3 bg-surface-container text-on-surface font-bold rounded-lg hover:bg-surface-container-high transition-colors">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
}
