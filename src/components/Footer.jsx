import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Footer() {
  const { theme: t } = useTheme()

  return (
    <footer 
      className="w-full transition-colors duration-300"
      style={{ background: t.bgAlt, borderTop: `1px solid ${t.border}` }}
    >
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col md:flex-row-reverse justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2" style={{ color: t.text }}>
            <span className="font-headline font-black text-2xl leading-none">חותם</span>
            <span className="text-xs font-light tracking-tight select-none opacity-60">סטודיו לייזר</span>
          </div>

          {/* Links */}
          <div 
            className="flex flex-wrap justify-center gap-8 font-headline text-sm font-bold"
            style={{ color: t.textSub }}
          >
            <a href="https://www.instagram.com/hotam.studio/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: t.textSub }}>אינסטגרם</a>
            <a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: t.textSub }}>פייסבוק</a>
            <a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: t.textSub }}>תנאי שימוש</a>
            <a href="#" className="opacity-80 hover:opacity-100 transition-opacity" style={{ color: t.textSub }}>מדיניות פרטיות</a>
          </div>

          {/* Copyright */}
          <div className="font-body text-xs" style={{ color: t.textMuted }}>
            כל הזכויות שמורות © 2026 חותם - סטודיו לייזר
          </div>
        </div>

        {/* Bottom bar */}
        <div 
          className="mt-12 pt-8 border-t flex flex-col md:flex-row-reverse justify-between items-center gap-4 text-xs font-body"
          style={{ borderColor: t.border, color: t.textMuted }}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">lock</span>
              SSL מאובטח
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              PCI-DSS
            </span>
          </div>
          <div>עיצוב ופיתוח: חותם לייזר סטודיו</div>
        </div>
      </div>
    </footer>
  )
}

