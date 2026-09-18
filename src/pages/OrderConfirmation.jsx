import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import Icon, { waLink } from '../components/Icon'

const API = import.meta.env.VITE_API_URL

const STATUS_LABELS = {
  pending: 'מחכה לאישור שלכם',
  confirmed: 'אושרה',
  in_production: 'בחריטה',
  ready: 'מוכנה לאיסוף',
  shipped: 'בדרך אליכם',
  delivered: 'הגיעה',
  cancelled: 'בוטלה',
  out_of_stock: 'התקבלה, נחזור אליכם',
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
      <div className="min-h-[60vh] grid place-items-center text-ink-3" role="status">
        <span className="flex items-center gap-3"><Icon name="spinner" size={22} /> מחפשים את ההזמנה…</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="wrap py-24">
        <div className="sheet text-center px-6 py-16 max-w-xl mx-auto">
          <h1 className="font-display text-[44px] m-0">לא מצאנו את ההזמנה הזאת</h1>
          <p className="m-0 mt-2 text-ink-2">שלחו לנו את מספר ההזמנה בוואטסאפ ונבדוק.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a href={waLink(`היי חותם, אני מחפש/ת את הזמנה ${orderId}`)} target="_blank" rel="noopener noreferrer" className="btn btn-pink">
              <Icon name="whatsapp" size={18} /> לשאול בוואטסאפ
            </a>
            <Link to="/" className="btn btn-line">לדף הבית</Link>
          </div>
        </div>
      </div>
    )
  }

  const rows = [
    ['מוצר', order.product_name],
    ['טקסט', order.engraving_text || '—'],
    ['חומר', order.material],
    ['כמות', order.quantity],
  ]

  return (
    <div className="wrap py-12 md:py-20 max-w-3xl">
      <div className="slab" style={{ padding: 'clamp(40px, 5vw, 60px) clamp(26px, 5vw, 56px)' }}>
        <h1 className="font-display m-0 text-white" style={{ fontSize: 'clamp(54px, 6.9vw, 87px)', lineHeight: 0.9 }}>
          תודה, {order.customer_name}.
        </h1>
        <p className="m-0 mt-4 text-[18px] text-on-blue-2">
          אישור נשלח ל־<span dir="ltr">{order.customer_email}</span>. השרטוט לאישור יגיע לשם, והלייזר נדלק רק אחרי שתאשרו.
        </p>
      </div>

      <div className="ticket mt-8">
        <div className="p-6 md:p-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="m-0 text-[14px] text-ink-3">מספר הזמנה</p>
            <p className="m-0 font-display text-[35px] tabular" dir="ltr" style={{ textAlign: 'right' }}>{order.id}</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-paper text-[14px] font-medium">
            <span className="live-dot" aria-hidden="true" />
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <div className="ticket-cut" aria-hidden="true" />
        <div className="p-6 md:p-8">
          <dl className="m-0">
            {rows.map(([k, v]) => (
              <div key={k} className="ticket-row"><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <div className="flex items-end justify-between mt-4 pt-4 border-t-2 border-ink">
            <span className="font-semibold">סה״כ</span>
            <span className="font-display text-[52px] leading-none tabular">₪{Number(order.total).toFixed(2)}</span>
          </div>
          <p className="m-0 mt-5 flex items-center gap-2 text-ink-2 text-[15px]">
            <Icon name="truck" size={18} /> 5–7 ימי עסקים מאישור השרטוט
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-8">
        <Link to="/products" className="btn btn-pink">עוד משהו לחרוט <Icon name="arrowBack" size={18} /></Link>
        <Link to="/" className="btn btn-line">לדף הבית</Link>
      </div>
    </div>
  )
}
