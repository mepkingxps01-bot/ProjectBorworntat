import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterSprite } from '../components/character/CharacterSprite';
import { StatBar } from '../components/ui/StatBar';
import { GlowButton } from '../components/ui/GlowButton';
import { useCharacterStore } from '../store/characterStore';
import { useSessionStore } from '../store/sessionStore';
import axios from 'axios';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BattleQuestion {
  question: string;
  type: 'mcq' | 'crq';
  options?: string[];
  correct_index?: number;
  difficulty: number;
  explanation?: string;
  model_answer?: string;
  damage: number;
}

interface Enemy {
  name: string;
  hp: number;
  max_hp: number;
  topic: string;
  is_boss: boolean;
}

type Phase = 'loading' | 'battle' | 'answering' | 'result' | 'victory' | 'defeat';

// ─── Fallback questions (when backend unavailable) ───────────────────────────

const FALLBACK_QUESTIONS: BattleQuestion[] = [
  {
    question: 'Which layer of the cornea has the greatest regenerative capacity?',
    type: 'mcq',
    options: ['A) Epithelium', 'B) Bowman layer', 'C) Stroma', 'D) Descemet membrane'],
    correct_index: 0,
    difficulty: 2,
    explanation: 'The corneal epithelium regenerates completely within 24–72 hours after injury.',
    damage: 20,
  },
  {
    question: 'What is the normal range of intraocular pressure (IOP)?',
    type: 'mcq',
    options: ['A) 5–10 mmHg', 'B) 10–21 mmHg', 'C) 21–30 mmHg', 'D) 30–40 mmHg'],
    correct_index: 1,
    difficulty: 1,
    explanation: 'Normal IOP is 10–21 mmHg. Values >21 mmHg are considered elevated.',
    damage: 15,
  },
  {
    question: 'The optic cup-to-disc ratio is increased in which condition?',
    type: 'mcq',
    options: ['A) Papilledema', 'B) Glaucoma', 'C) Optic neuritis', 'D) CRAO'],
    correct_index: 1,
    difficulty: 2,
    explanation: 'Glaucoma causes progressive loss of the neuroretinal rim, enlarging the cup-to-disc ratio.',
    damage: 20,
  },
  {
    question: 'Which structure is responsible for aqueous humor production?',
    type: 'mcq',
    options: ['A) Iris', 'B) Trabecular meshwork', 'C) Ciliary body', 'D) Lens'],
    correct_index: 2,
    difficulty: 2,
    explanation: 'The ciliary body (pars plana epithelium) produces aqueous humor continuously.',
    damage: 20,
  },
  {
    question: 'A "cherry red spot" at the macula is pathognomonic of which condition?',
    type: 'mcq',
    options: [
      'A) Branch retinal artery occlusion',
      'B) Central retinal artery occlusion',
      'C) Central retinal vein occlusion',
      'D) Age-related macular degeneration',
    ],
    correct_index: 1,
    difficulty: 3,
    explanation:
      'CRAO causes ischemic whitening of the retina. The fovea appears red because the choroidal circulation is visible there.',
    damage: 30,
  },
];

const FALLBACK_ENEMIES: Record<string, { name: string; icon: string }> = {
  Glaucoma: { name: 'IOP Wraith', icon: '👁️' },
  Retina: { name: 'Macular Marauder', icon: '🌀' },
  Cornea: { name: 'Keratitis Knight', icon: '🔮' },
  default: { name: 'Knowledge Demon', icon: '💀' },
};

// ─── Enemy SVG sprite ────────────────────────────────────────────────────────

