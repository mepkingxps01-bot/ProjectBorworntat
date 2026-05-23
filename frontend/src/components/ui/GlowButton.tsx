import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'gold' | 'cyan' | 'purple' | 'red' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
}

const VARIANTS = {
  gold: {
    bg: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #92400e 100%)',
    border: '#f5a623',
    glow: 'rgba(245, 166, 35, 0.5)',
    text: '#fef3c7',
    hoverBg: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #b45309 100%)',
  },
  cyan: {
    bg: 'linear-gradient(135deg, #164e63 0%, #0e7490 50%, #164e63 100%)',
    border: '#00d4ff',
    glow: 'rgba(0, 212, 255, 0.5)',
    text: '#e0f7ff',
    hoverBg: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0e7490 100%)',
  },
  purple: {
    bg: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 50%, #3b0764 100%)',
    border: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
    text: '#f3e8ff',
    hoverBg: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #5b21b6 100%)',
  },
  red: {
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #7f1d1d 100%)',
    border: '#f87171',
    glow: 'rgba(248, 113, 113, 0.5)',
    text: '#fee2e2',
    hoverBg: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #991b1b 100%)',
  },
  ghost: {
    bg: 'transparent',
    border: '#1e2d4a',
    glow: 'rgba(30, 45, 74, 0.3)',
    text: '#94a3b8',
    hoverBg: 'rgba(30, 45, 74, 0.3)',
  },
};

const SIZES = {
  sm: { padding: '8px 16px', fontSize: '13px', letterSpacing: '0.1em' },
  md: { padding: '12px 24px', fontSize: '15px', letterSpacing: '0.12em' },
  lg: { padding: '16px 36px', fontSize: '17px', letterSpacing: '0.15em' },
  xl: { padding: '20px 48px', fontSize: '20px', letterSpacing: '0.2em' },
};

export function GlowButton({
  children,
  onClick,
  variant = 'gold',
  size = 'md',
  disabled = false,
  fullWidth = false,
  type = 'button',
}: GlowButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        color: v.text,
        padding: s.padding,
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
        fontFamily: "'Cinzel', serif",
        fontWeight: 700,
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        transition: 'box-shadow 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        textTransform: 'uppercase',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.boxShadow =
            `0 0 20px ${v.glow}, 0 0 40px ${v.glow}`;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}
