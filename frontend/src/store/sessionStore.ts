import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudyPlan } from '../types';

interface SessionStore {
  studyPlan: StudyPlan | null;
  currentDayIndex: number;
  dailyMinutesStudied: number;
  isResting: boolean;
  restEndsAt: number | null;
  bossUnlocked: boolean;
  setStudyPlan: (plan: StudyPlan) => void;
  addMinutesStudied: (mins: number) => void;
  startRest: (durationMs: number) => void;
  endRest: () => void;
  checkBossUnlock: () => boolean;
  resetDay: () => void;
}

const BOSS_THRESHOLD_MINUTES = 300; // 5 hours

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      studyPlan: null,
      currentDayIndex: 0,
      dailyMinutesStudied: 0,
      isResting: false,
      restEndsAt: null,
      bossUnlocked: false,

      setStudyPlan: (plan) => set({ studyPlan: plan }),

      addMinutesStudied: (mins) =>
        set((state) => {
          const total = state.dailyMinutesStudied + mins;
          return {
            dailyMinutesStudied: total,
            bossUnlocked: total >= BOSS_THRESHOLD_MINUTES,
          };
        }),

      startRest: (durationMs) =>
        set({ isResting: true, restEndsAt: Date.now() + durationMs }),

      endRest: () => set({ isResting: false, restEndsAt: null }),

      checkBossUnlock: () => get().dailyMinutesStudied >= BOSS_THRESHOLD_MINUTES,

      resetDay: () =>
        set({ dailyMinutesStudied: 0, isResting: false, restEndsAt: null, bossUnlocked: false }),
    }),
    { name: 'borworntat-session' }
  )
);
