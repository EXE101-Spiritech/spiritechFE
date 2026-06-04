import axiosClient from '@/shared/api/axiosClient';
import type {
  ProductListResponse,
  ProductDetail,
  SearchResponse,
  PaginationParams,
} from '@/shared/types';

export const productApi = {
  /** List products with cursor pagination */
  list: (params?: PaginationParams) =>
    axiosClient
      .get<ProductListResponse>('/v1/products', { params })
      .then((r) => r.data),

  /** Get product detail by slug */
  get: (slug: string) =>
    axiosClient
      .get<ProductDetail>(`/v1/products/${slug}`)
      .then((r) => r.data),

  /** Search products */
  search: (params: {
    q: string;
    category?: string;
    page?: number;
    size?: number;
  }) =>
    axiosClient
      .get<SearchResponse>('/v1/search/products', { params })
      .then((r) => r.data),
};

export type { ProductListItem, VariantItem } from '@/shared/types';
