import { create } from 'zustand';
import type { SiteType } from '@constants/services';

export interface ServicePick {
  tab: string;
  packageId?: string;
  siteType?: SiteType;
  addOnIds?: string[];
  cmsTabIds?: string[] | null;
  buildId?: string | null;
  /** Custom Admin portal features; null leaves it off. */
  adminIds?: string[] | null;
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
