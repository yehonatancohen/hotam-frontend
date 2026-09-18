import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Icon, { WA_URL } from '../components/Icon'

const API = import.meta.env.VITE_API_URL

export default function ComingSoon() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API}/waitlist`, { email: email.trim() })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('לא הצלחנו לרשום את המייל. נסו שוב עוד רגע.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wrap py-16 md:py-24">
      <div className="slab max-w-3xl mx-auto text-center" style={{ padding: 'clamp(48px, 7vw, 88px) clamp(24px, 5vw, 64px)' }}>
        <h1 className="font-display m-0 text-white mx-auto max-w-[14ch]" style={{ fontSize: 'clamp(57px, 8.1vw, 105px)', lineHeight: 0.9 }}>
          הלייזר מתחמם.
        </h1>
        <p className="m-0 mt-5 mx-auto text-[18px] text-on-blue-2 max-w-[42ch]">
          החלק הזה של האתר עוד לא מוכן. השאירו מייל ונעדכן כשהוא עולה.
        </p>

        {submitted ? (
          <p className="m-0 mt-9 inline-flex items-center gap-2 text-white text-[18px] font-medium" role="status">
            <Icon name="check" size={20} /> רשמנו. נעדכן אתכם.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-9 mx-auto max-w-md flex flex-col sm:flex-row gap-3">
            <label htmlFor="cs-email" className="sr-only">מייל</label>
            <input
              id="cs-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="המייל שלכם"
              required
              dir="ltr"
              className="field flex-1"
              style={{ textAlign: 'right', borderColor: 'transparent' }}
            />
            <button type="submit" disabled={loading} className="btn btn-paper">
              {loading ? <><Icon name="spinner" size={18} /> שולחים…</> : 'לעדכן אותי'}
            </button>
          </form>
        )}
        {error && <p className="m-0 mt-3 text-white text-[14px]" role="alert">{error}</p>}
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-10">
        <Link to="/products" className="btn btn-line">למוצרים שכבר אפשר להזמין</Link>
        <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line"><Icon name="whatsapp" size={18} /> וואטסאפ</a>
      </div>
    </div>
  )
}
