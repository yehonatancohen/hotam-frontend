import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const API = import.meta.env.VITE_API_URL
const STATIC_BASE = import.meta.env.VITE_STATIC_BASE

// ── Per-category option config ──────────────────────────────────────────────
const CATEGORY_CONFIG = {
  drinkware: {
    materials: [
      { id: 'matte_black',   label: 'מט שחור',     bg: '#1a1a1a', textColor: '#9acbff',  blendMode: 'screen' },
      { id: 'silver',        label: 'כסוף',         bg: '#b0b8c1', textColor: '#1a1c1c',  blendMode: 'multiply' },
      { id: 'white',         label: 'לבן',          bg: '#f5f5f5', textColor: '#1a1c1c',  blendMode: 'multiply' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [
      { id: 'small',  label: '300ml', extra: 0 },
      { id: 'medium', label: '500ml', extra: 20 },
      { id: 'large',  label: '750ml', extra: 40 },
    ],
    maxChars: 20,
    textPosition: 'center',
    hint: 'שם, תאריך, או ברכה קצרה',
  },
  accessories: {
    materials: [
      { id: 'leather_brown', label: 'עור חום',   bg: '#8B6343', textColor: '#ffddb7', blendMode: 'screen' },
      { id: 'leather_black', label: 'עור שחור',  bg: '#1c1c1c', textColor: '#c0c7d2', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [
      { id: 'standard', label: 'סטנדרט', extra: 0 },
    ],
    maxChars: 15,
    textPosition: 'center',
    hint: 'ראשי תיבות, שם, ברכה',
  },
  signage: {
    materials: [
      { id: 'acrylic',    label: 'אקריליק',    bg: '#daeeff', textColor: '#005e97', blendMode: 'multiply' },
      { id: 'dark_steel', label: 'פלדה כהה',   bg: '#2f3131', textColor: '#9acbff', blendMode: 'screen' },
      { id: 'oak_wood',   label: 'עץ אלון',    bg: '#78582f', textColor: '#ffddb7', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic'],
    sizes: [
      { id: 'small',  label: 'קטן (20×10)',  extra: 0 },
      { id: 'medium', label: 'בינוני (40×20)', extra: 80 },
      { id: 'large',  label: 'גדול (60×30)',  extra: 180 },
    ],
    maxChars: 40,
    textPosition: 'center',
    hint: 'שם חברה, כותרת, ציטוט',
  },
  home_decor: {
    materials: [
      { id: 'oak_wood',   label: 'עץ אלון',    bg: '#78582f', textColor: '#ffddb7', blendMode: 'screen' },
      { id: 'dark_steel', label: 'מתכת כהה',   bg: '#2f3131', textColor: '#9acbff', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [
      { id: 'small',  label: 'קטן',   extra: 0 },
      { id: 'medium', label: 'בינוני', extra: 50 },
      { id: 'large',  label: 'גדול',  extra: 100 },
    ],
    maxChars: 25,
    textPosition: 'center',
    hint: 'שם משפחה, תאריך, ציטוט',
  },
  gifts: {
    materials: [
      { id: 'natural_wood', label: 'עץ טבעי', bg: '#c4975a', textColor: '#2a1700', blendMode: 'multiply' },
    ],
    fonts: ['modern', 'handwriting'],
    sizes: [
      { id: 'standard', label: 'קופסה רגילה', extra: 0 },
      { id: 'premium',  label: 'קופסה פרימיום', extra: 60 },
    ],
    maxChars: 50,
    textPosition: 'center',
    hint: 'הקדשה אישית עד 50 תווים',
  },
  mixed: {
    materials: [
      { id: 'dark_steel',   label: 'פלדה כהה',   bg: '#2f3131', textColor: '#9acbff', blendMode: 'screen' },
      { id: 'oak_wood',     label: 'עץ אלון',     bg: '#78582f', textColor: '#ffddb7', blendMode: 'screen' },
      { id: 'leather',      label: 'עור',         bg: '#8B6343', textColor: '#ffddb7', blendMode: 'screen' },
    ],
    fonts: ['modern', 'classic', 'handwriting'],
    sizes: [
      { id: 'small',  label: 'קטן',   extra: 0 },
      { id: 'medium', label: 'בינוני', extra: 30 },
      { id: 'large',  label: 'גדול',  extra: 60 },
    ],
    maxChars: 30,
    textPosition: 'center',
    hint: 'טקסט לחריטה',
  },
}

const FONT_DEFS = {
  modern:      { label: 'מודרני',   style: { fontFamily: 'Heebo, sans-serif', fontWeight: 900 } },
  classic:     { label: 'קלאסי',    style: { fontFamily: 'Assistant, sans-serif', fontWeight: 300, letterSpacing: '0.15em' } },
  handwriting: { label: 'כתב יד',   style: { fontFamily: 'cursive', fontStyle: 'italic', fontWeight: 700 } },
}

function resolveUrl(url) {
  if (!url) return null
  return url.startsWith('/') ? STATIC_BASE + url : url
}

function imgSrc(product) {
  return resolveUrl(product?.image_url)
}

// Returns { url, zone } where zone = { x, y, width, height } in percent, or null
function getPreviewImage(product) {
  const preview = product?.images?.find(img => img.is_preview)
  if (preview) {
    return {
      url: resolveUrl(preview.url),
      zone: { x: preview.design_x, y: preview.design_y, width: preview.design_width, height: preview.design_height }
    }
  }
  return { url: imgSrc(product), zone: null }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Customizer() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [engravingText, setEngravingText] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [selectedFont, setSelectedFont] = useState('modern')
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)

  // Load the single product
  useEffect(() => {
    if (!productId) { navigate('/products'); return }
    axios.get(`${API}/products/${productId}`)
      .then(r => {
        const p = r.data.data
        setProduct(p)
        const cfg = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.mixed
        setSelectedMaterial(cfg.materials[0].id)
        setSelectedSize(cfg.sizes[0].id)
        setEngravingText(cfg.hint)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [productId])

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

  const cfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.mixed
  const material = cfg.materials.find(m => m.id === selectedMaterial) || cfg.materials[0]
  const font = FONT_DEFS[selectedFont]
  const size = cfg.sizes.find(s => s.id === selectedSize) || cfg.sizes[0]
  const basePrice = product.price
  const unitPrice = basePrice + (size?.extra || 0)
  const subtotal = unitPrice * quantity
  const grandTotal = subtotal

  const handleOrder = () => {
    if (!engravingText.trim()) return
    addToCart({
      product,
      engravingText,
      material: selectedMaterial,
      fontStyle: selectedFont,
      size: selectedSize,
      quantity,
      price: subtotal,
    })
    navigate('/checkout')
  }

  const { url: productImg, zone: designZone } = getPreviewImage(product)
  const previewText = engravingText || cfg.hint

  return (
    <div>
      {/* Breadcrumb */}
      <div className="px-6 md:px-8 pt-8 pb-0 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
          <Link to="/products" className="hover:text-primary transition-colors">מוצרים</Link>
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <Link to={`/products/${product.id}`} className="hover:text-primary transition-colors">{product.name_he}</Link>
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <span className="text-on-surface">התאמה אישית</span>
        </nav>
      </div>

      {/* Page header */}
      <div className="px-6 md:px-8 pb-10 max-w-7xl mx-auto">
        <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface tracking-tighter">
          עצב: {product.name_he}
        </h1>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ── Visualizer ── */}
          <div className="lg:col-span-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10 bg-surface-container-low"
                 style={{ aspectRatio: '4/3' }}>

              {/* Product image OR color background */}
              {productImg ? (
                <>
                  <img
                    src={productImg}
                    alt={product.name_he}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'brightness(0.85) contrast(1.05)' }}
                  />
                  {/* Colour tint matching selected material */}
                  <div
                    className="absolute inset-0"
                    style={{ background: material.bg + '33', mixBlendMode: 'color' }}
                  />
                  {/* Engraving text overlay — respects admin-set design zone */}
                  <div
                    className="absolute pointer-events-none flex items-center justify-center"
                    style={designZone ? {
                      left: `${designZone.x}%`,
                      top: `${designZone.y}%`,
                      width: `${designZone.width}%`,
                      height: `${designZone.height}%`,
                    } : { inset: 0, padding: '2rem' }}
                  >
                    <div
                      className="text-center"
                      style={{ mixBlendMode: material.blendMode, filter: 'contrast(1.2)' }}
                    >
                      <span
                        className="block leading-tight text-4xl md:text-6xl break-words max-w-full"
                        style={{ ...font.style, color: material.textColor }}
                      >
                        {previewText}
                      </span>
                    </div>
                  </div>
                  {/* Subtle laser-scan overlay */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(154,203,255,0.04) 50%, transparent 60%)' }}
                  />
                </>
              ) : (
                // Fallback: no product image, show material BG with text
                <>
                  <div className="absolute inset-0" style={{ background: material.bg }} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <span
                      className="block leading-tight text-4xl md:text-7xl text-center break-words max-w-sm md:max-w-xl"
                      style={{ ...font.style, color: material.textColor }}
                    >
                      {previewText}
                    </span>
                  </div>
                </>
              )}

              {/* Laser indicator chip */}
              <div className="absolute top-5 right-5 flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed-dim opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-fixed-dim" />
                </span>
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">LIVE PREVIEW</span>
              </div>

              {/* Material swatches */}
              <div className="absolute bottom-5 left-5 flex gap-2">
                {cfg.materials.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m.id)}
                    title={m.label}
                    className={`w-9 h-9 rounded-lg shadow-lg border-2 transition-all ${
                      selectedMaterial === m.id ? 'border-white scale-110 ring-2 ring-white/30' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                    style={{ background: m.bg }}
                  />
                ))}
              </div>
            </div>

            {/* Font selector below visualizer */}
            {cfg.fonts.length > 1 && (
              <div className="mt-4 flex gap-3 items-center">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-label">גופן:</span>
                <div className="flex gap-2 flex-wrap">
                  {cfg.fonts.map(fid => (
                    <button
                      key={fid}
                      onClick={() => setSelectedFont(fid)}
                      className={`px-4 py-2 rounded-full text-sm font-label transition-all ${
                        selectedFont === fid
                          ? 'bg-primary text-white'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                      style={selectedFont === fid ? {} : FONT_DEFS[fid].style}
                    >
                      {FONT_DEFS[fid].label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Controls panel ── */}
          <div className="lg:col-span-4 space-y-6 bg-surface-container-low p-7 rounded-xl border border-outline-variant/10">

            {/* Mini live preview */}
            <div className="relative rounded-xl overflow-hidden border border-outline-variant/15 shadow-inner" style={{ aspectRatio: '4/3' }}>
              {productImg ? (
                <>
                  <img src={productImg} alt={product.name_he} className="absolute inset-0 w-full h-full object-cover" style={{ filter: 'brightness(0.85) contrast(1.05)' }} />
                  <div className="absolute inset-0" style={{ background: material.bg + '33', mixBlendMode: 'color' }} />
                  <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                    <span
                      className="block text-center leading-tight text-xl break-words max-w-full"
                      style={{ ...font.style, color: material.textColor, mixBlendMode: material.blendMode, filter: 'contrast(1.2)' }}
                    >
                      {previewText}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0" style={{ background: material.bg }} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span
                      className="block text-center leading-tight text-xl break-words max-w-full"
                      style={{ ...font.style, color: material.textColor }}
                    >
                      {previewText}
                    </span>
                  </div>
                </>
              )}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed-dim opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-fixed-dim" />
                </span>
                <span className="text-[9px] font-bold tracking-widest text-white uppercase">תצוגה חיה</span>
              </div>
            </div>

            {/* Product locked indicator */}
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/15">
              <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
              <div>
                <div className="font-headline font-bold text-sm text-on-surface">{product.name_he}</div>
                <div className="text-xs text-on-surface-variant">₪{product.price}</div>
              </div>
              <Link to={`/products/${product.id}`} className="mr-auto text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-base">edit</span>
              </Link>
            </div>

            {/* Text input */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">טקסט לחריטה</label>
                <span className={`text-xs ${engravingText.length > cfg.maxChars * 0.85 ? 'text-error' : 'text-on-surface-variant'}`}>
                  {engravingText.length}/{cfg.maxChars}
                </span>
              </div>
              <input
                type="text"
                value={engravingText}
                onChange={e => setEngravingText(e.target.value.slice(0, cfg.maxChars))}
                className="w-full bg-surface-container-lowest border-b-2 border-outline-variant focus:border-primary focus:outline-none text-2xl font-headline font-bold py-3 px-0 transition-colors text-on-surface placeholder:text-on-surface-variant/30"
                placeholder={cfg.hint}
              />
            </div>

            {/* Material */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">חומר</label>
              <div className="space-y-2">
                {cfg.materials.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold text-right transition-all ${
                      selectedMaterial === m.id
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-highest/50 text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="w-5 h-5 rounded shrink-0 border border-white/20" style={{ background: m.bg }} />
                    {m.label}
                    {selectedMaterial === m.id && (
                      <span className="material-symbols-outlined text-base mr-auto" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size (only if more than one) */}
            {cfg.sizes.length > 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">גודל</label>
                <div className="flex gap-2 flex-wrap">
                  {cfg.sizes.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSize(s.id)}
                      className={`flex-1 min-w-[70px] py-2.5 rounded-lg text-sm font-bold transition-all ${
                        selectedSize === s.id
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-highest/50 text-on-surface hover:bg-surface-container-highest'
                      }`}
                    >
                      {s.label}
                      {s.extra > 0 && <span className="block text-xs opacity-70">+₪{s.extra}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">כמות</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-surface-container-highest/50 font-bold text-on-surface hover:bg-surface-container-highest transition-colors text-xl">−</button>
                <span className="font-headline font-bold text-xl text-on-surface w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 rounded-lg bg-surface-container-highest/50 font-bold text-on-surface hover:bg-surface-container-highest transition-colors text-xl">+</button>
              </div>
            </div>

            {/* Price + CTA */}
            <div className="pt-5 border-t border-outline-variant/30">
              <div className="flex justify-between items-end mb-5">
                <span className="text-on-surface-variant text-sm">סה&quot;כ</span>
                <div className="text-right">
                  <span className="block text-3xl font-headline font-black text-primary">₪{grandTotal.toFixed(0)}</span>
                  <span className="text-xs text-on-surface-variant">מחיר סופי</span>
                </div>
              </div>
              <button
                onClick={handleOrder}
                disabled={!engravingText.trim()}
                className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                המשך לתשלום
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
