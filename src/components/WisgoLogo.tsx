import React, { useState } from 'react';

interface WisgoLogoProps {
  className?: string;
  size?: number;
  alt?: string;
  strokeColor?: string;
  fillColor?: string;
}

export const WISGO_LOGO_URL = 'https://wsrv.nl/?url=https://drive.google.com/uc?id=1zVNzI7UBXACdZgi2QdJZ5JNXcvhHZsI1&export=download';
export const WISGO_LOGO_BACKUP_URL = 'https://drive.google.com/thumbnail?id=1zVNzI7UBXACdZgi2QdJZ5JNXcvhHZsI1&sz=w800';

export const WisgoLogo: React.FC<WisgoLogoProps> = ({
  className = 'w-6 h-6',
  size,
  alt = 'WisGO Logo',
  strokeColor = '#0B7A5C',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(WISGO_LOGO_URL);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleError = () => {
    if (imgSrc === WISGO_LOGO_URL) {
      setImgSrc(WISGO_LOGO_BACKUP_URL);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <svg
        viewBox="0 0 200 200"
        className={className}
        style={size ? { width: size, height: size } : undefined}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="100" cy="105" rx="85" ry="65" stroke={strokeColor} strokeWidth="6" fill="none" transform="rotate(-15 100 105)" />
        <path d="M 68,98 C 65,70 80,48 100,48 C 120,48 135,70 132,98 C 130,112 118,122 100,122 C 82,122 70,112 68,98 Z" stroke={strokeColor} strokeWidth="6" fill="none" transform="rotate(-15 100 105)" />
        <ellipse cx="100" cy="52" rx="8" ry="4" fill={strokeColor} transform="rotate(-15 100 105)" />
      </svg>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      referrerPolicy="no-referrer"
      className={`object-contain select-none shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      loading="eager"
    />
  );
};

