import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CharacterSprite } from '../components/character/CharacterSprite';
import { StatBar, ExpBar } from '../components/ui/StatBar';
import { GlowButton } from '../components/ui/GlowButton';
import { useCharacterStore } from '../store/characterStore';
import { useSessionStore } from '../store/sessionStore';
import axios from 'axios';

const SESSION_TYPES = {
  new: { label: 'New Lesson', color: '#00d4ff', icon: '📖' },
  review: { label: 'Review', color: '#f5a623', icon: '🔄' },
  retrieval: { label: 'Recall Quiz', color: '#a855f7', icon: '🧠' },
  boss: { label: 'Boss Fight', color: '#ff4466', icon: '👹' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { character } = useCharacterStore();
  const { studyPlan, dailyMinutesStudied, bossUnlocked } = useSessionStore();

  const [activeTab, setActiveTab] = useState<'quests' | 'setup' | 'inventory'>('quests');
  const [examDate, setExamDate] = useState('');
  const [examTopics, setExamTopics] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [planError, setPlanError] = useState('');

  const { setStudyPlan } = useSessionStore();

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#05080f' }}>
        <div className="text-center">
          <p className="text-[#64748b] mb-4">No hero found. Create one first.</p>
          <GlowButton variant="gold" onClick={() => navigate('/create')}>Create Hero</GlowButton>
        </div>
      </div>
    );
  }

  const handleUploadPdf = async () => {
    if (!uploadFile) return;
    setUploadingPdf(true);
    setUploadStatus('');
    try {
      const form = new FormData();
      form.append('character_id', String(character.id));
      form.append('file', uploadFile);
      const res = await axios.post('/api/resources/upload', form);
      setUploadStatus(`✓ "${res.data.filename}" uploaded! AI is processing it in the background.`);
      setUploadFile(null);
    } catch {
      setUploadStatus('Upload failed. Make sure the backend is running.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!examDate || !examTopics.trim()) return;
    setGeneratingPlan(true);
    setPlanError('');
    try {
      const topics = examTopics.split('\n').map((t) => t.trim()).filter(Boolean);
      const res = await axios.post('/api/schedule/generate', {
        character_id: character.id,
        exam_date: examDate,
        topics,
      });
      setStudyPlan({
        id: res.data.id,
        examDate: res.data.exam_date,
        topics: res.data.topics,
        plan: res.data.plan,
      });
      setActiveTab('quests');
    } catch (e: any) {
      setPlanError(e.response?.data?.detail || 'Failed to generate plan. Check backend and API key.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlan = studyPlan?.plan.find((d) => d.date === todayStr);
  const upcomingDays = studyPlan?.plan.filter((d) => d.date > todayStr).slice(0, 4) || [];

  return (
    <div className="min-h-screen" style={{ background: '#05080f', fontFamily: "'Rajdhani', sans-serif" }}>
      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-3"
        style={{ borderBottom: '1px solid #1e2d4a', background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(10px)' }}>
        <button onClick={() => navigate('/')} className="text-[#64748b] hover:text-[#f5a623] transition-colors text-xs tracking-widest"
          style={{ fontFamily: "'Orbitron', monospace" }}>
          ← HOME
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-[#64748b]" style={{ fontFamily: "'Orbitron', monospace" }}>
            LVL {character.level}
          </div>
          <div className="font-bold text-[#f5a623]" style={{ fontFamily: "'Cinzel', serif" }}>
            {character.name}
          </div>
          <div className="text-xs text-[#94a3b8]">— {character.charClass}</div>
        </div>

        {bossUnlocked && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-xs font-bold text-[#ff4466] tracking-wider cursor-pointer"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            👹 BOSS READY
          </motion.div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-0 min-h-[calc(100vh-56px)]">
        {/* Left sidebar: Character panel */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0"
          style={{ borderRight: '1px solid #1e2d4a', background: 'rgba(10,15,30,0.7)' }}>
          <div className="p-5 flex flex-col items-center gap-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CharacterSprite charClass={character.charClass} size={140} />
            </motion.div>

            <div className="w-full space-y-3">
              <ExpBar exp={character.exp} expToNext={character.expToNext} level={character.level} />
              <StatBar label="HP" current={character.hp} max={character.maxHp} color="#ff4466" icon="❤️" />
              <StatBar
                label="Daily Stamina"
                current={Math.min(dailyMinutesStudied, character.maxStamina)}
                max={character.maxStamina}
                color="#00ff88"
                icon="⚡"
              />
            </div>

            {/* Today stats */}
            <div className="w-full game-panel p-3">
              <div className="text-xs tracking-wider text-[#64748b] mb-3"
                style={{ fontFamily: "'Orbitron', monospace" }}>TODAY</div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-xl font-black text-[#00ff88]">{dailyMinutesStudied}m</div>
                  <div className="text-xs text-[#64748b]">Studied</div>
                </div>
                <div>
                  <div className="text-xl font-black text-[#f5a623]">300m</div>
                  <div className="text-xs text-[#64748b]">Boss at</div>
                </div>
              </div>
              {bossUnlocked && (
                <div className="mt-3 text-center text-xs font-bold text-[#ff4466] animate-pulse-glow">
                  ⚠ BOSS FIGHT AVAILABLE
                </div>
              )}
            </div>

            {/* Equipment quick view */}
            <div className="w-full game-panel p-3">
              <div className="text-xs tracking-wider text-[#64748b] mb-3"
                style={{ fontFamily: "'Orbitron', monospace" }}>EQUIPMENT</div>
              {Object.entries(character.equipment).length > 0 ? (
                Object.entries(character.equipment).map(([slot, item]: [string, any]) => (
                  <div key={slot} className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#94a3b8] capitalize">{slot}</span>
                    <span className="text-xs font-bold text-[#f5a623]">{item.name}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#1e2d4a]">No equipment</div>
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6" style={{ borderBottom: '1px solid #1e2d4a' }}>
            {(['quests', 'setup', 'inventory'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-3 text-sm font-bold tracking-wider transition-all uppercase"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 11,
                  color: activeTab === tab ? '#f5a623' : '#64748b',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #f5a623' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {tab === 'quests' && '⚔ '}
                {tab === 'setup' && '⚙ '}
                {tab === 'inventory' && '🎒 '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Quests tab */}
          {activeTab === 'quests' && (
            <div>
              {studyPlan ? (
                <>
                  {/* Exam countdown */}
                  <div className="game-panel corner-accent p-4 mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs tracking-wider text-[#64748b] mb-1"
                        style={{ fontFamily: "'Orbitron', monospace" }}>EXAM DATE</div>
                      <div className="text-xl font-bold text-[#f5a623]"
                        style={{ fontFamily: "'Cinzel', serif" }}>
                        {new Date(studyPlan.examDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-[#ff4466]"
                        style={{ fontFamily: "'Orbitron', monospace" }}>
                        {Math.max(0, Math.ceil((new Date(studyPlan.examDate).getTime() - Date.now()) / 86400000))}
                      </div>
                      <div className="text-xs text-[#64748b]">days left</div>
                    </div>
                  </div>

                  {/* Today's quests */}
                  <div className="mb-6">
                    <div className="text-xs tracking-[0.3em] text-[#64748b] mb-3"
                      style={{ fontFamily: "'Orbitron', monospace" }}>TODAY'S QUESTS</div>
                    {todayPlan ? (
                      <div className="space-y-3">
                        {todayPlan.sessions.map((session, i) => {
                          const type = SESSION_TYPES[session.type] || SESSION_TYPES.new;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="game-panel p-4 flex items-center justify-between hover:border-[#7c3aed] transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-2xl">{type.icon}</div>
                                <div>
                                  <div className="font-bold text-[#e2e8f0]">{session.topic}</div>
                                  <div className="text-xs" style={{ color: type.color }}>{type.label}</div>
                                  <div className="text-xs text-[#64748b]">{session.description}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm font-bold text-[#94a3b8]">{session.estimatedMinutes}m</div>
                                </div>
                                <GlowButton variant="cyan" size="sm" onClick={() => navigate('/battle', { state: { topic: session.topic, subtopic: session.subtopics?.[0] ?? '' } })}>
                                  Fight
                                </GlowButton>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="game-panel p-6 text-center text-[#64748b]">
                        No sessions scheduled for today.
                      </div>
                    )}
                  </div>

                  {/* Upcoming */}
                  {upcomingDays.length > 0 && (
                    <div>
                      <div className="text-xs tracking-[0.3em] text-[#64748b] mb-3"
                        style={{ fontFamily: "'Orbitron', monospace" }}>UPCOMING</div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {upcomingDays.map((day) => (
                          <div key={day.date} className="game-panel p-3">
                            <div className="text-xs font-bold text-[#f5a623] mb-1"
                              style={{ fontFamily: "'Orbitron', monospace" }}>
                              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="space-y-1">
                              {day.sessions.slice(0, 2).map((s, i) => (
                                <div key={i} className="text-xs text-[#94a3b8]">
                                  {SESSION_TYPES[s.type]?.icon} {s.topic}
                                </div>
                              ))}
                              {day.sessions.length > 2 && (
                                <div className="text-xs text-[#64748b]">+{day.sessions.length - 2} more</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-6xl mb-4 opacity-30">📅</div>
                  <h3 className="text-xl font-bold text-[#e2e8f0] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
                    No Study Plan Yet
                  </h3>
                  <p className="text-[#64748b] mb-6 max-w-sm">
                    Go to the Setup tab to upload your textbook, set your exam date, and generate your study plan.
                  </p>
                  <GlowButton variant="gold" onClick={() => setActiveTab('setup')}>
                    Setup Study Plan →
                  </GlowButton>
                </div>
              )}
            </div>
          )}

          {/* Setup tab */}
          {activeTab === 'setup' && (
            <div className="max-w-2xl space-y-6">
              {/* PDF Upload */}
              <div className="game-panel corner-accent p-6">
                <h3 className="font-bold text-[#f5a623] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                  📚 Upload Textbook
                </h3>
                <p className="text-xs text-[#64748b] mb-4">
                  AI will extract all topics, key facts, and generate questions automatically.
                </p>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: uploadFile ? '#00d4ff' : '#1e2d4a',
                    background: uploadFile ? 'rgba(0,212,255,0.05)' : 'transparent',
                  }}
                  onClick={() => document.getElementById('pdf-input')?.click()}
                >
                  <input
                    id="pdf-input"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  {uploadFile ? (
                    <div>
                      <div className="text-[#00d4ff] font-bold">{uploadFile.name}</div>
                      <div className="text-xs text-[#64748b] mt-1">
                        {(uploadFile.size / 1024 / 1024).toFixed(1)} MB — Click to change
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📄</div>
                      <div className="text-[#64748b] text-sm">Click to select PDF</div>
                      <div className="text-xs text-[#1e2d4a] mt-1">Standard ophthalmology textbook</div>
                    </div>
                  )}
                </div>
                {uploadStatus && (
                  <div className="mt-3 text-sm text-[#00ff88] bg-[#00ff8811] rounded p-2">
                    {uploadStatus}
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <GlowButton
                    variant="cyan"
                    onClick={handleUploadPdf}
                    disabled={!uploadFile || uploadingPdf}
                  >
                    {uploadingPdf ? 'Uploading...' : 'Upload & Process'}
                  </GlowButton>
                </div>
              </div>

              {/* Exam Setup */}
              <div className="game-panel corner-accent p-6">
                <h3 className="font-bold text-[#f5a623] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
                  📅 Set Exam Date & Topics
                </h3>
                <p className="text-xs text-[#64748b] mb-4">
                  AI will generate a personalized study plan using spaced repetition and Make It Stick principles.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-widest text-[#64748b] mb-2"
                      style={{ fontFamily: "'Orbitron', monospace" }}>EXAM DATE</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#0a0f1e] text-[#e2e8f0] rounded p-3 outline-none text-sm"
                      style={{ border: '1px solid #1e2d4a', fontFamily: "'Rajdhani', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest text-[#64748b] mb-2"
                      style={{ fontFamily: "'Orbitron', monospace" }}>
                      TOPICS (one per line)
                    </label>
                    <textarea
                      value={examTopics}
                      onChange={(e) => setExamTopics(e.target.value)}
                      placeholder={`Glaucoma\nCataract\nRetinal Detachment\nCorneal Diseases\nUveitis`}
                      rows={6}
                      className="w-full bg-[#0a0f1e] text-[#e2e8f0] rounded p-3 outline-none text-sm resize-none"
                      style={{ border: '1px solid #1e2d4a', fontFamily: "'Rajdhani', sans-serif" }}
                    />
                  </div>

                  {planError && (
                    <div className="text-[#ff4466] text-sm bg-[#ff446611] rounded p-3">{planError}</div>
                  )}

                  <GlowButton
                    variant="gold"
                    size="lg"
                    onClick={handleGeneratePlan}
                    disabled={!examDate || !examTopics.trim() || generatingPlan}
                    fullWidth
                  >
                    {generatingPlan ? '✦ AI is building your plan...' : '✦ Generate Study Plan'}
                  </GlowButton>

                  <p className="text-xs text-[#1e2d4a] text-center">
                    Requires Claude API key in backend .env
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inventory tab */}
          {activeTab === 'inventory' && (
            <div>
              <div className="text-xs tracking-[0.3em] text-[#64748b] mb-4"
                style={{ fontFamily: "'Orbitron', monospace" }}>
                YOUR ARSENAL
              </div>
              {Object.entries(character.equipment).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(character.equipment).map(([slot, item]: [string, any]) => (
                    <div key={slot} className="game-panel p-4">
                      <div className="text-xs text-[#64748b] capitalize mb-1">{slot} slot</div>
                      <div className="font-bold text-[#f5a623]">{item.name}</div>
                      <div className="text-xs text-[#94a3b8] capitalize mt-1">{item.rarity}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(item.stats || {}).map(([stat, val]) => (
                          <span key={stat} className="text-xs bg-[#0a0f1e] px-2 py-1 rounded text-[#00d4ff]">
                            +{val as number} {stat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#64748b]">
                  <div className="text-4xl mb-3 opacity-30">🎒</div>
                  <p>No equipment yet. Defeat enemies to earn loot!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
