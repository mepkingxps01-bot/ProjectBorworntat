import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  showNumbers?: boolean;
  height?: number;
  icon?: string;
}

export function StatBar({
  label,
  current,
  max,
  color,
  showNumbers = true,
  height = 10,
  icon,
}: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: color, fontFamily: "'Orbitron', monospace" }}>
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </span>
        {showNumbers && (
          <span className="text-xs" style={{ color: color, fontFamily: "'Orbitron', monospace" }}>
            {current} / {max}
          </span>
        )}
      </div>
      <div
        className="w-full rounded-full overflow-hidden bg-[#0a0f1e]"
        style={{ height: `${height}px`, border: `1px solid ${color}33` }}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)' }} />
        </motion.div>
      </div>
    </div>
  );
}

interface ExpBarProps {
  exp: number;
  expToNext: number;
  level: number;
}

export function ExpBar({ exp, expToNext, level }: ExpBarProps) {
  const pct = (exp / expToNext) * 100;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold tracking-widest text-[#ffd700]" style={{ fontFamily: "'Orbitron', monospace" }}>
          LVL {level}
        </span>
        <span className="text-xs text-[#ffd700]" style={{ fontFamily: "'Orbitron', monospace" }}>
          {exp} / {expToNext} XP
        </span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden bg-[#0a0f1e]"
        style={{ border: '1px solid #ffd70033' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #ffd700 0%, #f5a623 50%, #ffd700 100%)',
            backgroundSize: '200% auto',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