function EnemySprite({ enemy, shaking }: { enemy: Enemy; shaking: boolean }) {
  const isBoss = enemy.is_boss;
  const color = isBoss ? '#ff4466' : '#a855f7';
  const size = isBoss ? 180 : 150;

  return (
    <motion.div
      animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 200 240"
        style={{ filter: `drop-shadow(0 0 16px ${color}88)` }}
      >
        {/* Shadow */}
        <ellipse cx="100" cy="232" rx="45" ry="8" fill="rgba(0,0,0,0.5)" />
        {/* Body */}
        <ellipse cx="100" cy="130" rx="55" ry="70" fill={color} opacity="0.9" />
        {/* Arms */}
        <ellipse cx="42" cy="120" rx="18" ry="38" fill={color} opacity="0.8" transform="rotate(-15 42 120)" />
        <ellipse cx="158" cy="120" rx="18" ry="38" fill={color} opacity="0.8" transform="rotate(15 158 120)" />
        {/* Claws left */}
        <line x1="28" y1="152" x2="18" y2="168" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="35" y1="156" x2="22" y2="174" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="42" y1="158" x2="34" y2="176" stroke={color} strokeWidth="4" strokeLinecap="round" />
        {/* Claws right */}
        <line x1="172" y1="152" x2="182" y2="168" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="165" y1="156" x2="178" y2="174" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <line x1="158" y1="158" x2="166" y2="176" stroke={color} strokeWidth="4" strokeLinecap="round" />
        {/* Head */}
        <ellipse cx="100" cy="65" rx="48" ry="50" fill={isBoss ? '#7f1d1d' : '#2d1b69'} />
        {/* Horns */}
        <polygon points="65,26 54,2 75,20" fill={color} />
        <polygon points="135,26 146,2 125,20" fill={color} />
        {isBoss && (
          <>
            <polygon points="95,20 88,2 102,18" fill="#f5a623" />
          </>
        )}
        {/* Eyes */}
        <ellipse cx="82" cy="60" rx="12" ry="14" fill="#ff0033" opacity="0.9" />
        <ellipse cx="118" cy="60" rx="12" ry="14" fill="#ff0033" opacity="0.9" />
        <ellipse cx="82" cy="60" rx="6" ry="8" fill="#1a0010" />
        <ellipse cx="118" cy="60" rx="6" ry="8" fill="#1a0010" />
        {/* Eye glow */}
        <ellipse cx="85" cy="57" rx="3" ry="3" fill="white" opacity="0.6" />
        <ellipse cx="121" cy="57" rx="3" ry="3" fill="white" opacity="0.6" />
        {/* Mouth */}
        <path d="M 72 84 Q 100 100 128 84" stroke={color} strokeWidth="3" fill="none" />
        {[78, 88, 100, 112, 122].map((x, i) => (
          <line key={i} x1={x} y1="84" x2={x - 2 + i} y2="94" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        ))}
        {/* Legs */}
        <rect x="72" y="190" width="22" height="42" rx="8" fill={color} opacity="0.9" />
        <rect x="106" y="190" width="22" height="42" rx="8" fill={color} opacity="0.9" />
        {/* Feet */}
        <ellipse cx="83" cy="232" rx="16" ry="8" fill={isBoss ? '#7f1d1d' : '#2d1b69'} />
        <ellipse cx="117" cy="232" rx="16" ry="8" fill={isBoss ? '#7f1d1d' : '#2d1b69'} />
        {/* Boss crown */}
        {isBoss && (
          <g transform="translate(100,30)">
            <polygon points="0,-14 -20,0 -14,-8 0,-4 14,-8 20,0" fill="#f5a623" />
            <circle cx="-12" cy="-2" r="3" fill="#ff4466" />
            <circle cx="0" cy="-8" r="4" fill="#00d4ff" />
            <circle cx="12" cy="-2" r="3" fill="#a855f7" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}

// ─── Floating damage number ───────────────────────────────────────────────────

function DamageFloat({ value, color, side }: { value: number; color: string; side: 'left' | 'right' }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: side === 'right' ? 20 : -20 }}
      animate={{ opacity: 0, y: -60, x: side === 'right' ? 40 : -40 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '30%',
        [side === 'right' ? 'right' : 'left']: '10%',
        color,
        fontFamily: "'Orbitron', monospace",
        fontWeight: 900,
        fontSize: '28px',
        textShadow: `0 0 10px ${color}`,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      -{value}
    </motion.div>
  );
}

// ─── Main Battle component ───────────────────────────────────────────────────

export default function Battle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { character, updateCharacter } = useCharacterStore();
  const { addMinutesStudied } = useSessionStore();

  const navState = (location.state as { topic?: string; subtopic?: string }) || {};
  const topic = navState.topic || 'General';
  const subtopic = navState.subtopic || '';

  // Battle state
  const [phase, setPhase] = useState<Phase>('loading');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(character?.hp ?? 100);
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);

  // Answer state
  const [selected, setSelected] = useState<number | null>(null);
  const [crqAnswer, setCrqAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastExplanation, setLastExplanation] = useState('');
  const [lastDamage, setLastDamage] = useState(0);

  // Visual effects
  const [enemyShaking, setEnemyShaking] = useState(false);
  const [playerShaking, setPlayerShaking] = useState(false);
  const [showEnemyDmg, setShowEnemyDmg] = useState(false);
  const [showPlayerDmg, setShowPlayerDmg] = useState(false);

  // Loot
  const [lootGained, setLootGained] = useState<{ name: string; rarity: string } | null>(null);
  const [expGained, setExpGained] = useState(0);

  const playerMaxHp = character?.maxHp ?? 100;
  const initialized = useRef(false);

  // ── Init battle ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    startBattle();
  }, []);

  async function startBattle() {
    if (!character) { navigate('/create'); return; }
    try {
      const res = await axios.post('/api/battle/start', {
        character_id: character.id,
        topic,
        subtopic,
      });
      const d = res.data;
      const e: Enemy = {
        name: d.enemy.name,
        hp: d.enemy.hp,
        max_hp: d.enemy.max_hp,
        topic: d.enemy.topic,
        is_boss: d.enemy.is_boss,
      };
      setEnemy(e);
      setEnemyHp(e.hp);
      setSessionId(d.session_id);
      setQuestions(d.questions);
      setPhase('battle');
    } catch {
      // Backend offline → use fallback
      const fallbackEnemy = FALLBACK_ENEMIES[topic] || FALLBACK_ENEMIES.default;
      const e: Enemy = {
        name: fallbackEnemy.name,
        hp: 100,
        max_hp: 100,
        topic,
        is_boss: false,
      };
      setEnemy(e);
      setEnemyHp(e.hp);
      setQuestions(FALLBACK_QUESTIONS);
      setPhase('battle');
    }
  }

  // ── Submit answer ────────────────────────────────────────────────────────

  async function submitAnswer(chosenIndex: number | null) {
    if (phase !== 'battle' || showResult) return;
    const q = questions[qIndex];
    let correct = false;

    if (q.type === 'mcq') {
      correct = chosenIndex === q.correct_index;
    } else {
      // CRQ: mark as correct if they wrote something (AI eval simplified)
      correct = crqAnswer.trim().length > 20;
    }

    setLastCorrect(correct);
    setLastExplanation(q.explanation || q.model_answer || '');
    setShowResult(true);
    setPhase('answering');

    // Record with backend (best-effort)
    let damageDealt = 0;
    let loot = null;
    if (sessionId && enemy) {
      try {
        const res = await axios.post('/api/battle/answer', {
          session_id: sessionId,
          enemy_name: enemy.name,
          question: q.question,
          answer_chosen: q.type === 'mcq' ? (q.options?.[chosenIndex ?? 0] ?? '') : crqAnswer,
          correct,
          difficulty: q.difficulty,
        });
        damageDealt = res.data.damage_dealt;
        loot = res.data.loot;
      } catch {
        // offline fallback
        damageDealt = correct ? q.damage : 0;
      }
    } else {
      damageDealt = correct ? q.damage : 0;
    }

    if (correct) {
      const newEnemyHp = Math.max(0, enemyHp - damageDealt);
      setEnemyHp(newEnemyHp);
      setLastDamage(damageDealt);
      setEnemyShaking(true);
      setShowEnemyDmg(true);
      if (loot) setLootGained(loot);
      setExpGained((prev) => prev + q.difficulty * 10);
      setTimeout(() => { setEnemyShaking(false); setShowEnemyDmg(false); }, 1000);
    } else {
      const dmgToPlayer = q.difficulty * 8 + 5;
      const newPlayerHp = Math.max(0, playerHp - dmgToPlayer);
      setPlayerHp(newPlayerHp);
      setLastDamage(dmgToPlayer);
      setPlayerShaking(true);
      setShowPlayerDmg(true);
      setTimeout(() => { setPlayerShaking(false); setShowPlayerDmg(false); }, 1000);
    }
  }

  // ── Next question ────────────────────────────────────────────────────────

  function nextQuestion() {
    const newEnemyHp = enemyHp;
    const newPlayerHp = playerHp;

    if (newEnemyHp <= 0) {
      addMinutesStudied(questions.length * 5);
      setPhase('victory');
      return;
    }
    if (newPlayerHp <= 0) {
      setPhase('defeat');
      return;
    }
    if (qIndex + 1 >= questions.length) {
      addMinutesStudied(questions.length * 5);
      setPhase(newEnemyHp <= 0 ? 'victory' : 'victory'); // win if survived all
      return;
    }

    setQIndex((i) => i + 1);
    setSelected(null);
    setCrqAnswer('');
    setShowResult(false);
    setLootGained(null);
    setPhase('battle');
  }

  // ── Finish battle ────────────────────────────────────────────────────────

  function finishBattle() {
    if (character && expGained > 0) {
      updateCharacter({
        exp: Math.min(character.exp + expGained, character.expToNext - 1),
        hp: playerHp,
      });
    }
    navigate('/dashboard');
  }

  // ─── Render: Loading ────────────────────────────────────────────────────

  if (phase === 'loading' || !enemy || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#05080f' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">⚔️</div>
          <div className="text-[#f5a623] text-sm tracking-widest" style={{ fontFamily: "'Orbitron', monospace" }}>
            PREPARING BATTLE...
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[qIndex];

  // ─── Render: Victory ─────────────────────────────────────────────────────

  if (phase === 'victory') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#05080f' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg w-full"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-7xl mb-6"
          >
            🏆
          </motion.div>
          <div className="text-xs tracking-[0.4em] text-[#f5a623] mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>
            ◆ VICTORY ◆
          </div>
          <h2 className="text-4xl font-black text-[#f5a623] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
            {enemy.name}
          </h2>
          <p className="text-[#94a3b8] mb-8">has been defeated!</p>

          <div className="game-panel corner-accent p-6 mb-6 grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-[#ffd700]" style={{ fontFamily: "'Orbitron', monospace" }}>
                +{expGained}
              </div>
              <div className="text-xs text-[#64748b] mt-1">EXP GAINED</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#00ff88]" style={{ fontFamily: "'Orbitron', monospace" }}>
                {playerHp}/{playerMaxHp}
              </div>
              <div className="text-xs text-[#64748b] mt-1">HP REMAINING</div>
            </div>
          </div>

          {lootGained && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="game-panel p-4 mb-6 flex items-center gap-4"
              style={{ borderColor: lootGained.rarity === 'epic' ? '#a855f7' : lootGained.rarity === 'rare' ? '#00d4ff' : '#f5a623' }}
            >
              <div className="text-3xl">🎁</div>
              <div>
                <div className="text-xs text-[#64748b]">LOOT DROP</div>
                <div className="font-bold text-[#f5a623]">{lootGained.name}</div>
                <div
                  className="text-xs capitalize"
                  style={{ color: lootGained.rarity === 'epic' ? '#a855f7' : lootGained.rarity === 'rare' ? '#00d4ff' : '#94a3b8' }}
                >
                  {lootGained.rarity}
                </div>
              </div>
            </motion.div>
          )}

          <GlowButton variant="gold" size="lg" onClick={finishBattle} fullWidth>
            Return to Dashboard →
          </GlowButton>
        </motion.div>
      </div>
    );
  }

  // ─── Render: Defeat ──────────────────────────────────────────────────────

  if (phase === 'defeat') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#05080f' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-lg w-full"
        >
          <div className="text-7xl mb-6">💀</div>
          <div className="text-xs tracking-[0.4em] text-[#ff4466] mb-2" style={{ fontFamily: "'Orbitron', monospace" }}>
            ◆ DEFEATED ◆
          </div>
          <h2 className="text-4xl font-black text-[#ff4466] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
            You Fell
          </h2>
          <p className="text-[#94a3b8] mb-8">
            The {enemy.name} was too strong. Study more and return stronger.
          </p>
          <div className="flex gap-3">
            <GlowButton variant="ghost" size="lg" onClick={finishBattle} fullWidth>
              ← Retreat
            </GlowButton>
            <GlowButton variant="red" size="lg" onClick={() => { initialized.current = false; setPhase('loading'); setQIndex(0); setSelected(null); setShowResult(false); setExpGained(0); setLootGained(null); startBattle(); }} fullWidth>
              Try Again
            </GlowButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Render: Battle arena ─────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #05080f 0%, #0a0414 40%, #05080f 100%)',
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid #1e2d4a', background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(10px)' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="text-[#64748b] hover:text-[#f5a623] transition-colors text-xs tracking-widest"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          ← FLEE
        </button>
        <div className="text-xs tracking-[0.3em] text-[#64748b]" style={{ fontFamily: "'Orbitron', monospace" }}>
          {topic.toUpperCase()} — Q {qIndex + 1}/{questions.length}
        </div>
        <div className="text-xs text-[#f5a623]" style={{ fontFamily: "'Orbitron', monospace" }}>
          +{expGained} EXP
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-4 gap-4">

        {/* Combatants row */}
        <div className="flex items-end justify-between gap-4 relative" style={{ minHeight: 220 }}>

          {/* Player side */}
          <div className="flex flex-col items-center gap-2 w-2/5">
            <div className="w-full game-panel p-2">
              <StatBar label={character.name} current={playerHp} max={playerMaxHp} color="#ff4466" icon="❤️" />
            </div>
            <div className="relative">
              {showPlayerDmg && <DamageFloat value={lastDamage} color="#ff4466" side="left" />}
              <motion.div
                animate={playerShaking ? { x: [-6, 6, -4, 4, -2, 2, 0] } : { y: [0, -6, 0] }}
                transition={playerShaking ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CharacterSprite charClass={character.charClass} size={120} />
              </motion.div>
            </div>
          </div>

          {/* VS badge */}
          <div
            className="flex-shrink-0 text-xs font-black tracking-widest text-[#64748b] self-center"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            VS
          </div>

          {/* Enemy side */}
          <div className="flex flex-col items-center gap-2 w-2/5">
            <div className="w-full game-panel p-2">
              <StatBar label={enemy.name} current={enemyHp} max={enemy.max_hp} color="#a855f7" icon="👹" />
            </div>
            <div className="relative">
              {showEnemyDmg && <DamageFloat value={lastDamage} color="#a855f7" side="right" />}
              <EnemySprite enemy={enemy} shaking={enemyShaking} />
            </div>
          </div>
        </div>

        {/* Question card */}
        {q && (
          <AnimatePresence mode="wait">
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="game-panel corner-accent p-5 flex flex-col gap-4"
            >
              {/* Difficulty badge */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs tracking-widest"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    color: q.difficulty >= 4 ? '#ff4466' : q.difficulty >= 3 ? '#f5a623' : '#00ff88',
                  }}
                >
                  {'★'.repeat(q.difficulty)}{'☆'.repeat(5 - q.difficulty)} DIFFICULTY {q.difficulty}/5
                </span>
                <span className="text-xs text-[#64748b]" style={{ fontFamily: "'Orbitron', monospace" }}>
                  DMG {q.damage}
                </span>
              </div>

              {/* Question text */}
              <div className="text-base font-semibold text-[#e2e8f0]" style={{ lineHeight: 1.5 }}>
                {q.question}
              </div>

              {/* MCQ options */}
              {q.type === 'mcq' && q.options && !showResult && (
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setSelected(i); submitAnswer(i); }}
                      disabled={showResult}
                      className="text-left p-3 rounded-lg transition-all text-sm"
                      style={{
                        background: selected === i ? 'rgba(124,58,237,0.2)' : '#0a0f1e',
                        border: `1px solid ${selected === i ? '#7c3aed' : '#1e2d4a'}`,
                        color: '#e2e8f0',
                        cursor: showResult ? 'not-allowed' : 'pointer',
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* MCQ result highlight */}
              {q.type === 'mcq' && q.options && showResult && (
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, i) => {
                    const isCorrect = i === q.correct_index;
                    const isChosen = i === selected;
                    let bg = '#0a0f1e';
                    let border = '#1e2d4a';
                    if (isCorrect) { bg = 'rgba(0,255,136,0.15)'; border = '#00ff88'; }
                    else if (isChosen && !isCorrect) { bg = 'rgba(255,68,102,0.15)'; border = '#ff4466'; }
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-lg text-sm flex items-center justify-between"
                        style={{ background: bg, border: `1px solid ${border}`, color: '#e2e8f0', fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        <span>{opt}</span>
                        {isCorrect && <span className="text-[#00ff88] font-bold">✓</span>}
                        {isChosen && !isCorrect && <span className="text-[#ff4466] font-bold">✗</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CRQ input */}
              {q.type === 'crq' && !showResult && (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={crqAnswer}
                    onChange={(e) => setCrqAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    className="w-full bg-[#0a0f1e] text-[#e2e8f0] rounded p-3 outline-none text-sm resize-none"
                    style={{ border: '1px solid #1e2d4a', fontFamily: "'Rajdhani', sans-serif" }}
                  />
                  <GlowButton
                    variant="cyan"
                    onClick={() => submitAnswer(null)}
                    disabled={crqAnswer.trim().length < 5}
                    fullWidth
                  >
                    Submit Answer
                  </GlowButton>
                </div>
              )}

              {/* Result feedback */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg p-4"
                  style={{
                    background: lastCorrect ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,102,0.08)',
                    border: `1px solid ${lastCorrect ? '#00ff88' : '#ff4466'}`,
                  }}
                >
                  <div className="font-bold mb-1" style={{ color: lastCorrect ? '#00ff88' : '#ff4466', fontFamily: "'Orbitron', monospace", fontSize: 13 }}>
                    {lastCorrect ? '✓ CORRECT! ' + `+${lastDamage} DMG` : '✗ WRONG! -' + lastDamage + ' HP'}
                  </div>
                  {lastExplanation && (
                    <p className="text-sm text-[#94a3b8]">{lastExplanation}</p>
                  )}
                  {lootGained && (
                    <div className="mt-2 text-xs font-bold text-[#f5a623]">🎁 LOOT: {lootGained.name} ({lootGained.rarity})</div>
                  )}
                </motion.div>
              )}

              {/* Next button */}
              {showResult && (
                <GlowButton variant="gold" onClick={nextQuestion} fullWidth>
                  {qIndex + 1 >= questions.length ? 'Finish Battle →' : 'Next Question →'}
                </GlowButton>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
