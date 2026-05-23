import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, CharacterClass } from '../types';

interface CharacterStore {
  character: Character | null;
  setCharacter: (c: Character) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  clearCharacter: () => void;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set) => ({
      character: null,
      setCharacter: (c) => set({ character: c }),
      updateCharacter: (updates) =>
        set((state) => ({
          character: state.character ? { ...state.character, ...updates } : null,
        })),
      clearCharacter: () => set({ character: null }),
    }),
    { name: 'borworntat-character' }
  )
);

export const CLASS_STARTING_STATS: Record<CharacterClass, { hp: number; stamina: number }> = {
  Ophthalmologist: { hp: 90, stamina: 150 },
  Internist: { hp: 110, stamina: 140 },
  Surgeon: { hp: 80, stamina: 160 },
  Pediatrician: { hp: 130, stamina: 130 },
  Neurologist: { hp: 70, stamina: 170 },
};
