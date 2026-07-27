import React from 'react';

interface WisgoLogoProps {
  className?: string;
  size?: number;
  strokeColor?: string;
  fillColor?: string;
}

export const WisgoLogo: React.FC<WisgoLogoProps> = ({
  className = 'w-6 h-6',
  size,
  strokeColor = '#0B7A5C',
  fillColor = 'none'
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Brim - Tilted Ellipse */}
      <ellipse
        cx="100"
        cy="105"
        rx="85"
        ry="65"
        stroke={strokeColor}
        strokeWidth="5"
        fill="none"
        transform="rotate(-15 100 105)"
      />

      {/* Central Crown Dome Outline */}
      <path
        d="M 68,98 C 65,70 80,48 100,48 C 120,48 135,70 132,98 C 130,112 118,122 100,122 C 82,122 70,112 68,98 Z"
        stroke={strokeColor}
        strokeWidth="5"
        fill="none"
        transform="rotate(-15 100 105)"
      />

      {/* Top Knob / Crown Stalk */}
      <ellipse
        cx="100"
        cy="52"
        rx="8"
        ry="4"
        fill={strokeColor}
        transform="rotate(-15 100 105)"
      />

      {/* Vertical Curved Ribs on the Crown Dome */}
      <path
        d="M 100,52 Q 90,82 100,122"
        stroke={strokeColor}
        strokeWidth="3.5"
        fill="none"
        transform="rotate(-15 100 105)"
      />
      <path
        d="M 100,52 Q 80,80 82,118"
        stroke={strokeColor}
        strokeWidth="3.5"
        fill="none"
        transform="rotate(-15 100 105)"
      />
      <path
        d="M 100,52 Q 72,76 70,105"
        stroke={strokeColor}
        strokeWidth="3.5"
        fill="none"
        transform="rotate(-15 100 105)"
      />
      <path
        d="M 100,52 Q 110,80 118,118"
        stroke={strokeColor}
        strokeWidth="3.5"
        fill="none"
        transform="rotate(-15 100 105)"
      />
      <path
        d="M 100,52 Q 125,76 130,105"
        stroke={strokeColor}
        strokeWidth="3.5"
        fill="none"
        transform="rotate(-15 100 105)"
      />

      {/* Radiating Palm Leaf Woven Ribs across the Outer Brim */}
      {/* Top radiating lines */}
      <line x1="100" y1="48" x2="100" y2="40" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="112" y1="52" x2="128" y2="43" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="123" y1="62" x2="152" y2="52" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="130" y1="78" x2="172" y2="76" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="131" y1="96" x2="183" y2="105" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      
      {/* Bottom radiating lines */}
      <line x1="124" y1="112" x2="165" y2="135" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="110" y1="120" x2="132" y2="163" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="98" y1="122" x2="98" y2="170" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="86" y1="120" x2="68" y2="164" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="74" y1="112" x2="35" y2="138" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      
      {/* Left radiating lines */}
      <line x1="68" y1="96" x2="17" y2="105" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="70" y1="78" x2="28" y2="76" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="77" y1="62" x2="48" y2="52" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
      <line x1="88" y1="52" x2="72" y2="43" stroke={strokeColor} strokeWidth="3.5" transform="rotate(-15 100 105)" />
    </svg>
  );
};
