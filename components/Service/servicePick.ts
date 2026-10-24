import { create } from 'zustand';

/** The pricing tab to open, such as "automation". */
export interface ServicePick {
  tab: string;
}

interface ServicePickState {
  pick: (ServicePick & { at: number }) | null;
  choose: (pick: ServicePick) => void;
}

export const useServicePick = create<ServicePickState>((set) => ({
  pick: null,
  choose: (pick) => set({ pick: { ...pick, at: Date.now() } }),
}));
