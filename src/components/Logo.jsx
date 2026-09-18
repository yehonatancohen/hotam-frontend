/*
  The Hotam wordmark: "חותם" set in the site's own two-ink misprint
  device (see .misprint in index.css). Text only, for now — no mark/icon.
*/
export default function Logo({ size = 32, tone = 'ink', className = '' }) {
  const light = tone === 'white'
  return (
    <p
      className={`font-display m-0 misprint ${light ? 'misprint-light' : ''} ${className}`}
      data-text="חותם"
      style={{ fontSize: size, lineHeight: 0.85 }}
    >
      חותם
    </p>
  )
}
