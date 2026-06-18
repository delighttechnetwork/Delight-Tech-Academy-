import { NextResponse } from 'next/server';

export async function GET() {
  const svg = `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="mask-icon">
          <rect x="0" y="0" width="100" height="120" fill="white" />
          <path d="M52 24 L35 56 H47 L41 84 L61 48 H49 L52 24 Z" fill="black" />
        </mask>
      </defs>
      <path d="M 50 12 A 30 30 0 1 1 29 65 C 31.5 70 35.5 75 35.5 82 H 64.5 C 64.5 75 68.5 70 71 65 A 30 30 0 0 1 50 12 Z" fill="#22D3EE" mask="url(#mask-icon)" />
      <rect x="37.5" y="86" width="25" height="5" rx="2.5" fill="#22D3EE" />
      <rect x="40" y="95" width="20" height="5" rx="2.5" fill="#22D3EE" />
      <rect x="42.5" y="104" width="15" height="5" rx="2.5" fill="#22D3EE" />
      <rect x="46" y="113" width="8" height="4" rx="2" fill="#22D3EE" />
    </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
