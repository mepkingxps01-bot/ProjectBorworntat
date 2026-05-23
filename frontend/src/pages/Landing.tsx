import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlowButton } from '../components/ui/GlowButton';
import { CharacterSprite } from '../components/character/CharacterSprite';
import { useCharacterStore } from '../store/characterStore';

const FEATURES = [
  { icon: '⚔️', title: 'Battle to Learn', desc: 'Defeat enemies by answering questions. Wrong answers deal damage to YOU.' },
  { icon: '🗺️', title: 'Study Quests', desc: 'Each topic becomes a quest. Complete them to level up your character.' },
  { icon: '🧠', title: 'Make It Stick', desc: 'Spaced repetition + interleaving ensures you actually remember the material.' },
  { icon: '👑', title: 'Boss Fights', desc: 'Study 5 hours to summon a Boss. Defeat it for epic loot and massive EXP.' },
];

const FLOAT_CHARS = ['Ophthalmologist', 'Internist', 'Surgeon', 'Pediatrician', 'Neurologist'] as const;

export default function Landing() {
  const navigate = useNavigate();
  const { character } = useCharacterStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string }[] = [];
    const colors = ['#7c3aed', '#f5a623', '#00d4ff', '#a855f7'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#05080f' }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f5a623 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Header nav */}
      <nav className="relative flex items-center justify-between px-8 py-5" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #f5a623)', boxShadow: '0 0 15px rgba(124,58,237,0.5)' }}>
            ⚕️
          </div>
          <span className="text-sm font-bold tracking-widest text-[#f5a623]"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            BORWORNTAT
          </span>
        </div>
        {character && (
          <GlowButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            Continue as {character.name}
          </GlowButton>
        )}
      </nav>

      {/* Hero section */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 pt-12 pb-20" style={{ zIndex: 10 }}>
        {/* Floating character previews */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOAT_CHARS.map((cls, i) => (
            <motion.div
              key={cls}
              className="absolute opacity-10"
              style={{
                left: `${10 + i * 20}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
            >
              <CharacterSprite charClass={cls} size={80} />
            </motion.div>
          ))}
        </div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <div className="text-xs tracking-[0.4em] text-[#f5a623] mb-3 font-semibold"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            ◆ THE REALM OF MEDICAL MASTERY ◆
          </div>
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(36px, 6vw, 76px)',
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, #ffffff 0%, #f5a623 40%, #ffffff 70%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(245,166,35,0.3))',
            }}
          >
            PROJECT<br />BORWORNTAT
          </h1>
          <div className="text-base text-[#94a3b8] tracking-widest mt-2"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            From Zero to Hero — One Quest at a Time
          </div>
        </motion.div>

        {/* Class showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="my-8 flex gap-4 justify-center flex-wrap"
        >
          {(['Ophthalmologist', 'Surgeon', 'Neurologist'] as const).map((cls, i) => (
            <motion.div
              key={cls}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}
            >
              <CharacterSprite charClass={cls} size={100} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <GlowButton
            variant="gold"
            size="xl"
            onClick={() => navigate(character ? '/dashboard' : '/create')}
          >
            {character ? `Continue — ${character.name}` : '⚔ Enter the Realm'}
          </GlowButton>
          {!character && (
            <p className="text-sm text-[#64748b]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Create your hero. Upload your textbook. Begin the journey.
            </p>
          )}
        </motion.div>
      </div>

      {/* Feature cards */}
      <div className="relative px-6 pb-20 max-w-5xl mx-auto" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-10"
        >
          <div className="text-xs tracking-[0.3em] text-[#64748b] mb-2"
            style={{ fontFamily: "'Orbitron', monospace" }}>
            ◆ HOW IT WORKS ◆
          </div>
          <h2 className="text-2xl font-bold text-[#e2e8f0]" style={{ fontFamily: "'Cinzel', serif" }}>
            Learning Reinvented
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="game-panel corner-accent p-6 flex gap-4 items-start hover:border-[#7c3aed] transition-colors cursor-default"
            >
              <div className="text-3xl flex-shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-bold text-[#f5a623] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-[#64748b]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Journey steps */}
      <div className="relative px-6 pb-24 max-w-4xl mx-auto" style={{ zIndex: 10 }}>
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.3em] text-[#64748b] mb-2"
            style={{ fontFamily: "'Orbitron', monospace" }}>◆ YOUR JOURNEY ◆</div>
          <h2 className="text-2xl font-bold text-[#e2e8f0]" style={{ fontFamily: "'Cinzel', serif" }}>
            The Path of the Resident
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { n: '01', t: 'Create Your Hero', d: 'Choose your class. Build your identity.' },
            { n: '02', t: 'Upload Your Textbook', d: 'AI extracts every topic, fact, and question.' },
            { n: '03', t: 'Set Your Exam Date', d: 'AI builds a personalized study schedule.' },
            { n: '04', t: 'Battle Through Lessons', d: 'Defeat enemies to master each topic.' },
            { n: '05', t: 'Conquer the Final Boss', d: 'Day before exam — prove you are ready.' },
          ].map((step) => (
            <div key={step.n} className="game-panel p-4 flex items-center gap-4">
              <span className="text-2xl font-black text-[#1e2d4a]"
                style={{ fontFamily: "'Orbitron', monospace", minWidth: 44 }}>
                {step.n}
              </span>
              <div className="w-px h-8 bg-[#1e2d4a]" />
              <div>
                <div className="font-bold text-[#e2e8f0] text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                  {step.t}
                </div>
                <div className="text-xs text-[#64748b]">{step.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <GlowButton variant="purple" size="lg" onClick={() => navigate(character ? '/dashboard' : '/create')}>
            {character ? 'Back to Dashboard' : 'Begin Your Journey'}
          </GlowButton>
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-center py-6 text-[#1e2d4a] text-xs tracking-widest"
        style={{ zIndex: 10, fontFamily: "'Orbitron', monospace", borderTop: '1px solid #0f1628' }}>
        PROJECT BORWORNTAT — FOR THE RESIDENTS WHO NEVER STOP FIGHTING
      </div>
    </div>
  );
}
