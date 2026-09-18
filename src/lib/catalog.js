import axios from 'axios'

export const API = import.meta.env.VITE_API_URL
export const STATIC_BASE = import.meta.env.VITE_STATIC_BASE

export const CATEGORY_LABELS = {
  drinkware: 'כלי שתייה',
  accessories: 'אביזרים',
  signage: 'שילוט',
  home_decor: 'לבית',
  gifts: 'מתנות',
  mixed: 'מגוון',
}

// What each product is made of, in Hebrew. Falls back to the raw value.
const MATERIAL_LABELS = {
  stainless_steel: 'נירוסטה',
  leather: 'עור',
  acrylic: 'אקריליק',
  wood: 'עץ',
  dark_steel: 'פלדה כהה',
  mixed: 'עץ, עור ומתכת',
  metal: 'מתכת',
  steel: 'פלדה',
}

export function materialLabel(m) {
  if (!m) return ''
  return MATERIAL_LABELS[m] || m
}

// Which drawn material a product shows while it has no photo.
export function swatchFor(product) {
  const m = `${product?.materials || ''}`.toLowerCase()
  if (m.includes('leather') || m.includes('עור')) return 'leather'
  if (m.includes('acrylic') || m.includes('אקריליק')) return 'acrylic'
  if (m.includes('wood') || m.includes('עץ')) return 'wood'
  if (m.includes('dark') || m.includes('black')) return 'steel-dark'
  if (m.includes('steel') || m.includes('metal') || m.includes('מתכת') || m.includes('ברזל')) return 'steel'
  const byCat = { drinkware: 'steel-dark', accessories: 'leather', signage: 'acrylic', home_decor: 'wood', gifts: 'wood' }
  return byCat[product?.category] || 'wood'
}

export function imgSrc(product) {
  if (!product?.image_url) return null
  return product.image_url.startsWith('/') ? STATIC_BASE + product.image_url : product.image_url
}

export async function fetchWithRetry(url, retries = 4, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { timeout: 12000 })
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

export const formatPrice = (n) => `₪${Number(n || 0).toLocaleString('he-IL', { maximumFractionDigits: 2 })}`
