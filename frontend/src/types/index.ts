export type CharacterClass =
  | 'Ophthalmologist'
  | 'Internist'
  | 'Surgeon'
  | 'Pediatrician'
  | 'Neurologist';

export interface CharacterStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  exp: number;
  expToNext: number;
  level: number;
}

export interface Equipment {
  weapon?: InventoryItem;
  armor?: InventoryItem;
  accessory?: InventoryItem;
}

export interface Character {
  id: number;
  name: string;
  charClass: CharacterClass;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  equipment: Equipment;
}

export interface InventoryItem {
  id: number;
  itemName: string;
  itemType: 'weapon' | 'armor' | 'accessory';
  stats: Record<string, number>;
  equipped: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: number;
  explanation: string;
}

export interface CRQQuestion {
  question: string;
  modelAnswer: string;
  difficulty: number;
}

export interface Subtopic {
  name: string;
  keyFacts: string[];
  mcqQuestions: MCQQuestion[];
  crqQuestions: CRQQuestion[];
}

export interface Topic {
  id?: number;
  name: string;
  subtopics: Subtopic[];
  difficulty?: number;
}

export interface StudySession {
  topic: string;
  subtopics: string[];
  type: 'new' | 'review' | 'retrieval' | 'boss';
  estimatedMinutes: number;
  description: string;
}

export interface StudyDay {
  date: string;
  dayNumber: number;
  sessions: StudySession[];
}

export interface StudyPlan {
  id: number;
  examDate: string;
  topics: string[];
  plan: StudyDay[];
}

export interface BattleEnemy {
  name: string;
  hp: number;
  maxHp: number;
  topic: string;
  isBoss: boolean;
  sprite?: string;
}

export interface ClassConfig {
  id: CharacterClass;
  label: string;
  description: string;
  startingWeapon: string;
  color: string;
  accentColor: string;
  icon: string;
}

export const CLASS_CONFIGS: ClassConfig[] = [
  {
    id: 'Ophthalmologist',
    label: 'Ophthalmologist',
    description: 'Master of the eye. Wields the Slit Lamp as a weapon. High precision, high damage.',
    startingWeapon: 'Slit Lamp Staff',
    color: '#7c3aed',
    accentColor: '#f5a623',
    icon: '👁️',
  },
  {
    id: 'Internist',
    label: 'Internist',
    description: 'Jack of all trades. Wields the Stethoscope Blade. Balanced stats, wide knowledge.',
    startingWeapon: 'Stethoscope Blade',
    color: '#dc2626',
    accentColor: '#60a5fa',
    icon: '❤️',
  },
  {
    id: 'Surgeon',
    label: 'Surgeon',
    description: 'Swift and precise. Wields the Scalpel Twin Blades. Fast attacks, critical hits.',
    startingWeapon: 'Scalpel Twin Blades',
    color: '#0891b2',
    accentColor: '#34d399',
    icon: '🔪',
  },
  {
    id: 'Pediatrician',
    label: 'Pediatrician',
    description: 'Healer archetype. Wields the Reflex Hammer. Bonus HP and recovery.',
    startingWeapon: 'Reflex Hammer',
    color: '#059669',
    accentColor: '#fbbf24',
    icon: '🌱',
  },
  {
    id: 'Neurologist',
    label: 'Neurologist',
    description: 'Mind mage class. Wields the Neural Arc. Massive EXP gains, fragile.',
    startingWeapon: 'Neural Arc',
    color: '#d97706',
    accentColor: '#c084fc',
    icon: '🧠',
  },
];
