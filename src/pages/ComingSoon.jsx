import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ComingSoon() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    // Simulate submission — wire to a real mailing list when ready
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 900)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-20 bg-surface">
      <div className="max-w-lg w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            inventory_2
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-headline font-black text-4xl md:text-5xl text-on-surface tracking-tight mb-4">
          המלאי אזל — <span className="text-primary">בקרוב נחזור</span>
        </h1>

        <p className="text-on-surface-variant text-lg leading-relaxed mb-10 font-light">
          אנחנו עובדים קשה כדי לחדש את המלאי ולהביא לכם עוד מוצרים מדהימים.
          השאירו אימייל ונודיע לכם ראשונים כשהמוצרים יחזרו לאוויר.
        </p>

        {/* Email form */}
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8 px-6 bg-primary/5 border border-primary/20 rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="font-headline font-bold text-xl text-on-surface">נרשמת בהצלחה!</p>
            <p className="text-on-surface-variant text-sm">נשלח לך עדכון כשהמוצרים יחזרו. תודה שאתה איתנו.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full" dir="rtl">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="כתובת האימייל שלך"
              required
              className="flex-1 bg-surface-container-lowest border-2 border-outline-variant focus:border-primary focus:outline-none rounded-xl px-5 py-3.5 text-on-surface text-base placeholder:text-on-surface-variant/40 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3.5 text-base whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="animate-spin material-symbols-outlined text-base">autorenew</span>
                  שולח...
                </span>
              ) : 'הודיעו לי'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="text-on-surface-variant text-xs font-label uppercase tracking-widest">או</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>

        {/* Back links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container text-on-surface font-headline font-bold text-sm hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-base">arrow_forward</span>
            ראו את המוצרים
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container text-on-surface font-headline font-bold text-sm hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-base">home</span>
            דף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
