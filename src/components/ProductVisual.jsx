import { useTheme } from '../context/ThemeContext'
import { imgSrc } from '../lib/catalog'
import StickerArt from './StickerArt'

/*
  A real photo (or, later, a 3D render) when the studio has uploaded one.
  Until then, a drawn sticker of the product with the visitor's own words
  printed on it. Never a stock photo of someone else's product.
*/

// Which sticker drawing stands in for a product.
export function stickerKind(product) {
  const m = `${product?.materials || ''} ${product?.name_he || ''}`.toLowerCase()
  if (m.includes('שעון') || m.includes('clock')) return 'clock'
  if (m.includes('מחזיק') || m.includes('keychain')) return 'keychain'
  if (m.includes('ארנק') || m.includes('leather') || m.includes('עור')) return 'wallet'
  if (m.includes('acrylic') || m.includes('אקריליק')) return 'acrylic'
  const byCat = { drinkware: 'cup', accessories: 'keychain', signage: 'acrylic', home_decor: 'sign', gifts: 'box' }
  return byCat[product?.category] || 'sign'
}

// Width of each drawing inside a 5:4 frame, so tall ones (cup, clock) never overflow it.
const FIT = { sign: '96%', acrylic: '100%', wallet: '84%', box: '80%', clock: '76%', keychain: '56%', cup: '48%' }

// What each sticker says before the visitor has typed anything.
const SAMPLE = { sign: 'משפחת כהן', wallet: 'ד.כ', cup: 'ל-אבא', keychain: 'חותם', clock: 'בית לוי', box: 'תודה!', acrylic: 'המשרד שלכם' }

export default function ProductVisual({ product, className = '', size = 'md', zoom = false, tilt = 0 }) {
  const { visitorName } = useTheme()
  const src = imgSrc(product)

  if (src) {
    return (
      <div className={`relative overflow-hidden bg-paper-2 ${className}`}>
        <img
          src={src}
          alt={product.name_he}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 ${zoom ? 'group-hover:scale-[1.04]' : ''}`}
        />
      </div>
    )
  }

  const kind = stickerKind(product)
  const word = (visitorName || SAMPLE[kind]).trim().slice(0, 18)
  const pad = size === 'lg' ? '12%' : size === 'sm' ? '14%' : '12%'

  return (
    <div
      className={`relative grid place-items-center overflow-visible ${className}`}
      role="img"
      aria-label={`${product?.name_he || 'מוצר'}: איור של המוצר עם "${word}" עליו`}
      style={{ padding: pad }}
    >
      <StickerArt
        key={word}
        kind={kind}
        text={word}
        className={zoom ? 'sticker-hover' : ''}
        style={{ transform: `rotate(${tilt}deg)`, width: FIT[kind] }}
      />
    </div>
  )
}
