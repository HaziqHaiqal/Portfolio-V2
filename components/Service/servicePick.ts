import { create } from 'zustand';

export interface ServicePick {
  tab: string;
  packageId?: string;
  addOnIds?: string[];
  cmsTabIds?: string[] | null;
  buildId?: string | null;
}

interface ServicePickState {
  pick: (ServicePick & { at: number }) | null;
  choose: (pick: ServicePick) => void;
}

/** The recommender's choice, applied by the tabs and the matching estimator. */
export const useServicePick = create<ServicePickState>((set) => ({
  pick: null,
  choose: (pick) => set({ pick: { ...pick, at: Date.now() } }),
}));
