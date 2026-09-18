import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import Icon from '../components/Icon'

const API = import.meta.env.VITE_API_URL
const STATIC_BASE = import.meta.env.VITE_STATIC_BASE

// ── Per-category config (unchanged) ──────────────────────────────────────────
export const CATEGORY_CONFIG = {
  drinkware: {
    materials: [
      { id: 'matte_black',   label: 'מט שחור',    bg: '#1a1a1a', textColor: '#9acbff', blendMode: 'screen' },
      { id: 'silver',        label: 'כסוף',        bg: '#b0b8c1', textColor: '#1a1c1c', blendMode: 'multiply' },
      { id: 'white',         label: 'לבן',         bg: '#f5f5f5', textColor: '#1a1c1c', blendMode: 'multiply' },
    ],
    fonts: ['modern', 'classic', 'handwriting', 'typewriter', 'bold'],
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
    fonts: ['modern', 'classic', 'handwriting', 'typewriter', 'bold'],
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
    fonts: ['modern', 'classic', 'handwriting', 'typewriter', 'bold'],
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
    fonts: ['modern', 'classic', 'handwriting', 'typewriter', 'bold'],
    sizes: [
      { id: 'small',  label: 'קטן',   extra: 0 },
      { id: 'medium', label: 'בינוני', extra: 30 },
      { id: 'large',  label: 'גדול',  extra: 60 },
    ],
    maxChars: 100,
    hint: 'טקסט לחריטה',
  },
}

export const FONT_DEFS = {
  modern:      { label: 'מודרני',  style: { fontFamily: 'Rubik, sans-serif',     fontWeight: 700 } },
  classic:     { label: 'קלאסי',   style: { fontFamily: '"Miriam Libre", serif', fontWeight: 400, letterSpacing: '0.08em' } },
  handwriting: { label: 'כתב יד',  style: { fontFamily: 'cursive',               fontStyle: 'italic', fontWeight: 700 } },
  typewriter:  { label: 'מכונת כתיבה', style: { fontFamily: 'monospace', fontWeight: 600 } },
  bold:        { label: 'בולט',    style: { fontFamily: 'Rubik, sans-serif', fontWeight: 800, letterSpacing: '0.02em' } },
}

