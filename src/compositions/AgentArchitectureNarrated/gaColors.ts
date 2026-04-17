export const GA = {
  // Backgrounds
  bg: '#000000',           // Pure black — primary background
  surface: '#111111',      // Near-black for node fills
  navy: '#202E4A',         // Deep Navy for cards/panels
  navyLight: '#2a3e5a',    // Slightly lighter navy

  // Text
  text: '#FFFFFF',         // White
  muted: '#D0D0D0',        // Light Grey for secondary text

  // Accents — ONLY use these, no blues/purples/greens
  yellow: '#FEFB41',       // Academy Yellow — primary accent (CTAs, hero, emphasis)
  softYellow: '#FFF994',   // Soft Yellow — secondary accent
  white: '#FFFFFF',

  // Borders
  border: '#2a2a2a',       // Dark subtle border
  borderLight: '#444444',  // Slightly lighter border

  // Node-specific accent colors (staying brand-compliant)
  // Tool nodes need visual distinction — use yellow family + greys
  accent1: '#FEFB41',      // Academy Yellow
  accent2: '#FFF994',      // Soft Yellow
  accent3: '#D0D0D0',      // Light Grey
  accent4: '#FFFFFF',      // White

  // Node deep backgrounds (darkened versions of accent)
  accent1Deep: '#1a1900',  // Very dark yellow-black
  accent2Deep: '#1a1800',
  accent3Deep: '#1a1a1a',
  accent4Deep: '#111111',

  // Warning (bottleneck) — use yellow, it's on-brand
  warning: '#FEFB41',
  warningDeep: '#1a1700',
} as const;
