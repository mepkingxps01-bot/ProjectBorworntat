import React from 'react';
import type { CharacterClass } from '../../types';

interface CharacterSpriteProps {
  charClass: CharacterClass;
  size?: number;
  animated?: boolean;
  equippedWeapon?: string;
}

const CLASS_COLORS: Record<CharacterClass, { primary: string; secondary: string; weapon: string }> = {
  Ophthalmologist: { primary: '#7c3aed', secondary: '#f5a623', weapon: '#00d4ff' },
  Internist: { primary: '#dc2626', secondary: '#60a5fa', weapon: '#e5e7eb' },
  Surgeon: { primary: '#0891b2', secondary: '#34d399', weapon: '#e5e7eb' },
  Pediatrician: { primary: '#059669', secondary: '#fbbf24', weapon: '#f97316' },
  Neurologist: { primary: '#d97706', secondary: '#c084fc', weapon: '#f0abfc' },
};

export function CharacterSprite({ charClass, size = 180, animated = false }: CharacterSpriteProps) {
  const colors = CLASS_COLORS[charClass] || CLASS_COLORS.Ophthalmologist;

  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 200 280"
      style={{ filter: `drop-shadow(0 0 12px ${colors.primary}88)` }}
      className={animated ? 'animate-float' : ''}
    >
      {/* Shadow */}
      <ellipse cx="100" cy="272" rx="40" ry="8" fill="rgba(0,0,0,0.4)" />

      {/* Legs */}
      <rect x="80" y="190" width="18" height="60" rx="6" fill={colors.primary} opacity="0.9" />
      <rect x="102" y="190" width="18" height="60" rx="6" fill={colors.primary} opacity="0.9" />
      {/* Boots */}
      <rect x="76" y="240" width="26" height="14" rx="5" fill="#1a1a2e" />
      <rect x="98" y="240" width="26" height="14" rx="5" fill="#1a1a2e" />

      {/* Body / Coat */}
      <rect x="68" y="110" width="64" height="88" rx="10" fill={colors.primary} />
      {/* Coat lapels */}
      <polygon points="100,118 82,130 82,150 100,140" fill={colors.secondary} opacity="0.8" />
      <polygon points="100,118 118,130 118,150 100,140" fill={colors.secondary} opacity="0.8" />
      {/* Belt */}
      <rect x="68" y="185" width="64" height="10" rx="3" fill="#0f172a" />
      <rect x="94" y="183" width="12" height="14" rx="2" fill={colors.secondary} />

      {/* Left arm */}
      <rect x="46" y="114" width="22" height="60" rx="8" fill={colors.primary} opacity="0.9" />
      <rect x="44" y="166" width="26" height="16" rx="7" fill="#1e293b" />

      {/* Right arm + weapon hand */}
      <rect x="132" y="114" width="22" height="55" rx="8" fill={colors.primary} opacity="0.9" />
      <rect x="130" y="162" width="26" height="16" rx="7" fill="#1e293b" />

      {/* Weapon */}
      <WeaponSVG charClass={charClass} colors={colors} />

      {/* Neck */}
      <rect x="90" y="96" width="20" height="20" rx="5" fill="#d4a886" />

      {/* Head */}
      <ellipse cx="100" cy="80" rx="30" ry="32" fill="#d4a886" />
      {/* Hair */}
      <HairSVG charClass={charClass} colors={colors} />
      {/* Eyes */}
      <ellipse cx="90" cy="78" rx="5" ry="6" fill="white" />
      <ellipse cx="110" cy="78" rx="5" ry="6" fill="white" />
      <ellipse cx="91" cy="79" rx="3" ry="4" fill="#1a1a2e" />
      <ellipse cx="111" cy="79" rx="3" ry="4" fill="#1a1a2e" />
      {/* Eye shine */}
      <ellipse cx="92" cy="77" rx="1" ry="1.5" fill="white" opacity="0.8" />
      <ellipse cx="112" cy="77" rx="1" ry="1.5" fill="white" opacity="0.8" />
      {/* Mouth */}
      <path d="M 93 90 Q 100 95 107 90" stroke="#8b5e3c" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Class emblem on chest */}
      <ClassEmblem charClass={charClass} colors={colors} />

      {/* Shoulder pads */}
      <ellipse cx="68" cy="118" rx="14" ry="10" fill={colors.secondary} opacity="0.8" />
      <ellipse cx="132" cy="118" rx="14" ry="10" fill={colors.secondary} opacity="0.8" />

      {/* Glow aura */}
      <ellipse cx="100" cy="160" rx="55" ry="90" fill="none"
        stroke={colors.primary} strokeWidth="1" opacity="0.3"
        style={{ filter: `blur(4px)` }} />
    </svg>
  );
}