export const ZONES = [
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

export const SIZE_DEFS = [
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

export function getPreviewImage(product) {
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

// One step of the form: a two-ink step numeral, a title, and the controls. No card shell.
function SectionCard({ num, title, desc, children }) {
  const numbered = num && num !== '—'
  return (
    <section className="py-8 border-t border-[var(--rule-strong)] first:border-t-0 first:pt-0">
      <div className="flex items-start gap-4 mb-5">
        {numbered && (
          <span
            className="font-display misprint shrink-0 text-[60px] leading-[0.75] w-9 text-center tabular"
            data-text={Number(num)}
            aria-hidden="true"
          >
            {Number(num)}
          </span>
        )}
        <div className="pt-0.5">
          <h2 className="m-0 font-display text-[33px] leading-tight">{title}</h2>
          {desc && <p className="m-0 mt-1 text-[15px] text-ink-3">{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function Divider() {
  return <div className="border-t border-[var(--rule)] my-6" />
}

// ── Live Preview ──────────────────────────────────────────────────────────────

export function LivePreview({
  product, productImg, designZone,
  engravingType, engravingText, engravingText2,
  material, font, sizeScale, placement,
  uploadedImgSrc, compact = false,
  previewApproved, onApprove, onAdjust,
  onCustomPlacementChange,
  onSizeScaleChange,
  interactive = false,
  placementLogo,
  sizeScaleLogo,
  rotationText = 0,
  rotationLogo = 0,
  textAlignment = 'center',
  onCustomPlacementChangeLogo,
  onSizeScaleChangeLogo,
  onRotationTextChange,
  onRotationLogoChange,
}) {
  const { theme: t } = useTheme()
  const cfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.mixed
  const previewText = engravingText || cfg.hint
  
  // Parse text placement coordinates
  const parts = typeof placement === 'string' && placement.startsWith('custom_') ? placement.split('_') : []
  const customX = parseFloat(parts[1]) || 50
  const customY = parseFloat(parts[2]) || 50
  const customW = parseFloat(parts[3]) || 50
  const customH = parseFloat(parts[4]) || 30

  // Parse logo placement coordinates
  const logoParts = typeof placementLogo === 'string' && placementLogo.startsWith('custom_') ? placementLogo.split('_') : []
  const customLogoX = parseFloat(logoParts[1]) || 50
  const customLogoY = parseFloat(logoParts[2]) || 70
  const customLogoW = parseFloat(logoParts[3]) || 50
  const customLogoH = parseFloat(logoParts[4]) || 30

  const placementFlex = 'items-center justify-center'

  const overlayStyle = {
    position: 'absolute',
    left: `${customX}%`, top: `${customY}%`,
    width: 'max-content',
    maxWidth: '90%',
    height: 'auto',
    transform: `translate(-50%, -50%) rotate(${rotationText}deg)`,
    direction: 'ltr',
    border: compact || !interactive || previewApproved ? 'none' : '1.5px dashed ' + t.accent,
    background: compact || !interactive || previewApproved ? 'transparent' : 'rgba(0,120,191,0.07)',
    cursor: compact || !interactive || previewApproved ? 'default' : 'move',
    touchAction: 'none',
  }

  const overlayStyleLogo = {
    position: 'absolute',
    left: `${customLogoX}%`, top: `${customLogoY}%`,
    width: '28cqw',
    height: '28cqw',
    transform: `translate(-50%, -50%) rotate(${rotationLogo}deg) scale(${sizeScaleLogo})`,
    direction: 'ltr',
    border: compact || !interactive || previewApproved ? 'none' : '1.5px dashed ' + t.accent,
    background: compact || !interactive || previewApproved ? 'transparent' : 'rgba(0,120,191,0.07)',
    cursor: compact || !interactive || previewApproved ? 'default' : 'move',
    touchAction: 'none',
  }

  const textStyle = {
    ...font.style,
    color: material?.textColor || '#fff',
    mixBlendMode: material?.blendMode || 'screen',
    filter: 'contrast(1.2)',
    fontSize: `calc(7.2cqw * ${sizeScale})`,
    lineHeight: 1.3,
    wordBreak: 'break-word',
    textAlign: textAlignment,
    whiteSpace: 'pre-wrap',
    direction: 'rtl' // Keep the text itself reading RTL
  }

  const needsZoom = product?.id === 'prod_4' || product?.name_he?.includes('תחתיות') || product?.name_he?.includes('בלוק')
  const zoomStyle = needsZoom ? { transform: 'scale(1.35)', transformOrigin: 'center center' } : {}

  const containerRef = useRef(null)

  const handleStartDrag = (target, type, e) => {
    if (compact || !interactive || previewApproved || !onCustomPlacementChange) return
    e.preventDefault()
    e.stopPropagation()

    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()

    const isTouch = e.type === 'touchstart'
    const startCX = isTouch ? e.touches[0].clientX : e.clientX
    const startCY = isTouch ? e.touches[0].clientY : e.clientY

    const startX = target === 'text' ? customX : customLogoX
    const startY = target === 'text' ? customY : customLogoY
    const startScale = target === 'text' ? sizeScale : sizeScaleLogo

    const handleDragMove = (moveEvt) => {
      const currentCX = isTouch ? moveEvt.touches[0].clientX : moveEvt.clientX
      const currentCY = isTouch ? moveEvt.touches[0].clientY : moveEvt.clientY

      const dx = ((currentCX - startCX) / rect.width) * 100
      const dy = ((currentCY - startCY) / rect.height) * 100

      if (type === 'move') {
        const nextX = Math.max(5, Math.min(95, startX + dx))
        const nextY = Math.max(5, Math.min(95, startY + dy))
        if (target === 'text') {
          onCustomPlacementChange(`custom_${nextX.toFixed(1)}_${nextY.toFixed(1)}_${customW.toFixed(1)}_${customH.toFixed(1)}`)
        } else {
          onCustomPlacementChangeLogo(`custom_${nextX.toFixed(1)}_${nextY.toFixed(1)}_${customLogoW.toFixed(1)}_${customLogoH.toFixed(1)}`)
        }
      } else if (type === 'resize') {
        const scaleChange = (dx + dy) / 40
        const nextScale = Math.max(0.3, Math.min(6.0, startScale + scaleChange))
        if (target === 'text') {
          if (onSizeScaleChange) onSizeScaleChange(nextScale)
        } else {
          if (onSizeScaleChangeLogo) onSizeScaleChangeLogo(nextScale)
        }
      } else if (type === 'rotate') {
        const box = container.querySelector(target === 'text' ? '.text-overlay-box' : '.logo-overlay-box')
        if (box) {
          const boxRect = box.getBoundingClientRect()
          const centerX = boxRect.left + boxRect.width / 2
          const centerY = boxRect.top + boxRect.height / 2
          const rad = Math.atan2(currentCY - centerY, currentCX - centerX)
          let deg = rad * (180 / Math.PI) + 90
          
          if (deg > 180) deg -= 360
          if (deg < -180) deg += 360

          // Lock easily to 0, 90, 180, -90, -180
          const snapAngles = [0, 90, 180, -90, -180]
          for (let snap of snapAngles) {
            if (Math.abs(deg - snap) < 8) {
              deg = snap
              break
            }
          }

          if (target === 'text') {
            if (onRotationTextChange) onRotationTextChange(Math.round(deg))
          } else {
            if (onRotationLogoChange) onRotationLogoChange(Math.round(deg))
          }
        }
      }
    }

    const handleDragEnd = () => {
      if (isTouch) {
        window.removeEventListener('touchmove', handleDragMove)
        window.removeEventListener('touchend', handleDragEnd)
      } else {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
      }
    }

    if (isTouch) {
      window.addEventListener('touchmove', handleDragMove, { passive: false })
      window.addEventListener('touchend', handleDragEnd)
    } else {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
    }
  }

  return (
    <div>
      <div
        className="relative rounded-[10px] overflow-hidden bg-paper-2"
        style={{ aspectRatio: '4/3', containerType: 'inline-size' }}
      >
        <div ref={containerRef} className="absolute inset-0 w-full h-full" style={zoomStyle}>
          {productImg ? (
            <>
              <img
                src={productImg}
                alt={product.name_he}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                style={{ filter: 'brightness(0.88) contrast(1.05)' }}
                draggable={false}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: (material?.bg || '#000') + '28', mixBlendMode: 'color' }}
              />
            </>
          ) : (
            <>
              <div className="absolute inset-0 pointer-events-none" style={{ background: material?.bg || '#2f3131' }} />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent pointer-events-none" />
            </>
          )}

          {/* Engraving overlay */}
          {engravingType !== 'logo' && (
            <div 
              className={`flex ${placementFlex} p-1 select-none text-overlay-box`} 
              style={overlayStyle}
              onMouseDown={e => handleStartDrag('text', 'move', e)}
              onTouchStart={e => handleStartDrag('text', 'move', e)}
            >
              <div style={{ ...textStyle, maxWidth: '100%' }}>
                {previewText}
                {engravingText2 && (
                  <span className="block" style={{ fontSize: `calc(0.7em)`, marginTop: '0.3em' }}>
                    {engravingText2}
                  </span>
                )}
              </div>
              {!compact && interactive && !previewApproved && (
                <>
                  <div
                    className="absolute w-4.5 h-4.5 bg-white border-2 rounded-full cursor-se-resize z-30"
                    style={{ bottom: '-9px', right: '-9px', borderColor: t.accent }}
                    onMouseDown={e => handleStartDrag('text', 'resize', e)}
                    onTouchStart={e => handleStartDrag('text', 'resize', e)}
                  />
                  <div
                    className="absolute w-5 h-5 bg-white border-2 rounded-full cursor-alias z-30 flex items-center justify-center shadow-sm"
                    style={{ top: '-24px', left: '50%', transform: 'translateX(-50%)', borderColor: t.accent }}
                    onMouseDown={e => handleStartDrag('text', 'rotate', e)}
                    onTouchStart={e => handleStartDrag('text', 'rotate', e)}
                  >
                    <Icon name="rotate" size={12} strokeWidth={2.4} style={{ color: t.accent }} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Uploaded image overlay */}
          {engravingType !== 'text' && uploadedImgSrc && (
            <div 
              className={`flex ${placementFlex} p-1 select-none logo-overlay-box`} 
              style={overlayStyleLogo}
              onMouseDown={e => handleStartDrag('logo', 'move', e)}
              onTouchStart={e => handleStartDrag('logo', 'move', e)}
            >
              <img
                src={uploadedImgSrc}
                alt="לוגו"
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{
                  opacity: 0.85,
                  mixBlendMode: material?.blendMode || 'screen',
                }}
                draggable={false}
              />
              {!compact && interactive && !previewApproved && (
                <>
                  <div
                    className="absolute w-4.5 h-4.5 bg-white border-2 rounded-full cursor-se-resize z-30"
                    style={{ bottom: '-9px', right: '-9px', borderColor: t.accent }}
                    onMouseDown={e => handleStartDrag('logo', 'resize', e)}
                    onTouchStart={e => handleStartDrag('logo', 'resize', e)}
                  />
                  <div
                    className="absolute w-5 h-5 bg-white border-2 rounded-full cursor-alias z-30 flex items-center justify-center shadow-sm"
                    style={{ top: '-24px', left: '50%', transform: 'translateX(-50%)', borderColor: t.accent }}
                    onMouseDown={e => handleStartDrag('logo', 'rotate', e)}
                    onTouchStart={e => handleStartDrag('logo', 'rotate', e)}
                  >
                    <Icon name="rotate" size={12} strokeWidth={2.4} style={{ color: t.accent }} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Live indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-[rgba(18,19,23,.55)] backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span className="live-dot" style={{ width: 7, height: 7 }} aria-hidden="true" />
          <span className="text-[11px] font-medium text-white">תצוגה חיה</span>
        </div>
      </div>

      {!compact && interactive && (
        <>
          <p className="text-[13px] text-ink-3 text-center mt-3 mb-0">
            תצוגה משוערת. גרגר החומר משנה קצת את התוצאה, ולכן תקבלו שרטוט מדויק לאישור.
          </p>
          <div className="flex gap-2 mt-3">
            {previewApproved ? (
              <>
                <div className="flex-1 min-h-[46px] flex items-center justify-center gap-2 rounded-[10px] text-[14.5px] font-medium text-blue" style={{ boxShadow: 'inset 0 0 0 1.5px var(--blue)', background: 'rgba(0,120,191,.06)' }}>
                  <Icon name="check" size={17} /> המיקום נשמר
                </div>
                <button onClick={onAdjust} type="button" className="btn btn-line btn-sm">לערוך</button>
              </>
            ) : (
              <>
                <button type="button" onClick={onApprove} className="btn btn-pink btn-sm flex-1">
                  <Icon name="check" size={17} /> נראה טוב
                </button>
                <button type="button" onClick={onAdjust} className="btn btn-line btn-sm flex-1">לשנות הגדרות</button>
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
  const { theme: t, visitorName } = useTheme()
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
  const [colors, setColors] = useState([])
  const [selectedColor, setSelectedColor] = useState(null)
  const [customOptions, setCustomOptions] = useState([])
  const [selectedOptions, setSelectedOptions] = useState({})

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
  const [sizeScale, setSizeScale] = useState(1.0)
  const [placement, setPlacement] = useState('custom_50_50_50_30')
  const [placementLogo, setPlacementLogo] = useState('custom_50_70_50_30')
  const [sizeScaleLogo, setSizeScaleLogo] = useState(1.0)
  const [rotationText, setRotationText] = useState(0)
  const [rotationLogo, setRotationLogo] = useState(0)
  const [textAlignment, setTextAlignment] = useState('center')

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

        // Initialize custom coordinates placement based on product designZone if available
        const { zone: designZone } = getPreviewImage(p)
        let defaultPlacement = 'custom_50_30_50_30'
        let defaultPlacementLogo = 'custom_50_70_50_30'
        if (designZone) {
          const centerX = designZone.x + designZone.width / 2
          const centerYText = designZone.y + designZone.height * 0.35
          const centerYLogo = designZone.y + designZone.height * 0.65
          const width = designZone.width
          const height = designZone.height
          defaultPlacement = `custom_${centerX.toFixed(1)}_${centerYText.toFixed(1)}_${width.toFixed(1)}_${(height * 0.4).toFixed(1)}`
          defaultPlacementLogo = `custom_${centerX.toFixed(1)}_${centerYLogo.toFixed(1)}_${width.toFixed(1)}_${(height * 0.4).toFixed(1)}`
        }

        // Check localStorage for saved draft first
        let hadDraftText = false
        try {
          const draft = JSON.parse(localStorage.getItem(`am_draft_${productId}`))
          if (draft) {
            if (draft.placement) defaultPlacement = draft.placement
            if (draft.placementLogo) defaultPlacementLogo = draft.placementLogo
            if (draft.sizeScale) setSizeScale(draft.sizeScale)
            if (draft.sizeScaleLogo) setSizeScaleLogo(draft.sizeScaleLogo)
            if (draft.rotationText) setRotationText(draft.rotationText)
            if (draft.rotationLogo) setRotationLogo(draft.rotationLogo)
            if (draft.textAlignment) setTextAlignment(draft.textAlignment)
            if (draft.engravingType) setEngravingType(draft.engravingType)
            if (draft.engravingText) { setEngravingText(draft.engravingText); hadDraftText = true }
            if (draft.selectedFont) setSelectedFont(draft.selectedFont)
            showToast('הטיוטה שלך שוחזרה')
          }
        } catch (_) {}

        // The name typed on the home page door sign carries over.
        if (!hadDraftText && visitorName) setEngravingText(visitorName)

        setPlacement(defaultPlacement)
        setPlacementLogo(defaultPlacementLogo)
        const cfg = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.mixed

        // Parse custom options
        let opts = []
        try {
          if (p.available_materials && p.available_materials.startsWith('[')) {
            opts = JSON.parse(p.available_materials)
          }
        } catch (_) {}
        setCustomOptions(opts)

        // Init selected options
        const initialSelected = {}
        opts.forEach(o => {
          if (o.values && o.values.length > 0) {
            initialSelected[o.name] = o.values[0]
          }
        })
        setSelectedOptions(initialSelected)

        let mats = cfg.materials
        const isMetalProduct = p.materials && (
          p.materials.includes('ברזל') || 
          p.materials.includes('מתכת') || 
          p.materials.includes('metal') || 
          p.materials.includes('steel')
        )
        if (isMetalProduct) {
          mats = [
            { id: 'matte_black', label: 'מט שחור', bg: '#1a1a1a', textColor: '#9acbff', blendMode: 'screen' },
            { id: 'silver',      label: 'כסוף',    bg: '#b0b8c1', textColor: '#1a1c1c', blendMode: 'multiply' },
          ]
        }
        setMaterials(mats)
        setSelectedMaterial(mats[0]?.id || null)

        let szs = cfg.sizes
        if (p.available_sizes) {
          const avail = p.available_sizes.split(',').map(s => s.trim()).filter(Boolean)
          szs = avail.map((s, i) => ({ id: `size_${i}`, label: s, extra: 0 }))
        }
        setSizes(szs)
        setSelectedSize(szs[0]?.id || null)

        let cols = []
        if (p.available_colors) {
          cols = p.available_colors.split(',').map(s => s.trim()).filter(Boolean)
        }
        setColors(cols)
        if (cols.length > 0) setSelectedColor(cols[0])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
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
      engravingType, engravingText, selectedFont, placement, sizeScale,
      placementLogo, sizeScaleLogo, rotationText, rotationLogo, textAlignment,
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
      sizeScale, placement, wantsProof, specialNotes,
      color: selectedColor,
      customOptions: selectedOptions, // Pass chosen custom options
      placementLogo,
      sizeScaleLogo,
      rotationText,
      rotationLogo,
      textAlignment,
    })
    navigate('/checkout')
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[60vh] grid place-items-center text-ink-3" role="status">
      <span className="flex items-center gap-3"><Icon name="spinner" size={22} /> טוענים את המוצר…</span>
    </div>
  )

  if (notFound || !product) return (
    <div className="wrap py-24">
      <div className="sheet text-center px-6 py-16 max-w-xl mx-auto">
        <h1 className="font-display text-[44px] m-0">המוצר הזה לא נמצא</h1>
        <Link to="/products" className="btn btn-pink mt-6">לכל המוצרים</Link>
      </div>
    </div>
  )

  // ── Derived values ────────────────────────────────────────────────────────
  const cfg        = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.mixed
  const material   = materials.find(m => m.id === selectedMaterial) || materials[0]
  const font       = FONT_DEFS[selectedFont]
  const size       = sizes.find(s => s.id === selectedSize) || sizes[0]
  const unitPrice  = product.price + (size?.extra || 0)
  const grandTotal = unitPrice * quantity

  const parts = typeof placement === 'string' && placement.startsWith('custom_') ? placement.split('_') : []
  const customX = parseFloat(parts[1]) || 50
  const customY = parseFloat(parts[2]) || 50
  const customW = parseFloat(parts[3]) || 50
  const customH = parseFloat(parts[4]) || 30

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
      color:    colors.length > 0 ? n() : null,
      material: (materials.length > 0 && customOptions.length === 0) ? n() : null,
      proof:    n(),
      notes:    n(),
    }
  })()

  const typeLabels = { text: 'טקסט', logo: 'תמונה או לוגו', both: 'טקסט ותמונה' }

  const getProductImg = () => {
    // Dynamic image swap if custom option specifies an image
    for (let optName in selectedOptions) {
      const val = selectedOptions[optName]
      if (val && val.image_url) return resolveUrl(val.image_url)
    }
    const { url: previewUrl } = getPreviewImage(product)
    return previewUrl
  }

  const { zone: designZone } = getPreviewImage(product)
  const productImg = getProductImg()

  const previewProps = {
    product, productImg, designZone,
    engravingType, engravingText, engravingText2,
    material, font, sizeScale, placement, uploadedImgSrc,
    previewApproved,
    placementLogo,
    sizeScaleLogo,
    rotationText,
    rotationLogo,
    textAlignment,
    onApprove: () => setPreviewApproved(true),
    onAdjust: () => {
      setPreviewApproved(false)
      document.getElementById('et-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
    onCustomPlacementChange: (val) => {
      setPlacement(val)
      setPreviewApproved(false)
    },
    onSizeScaleChange: (val) => {
      setSizeScale(val)
      setPreviewApproved(false)
    },
    onCustomPlacementChangeLogo: (val) => {
      setPlacementLogo(val)
      setPreviewApproved(false)
    },
    onSizeScaleChangeLogo: (val) => {
      setSizeScaleLogo(val)
      setPreviewApproved(false)
    },
    onRotationTextChange: (val) => {
      setRotationText(val)
      setPreviewApproved(false)
    },
    onRotationLogoChange: (val) => {
      setRotationLogo(val)
      setPreviewApproved(false)
    },
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const summaryRows = [
    ['מוצר', product.name_he],
    ['חריטה', typeLabels[engravingType]],
    showTextSection && engravingText && ['טקסט', engravingText],
    showTextSection && ['גופן', FONT_DEFS[selectedFont]?.label],
    (materials.length > 0 && customOptions.length === 0) && ['חומר', material?.label],
    sizes.length > 1 && ['גודל', size?.label],
    colors.length > 0 && ['צבע', selectedColor],
    ...Object.entries(selectedOptions).map(([k, v]) => [k, v?.label || v]),
    ['שרטוט לאישור', wantsProof ? 'כן, לפני חריטה' : 'לא'],
    ['זמן הכנה', product.production_time || '5–7 ימי עסקים'],
  ].filter(Boolean)

  return (
    <div>
      <div className="wrap pt-6">
        <nav className="text-[14.5px] text-ink-3" aria-label="פירורי לחם">
          <ol className="list-none m-0 p-0 flex flex-wrap items-center gap-1.5">
            <li><Link to="/products" className="link-u">מוצרים</Link></li>
            <li aria-hidden="true"><Icon name="chevron" size={14} /></li>
            <li><Link to={`/products/${product.id}`} className="link-u">{product.name_he}</Link></li>
            <li aria-hidden="true"><Icon name="chevron" size={14} /></li>
            <li className="text-ink" aria-current="page">עיצוב החריטה</li>
          </ol>
        </nav>
        <h1 className="font-display m-0 mt-5" style={{ fontSize: 'clamp(51px, 6.6vw, 84px)', lineHeight: 0.9 }}>
          מה נחרוט על {product.name_he}?
        </h1>
        <p className="m-0 mt-3 mb-10 text-[17px] text-ink-2 max-w-[60ch]">
          כותבים, מזיזים ורואים על המוצר. לפני החריטה נשלח לכם שרטוט מדויק לאישור.
        </p>
      </div>

      <div className="wrap pb-32 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">

          {/* ══════════ FORM COLUMN ══════════ */}
          <div className="sheet" style={{ padding: 'clamp(22px, 3.5vw, 40px)' }}>

            <SectionCard num="—" title="מה חורטים?">
              <div className="seg" role="group" aria-label="סוג חריטה">
                {[
                  { id: 'text', label: 'טקסט' },
                  { id: 'logo', label: 'תמונה או לוגו' },
                  { id: 'both', label: 'שניהם' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={engravingType === opt.id}
                    onClick={() => { setEngravingType(opt.id); setPreviewApproved(false) }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SectionCard>

            {showTextSection && (
              <SectionCard num={nums.text} title="מה יהיה כתוב?" desc="טקסט קצר נחרט חד ויפה יותר.">
                <div>
                  <div className="flex justify-between items-baseline">
                    <label className="field-label" htmlFor="et-input">טקסט לחריטה</label>
                    <span className={`text-[13px] tabular ${engravingText.length > cfg.maxChars * 0.85 ? 'text-danger font-semibold' : 'text-ink-3'}`}>
                      {engravingText.length}/{cfg.maxChars}
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
                    className="field text-[18px]"
                    aria-invalid={textError ? 'true' : undefined}
                    aria-describedby={textError ? 'et-error' : undefined}
                    placeholder={cfg.hint}
                  />
                  {textError && (
                    <p id="et-error" className="field-error m-0"><Icon name="alert" size={15} /> {textError}</p>
                  )}
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer mt-4 w-fit text-[15px] text-ink-2">
                  <input
                    type="checkbox"
                    checked={isMultiline}
                    onChange={e => {
                      setIsMultiline(e.target.checked)
                      if (!e.target.checked) setEngravingText2('')
                    }}
                    className="w-[18px] h-[18px] cursor-pointer"
                    style={{ accentColor: 'var(--blue)' }}
                  />
                  להוסיף שורה שנייה
                </label>

                {isMultiline && (
                  <div className="mt-4">
                    <div className="flex justify-between items-baseline">
                      <label className="field-label" htmlFor="et-input-2">שורה שנייה</label>
                      <span className="text-[13px] text-ink-3 tabular">{engravingText2.length}/{cfg.maxChars}</span>
                    </div>
                    <input
                      id="et-input-2"
                      type="text"
                      value={engravingText2}
                      onChange={e => setEngravingText2(e.target.value.slice(0, cfg.maxChars))}
                      className="field"
                      placeholder="למשל תאריך"
                    />
                  </div>
                )}

                <Divider />

                <p className="field-label m-0">גופן</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2" role="group" aria-label="בחירת גופן">
                  {cfg.fonts.map(fid => (
                    <button
                      key={fid}
                      type="button"
                      aria-pressed={selectedFont === fid}
                      onClick={() => { setSelectedFont(fid); setPreviewApproved(false) }}
                      className="choice flex-col justify-center !items-center py-4"
                    >
                      {selectedFont === fid && <span className="tick"><Icon name="check" size={13} strokeWidth={2.6} /></span>}
                      <span className="block text-[22px] leading-tight text-ink truncate max-w-full" style={FONT_DEFS[fid].style}>
                        {(engravingText || 'חותם').slice(0, 10)}
                      </span>
                      <span className="block text-[12.5px] text-ink-3">{FONT_DEFS[fid].label}</span>
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {showLogoSection && (
              <SectionCard num={nums.logo} title="תמונה או לוגו" desc="SVG או PNG עם רקע שקוף נותנים את התוצאה הכי חדה.">
                <div
                  id="drop-zone"
                  role="button"
                  tabIndex={0}
                  aria-label="העלאת קובץ: גוררים לכאן או לוחצים לבחירה"
                  className="rounded-[12px] p-8 md:p-10 text-center cursor-pointer transition-colors"
                  style={{
                    border: `2px dashed ${isDragOver ? 'var(--blue)' : 'var(--rule-strong)'}`,
                    background: isDragOver ? 'rgba(0,120,191,.06)' : 'var(--paper)',
                  }}
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]) }}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
                >
                  <Icon name="upload" size={30} className="mx-auto text-ink-3" />
                  <p className="m-0 mt-3 font-medium">גוררים לכאן, או לוחצים לבחירה</p>
                  <p className="m-0 mt-1 text-[13.5px] text-ink-3">SVG · PNG · JPG, עד 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,.png,.jpg,.jpeg"
                    onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]) }}
                    className="hidden"
                  />
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-3 p-3 mt-3 rounded-[12px] bg-paper">
                    <img src={uploadedImgSrc} alt="הקובץ שהעליתם" className="w-14 h-14 object-contain rounded-[8px] bg-sheet" />
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[15px] font-medium truncate" dir="ltr" style={{ textAlign: 'right' }}>{uploadedFile.name}</p>
                      <p className="m-0 text-[13px] text-ink-3 tabular">{fmtBytes(uploadedFile.size)}</p>
                    </div>
                    <button type="button" onClick={removeFile} className="btn btn-sm" style={{ background: 'transparent', color: 'var(--ink-2)' }} aria-label="להסיר את הקובץ">
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                )}

                {isJpgWarn && (
                  <p className="m-0 mt-3 text-[14px] text-ink-2 flex gap-2">
                    <Icon name="alert" size={17} className="shrink-0 mt-0.5 text-pink-deep" />
                    JPG עלול לאבד פרטים עדינים בחריטה. נבדוק את הקובץ לפני הייצור ונחזור אליכם אם צריך.
                  </p>
                )}

                {fileError && (
                  <p className="field-error m-0 mt-2"><Icon name="alert" size={15} /> {fileError}</p>
                )}
              </SectionCard>
            )}

            {customOptions.map((optGroup, idx) => {
              const currentVal = selectedOptions[optGroup.name]
              return (
                <SectionCard key={idx} num="—" title={optGroup.name}>
                  <div className="grid grid-cols-2 gap-2.5" role="group" aria-label={optGroup.name}>
                    {optGroup.values && optGroup.values.map((v, valIdx) => {
                      const isSelected = currentVal && currentVal.label === v.label
                      return (
                        <button
                          key={valIdx}
                          type="button"
                          aria-pressed={!!isSelected}
                          onClick={() => {
                            setSelectedOptions(prev => ({ ...prev, [optGroup.name]: v }))
                            setPreviewApproved(false)
                          }}
                          className="choice"
                        >
                          {v.color && <span className="w-6 h-6 rounded-full shrink-0" style={{ background: v.color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)' }} />}
                          <span className="font-medium text-[15px]">{v.label}</span>
                          {isSelected && <span className="tick"><Icon name="check" size={13} strokeWidth={2.6} /></span>}
                        </button>
                      )
                    })}
                  </div>
                </SectionCard>
              )
            })}

            <SectionCard num={nums.place} title="מיקום וגודל" desc="גוררים את החריטה על המוצר. הפינה משנה גודל, העיגול למעלה מסובב.">
              <LivePreview {...previewProps} interactive={true} />

              {!previewApproved && showTextSection && (
                <div className="mt-6">
                  <p className="field-label m-0">יישור הטקסט</p>
                  <div className="seg mt-2 max-w-xs" role="group" aria-label="יישור הטקסט">
                    {[
                      { id: 'right', label: 'ימין' },
                      { id: 'center', label: 'מרכז' },
                      { id: 'left', label: 'שמאל' },
                    ].map(align => (
                      <button
                        key={align.id}
                        type="button"
                        aria-pressed={textAlignment === align.id}
                        onClick={() => { setTextAlignment(align.id); setPreviewApproved(false) }}
                      >
                        {align.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {colors.length > 0 && (
              <SectionCard num={nums.color} title="צבע המוצר">
                <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="צבע המוצר">
                  {colors.map(c => (
                    <button key={c} type="button" aria-pressed={selectedColor === c} onClick={() => setSelectedColor(c)} className="choice justify-center">
                      <span className="font-medium">{c}</span>
                      {selectedColor === c && <span className="tick"><Icon name="check" size={13} strokeWidth={2.6} /></span>}
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {materials.length > 0 && customOptions.length === 0 && (
              <SectionCard num={nums.material} title="חומר" desc="כל חומר מקבל את הלייזר קצת אחרת.">
                <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="חומר">
                  {materials.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={selectedMaterial === m.id}
                      onClick={() => { setSelectedMaterial(m.id); setPreviewApproved(false) }}
                      className="choice"
                    >
                      <span className="w-8 h-8 rounded-[7px] shrink-0" style={{ background: m.bg, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)' }} />
                      <span className="font-medium text-[15px]">{m.label}</span>
                      {selectedMaterial === m.id && <span className="tick"><Icon name="check" size={13} strokeWidth={2.6} /></span>}
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {sizes.length > 1 && (
              <SectionCard num="—" title="גודל המוצר">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group" aria-label="גודל המוצר">
                  {sizes.map(sz => (
                    <button key={sz.id} type="button" aria-pressed={selectedSize === sz.id} onClick={() => setSelectedSize(sz.id)} className="choice flex-col !items-center justify-center">
                      <span className="font-medium">{sz.label}</span>
                      {sz.extra > 0 && <span className="text-[13px] text-ink-3 tabular">+₪{sz.extra}</span>}
                      {selectedSize === sz.id && <span className="tick"><Icon name="check" size={13} strokeWidth={2.6} /></span>}
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            <SectionCard num={nums.proof} title="שרטוט לאישור" desc="לפני שהלייזר נדלק, נשלח לכם את הקובץ הסופי.">
              <label className={`choice !items-start cursor-pointer ${wantsProof ? 'is-on' : ''}`}>
                <input
                  type="checkbox"
                  checked={wantsProof}
                  onChange={e => setWantsProof(e.target.checked)}
                  className="w-[18px] h-[18px] mt-1 shrink-0 cursor-pointer"
                  style={{ accentColor: 'var(--blue)' }}
                />
                <span>
                  <span className="block font-medium">כן, שלחו לי שרטוט לפני החריטה</span>
                  <span className="block mt-1 text-[14px] text-ink-3">במייל, בלי עלות. אתם מאשרים, אנחנו חורטים.</span>
                </span>
              </label>
            </SectionCard>

            <SectionCard num={nums.notes} title="הערות לצוות" desc="לא ייחרט על המוצר.">
              {!notesOpen ? (
                <button type="button" onClick={() => setNotesOpen(true)} className="btn btn-line w-full">
                  <Icon name="plus" size={17} /> להוסיף הערה
                </button>
              ) : (
                <textarea
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  placeholder="למשל: למקם את הטקסט מתחת לידית"
                  rows={3}
                  aria-label="הערות לצוות"
                  className="field"
                  style={{ resize: 'vertical' }}
                  autoFocus
                />
              )}
            </SectionCard>
          </div>

          {/* ══════════ PREVIEW + TICKET (sticky) ══════════ */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div className="hidden lg:block">
              <LivePreview {...previewProps} interactive={false} />
            </div>

            <div className="ticket">
              <div className="p-6">
                <h2 className="m-0 font-display text-[32px]">כרטיס עבודה</h2>
                <dl className="m-0 mt-3">
                  {summaryRows.map(([k, v]) => (
                    <div key={k} className="ticket-row">
                      <dt>{k}</dt>
                      <dd className="truncate max-w-[60%]">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="ticket-cut" aria-hidden="true" />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-ink-2">כמות</span>
                  <div className="flex items-center gap-1 rounded-[10px] p-1 bg-paper">
                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 grid place-items-center rounded-[8px] bg-sheet border-0 cursor-pointer text-ink" aria-label="להפחית כמות">
                      <Icon name="minus" size={16} />
                    </button>
                    <span className="w-9 text-center font-semibold tabular" aria-live="polite">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 grid place-items-center rounded-[8px] bg-sheet border-0 cursor-pointer text-ink" aria-label="להוסיף כמות">
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-6">
                  <div>
                    <p className="m-0 font-semibold">סה״כ</p>
                    <p className="m-0 text-[13px] text-ink-3">לפני משלוח</p>
                  </div>
                  <p className="m-0 font-display text-[58px] leading-none tabular">₪{grandTotal.toFixed(0)}</p>
                </div>

                <button type="button" onClick={handleOrder} className="btn btn-pink w-full mt-6 text-[17px]" style={{ minHeight: 56 }}>
                  להמשך ההזמנה
                  <Icon name="arrowBack" size={18} />
                </button>
                <button type="button" onClick={saveForLater} className="btn btn-line w-full mt-2.5">
                  לשמור ולהמשיך אחר כך
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 inset-x-0 lg:hidden z-50 bg-sheet border-t border-[var(--rule)] px-4 py-3" style={{ boxShadow: '0 -10px 24px -18px rgba(18,19,23,.6)' }}>
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[14.5px] font-semibold truncate">{product.name_he}</p>
            <p className="m-0 text-[13px] text-ink-3 truncate">
              {typeLabels[engravingType]}{showTextSection ? ` · ${FONT_DEFS[selectedFont]?.label}` : ''}
            </p>
          </div>
          <span className="flex flex-col items-end leading-none shrink-0">
            <span className="font-display text-[32px] tabular">₪{grandTotal.toFixed(0)}</span>
            <span className="text-[11px] text-ink-3 mt-1">לפני משלוח</span>
          </span>
          <button type="button" onClick={handleOrder} className="btn btn-pink btn-sm shrink-0" style={{ minHeight: 46 }}>
            להמשך
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-[12px] text-white text-[15px] font-medium pointer-events-none bg-ink"
          style={{ bottom: 96, whiteSpace: 'nowrap', boxShadow: '0 14px 30px -14px rgba(0,0,0,.7)' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
