import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterSprite } from '../components/character/CharacterSprite';
import { StatBar, ExpBar } from '../components/ui/StatBar';
import { GlowButton } from '../components/ui/GlowButton';
import { CLASS_CONFIGS } from '../types';
import type { CharacterClass } from '../types';
import { useCharacterStore, CLASS_STARTING_STATS } from '../store/characterStore';
import axios from 'axios';

type Step = 1 | 2 | 3;

export default function CharacterCreate() {
  const navigate = useNavigate();
  const { setCharacter } = useCharacterStore();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Ophthalmologist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = CLASS_CONFIGS.find((c) => c.id === selectedClass)!;
  const stats = CLASS_STARTING_STATS[selectedClass];

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/character', {
        name: name.trim(),
        char_class: selectedClass,
      });
      const data = res.data;
      setCharacter({
        id: data.id,
        name: data.name,
        charClass: data.char_class,
        level: data.level,
        exp: data.exp,
        expToNext: data.exp_to_next,
        hp: data.hp,
        maxHp: data.max_hp,
        stamina: data.stamina,
        maxStamina: data.max_stamina,
        equipment: data.equipment,
      });
      setStep(3);
    } catch (e: any) {
      setError('Failed to create character. Make sure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #05080f 0%, #0a0f1e 50%, #05080f 100%)',
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #1e2d4a' }}>
        <button onClick={() => navigate('/')} className="text-[#64748b] hover:text-[#f5a623] transition-colors text-sm tracking-widest"
          style={{ fontFamily: "'Orbitron', monospace" }}>
          ← BACK
        </button>
        <div className="text-xs tracking-[0.3em] text-[#64748b]"
          style={{ fontFamily: "'Orbitron', monospace" }}>
          CHARACTER CREATION
        </div>
        {/* Step indicator */}
        <div className="flex gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="w-8 h-1.5 rounded-full transition-all"
              style={{ background: step >= s ? '#f5a623' : '#1e2d4a' }} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Left: Character Preview */}
        <div className="hidden lg:flex flex-col items-center justify-center w-72 xl:w-80"
          style={{ borderRight: '1px solid #1e2d4a', background: 'rgba(10,15,30,0.5)' }}>
          <motion.div
            key={selectedClass}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 p-8"
          >
            <CharacterSprite charClass={selectedClass} size={160} animated />

            <div className="w-full space-y-3">
              <div className="text-center">
                <div className="text-lg font-bold text-[#e2e8f0]" style={{ fontFamily: "'Cinzel', serif" }}>
                  {name || 'Your Hero'}
                </div>
                <div className="text-sm flex items-center justify-center gap-2" style={{ color: config.color }}>
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </div>
              </div>

              <ExpBar exp={0} expToNext={100} level={1} />
              <StatBar label="HP" current={stats.hp} max={stats.hp} color="#ff4466" icon="❤️" />
              <StatBar label="Stamina" current={stats.stamina} max={stats.stamina} color="#00ff88" icon="⚡" />

              <div className="game-panel p-3 mt-2">
                <div className="text-xs text-[#64748b] mb-1 tracking-wider">STARTING WEAPON</div>
                <div className="text-sm font-bold text-[#f5a623]">{config.startingWeapon}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Steps */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="w-full max-w-xl"
              >
                <div className="mb-8">
                  <div className="text-xs tracking-[0.3em] text-[#f5a623] mb-2"
                    style={{ fontFamily: "'Orbitron', monospace" }}>STEP 1 OF 2</div>
                  <h2 className="text-3xl font-bold text-[#e2e8f0] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                    Name Your Hero
                  </h2>
                  <p className="text-[#64748b] text-sm">This is the name that will echo through the halls of medicine.</p>
                </div>

                <div className="mb-8">
                  <label className="block text-xs tracking-widest text-[#64748b] mb-3"
                    style={{ fontFamily: "'Orbitron', monospace" }}>
                    HERO NAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
                    placeholder="Enter your name..."
                    maxLength={30}
                    className="w-full bg-transparent text-[#e2e8f0] text-xl font-bold outline-none"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      border: 'none',
                      borderBottom: `2px solid ${name.trim() ? '#f5a623' : '#1e2d4a'}`,
                      padding: '12px 4px',
                      transition: 'border-color 0.3s',
                    }}
                    autoFocus
                  />
                  <div className="text-right text-xs text-[#1e2d4a] mt-1">{name.length}/30</div>
                </div>

                {/* Mobile preview */}
                <div className="lg:hidden flex justify-center mb-6">
                  <CharacterSprite charClass={selectedClass} size={120} animated />
                </div>

                <GlowButton
                  variant="gold"
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  fullWidth
                >
                  Next — Choose Class →
                </GlowButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="w-full max-w-2xl"
              >
                <div className="mb-8">
                  <div className="text-xs tracking-[0.3em] text-[#f5a623] mb-2"
                    style={{ fontFamily: "'Orbitron', monospace" }}>STEP 2 OF 2</div>
                  <h2 className="text-3xl font-bold text-[#e2e8f0] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                    Choose Your Class
                  </h2>
                  <p className="text-[#64748b] text-sm">Your class shapes your stats, weapon, and learning style.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {CLASS_CONFIGS.map((cls) => {
                    const isSelected = selectedClass === cls.id;
                    return (
                      <motion.button
                        key={cls.id}
                        onClick={() => setSelectedClass(cls.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-left p-4 rounded-lg transition-all"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${cls.color}22 0%, ${cls.color}11 100%)`
                            : 'linear-gradient(135deg, #0f1628 0%, #141c30 100%)',
                          border: `1px solid ${isSelected ? cls.color : '#1e2d4a'}`,
                          boxShadow: isSelected ? `0 0 20px ${cls.color}33` : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{cls.icon}</span>
                          <div>
                            <div className="font-bold text-sm text-[#e2e8f0]"
                              style={{ fontFamily: "'Cinzel', serif", color: isSelected ? cls.accentColor : '#e2e8f0' }}>
                              {cls.label}
                            </div>
                            <div className="text-xs text-[#64748b]">{cls.startingWeapon}</div>
                          </div>
                        </div>
                        <p className="text-xs text-[#94a3b8]">{cls.description}</p>

                        <div className="flex gap-3 mt-3">
                          <div className="text-xs">
                            <span className="text-[#ff4466]">HP </span>
                            <span className="text-[#94a3b8]">{CLASS_STARTING_STATS[cls.id].hp}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-[#00ff88]">STA </span>
                            <span className="text-[#94a3b8]">{CLASS_STARTING_STATS[cls.id].stamina}m</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {error && (
                  <div className="text-[#ff4466] text-sm text-center mb-4 game-panel p-3">{error}</div>
                )}

                <div className="flex gap-3">
                  <GlowButton variant="ghost" size="lg" onClick={() => setStep(1)}>
                    ← Back
                  </GlowButton>
                  <GlowButton
                    variant="gold"
                    size="lg"
                    onClick={handleCreate}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Creating Hero...' : `✦ Forge ${name} ✦`}
                  </GlowButton>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-full max-w-lg text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mb-6"
                >
                  <CharacterSprite charClass={selectedClass} size={180} animated />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-xs tracking-[0.4em] text-[#f5a623] mb-3"
                    style={{ fontFamily: "'Orbitron', monospace" }}>
                    ◆ HERO FORGED ◆
                  </div>
                  <h2 className="text-4xl font-black text-[#f5a623] mb-2"
                    style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 30px rgba(245,166,35,0.5)' }}>
                    {name}
                  </h2>
                  <p className="text-[#94a3b8] mb-1">{config.icon} {config.label}</p>
                  <p className="text-[#64748b] text-sm mb-8">
                    Armed with the <span className="text-[#00d4ff]">{config.startingWeapon}</span>,
                    your legend begins.
                  </p>

                  <GlowButton variant="gold" size="xl" onClick={() => navigate('/dashboard')} fullWidth>
                    Begin the Journey →
                  </GlowButton>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
