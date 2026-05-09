import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_URL
const STATIC_BASE = import.meta.env.VITE_STATIC_BASE

// ── Per-category config (unchanged) ──────────────────────────────────────────
const CATEGORY_CONFIG = {
  drinkware: {
    materials: [
      { id: 'matte_black',   label: 'מט שחור',    bg: '#1a1a1a', textColor: '#9acbff', blendMode: 'screen' },
      { id: 'silver',        label: 'כסוף',        bg: '#b0b8c1', textColor: '#1a1c1c', blendMode: 'multiply' },
      { id: 'white',         label: 'לבן',         bg: '#f5f5f5', textColor: '#1a1c1c', blendMode: 'multiply' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [
      { id: 'small',  label: '300ml', extra: 0 },
      { id: 'medium', label: '500ml', extra: 20 },
      { id: 'large',  label: '750ml', extra: 40 },
    ],
    maxChars: 100,
    hint: 'שם, תאריך, או ברכה קצרה',
  },
  accessories: {
    materials: [
      { id: 'leather_brown', label: 'עור חום',  bg: '#8B6343', textColor: '#ffddb7', blendMode: 'screen' },
      { id: 'leather_black', label: 'עור שחור', bg: '#1c1c1c', textColor: '#c0c7d2', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [{ id: 'standard', label: 'סטנדרט', extra: 0 }],
    maxChars: 80,
    hint: 'ראשי תיבות, שם, ברכה',
  },
  signage: {
    materials: [
      { id: 'acrylic',    label: 'אקריליק',  bg: '#daeeff', textColor: '#005e97', blendMode: 'multiply' },
      { id: 'dark_steel', label: 'פלדה כהה', bg: '#2f3131', textColor: '#9acbff', blendMode: 'screen' },
      { id: 'oak_wood',   label: 'עץ אלון',  bg: '#78582f', textColor: '#ffddb7', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic'],
    sizes: [
      { id: 'small',  label: 'קטן (20×10)',   extra: 0 },
      { id: 'medium', label: 'בינוני (40×20)', extra: 80 },
      { id: 'large',  label: 'גדול (60×30)',   extra: 180 },
    ],
    maxChars: 150,
    hint: 'שם חברה, כותרת, ציטוט',
  },
  home_decor: {
    materials: [
      { id: 'oak_wood',   label: 'עץ אלון',  bg: '#78582f', textColor: '#ffddb7', blendMode: 'screen' },
      { id: 'dark_steel', label: 'מתכת כהה', bg: '#2f3131', textColor: '#9acbff', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [
      { id: 'small',  label: 'קטן',   extra: 0 },
      { id: 'medium', label: 'בינוני', extra: 50 },
      { id: 'large',  label: 'גדול',  extra: 100 },
    ],
    maxChars: 100,
    hint: 'שם משפחה, תאריך, ציטוט',
  },
  gifts: {
    materials: [
      { id: 'natural_wood', label: 'עץ טבעי', bg: '#c4975a', textColor: '#2a1700', blendMode: 'multiply' },
    ],
    fonts: ['modern', 'handwriting'],
    sizes: [
      { id: 'standard', label: 'קופסה רגילה',   extra: 0 },
      { id: 'premium',  label: 'קופסה פרימיום', extra: 60 },
    ],
    maxChars: 120,
    hint: 'הקדשה אישית עד 120 תווים',
  },
  mixed: {
    materials: [
      { id: 'dark_steel', label: 'פלדה כהה', bg: '#2f3131', textColor: '#9acbff', blendMode: 'screen' },
      { id: 'oak_wood',   label: 'עץ אלון',  bg: '#78582f', textColor: '#ffddb7', blendMode: 'screen' },
      { id: 'leather',    label: 'עור',      bg: '#8B6343', textColor: '#ffddb7', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [
      { id: 'small',  label: 'קטן',   extra: 0 },
      { id: 'medium', label: 'בינוני', extra: 30 },
      { id: 'large',  label: 'גדול',  extra: 60 },
    ],
    maxChars: 100,
    hint: 'טקסט לחריטה',
  },
}

const FONT_DEFS = {
  modern:      { label: 'מודרני',  style: { fontFamily: 'Heebo, sans-serif',     fontWeight: 900 } },
  classic:     { label: 'קלאסי',   style: { fontFamily: 'Assistant, sans-serif', fontWeight: 300, letterSpacing: '0.15em' } },
  handwriting: { label: 'כתב יד',  style: { fontFamily: 'cursive',               fontStyle: 'italic', fontWeight: 700 } },
}

const ZONES = [
  { id: 'tl', label: 'שמאל עליון',  x: 0.15, y: 0.20 },
  { id: 'tc', label: 'מרכז עליון',  x: 0.50, y: 0.20 },
  { id: 'tr', label: 'ימין עליון',  x: 0.85, y: 0.20 },
  { id: 'cl', label: 'שמאל',        x: 0.15, y: 0.50 },
  { id: 'cc', label: 'מרכז',        x: 0.50, y: 0.50 },
  { id: 'cr', label: 'ימין',        x: 0.85, y: 0.50 },
  { id: 'bl', label: 'שמאל תחתון', x: 0.15, y: 0.80 },
  { id: 'bc', label: 'מרכז תחתון', x: 0.50, y: 0.80 },
  { id: 'br', label: 'ימין תחתון', x: 0.85, y: 0.80 },
]

const SIZE_DEFS = [
  { id: 'sm', label: 'S',  desc: 'עדין',  scale: 0.7 },
  { id: 'md', label: 'M',  desc: 'מאוזן', scale: 1.0 },
  { id: 'lg', label: 'L',  desc: 'בולט',  scale: 1.3 },
  { id: 'xl', label: 'XL', desc: 'ענק',   scale: 1.7 },
]

const INVALID_RE = /[<>{}|\\^~[\]`]/

function resolveUrl(url) {
  if (!url) return null
  return url.startsWith('/') ? STATIC_BASE + url : url
}

function getPreviewImage(product) {
  const preview = product?.images?.find(img => img.is_preview)
  if (preview) {
    return {
      url: resolveUrl(preview.url),
      zone: {
        x: preview.design_x, y: preview.design_y,
        width: preview.design_width, height: preview.design_height,
        rotation: preview.design_rotation,
      },
    }
  }
  return { url: resolveUrl(product?.image_url), zone: null }
}

const fmtBytes = b => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionCard({ num, title, desc, children }) {
  return (
    <div className="bg-white border border-[#E4DDD6] rounded-2xl p-6 shadow-sm transition-shadow focus-within:shadow-md">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: num === '—' ? '#9CA3AF' : '#2D6A4F' }}
        >
          {num}
        </div>
        <div>
          <div className="text-[15px] font-semibold text-[#1C1917]">{title}</div>
          {desc && <div className="text-xs text-[#6B6560] mt-0.5">{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="border-t border-[#E4DDD6] my-5" />
}

// ── Live Preview ──────────────────────────────────────────────────────────────

function LivePreview({
  product, productImg, designZone,
  engravingType, engravingText, engravingText2,
  material, font, sizeScale, placement,
  uploadedImgSrc, compact = false,
  previewApproved, onApprove, onAdjust,
}) {
  const cfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.mixed
  const previewText = engravingText || cfg.hint
  const zone = ZONES.find(z => z.id === placement) || ZONES[4]

  const overlayStyle = designZone
    ? {
        position: 'absolute',
        left: `${designZone.x}%`, top: `${designZone.y}%`,
        width: `${designZone.width}%`, height: `${designZone.height}%`,
        transform: designZone.rotation ? `rotate(${designZone.rotation}deg)` : undefined,
      }
    : {
        position: 'absolute',
        left: `${zone.x * 100}%`, top: `${zone.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        maxWidth: '65%',
      }

  const textStyle = {
    ...font.style,
    color: material?.textColor || '#fff',
    mixBlendMode: material?.blendMode || 'screen',
    filter: 'contrast(1.2)',
    fontSize: compact ? `calc(1rem * ${sizeScale})` : `calc(2rem * ${sizeScale})`,
    lineHeight: 1.3,
    wordBreak: 'break-word',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
  }

  return (
    <div>
      <div
        className="relative rounded-xl overflow-hidden border border-[#E4DDD6]"
        style={{ aspectRatio: '4/3' }}
      >
        {productImg ? (
          <>
            <img
              src={productImg}
              alt={product.name_he}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.88) contrast(1.05)' }}
            />
            <div
              className="absolute inset-0"
              style={{ background: (material?.bg || '#000') + '28', mixBlendMode: 'color' }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: material?.bg || '#2f3131' }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent" />
          </>
        )}

        {/* Engraving overlay */}
        {engravingType !== 'logo' && (
          <div className="pointer-events-none flex items-center justify-center" style={overlayStyle}>
            <div style={textStyle}>
              {previewText}
              {engravingText2 && (
                <span className="block" style={{ fontSize: `calc(0.7em)`, marginTop: '0.3em' }}>
                  {engravingText2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Uploaded image overlay */}
        {engravingType !== 'text' && uploadedImgSrc && (
          <div className="pointer-events-none flex items-center justify-center" style={overlayStyle}>
            <img
              src={uploadedImgSrc}
              alt="לוגו"
              style={{
                maxWidth: '100%', maxHeight: '100%',
                opacity: 0.85,
                mixBlendMode: material?.blendMode || 'screen',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Live indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52B788] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#52B788]" />
          </span>
          <span className="text-[9px] font-bold tracking-widest text-white uppercase">
            {compact ? 'תצוגה חיה' : 'LIVE PREVIEW'}
          </span>
        </div>
      </div>

      {!compact && (
        <>
          <p className="text-[11px] text-[#6B6560] text-center mt-2 italic">
            התצוגה משוערת. החריטה הסופית עשויה להשתנות מעט בהתאם לגרגר החומר.
          </p>
          <div className="flex gap-2 mt-3">
            {previewApproved ? (
              <div className="flex-1 py-2.5 text-center text-sm font-medium text-[#2D6A4F] bg-[#D8F3DC] border border-[#2D6A4F] rounded-xl">
                ✓ התצוגה אושרה — מוכן להוספה לסל
              </div>
            ) : (
              <>
                <button
                  onClick={onApprove}
                  className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors"
                  style={{ background: '#2D6A4F' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1B4332'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2D6A4F'}
                >
                  נראה טוב ✓
                </button>
                <button
                  onClick={onAdjust}
                  className="flex-1 py-2.5 text-sm font-medium text-[#6B6560] bg-white border border-[#E4DDD6] rounded-xl hover:border-[#6B6560] transition-colors"
                >
                  שנה הגדרות
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Customizer() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const fileInputRef = useRef(null)
  const toastTimerRef = useRef(null)

  // Product
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [materials, setMaterials] = useState([])
  const [sizes, setSizes] = useState([])

  // Engraving
  const [engravingType, setEngravingType] = useState('text')
  const [engravingText, setEngravingText] = useState('')
  const [engravingText2, setEngravingText2] = useState('')
  const [isMultiline, setIsMultiline] = useState(false)
  const [textError, setTextError] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [selectedFont, setSelectedFont] = useState('modern')
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [engravingSize, setEngravingSize] = useState('md')
  const [placement, setPlacement] = useState('cc')

  // Image upload
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedImgSrc, setUploadedImgSrc] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileError, setFileError] = useState('')
  const [isJpgWarn, setIsJpgWarn] = useState(false)

  // Extras
  const [wantsProof, setWantsProof] = useState(true)
  const [specialNotes, setSpecialNotes] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [previewApproved, setPreviewApproved] = useState(false)
  const [toast, setToast] = useState('')

  // ── Load product ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) { navigate('/products'); return }
    axios.get(`${API}/products/${productId}`)
      .then(r => {
        const p = r.data.data
        setProduct(p)
        const cfg = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.mixed

        let mats = cfg.materials
        if (p.available_materials) {
          const avail = p.available_materials.split(',').map(s => s.trim().toLowerCase())
          const matched = cfg.materials.filter(m =>
            avail.includes(m.id.toLowerCase()) || avail.includes(m.label.toLowerCase())
          )
          if (matched.length > 0) mats = matched
        }
        setMaterials(mats)
        setSelectedMaterial(mats[0].id)

        let szs = cfg.sizes
        if (p.available_sizes) {
          const avail = p.available_sizes.split(',').map(s => s.trim())
          szs = avail.map((s, i) => ({ id: `size_${i}`, label: s, extra: 0 }))
        }
        setSizes(szs)
        setSelectedSize(szs[0].id)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [productId])

  // ── Restore draft ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return
    try {
      const d = JSON.parse(localStorage.getItem(`am_draft_${productId}`))
      if (!d) return
      if (d.engravingType) setEngravingType(d.engravingType)
      if (d.engravingText) setEngravingText(d.engravingText)
      if (d.selectedFont)  setSelectedFont(d.selectedFont)
      if (d.placement)     setPlacement(d.placement)
      if (d.engravingSize) setEngravingSize(d.engravingSize)
      showToast('הטיוטה שלך שוחזרה')
    } catch (_) {}
  }, [productId])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = msg => {
    setToast(msg)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 3500)
  }

  const validateText = val => {
    const bad = [...val].filter(c => INVALID_RE.test(c))
    setTextError(bad.length ? `תווים אלה אינם ניתנים לחריטה: ${[...new Set(bad)].join('  ')}` : '')
  }

  const processFile = file => {
    setFileError(''); setIsJpgWarn(false)
    const allowed = ['image/svg+xml', 'image/png', 'image/jpeg']
    if (!allowed.includes(file.type)) {
      setFileError('סוג קובץ לא נתמך. נא להשתמש ב-SVG, PNG, או JPG.'); return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError(`הקובץ גדול מדי (${(file.size / 1024 / 1024).toFixed(1)} MB). המגבלה היא 5 MB.`); return
    }
    if (file.type === 'image/jpeg') setIsJpgWarn(true)
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = e => setUploadedImgSrc(e.target.result)
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setUploadedFile(null); setUploadedImgSrc(null)
    setIsJpgWarn(false); setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const saveForLater = () => {
    localStorage.setItem(`am_draft_${productId}`, JSON.stringify({
      engravingType, engravingText, selectedFont, placement, engravingSize,
    }))
    showToast('נשמר! ההגדרות ישמרו לביקור הבא.')
  }

  const handleOrder = () => {
    if (showTextSection && !engravingText.trim()) {
      document.getElementById('et-input')?.focus()
      document.getElementById('et-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      showToast('נא להזין את הטקסט לחריטה')
      return
    }
    if (showLogoSection && !uploadedFile) {
      document.getElementById('drop-zone')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      showToast('נא להעלות תמונה או לוגו')
      return
    }
    addToCart({
      product, engravingText, engravingType, uploadedImgSrc,
      material: selectedMaterial, fontStyle: selectedFont,
      size: selectedSize, quantity, price: grandTotal,
      engravingSize, placement, wantsProof, specialNotes,
    })
    navigate('/checkout')
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="animate-spin material-symbols-outlined text-4xl text-primary">autorenew</span>
    </div>
  )

  if (notFound || !product) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <h2 className="font-headline font-bold text-2xl mb-4">המוצר לא נמצא</h2>
        <Link to="/products" className="btn-primary px-8 py-3 inline-block">חזרה למוצרים</Link>
      </div>
    </div>
  )

  // ── Derived values ────────────────────────────────────────────────────────
  const cfg        = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.mixed
  const material   = materials.find(m => m.id === selectedMaterial) || materials[0]
  const font       = FONT_DEFS[selectedFont]
  const size       = sizes.find(s => s.id === selectedSize) || sizes[0]
  const sizeScale  = SIZE_DEFS.find(s => s.id === engravingSize)?.scale || 1.0
  const unitPrice  = product.price + (size?.extra || 0)
  const grandTotal = unitPrice * quantity

  const showTextSection = engravingType !== 'logo'
  const showLogoSection = engravingType !== 'text'

  // Section numbering
  const nums = (() => {
    let i = 0
    const n = () => String(++i).padStart(2, '0')
    return {
      text:     showTextSection ? n() : (i++, null),
      logo:     showLogoSection ? n() : (i++, null),
      place:    n(),
      material: n(),
      proof:    n(),
      notes:    n(),
    }
  })()

  const typeLabels = { text: 'טקסט בלבד', logo: 'תמונה בלבד', both: 'טקסט + תמונה' }

  const { url: productImg, zone: designZone } = getPreviewImage(product)

  const previewProps = {
    product, productImg, designZone,
    engravingType, engravingText, engravingText2,
    material, font, sizeScale, placement, uploadedImgSrc,
    previewApproved,
    onApprove: () => setPreviewApproved(true),
    onAdjust: () => document.getElementById('et-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-5">
          <Link to="/products" className="hover:text-primary transition-colors">מוצרים</Link>
          <span className="material-symbols-outlined text-sm" style={{ direction: 'ltr' }}>chevron_left</span>
          <Link to={`/products/${product.id}`} className="hover:text-primary transition-colors">{product.name_he}</Link>
          <span className="material-symbols-outlined text-sm" style={{ direction: 'ltr' }}>chevron_left</span>
          <span className="text-on-surface">התאמה אישית</span>
        </nav>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface mb-1">
          עצב את החריטה שלך.
        </h1>
        <p className="text-on-surface-variant text-sm mb-8">
          {product.name_he} — חריטת לייזר אישית, מיוצרת לפי הזמנה.
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ══════════ FORM COLUMN ══════════ */}
          <div className="space-y-4">

            {/* Engraving type */}
            <SectionCard num="—" title="מה תרצה לחרוט?" desc="בחר את סוג התוכן לחריטה">
              <div className="flex bg-[#F7F5F2] border border-[#E4DDD6] rounded-xl p-1 gap-1">
                {[
                  { id: 'text', label: 'טקסט בלבד' },
                  { id: 'logo', label: 'תמונה / לוגו' },
                  { id: 'both', label: 'טקסט + תמונה' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setEngravingType(t.id); setPreviewApproved(false) }}
                    className="flex-1 py-2.5 px-2 text-sm font-medium rounded-lg transition-all"
                    style={engravingType === t.id
                      ? { background: '#fff', color: '#2D6A4F', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                      : { color: '#6B6560' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* §01 Text input */}
            {showTextSection && (
              <SectionCard num={nums.text} title="מה יהיה כתוב?" desc="המילים שלך, חרוטות לנצח.">
                {/* Text field */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <label className="text-sm font-medium text-[#1C1917]" htmlFor="et-input">טקסט לחריטה</label>
                    <span className={`text-xs ${engravingText.length > cfg.maxChars * 0.85 ? 'text-[#DC2626] font-semibold' : 'text-[#6B6560]'}`}>
                      {engravingText.length} / {cfg.maxChars}
                    </span>
                  </div>
                  <input
                    id="et-input"
                    type="text"
                    value={engravingText}
                    onChange={e => {
                      const v = e.target.value.slice(0, cfg.maxChars)
                      setEngravingText(v)
                      validateText(v)
                      setPreviewApproved(false)
                    }}
                    className="w-full border-[1.5px] border-[#E4DDD6] rounded-xl px-4 py-3 text-base text-[#1C1917] bg-white outline-none transition-colors focus:border-[#2D6A4F]"
                    style={{ '--tw-ring-color': '#2D6A4F' }}
                    placeholder={cfg.hint}
                  />
                  {textError && (
                    <p className="text-xs text-[#DC2626] mt-1.5 flex items-start gap-1">
                      <span className="material-symbols-outlined text-xs mt-0.5">warning</span>
                      {textError}
                    </p>
                  )}
                  <p className="text-xs text-[#6B6560] mt-1.5">טקסט קצר יותר נחרט בצורה ברורה ויפה יותר.</p>
                </div>

                {/* Multiline toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer mb-3 w-fit">
                  <input
                    type="checkbox"
                    checked={isMultiline}
                    onChange={e => {
                      setIsMultiline(e.target.checked)
                      if (!e.target.checked) setEngravingText2('')
                    }}
                    className="w-4 h-4 cursor-pointer rounded"
                    style={{ accentColor: '#2D6A4F' }}
                  />
                  <span className="text-sm font-medium text-[#1C1917]">הוסף שורה שנייה</span>
                </label>

                {isMultiline && (
                  <div className="bg-[#F7F5F2] rounded-xl p-4 mb-4 space-y-3">
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-medium text-[#1C1917]">שורה שנייה</label>
                        <span className="text-xs text-[#6B6560]">{engravingText2.length} / {cfg.maxChars}</span>
                      </div>
                      <input
                        type="text"
                        value={engravingText2}
                        onChange={e => setEngravingText2(e.target.value.slice(0, cfg.maxChars))}
                        className="w-full border-[1.5px] border-[#E4DDD6] rounded-xl px-4 py-3 text-base text-[#1C1917] bg-white outline-none transition-colors focus:border-[#2D6A4F]"
                        placeholder="שורה שנייה (אופציונלי)"
                      />
                    </div>
                  </div>
                )}

                <Divider />

                {/* Font selector */}
                <div>
                  <p className="text-sm font-medium text-[#1C1917] mb-1">בחר גופן</p>
                  <p className="text-xs text-[#6B6560] mb-3">כל הגופנים מותאמים לחריטת לייזר</p>
                  <div className="grid grid-cols-3 gap-2">
                    {cfg.fonts.map(fid => (
                      <button
                        key={fid}
                        onClick={() => { setSelectedFont(fid); setPreviewApproved(false) }}
                        className="relative border-2 rounded-xl py-4 px-2 text-center transition-all"
                        style={selectedFont === fid
                          ? { borderColor: '#2D6A4F', background: '#D8F3DC' }
                          : { borderColor: '#E4DDD6', background: '#fff' }}
                      >
                        {selectedFont === fid && (
                          <span className="absolute top-1.5 left-2 text-[10px] font-bold" style={{ color: '#2D6A4F' }}>✓</span>
                        )}
                        <span
                          className="block text-lg text-[#1C1917] mb-1"
                          style={FONT_DEFS[fid].style}
                        >
                          {FONT_DEFS[fid].label}
                        </span>
                        <span className="block text-[10px] text-[#6B6560] uppercase tracking-wider">
                          {FONT_DEFS[fid].label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* §02 Logo upload */}
            {showLogoSection && (
              <SectionCard num={nums.logo} title="העלה תמונה או לוגו" desc="קבצי SVG נותנים את התוצאה החדה ביותר.">
                <div
                  id="drop-zone"
                  className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all"
                  style={isDragOver
                    ? { borderColor: '#2D6A4F', background: '#D8F3DC' }
                    : { borderColor: '#E4DDD6', background: '#F7F5F2' }}
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined text-4xl text-[#6B6560] block mb-3">cloud_upload</span>
                  <p className="text-sm font-medium text-[#1C1917] mb-1">שחרר כאן, או לחץ לבחירה</p>
                  <p className="text-xs text-[#6B6560]">SVG · PNG עם שקיפות · JPG — עד 5 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg"
                    onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]) }}
                    className="hidden"
                  />
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-3 p-3.5 bg-[#F7F5F2] rounded-xl border border-[#E4DDD6] mt-3">
                    <img
                      src={uploadedImgSrc}
                      alt="תצוגה מקדימה"
                      className="w-14 h-14 object-contain rounded-lg bg-white border border-[#E4DDD6]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1C1917] truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-[#6B6560]">{fmtBytes(uploadedFile.size)}</p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-[#6B6560] hover:text-[#DC2626] transition-colors text-2xl leading-none p-1"
                      aria-label="הסר קובץ"
                    >×</button>
                  </div>
                )}

                {isJpgWarn && (
                  <div className="mt-3 text-xs text-[#D97706] bg-[#FFFBEB] border-r-2 border-[#D97706] px-3 py-2.5 rounded-lg leading-relaxed">
                    לתוצאה הטובה ביותר, השתמש ב-SVG או PNG עם שקיפות. JPG עלול לאבד פרטים עדינים בתהליך החריטה — נבדוק לפני הייצור ונפנה אליך במידת הצורך.
                  </div>
                )}

                {fileError && (
                  <p className="mt-2 text-xs text-[#DC2626] flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {fileError}
                  </p>
                )}
              </SectionCard>
            )}

            {/* §0N Placement & Size */}
            <SectionCard num={nums.place} title="איפה למקם?" desc="לחץ על אזור בחתיכה לקביעת המיקום.">
              <div className="flex flex-col items-center gap-4">
                {/* Product silhouette with zone grid */}
                <div className="relative">
                  <div
                    className="relative w-56 h-36 rounded-xl overflow-hidden border-2 shadow-md"
                    style={{
                      background: material
                        ? `linear-gradient(135deg, ${material.bg}ee, ${material.bg}99)`
                        : 'linear-gradient(135deg, #C8A96E, #A07830)',
                      borderColor: material?.bg || '#8B6914',
                    }}
                  >
                    {/* Grain texture */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(12deg, transparent, transparent 10px, rgba(0,0,0,0.25) 10px, rgba(0,0,0,0.25) 11px)',
                      }}
                    />
                    {/* 3×3 zone grid */}
                    <div className="absolute inset-1.5 grid grid-cols-3 grid-rows-3 gap-0.5">
                      {ZONES.map(z => (
                        <button
                          key={z.id}
                          onClick={() => { setPlacement(z.id); setPreviewApproved(false) }}
                          title={z.label}
                          className="rounded transition-all"
                          style={placement === z.id
                            ? { background: 'rgba(45,106,79,0.45)', border: '1.5px solid #2D6A4F' }
                            : { border: '1px solid transparent' }}
                          onMouseEnter={e => { if (placement !== z.id) e.currentTarget.style.background = 'rgba(45,106,79,0.18)' }}
                          onMouseLeave={e => { if (placement !== z.id) e.currentTarget.style.background = '' }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#6B6560] text-center mt-2">{product.name_he}</p>
                </div>

                <p className="text-sm font-medium" style={{ color: '#2D6A4F' }}>
                  מיקום נבחר: {ZONES.find(z => z.id === placement)?.label || 'מרכז'}
                </p>
              </div>

              <Divider />

              {/* Engraving size */}
              <div>
                <p className="text-sm font-medium text-[#1C1917] mb-1">גודל החריטה</p>
                <p className="text-xs text-[#6B6560] mb-3">ביחס לשטח המוצר</p>
                <div className="flex gap-2">
                  {SIZE_DEFS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setEngravingSize(s.id); setPreviewApproved(false) }}
                      className="flex-1 py-3 rounded-xl border-2 text-center transition-all"
                      style={engravingSize === s.id
                        ? { borderColor: '#2D6A4F', background: '#D8F3DC' }
                        : { borderColor: '#E4DDD6', background: '#fff' }}
                    >
                      <span className="block font-bold text-sm text-[#1C1917]">{s.label}</span>
                      <span className="block text-[10px] text-[#6B6560] mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* §0N Material */}
            <SectionCard num={nums.material} title="חומר" desc="לכל חומר מאפיינים ייחודיים של חריטה.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {materials.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m.id)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-medium transition-all text-right"
                    style={selectedMaterial === m.id
                      ? { borderColor: '#2D6A4F', background: '#D8F3DC' }
                      : { borderColor: '#E4DDD6', background: '#fff' }}
                  >
                    <span
                      className="w-5 h-5 rounded-md flex-shrink-0 shadow-sm border border-white/30"
                      style={{ background: m.bg }}
                    />
                    <span className="text-[#1C1917] flex-1 text-right">{m.label}</span>
                    {selectedMaterial === m.id && (
                      <span className="text-sm" style={{ color: '#2D6A4F' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Product size (if multiple) */}
              {sizes.length > 1 && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm font-medium text-[#1C1917] mb-3">גודל מוצר</p>
                    <div className="flex gap-2 flex-wrap">
                      {sizes.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSize(s.id)}
                          className="flex-1 min-w-[72px] py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                          style={selectedSize === s.id
                            ? { borderColor: '#2D6A4F', background: '#D8F3DC', color: '#1C1917' }
                            : { borderColor: '#E4DDD6', background: '#fff', color: '#1C1917' }}
                        >
                          {s.label}
                          {s.extra > 0 && (
                            <span className="block text-xs font-normal opacity-70">+₪{s.extra}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </SectionCard>

            {/* §0N Proof */}
            <SectionCard num={nums.proof} title="האם תרצה הדמיה לפני הייצור?" desc="נשלח לך רנדר לפני שנפעיל את הלייזר.">
              <label
                className="flex items-start gap-3 p-4 rounded-xl border-[1.5px] cursor-pointer transition-all"
                style={wantsProof
                  ? { borderColor: '#2D6A4F', background: '#D8F3DC' }
                  : { borderColor: '#E4DDD6', background: '#F7F5F2' }}
              >
                <input
                  type="checkbox"
                  checked={wantsProof}
                  onChange={e => setWantsProof(e.target.checked)}
                  className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer"
                  style={{ accentColor: '#2D6A4F' }}
                />
                <div>
                  <p className="text-sm font-medium text-[#1C1917]">שלח לי הדמיה דיגיטלית לפני הייצור</p>
                  <p className="text-xs text-[#6B6560] mt-1">
                    נשלח לדוא&quot;ל תוך 24 שעות, ללא עלות. אתה מאשר — אנחנו חורטים. אין הפתעות.
                  </p>
                </div>
              </label>
            </SectionCard>

            {/* §0N Special notes */}
            <SectionCard num={nums.notes} title="משהו נוסף שכדאי לדעת?">
              <button
                onClick={() => setNotesOpen(o => !o)}
                className="flex items-center justify-between w-full text-sm font-medium text-[#6B6560] py-1 transition-colors hover:text-[#1C1917]"
              >
                <span>הוסף הנחיות מיוחדות (אופציונלי)</span>
                <span
                  className="material-symbols-outlined text-sm transition-transform"
                  style={{ transform: notesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>

              {notesOpen && (
                <div className="mt-3">
                  <textarea
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    rows={3}
                    className="w-full border-[1.5px] border-[#E4DDD6] rounded-xl px-4 py-3 text-sm text-[#1C1917] bg-white outline-none transition-colors resize-y focus:border-[#2D6A4F]"
                    placeholder="לדוגמה: ראי את הלוגו, יישר לשמאל, הימנע מאזור הסיכה בצד ימין…"
                  />
                  <p className="text-xs text-[#6B6560] mt-1.5">
                    אנחנו קוראים כל הערה בקפידה. אם משהו לא אפשרי, ניצור קשר לפני שנתחיל.
                  </p>
                </div>
              )}
            </SectionCard>

            {/* Mobile-only preview */}
            <div className="lg:hidden bg-white border border-[#E4DDD6] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-[#1C1917]">תצוגה מקדימה חיה</p>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: '#2D6A4F', background: '#D8F3DC' }}
                >
                  משוערת
                </span>
              </div>
              <LivePreview {...previewProps} compact />
            </div>

          </div>{/* /form column */}

          {/* ══════════ PREVIEW + SUMMARY COLUMN (desktop) ══════════ */}
          <div className="hidden lg:flex flex-col gap-4 sticky top-20">

            {/* Live preview card */}
            <div className="bg-white border border-[#E4DDD6] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-[#1C1917]">תצוגה מקדימה חיה</p>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: '#2D6A4F', background: '#D8F3DC' }}
                >
                  משוערת
                </span>
              </div>
              <LivePreview {...previewProps} />
            </div>

            {/* Order summary + CTA */}
            <div className="bg-white border border-[#E4DDD6] rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#1C1917] mb-4">סיכום הזמנה</p>

              <div className="space-y-2.5 text-sm border-b border-[#E4DDD6] pb-4 mb-4">
                {[
                  ['מוצר',     product.name_he],
                  ['חריטה',    typeLabels[engravingType]],
                  ['גופן',     showTextSection ? FONT_DEFS[selectedFont]?.label : '—'],
                  ['חומר',     material?.label || '—'],
                  ['מיקום',    ZONES.find(z => z.id === placement)?.label || 'מרכז'],
                  ['זמן ייצור', wantsProof ? '4–6 ימי עסקים' : '3–5 ימי עסקים'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-baseline gap-2">
                    <span className="text-[#6B6560] flex-shrink-0">{k}</span>
                    <span className="font-medium text-[#1C1917] text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#6B6560]">כמות</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-[#F7F5F2] border border-[#E4DDD6] font-bold text-[#1C1917] hover:bg-[#E4DDD6] transition-colors text-lg leading-none"
                  >−</button>
                  <span className="font-bold text-[#1C1917] w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-lg bg-[#F7F5F2] border border-[#E4DDD6] font-bold text-[#1C1917] hover:bg-[#E4DDD6] transition-colors text-lg leading-none"
                  >+</button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end justify-between mb-5">
                <span className="text-sm text-[#6B6560]">סה&quot;כ לתשלום</span>
                <div className="text-right">
                  <span className="block text-3xl font-extrabold font-headline" style={{ color: '#2D6A4F' }}>
                    ₪{grandTotal.toFixed(0)}
                  </span>
                  <span className="text-xs text-[#6B6560]">מחיר סופי כולל הכל</span>
                </div>
              </div>

              {/* CTAs */}
              <button
                onClick={handleOrder}
                className="w-full py-4 text-base font-bold text-white rounded-xl transition-all"
                style={{ background: '#2D6A4F' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1B4332'}
                onMouseLeave={e => e.currentTarget.style.background = '#2D6A4F'}
              >
                המשך לתשלום
              </button>

              <button
                onClick={saveForLater}
                className="w-full py-2.5 mt-2 text-sm font-medium text-[#6B6560] bg-white border border-[#E4DDD6] rounded-xl hover:border-[#6B6560] hover:text-[#1C1917] transition-all"
              >
                שמור לאחר כך
              </button>
            </div>

          </div>{/* /preview column */}

        </div>
      </main>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden bg-white border-t border-[#E4DDD6] px-4 py-3 z-50"
           style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.09)' }}>
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1C1917] truncate">{product.name_he}</p>
            <p className="text-xs text-[#6B6560]">
              {typeLabels[engravingType]}
              {showTextSection ? ` · ${FONT_DEFS[selectedFont]?.label}` : ''}
            </p>
          </div>
          <span className="text-base font-bold flex-shrink-0" style={{ color: '#2D6A4F' }}>
            ₪{grandTotal.toFixed(0)}
          </span>
          <button
            onClick={handleOrder}
            className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors flex-shrink-0"
            style={{ background: '#2D6A4F' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1B4332'}
            onMouseLeave={e => e.currentTarget.style.background = '#2D6A4F'}
          >
            המשך לתשלום
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg pointer-events-none"
          style={{ bottom: '88px', background: '#1C1917', whiteSpace: 'nowrap' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
