/*
  Drawn product stickers, printed in three riso inks. Each kind is a die-cut
  sticker (white border) of a real Hotam product, with the visitor's words
  printed on it in two misregistered inks. When `text` changes, the parent
  re-keys this component and the pink layer slides into register (.print-pass).

  These are placeholders until the studio has 3D renders or photos of its
  products; ProductVisual swaps them out as soon as an image exists.
*/

const PINK = '#ff48b0'
const BLUE = '#0078bf'
const YELLOW = '#ffe800'
const INK = '#1d1d1f'

// Shared halftone patterns, rendered once per page by <StickerDefs />.
export function StickerDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hz-pink" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <circle cx="3" cy="3" r="1.25" fill={PINK} />
        </pattern>
        <pattern id="hz-blue" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="3.5" cy="3.5" r="2.2" fill={BLUE} />
        </pattern>
        <pattern id="hz-blue-s" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="3" cy="3" r="1.1" fill={BLUE} />
        </pattern>
        <pattern id="hz-line" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
          <rect width="8" height="2.2" fill={BLUE} />
        </pattern>
      </defs>
    </svg>
  )
}

// Two-ink text: blue (or white) on top, pink printed a few px off register.
function RisoText({ x, y, text, max, width, top = BLUE, under = PINK, lines }) {
  const rows = lines || [text]
  const longest = Math.max(3, ...rows.map(r => r.length))
  const size = Math.min(max, width / (0.46 * longest))
  const lh = size * 0.95
  const startY = y - ((rows.length - 1) * lh) / 2 + size * 0.32
  const common = { textAnchor: 'middle', direction: 'rtl', fontFamily: 'Karantina, Rubik, sans-serif', fontWeight: 700, fontSize: size }
  return (
    <g>
      <g className="ink-pink" style={{ mixBlendMode: 'multiply' }}>
        {rows.map((r, i) => (
          <text key={i} x={x + size * 0.07} y={startY + i * lh + size * 0.05} fill={under} {...common}>{r}</text>
        ))}
      </g>
      <g className="ink-blue" style={top === BLUE ? { mixBlendMode: 'multiply' } : undefined}>
        {rows.map((r, i) => (
          <text key={i} x={x} y={startY + i * lh} fill={top} {...common}>{r}</text>
        ))}
      </g>
    </g>
  )
}

// Split long text over two lines at the middle space.
function split(text, limit = 10) {
  const t = text.trim()
  if (t.length <= limit || !t.includes(' ')) return [t]
  const mid = Math.floor(t.length / 2)
  let cut = t.lastIndexOf(' ', mid)
  if (cut < 0) cut = t.indexOf(' ')
  return [t.slice(0, cut), t.slice(cut + 1)]
}

function Sign({ text }) {
  return (
    <svg viewBox="0 0 360 290">
      <path d="M60 70 L180 12 L300 70" fill="none" stroke="#fff" strokeWidth="16" strokeLinejoin="round" />
      <rect x="14" y="64" width="332" height="212" rx="34" fill="#fff" />
      <path d="M64 74 L180 22 L296 74" fill="none" stroke={INK} strokeWidth="3" />
      <circle cx="180" cy="22" r="6" fill={BLUE} />
      <rect x="30" y="80" width="300" height="180" rx="22" fill={YELLOW} />
      <rect x="30" y="80" width="300" height="180" rx="22" fill="url(#hz-pink)" style={{ mixBlendMode: 'multiply' }} />
      <g fill="none" stroke={PINK} strokeWidth="2.4" strokeLinecap="round" opacity=".85" style={{ mixBlendMode: 'multiply' }}>
        <path d="M44 110 C110 96 170 124 240 104 S320 112 318 112" />
        <path d="M44 236 C120 250 190 222 260 240 S318 232 318 232" />
        <ellipse cx="282" cy="130" rx="18" ry="7" /><ellipse cx="282" cy="130" rx="8" ry="3" />
      </g>
      <circle cx="62" cy="112" r="8" fill={BLUE} /><path d="M57 112h10" stroke="#fff" strokeWidth="2" />
      <circle cx="298" cy="228" r="8" fill={BLUE} /><path d="M293 228h10" stroke="#fff" strokeWidth="2" />
      <RisoText x={180} y={172} text={text} lines={split(text)} max={84} width={250} />
    </svg>
  )
}

function Wallet({ text }) {
  return (
    <svg viewBox="0 0 270 250">
      <rect x="8" y="8" width="254" height="234" rx="30" fill="#fff" />
      <rect x="24" y="30" width="222" height="190" rx="18" fill={BLUE} />
      <rect x="24" y="30" width="222" height="190" rx="18" fill="url(#hz-pink)" style={{ mixBlendMode: 'multiply' }} />
      <path d="M24 30 H246 V96 Q135 122 24 96 Z" fill={BLUE} />
      <path d="M24 30 H246 V96 Q135 122 24 96 Z" fill="url(#hz-line)" opacity=".35" />
      <path d="M36 42 H234 V88 Q135 112 36 88 Z" fill="none" stroke={YELLOW} strokeWidth="2.6" strokeDasharray="7 6" />
      <rect x="36" y="42" width="198" height="166" rx="12" fill="none" stroke={YELLOW} strokeWidth="2.6" strokeDasharray="7 6" />
      <circle cx="135" cy="104" r="11" fill={YELLOW} /><circle cx="135" cy="104" r="4" fill={BLUE} />
      <RisoText x={135} y={160} text={text} lines={split(text)} max={70} width={170} top="#fff" />
    </svg>
  )
}