function HairSVG({ charClass, colors }: { charClass: CharacterClass; colors: any }) {
  switch (charClass) {
    case 'Ophthalmologist':
      return (
        <>
          <ellipse cx="100" cy="52" rx="31" ry="16" fill={colors.secondary} />
          <polygon points="80,52 72,30 88,50" fill={colors.secondary} />
          <polygon points="88,50 82,26 96,48" fill={colors.secondary} />
          <polygon points="112,50 118,30 100,48" fill={colors.secondary} />
          <polygon points="120,52 128,30 112,50" fill={colors.secondary} />
        </>
      );
    case 'Surgeon':
      return <ellipse cx="100" cy="50" rx="30" ry="12" fill="#1e293b" />;
    case 'Neurologist':
      return (
        <>
          <ellipse cx="100" cy="52" rx="31" ry="16" fill={colors.secondary} opacity="0.9" />
          <circle cx="80" cy="46" r="6" fill={colors.secondary} opacity="0.7" />
          <circle cx="120" cy="46" r="6" fill={colors.secondary} opacity="0.7" />
        </>
      );
    default:
      return <ellipse cx="100" cy="52" rx="30" ry="14" fill={colors.secondary} opacity="0.85" />;
  }
}

function WeaponSVG({ charClass, colors }: { charClass: CharacterClass; colors: any }) {
  switch (charClass) {
    case 'Ophthalmologist':
      return (
        <g transform="translate(148, 130) rotate(20)">
          <rect x="-4" y="-50" width="8" height="70" rx="3" fill={colors.weapon} />
          <circle cx="0" cy="-52" r="12" fill="none" stroke={colors.weapon} strokeWidth="3" />
          <circle cx="0" cy="-52" r="5" fill={colors.weapon} opacity="0.6" />
          <rect x="-12" y="-30" width="24" height="5" rx="2" fill={colors.secondary} />
        </g>
      );
    case 'Internist':
      return (
        <g transform="translate(148, 128)">
          <path d="M -3,-60 Q 10,-20 -3,20" stroke={colors.weapon} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="10" cy="-20" r="10" fill="none" stroke={colors.weapon} strokeWidth="3" />
          <circle cx="-3" cy="20" r="5" fill={colors.weapon} />
        </g>
      );
    case 'Surgeon':
      return (
        <>
          <g transform="translate(148, 130) rotate(30)">
            <rect x="-2" y="-55" width="5" height="55" rx="2" fill={colors.weapon} />
            <polygon points="-5,-55 2,-70 9,-55" fill={colors.weapon} />
          </g>
          <g transform="translate(155, 140) rotate(-15)">
            <rect x="-2" y="-40" width="5" height="40" rx="2" fill={colors.weapon} opacity="0.7" />
            <polygon points="-5,-40 2,-55 9,-40" fill={colors.weapon} opacity="0.7" />
          </g>
        </>
      );
    case 'Neurologist':
      return (
        <g transform="translate(148, 125)">
          <line x1="0" y1="0" x2="-10" y2="-60" stroke={colors.weapon} strokeWidth="3" strokeLinecap="round" />
          {[-60, -45, -30].map((y, i) => (
            <g key={i}>
              <circle cx={-10 + i * 2} cy={y} r="4" fill={colors.weapon} opacity="0.8" />
              <line x1={-14 + i * 2} y1={y} x2={-6 + i * 2} y2={y} stroke={colors.weapon} strokeWidth="1.5" opacity="0.5" />
            </g>
          ))}
        </g>
      );
    default:
      return (
        <g transform="translate(148, 128) rotate(15)">
          <rect x="-4" y="-60" width="8" height="75" rx="3" fill={colors.weapon} />
          <rect x="-14" y="-20" width="28" height="7" rx="3" fill={colors.secondary} />
        </g>
      );
  }
}

function ClassEmblem({ charClass, colors }: { charClass: CharacterClass; colors: any }) {
  const emblems: Record<CharacterClass, React.ReactElement> = {
    Ophthalmologist: (
      <g transform="translate(100, 155)">
        <ellipse cx="0" cy="0" rx="10" ry="7" fill="none" stroke={colors.secondary} strokeWidth="2" />
        <circle cx="0" cy="0" r="4" fill={colors.secondary} opacity="0.8" />
      </g>
    ),
    Internist: (
      <g transform="translate(100, 155)">
        <path d="M0,-8 C-10,-8 -10,2 0,8 C10,2 10,-8 0,-8 Z" fill={colors.secondary} opacity="0.7" />
      </g>
    ),
    Surgeon: (
      <g transform="translate(100, 155)">
        <line x1="-8" y1="0" x2="8" y2="0" stroke={colors.secondary} strokeWidth="2.5" />
        <line x1="0" y1="-8" x2="0" y2="8" stroke={colors.secondary} strokeWidth="2.5" />
      </g>
    ),
    Pediatrician: (
      <g transform="translate(100, 155)">
        <circle cx="0" cy="0" r="7" fill="none" stroke={colors.secondary} strokeWidth="2" />
        <circle cx="0" cy="0" r="3" fill={colors.secondary} opacity="0.8" />
      </g>
    ),
    Neurologist: (
      <g transform="translate(100, 155)">
        <path d="M-8,-4 C-4,-10 4,-10 8,-4 C10,2 4,8 0,4 C-4,8 -10,2 -8,-4 Z"
          fill="none" stroke={colors.secondary} strokeWidth="1.5" />
      </g>
    ),
  };
  return emblems[charClass] || null;
}
