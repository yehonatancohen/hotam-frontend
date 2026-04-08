import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface w-full border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logo.png" alt="חתם - סטודיו לייזר" className="h-10 w-auto object-contain brightness-0 invert opacity-90" />
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-white font-headline text-sm font-light">
            <a href="#" className="opacity-70 hover:opacity-100 hover:-translate-y-0.5 transition-all">אינסטגרם</a>
            <a href="#" className="opacity-70 hover:opacity-100 hover:-translate-y-0.5 transition-all">פייסבוק</a>
            <a href="#" className="opacity-70 hover:opacity-100 hover:-translate-y-0.5 transition-all">תנאי שימוש</a>
            <a href="#" className="opacity-70 hover:opacity-100 hover:-translate-y-0.5 transition-all">מדיניות פרטיות</a>
            <Link to="/customizer" className="opacity-70 hover:opacity-100 hover:-translate-y-0.5 transition-all">התאמה אישית</Link>
          </div>

          {/* Copyright */}
          <div className="text-white/40 font-body text-xs">
            כל הזכויות שמורות © 2024 חתם - סטודיו לייזר
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row-reverse justify-between items-center gap-4 text-white/30 text-xs font-body">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">lock</span>
              SSL מאובטח
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              PCI-DSS
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">local_shipping</span>
              משלוח חינם מ-₪300
            </span>
          </div>
          <div>עיצוב ופיתוח: חתם לייזר סטודיו</div>
        </div>
      </div>
    </footer>
  )
}
