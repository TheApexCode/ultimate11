import React from 'react';

interface ClubEmblemProps {
  club: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ClubEmblem: React.FC<ClubEmblemProps> = ({
  club,
  className = '',
  size = 'sm',
}) => {
  const sizeMap = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const dim = sizeMap[size];

  // Specific Club SVG Badges
  switch (club) {
    case 'Real Madrid':
    case 'Real Madrid Legends':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Crown */}
          <path d="M12 10L14 14L20 9L26 14L28 10L25 16H15L12 10Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <circle cx="20" cy="7" r="1.5" fill="#EF4444" />
          {/* Round Shield */}
          <circle cx="20" cy="24" r="13" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="20" cy="24" r="10.5" stroke="#3B82F6" strokeWidth="1.2" fill="#F8FAFC" />
          {/* Purple Sash */}
          <path d="M11 20L27 30L29 27L13 17Z" fill="#7C3AED" opacity="0.85" />
          {/* Monogram letters M C F */}
          <text x="20" y="27" textAnchor="middle" fontSize="9" fontWeight="900" fill="#F59E0B" fontFamily="sans-serif">M</text>
        </svg>
      );

    case 'FC Barcelona':
    case 'Barcelona Legends':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Shield Outline */}
          <path
            d="M8 8C14 6 26 6 32 8C33 18 31 29 20 36C9 29 7 18 8 8Z"
            fill="#EDBB00"
            stroke="#1E1B4B"
            strokeWidth="1.5"
          />
          {/* Top Left: St George Cross */}
          <path d="M9 10H19V20H9Z" fill="#FFFFFF" />
          <path d="M13 10V20M9 15H19" stroke="#DC2626" strokeWidth="2" />
          {/* Top Right: Senyera Red/Gold stripes */}
          <path d="M21 10H31V20H21Z" fill="#F59E0B" />
          <path d="M23 10V20M26 10V20M29 10V20" stroke="#DC2626" strokeWidth="1.2" />
          {/* Bottom: Blaugrana vertical stripes */}
          <path d="M9 22C11 29 16 33 20 35C24 33 29 29 31 22Z" fill="#1E3A8A" />
          <path d="M14 22V32M18 22V34M22 22V34M26 22V32" stroke="#991B1B" strokeWidth="2" />
          {/* Center Golden Ball */}
          <circle cx="20" cy="26" r="3" fill="#F59E0B" stroke="#78350F" strokeWidth="0.8" />
        </svg>
      );

    case 'Manchester City':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Outer Roundel Sky Blue */}
          <circle cx="20" cy="20" r="18" fill="#6CABDD" stroke="#1C2C5B" strokeWidth="2" />
          <circle cx="20" cy="20" r="14" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="11" fill="#6CABDD" />
          {/* Golden Sailing Ship */}
          <path d="M15 17L20 12L25 17H15Z" fill="#F59E0B" />
          <path d="M14 18L16 22H24L26 18H14Z" fill="#F59E0B" />
          {/* Red Rose */}
          <circle cx="20" cy="25" r="2.5" fill="#EF4444" />
        </svg>
      );

    case 'Liverpool':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Shankly Green Gates Top */}
          <path d="M12 9H28V12H12Z" fill="#059669" />
          {/* Red Shield */}
          <path d="M11 12H29C29 24 25 32 20 36C15 32 11 24 11 12Z" fill="#C8102E" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Liver Bird Golden Silhouette */}
          <path
            d="M20 16C19 16 18 17 18 18C18 20 20 21 19 23C18 24 17 25 17 27C18 28 20 28 20 28C21 28 22 27 22 25C23 23 23 20 22 18C22 17 21 16 20 16Z"
            fill="#F59E0B"
          />
          <path d="M18 20L15 22L17 24Z" fill="#F59E0B" />
          <path d="M22 20L25 22L23 24Z" fill="#F59E0B" />
        </svg>
      );

    case 'Arsenal':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Red Shield */}
          <path d="M10 8H30C30 22 26 31 20 36C14 31 10 22 10 8Z" fill="#DB0007" stroke="#023474" strokeWidth="2" />
          {/* Gold Cannon */}
          <rect x="13" y="19" width="14" height="4" rx="1.5" fill="#F59E0B" />
          <circle cx="16" cy="24" r="3.5" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />
          <circle cx="24" cy="24" r="2.5" fill="#F59E0B" />
          <path d="M18 19L27 15" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'Bayern Munich':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Bavarian Roundel */}
          <circle cx="20" cy="20" r="18" fill="#DC052D" stroke="#0066B2" strokeWidth="2" />
          <circle cx="20" cy="20" r="14" fill="#FFFFFF" />
          {/* Blue Rhombuses */}
          <circle cx="20" cy="20" r="10" fill="#0066B2" />
          <path d="M15 15L20 10L25 15L20 20Z" fill="#FFFFFF" />
          <path d="M20 20L25 15L30 20L25 25Z" fill="#FFFFFF" />
          <path d="M15 25L20 20L25 25L20 30Z" fill="#FFFFFF" />
          <path d="M10 20L15 15L20 20L15 25Z" fill="#FFFFFF" />
        </svg>
      );

    case 'Paris Saint-Germain':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="18" fill="#004170" stroke="#DA291C" strokeWidth="2" />
          <circle cx="20" cy="20" r="13" fill="#FFFFFF" />
          <circle cx="20" cy="20" r="10" fill="#004170" />
          {/* Eiffel Tower in Red */}
          <path d="M20 13L16 26H19L20 23L21 26H24L20 13Z" fill="#DA291C" />
          <circle cx="20" cy="24" r="1" fill="#FFFFFF" />
          {/* Fleur de Lis gold */}
          <circle cx="20" cy="27" r="1.5" fill="#F59E0B" />
        </svg>
      );

    case 'Inter Milan':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="18" fill="#001EA0" stroke="#000000" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="14" fill="#000000" />
          <circle cx="20" cy="20" r="12" stroke="#001EA0" strokeWidth="1.5" fill="#000000" />
          <text x="20" y="26" textAnchor="middle" fontSize="13" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">IM</text>
        </svg>
      );

    case 'AC Milan':
    case 'AC Milan Legends':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Oval Shield */}
          <ellipse cx="20" cy="20" rx="14" ry="17" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          {/* Left: Red & Black Stripes */}
          <path d="M10 12C7 18 7 24 10 29H19V12H10Z" fill="#000000" />
          <path d="M12 14V27M15 12V29M18 12V29" stroke="#DC2626" strokeWidth="2" />
          {/* Right: Red Cross on White */}
          <path d="M21 12H30C33 18 33 24 30 29H21V12Z" fill="#FFFFFF" />
          <path d="M21 20H31M26 12V29" stroke="#DC2626" strokeWidth="2.5" />
          {/* Gold Star Top */}
          <path d="M20 5L21 8H24L21.5 10L22.5 13L20 11L17.5 13L18.5 10L16 8H19L20 5Z" fill="#F59E0B" />
        </svg>
      );

    case 'Chelsea':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="18" fill="#034694" stroke="#EE242C" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="14" fill="#FFFFFF" />
          {/* Lion Rampant */}
          <path d="M18 14C17 14 16 16 17 18C16 19 16 21 18 22C17 24 18 27 20 28C22 28 23 26 23 24C24 23 23 20 22 18C23 16 22 14 20 14C19 14 18 14 18 14Z" fill="#034694" />
          <path d="M23 16L26 13M23 20L25 22" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      );

    case 'Tottenham':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="18" fill="#132257" />
          {/* Cockerel on Ball */}
          <path d="M19 11C18 11 17 13 18 14C17 16 18 18 19 20C18 22 18 25 19 26H21C22 25 22 22 21 20C22 18 23 16 22 14C23 13 22 11 21 11Z" fill="#FFFFFF" />
          <circle cx="20" cy="29" r="3.5" fill="#FFFFFF" stroke="#132257" strokeWidth="1" />
        </svg>
      );

    case 'Inter Miami':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="18" fill="#231F20" stroke="#F7B5CD" strokeWidth="2" />
          {/* Twin Herons in Pink */}
          <path d="M15 15C17 13 20 14 20 18C20 23 17 25 15 27" stroke="#F7B5CD" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 15C23 13 20 14 20 18C20 23 23 25 25 27" stroke="#F7B5CD" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="13" r="2" fill="#F59E0B" />
        </svg>
      );

    case 'Al-Nassr':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          {/* Saudi Crown */}
          <path d="M14 10L16 13L20 9L24 13L26 10L24 15H16L14 10Z" fill="#F59E0B" />
          {/* Shield Yellow/Blue */}
          <path d="M11 14H29C29 25 25 32 20 35C15 32 11 25 11 14Z" fill="#FEBE10" stroke="#004B87" strokeWidth="2" />
          <path d="M15 17H25C25 24 22 28 20 30C18 28 15 24 15 17Z" fill="#004B87" />
          <text x="20" y="25" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FEBE10">V</text>
        </svg>
      );

    case 'Bayer Leverkusen':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="18" fill="#E32219" stroke="#000000" strokeWidth="2" />
          <circle cx="20" cy="20" r="13" fill="#000000" />
          {/* Lion Red Rampant */}
          <path d="M17 15C16 17 18 20 17 23C16 26 19 28 21 28C23 27 24 24 23 21C22 18 24 16 22 15Z" fill="#E32219" />
          <text x="20" y="34" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#FFFFFF">B04</text>
        </svg>
      );

    case 'Borussia Dortmund':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="18" fill="#FDE100" stroke="#000000" strokeWidth="2" />
          <circle cx="20" cy="20" r="14" stroke="#000000" strokeWidth="1" fill="#FDE100" />
          <text x="20" y="24" textAnchor="middle" fontSize="8" fontWeight="900" fill="#000000" fontFamily="sans-serif">BVB</text>
          <text x="20" y="29" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#000000" fontFamily="sans-serif">09</text>
        </svg>
      );

    case 'Juventus Legends':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <ellipse cx="20" cy="20" rx="14" ry="18" fill="#000000" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M15 12V24C15 27 18 29 20 29" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M23 12V24C23 27 25 28 27 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="8" r="1.5" fill="#F59E0B" />
        </svg>
      );

    case 'Newcastle':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <path d="M10 12H30C30 24 25 32 20 35C15 32 10 24 10 12Z" fill="#000000" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M13 14H16V28H13ZM19 14H22V31H19ZM25 14H28V28H25Z" fill="#FFFFFF" />
          {/* Castle top */}
          <path d="M16 8H24V11H16Z" fill="#F59E0B" />
        </svg>
      );

    case 'Aston Villa':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <path d="M10 8H30C30 22 26 31 20 36C14 31 10 22 10 8Z" fill="#670E36" stroke="#94BEE5" strokeWidth="2" />
          <path d="M17 15C16 18 18 21 17 24C16 27 19 29 21 29C23 28 24 25 23 22C22 19 24 17 22 15Z" fill="#FEE12B" />
        </svg>
      );

    case 'Galatasaray':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <path d="M10 8H30C30 22 26 31 20 36C14 31 10 22 10 8Z" fill="#A90432" stroke="#FDB912" strokeWidth="2" />
          <text x="18" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#FDB912">G</text>
          <text x="24" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#FDB912">S</text>
        </svg>
      );

    case 'Dynamo Moscow Legends':
    case 'Germany Legends':
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <circle cx="20" cy="20" r="17" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" />
          <path d="M16 12L20 8L24 12L20 16Z" fill="#F59E0B" />
          <text x="20" y="27" textAnchor="middle" fontSize="10" fontWeight="900" fill="#06B6D4">★</text>
        </svg>
      );

    default:
      return (
        <svg
          viewBox="0 0 40 40"
          className={`${dim} shrink-0 drop-shadow ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={club}
        >
          <path d="M10 10H30C30 22 26 31 20 36C14 31 10 22 10 10Z" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
          <circle cx="20" cy="21" r="5" fill="#06B6D4" opacity="0.3" stroke="#06B6D4" strokeWidth="1" />
          <text x="20" y="24" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#FFFFFF">FC</text>
        </svg>
      );
  }
};
