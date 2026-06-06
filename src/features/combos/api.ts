import { productApi } from "@/features/products/api";

// Combos are products with is_combo: true
// Since the list endpoint doesn't return is_combo, fetch details to detect combos

export const comboApi = {
  /** List combos by fetching product details and filtering for is_combo */
  list: async () => {
    const list = await productApi.list({ limit: 100 });
    const results = await Promise.allSettled(
      list.data.map((p: any) => productApi.get(p.slug)),
    );
    const combos: any[] = [];
    for (const result of results) {
      if (result.status === "fulfilled" && result.value.is_combo) {
        combos.push(result.value);
      }
    }
    return combos;
  },

  /** Get combo detail — uses products API by slug */
  get: (slug: string) => productApi.get(slug),
};
