'use client';

import React from 'react';

interface DelightBulbLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export default function DelightBulbLogo({ size = 40, className, ...props }: DelightBulbLogoProps) {
  // Use a unique ID for mask to avoid conflicts if multiple SVGs are rendered
  const maskId = React.useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <mask id={maskId}>
          {/* White area retains pixels, black area cuts out */}
          <rect x="0" y="0" width="100" height="120" fill="#FFFFFF" />
          {/* Delight Tech Lightning Bolt shaped cutout */}
          <path
            d="M52 24 L35 56 H47 L41 84 L61 48 H49 L52 24 Z"
            fill="#000000"
          />
        </mask>
      </defs>

      {/* Outer bulb body with cutout lightning bolt */}
      <path
        d="M 50 12 
           A 30 30 0 1 1 29 65 
           C 31.5 70 35.5 75 35.5 82
           H 64.5
           C 64.5 75 68.5 70 71 65
           A 30 30 0 0 1 50 12 Z"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />

      {/* Bulbed screw threading bottom */}
      <rect x="37.5" y="86" width="25" height="5" rx="2.5" fill="currentColor" />
      <rect x="40" y="95" width="20" height="5" rx="2.5" fill="currentColor" />
      <rect x="42.5" y="104" width="15" height="5" rx="2.5" fill="currentColor" />
      <rect x="46" y="113" width="8" height="4" rx="2" fill="currentColor" />
    </svg>
  );
}
