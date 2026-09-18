// One drawn icon set for the whole site: 24px grid, 1.8 stroke, round joins.
const PATHS = {
  arrowBack: 'M19 12H5M11 6l-6 6 6 6',          // points left: "forward" in RTL reading
  arrowFwd: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'M15 6l-6 6 6 6',
  bag: 'M5 8h14l-1.2 12H6.2L5 8zM9 8V6.5a3 3 0 016 0V8',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3',
  alert: 'M12 8v5M12 16.5v.5M10.3 3.9L2.6 17.5A2 2 0 004.3 20.5h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  truck: 'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a1.8 1.8 0 100-3.6A1.8 1.8 0 007 19zM17.5 19a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6z',
  rotate: 'M20 11a8 8 0 10-2.3 5.7M20 5v6h-6',
  mail: 'M3.5 6h17v12h-17zM4 6.5l8 6.5 8-6.5',
  instagram: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 16a4 4 0 100-8 4 4 0 000 8zM17.3 6.7v.1',
  refresh: 'M4 12a8 8 0 0113.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 01-13.7 5.7L4 15.5M4 20v-4.5h4.5',
  pen: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
}

const WHATSAPP = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'

export default function Icon({ name, size = 20, className = '', style, strokeWidth = 1.8, title }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true }
  if (name === 'whatsapp') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} {...a11y}>
        <path d={WHATSAPP} />
      </svg>
    )
  }
  if (name === 'spinner') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} style={style} {...a11y}>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth={strokeWidth} />
        <path d="M20.5 12A8.5 8.5 0 0012 3.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} {...a11y}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

export const WA_URL = 'https://wa.me/972529488077'
export const waLink = (text) => text ? `${WA_URL}?text=${encodeURIComponent(text)}` : WA_URL
