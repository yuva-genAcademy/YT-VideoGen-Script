import React from 'react';

export const YTVideoGenLogo: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 18,
      right: 20,
      borderRadius: 6,
      padding: '8px 14px',
      background: '#000000',
      border: '1px solid #333333',
      display: 'flex',
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    }}
  >
    {/* Brain-lightbulb SVG icon */}
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      {/* Lightbulb outer shape */}
      <path
        d="M14 4 C8 4 4 8.5 4 13.5 C4 17 6 19.5 8.5 21 L8.5 23 L19.5 23 L19.5 21 C22 19.5 24 17 24 13.5 C24 8.5 20 4 14 4 Z"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Coil lines */}
      <line x1="9.5" y1="24.5" x2="18.5" y2="24.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10.5" y1="26" x2="17.5" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Brain lines inside */}
      <path
        d="M10 13 C10 11 12 10 14 11 C16 10 18 11 18 13 C18 15 16 16 14 15.5 C12 16 10 15 10 13Z"
        stroke="#FEFB41"
        strokeWidth="1"
        fill="none"
      />
      <path d="M14 11 L14 15.5" stroke="#FEFB41" strokeWidth="0.8" />
      <path d="M11.5 12 C11.5 12 12.5 13.5 14 13" stroke="#FEFB41" strokeWidth="0.8" fill="none" />
      <path d="M16.5 12 C16.5 12 15.5 13.5 14 13" stroke="#FEFB41" strokeWidth="0.8" fill="none" />
    </svg>

    {/* Yellow separator */}
    <div
      style={{
        width: 1,
        height: 28,
        background: '#FEFB41',
      }}
    />

    {/* Text block */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        YT VIDEOGEN
      </div>
      <div
        style={{
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 8,
          color: '#FEFB41',
          letterSpacing: '0.05em',
          lineHeight: 1,
        }}
      >
        AI Skills That Advance Careers.
      </div>
    </div>
  </div>
);
