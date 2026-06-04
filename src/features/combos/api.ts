import axiosClient from '@/shared/api/axiosClient';
import type { ComboListItem, ComboDetail } from '@/shared/types';

export const comboApi = {
  /** List all active combos */
  list: () =>
    axiosClient.get<ComboListItem[]>('/v1/combos').then((r) => r.data),

  /** Get combo detail by slug */
  get: (slug: string) =>
    axiosClient.get<ComboDetail>(`/v1/combos/${slug}`).then((r) => r.data),
};
