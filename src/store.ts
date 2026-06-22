import { create } from "zustand";

interface AppState {
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  hoveredSkill: string | null;
  setHoveredSkill: (skill: string | null) => void;
  warpRatio: number;
  setWarpRatio: (ratio: number) => void;
}

let hoverTimeout: any = null;

export const useAppStore = create<AppState>((set, get) => ({
  hoveredId: null,
  setHoveredId: (id) => set({ hoveredId: id }),
  hoveredSkill: null,
  setHoveredSkill: (skill) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    if (get().hoveredSkill !== skill) {
      hoverTimeout = setTimeout(() => {
        set({ hoveredSkill: skill });
      }, 50);
    }
  },
  warpRatio: 0,
  setWarpRatio: (ratio) => set({ warpRatio: ratio }),
}));

