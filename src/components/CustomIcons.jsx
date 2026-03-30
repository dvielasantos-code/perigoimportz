import React from 'react';

// Uma biblioteca local exclusiva gerada com design "Urban Monolith" (Mínimo, traços retos, sofisticado)
export const CustomIconsList = [
  { id: 'tshirt', label: 'Camiseta' },
  { id: 'tanktop', label: 'Regata' },
  { id: 'hoodie', label: 'Moletom' },
  { id: 'pants', label: 'Calça' },
  { id: 'shorts', label: 'Bermuda' },
  { id: 'sneaker', label: 'Tênis' },
  { id: 'cap', label: 'Boné' },
  { id: 'diamond', label: 'Acess.' },
  { id: 'glasses', label: 'Óculos' },
  { id: 'watch', label: 'Relógio' },
  { id: 'bag', label: 'Bolsa' },
  { id: 'misc', label: 'Diversos' }
];

export function CustomIcon({ name, className = "w-6 h-6", strokeWidth = "1.5" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className
  };

  switch (name) {
    case 'tshirt':
    case 'checkroom': // fallback material symbol
      return (
        <svg {...props}>
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
        </svg>
      );
    case 'tanktop':
    case 'dry_cleaning': // fallback material symbol
      return (
        <svg {...props}>
          <path d="M7 2h2l-1 5h8l-1-5h2c1.1 0 2 .9 2 2v15c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2z" />
          <path d="M9 2c0 2 1.34 3 3 3s3-1 3-3" />
        </svg>
      );
    case 'hoodie':
      return (
        <svg {...props}>
          <path d="M12 2C8.69 2 6 4.69 6 8v2H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V8c0-3.31-2.69-6-6-6z" />
          <path d="M12 12v10" />
          <path d="M8 12L12 8L16 12" />
        </svg>
      );
    case 'pants':
      return (
        <svg {...props}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3-9 3 9h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          <path d="M12 3v3" />
        </svg>
      );
    case 'shorts':
      return (
        <svg {...props}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h4l3-5 3 5h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          <path d="M12 3v3" />
        </svg>
      );
    case 'sneaker':
      return (
        <svg {...props}>
          <path d="M19 16l-3-11a2 2 0 00-1.92-1.48H5.9A2.02 2.02 0 004 5.5v12A2.5 2.5 0 006.5 20h11.23a2.5 2.5 0 002.39-3.26L19 16z" />
          <path d="M4 11h6" />
          <path d="M4 14h6" />
          <path d="M15 16l2-6" />
        </svg>
      );
    case 'cap':
      return (
        <svg {...props}>
          <path d="M17 14v-4a5 5 0 00-10 0v4" />
          <path d="M3 14h18a2 2 0 012 2v0a2 2 0 01-2 2H3a2 2 0 01-2-2v0a2 2 0 012-2z" />
          <path d="M12 5v2" />
        </svg>
      );
    case 'diamond':
      return (
        <svg {...props}>
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
          <path d="M2 9h20" />
          <path d="M12 3l-4 6 4 12" />
          <path d="M12 3l4 6-4 12" />
        </svg>
      );
    case 'glasses':
      return (
        <svg {...props}>
          <circle cx="6" cy="15" r="4" />
          <circle cx="18" cy="15" r="4" />
          <path d="M14 15a2 2 0 00-4 0" />
          <path d="M2.5 13L5 7c.7-1.5 2.5-2 4-2h6c1.5 0 3.3.5 4 2l2.5 6" />
        </svg>
      );
    case 'watch':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 9v3l1.5 1.5" />
          <path d="M16.51 17.35l-.35 3.83a2 2 0 01-2 1.82H9.83a2 2 0 01-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 019.83 1h4.35a2 2 0 012 1.82l.35 3.83" />
        </svg>
      );
    case 'bag':
      return (
        <svg {...props}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      );
    case 'misc':
    default:
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
  }
}