function Cup({ text }) {
  return (
    <svg viewBox="0 0 230 330">
      <path d="M30 14 H200 Q214 14 212 30 L190 300 Q188 318 170 318 H60 Q42 318 40 300 L18 30 Q16 14 30 14Z" fill="#fff" />
      <rect x="36" y="28" width="158" height="40" rx="12" fill={INK} />
      <rect x="52" y="20" width="126" height="16" rx="6" fill={INK} />
      <path d="M42 76 H188 L170 300 H60 Z" fill={PINK} />
      <path d="M140 76 H188 L170 300 H128 Z" fill="url(#hz-blue)" style={{ mixBlendMode: 'multiply' }} />
      <path d="M52 92 L64 290" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".6" />
      <RisoText x={112} y={180} text={text} lines={split(text, 5)} max={56} width={118} top="#fff" under={BLUE} />
    </svg>
  )
}

function Keychain({ text }) {
  return (
    <svg viewBox="0 0 170 200">
      <circle cx="85" cy="40" r="34" fill="#fff" />
      <rect x="18" y="62" width="134" height="128" rx="28" fill="#fff" />
      <circle cx="85" cy="40" r="22" fill="none" stroke={INK} strokeWidth="5" />
      <rect x="30" y="74" width="110" height="104" rx="18" fill={YELLOW} />
      <rect x="30" y="74" width="110" height="104" rx="18" fill="url(#hz-blue-s)" style={{ mixBlendMode: 'multiply' }} />
      <circle cx="85" cy="92" r="8" fill="#f3f3ef" stroke={INK} strokeWidth="3" />
      <RisoText x={85} y={136} text={text} lines={split(text, 5)} max={46} width={96} />
    </svg>
  )
}

function Clock({ text }) {
  return (
    <svg viewBox="0 0 280 280">
      <circle cx="140" cy="140" r="132" fill="#fff" />
      <circle cx="140" cy="140" r="116" fill={YELLOW} />
      <circle cx="140" cy="140" r="116" fill="url(#hz-pink)" style={{ mixBlendMode: 'multiply' }} />
      <g stroke={BLUE} strokeWidth="6" strokeLinecap="round">
        <path d="M140 36v16M140 228v16M36 140h16M228 140h16" />
      </g>
      <path d="M140 140 L140 78 M140 140 L186 162" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <circle cx="140" cy="140" r="9" fill={PINK} />
      <RisoText x={140} y={196} text={text} lines={[text.trim()]} max={46} width={150} />
    </svg>
  )
}

function GiftBox({ text }) {
  return (
    <svg viewBox="0 0 290 280">
      <path d="M18 92 H272 V266 H18 Z" fill="#fff" rx="20" />
      <rect x="10" y="84" width="270" height="190" rx="24" fill="#fff" />
      <rect x="30" y="116" width="230" height="142" rx="12" fill={BLUE} />
      <rect x="30" y="116" width="230" height="142" rx="12" fill="url(#hz-pink)" style={{ mixBlendMode: 'multiply' }} />
      <rect x="22" y="92" width="246" height="36" rx="10" fill={BLUE} />
      <rect x="132" y="92" width="26" height="166" fill={YELLOW} />
      <path d="M145 92 C110 40 70 60 100 88 M145 92 C180 40 220 60 190 88" fill="none" stroke={YELLOW} strokeWidth="14" strokeLinecap="round" />
      <RisoText x={145} y={196} text={text} lines={split(text, 6)} max={52} width={100} top="#fff" />
    </svg>
  )
}

function AcrylicSign({ text }) {
  return (
    <svg viewBox="0 0 360 240">
      <rect x="10" y="10" width="340" height="220" rx="26" fill="#fff" />
      <rect x="28" y="28" width="304" height="184" rx="12" fill="#bfe3f6" />
      <path d="M28 28 L120 28 L28 150 Z" fill="#fff" opacity=".55" />
      <rect x="28" y="28" width="304" height="184" rx="12" fill="url(#hz-blue-s)" opacity=".35" />
      {[[48, 48], [312, 48], [48, 192], [312, 192]].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}><circle cx={cx} cy={cy} r="10" fill={INK} /><circle cx={cx} cy={cy} r="4" fill="#fff" /></g>
      ))}
      <RisoText x={180} y={120} text={text} lines={split(text)} max={80} width={230} />
    </svg>
  )
}

const KINDS = { sign: Sign, wallet: Wallet, cup: Cup, keychain: Keychain, clock: Clock, box: GiftBox, acrylic: AcrylicSign }

export default function StickerArt({ kind = 'sign', text = 'חותם', className = '', style }) {
  const Art = KINDS[kind] || Sign
  return (
    <div className={`sticker print-pass ${className}`} style={style} aria-hidden="true">
      <Art text={text} />
    </div>
  )
}
