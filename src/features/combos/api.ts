import axiosClient from "@/shared/api/axiosClient";
import type { ProductListResponse } from "@/shared/types";

export const comboApi = {
  /** List combos using dedicated endpoint */
  list: (params?: {
    page?: number;
    size?: number;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    q?: string;
  }) =>
    axiosClient
      .get<ProductListResponse>("/v1/combos", { params })
      .then((r) => r.data),

  /** Search combos by keyword (matches slug, name) */
  search: (params: { q: string; page?: number; size?: number }) =>
    axiosClient
      .get<ProductListResponse>("/v1/combos", { params })
      .then((r) => r.data),

  /** Get combo detail — uses products API by slug */
  get: (slug: string) =>
    axiosClient.get<any>(`/v1/products/${slug}`).then((r) => r.data),
};
