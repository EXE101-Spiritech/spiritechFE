import axiosClient from "@/shared/api/axiosClient";
import type {
  ProductListResponse,
  ProductDetail,
  SearchResponse,
  BlogSearchResponse,
  BlogListResponse,
  BlogDetail,
  PaginationParams,
} from "@/shared/types";

export const productApi = {
  /** List products with cursor pagination */
  list: (params?: PaginationParams) =>
    axiosClient
      .get<ProductListResponse>("/v1/products", { params })
      .then((r) => r.data),

  /** Get product detail by slug */
  get: (slug: string) =>
    axiosClient.get<ProductDetail>(`/v1/products/${slug}`).then((r) => r.data),

  /** Search products */
  search: (params: {
    q: string;
    category?: string;
    page?: number;
    size?: number;
  }) =>
    axiosClient
      .get<SearchResponse>("/v1/search/products", { params })
      .then((r) => r.data),

  /** Search blogs */
  searchBlogs: (params: { q: string; page?: number; size?: number }) =>
    axiosClient
      .get<BlogSearchResponse>("/v1/search/blogs", { params })
      .then((r) => r.data),

  /** List blogs */
  listBlogs: (params?: { page?: number; size?: number }) =>
    axiosClient
      .get<BlogListResponse>("/v1/blogs", { params })
      .then((r) => r.data),

  /** Get blog detail by slug */
  getBlog: (slug: string) =>
    axiosClient.get<BlogDetail>(`/v1/blogs/${slug}`).then((r) => r.data),
};

export type { ProductListItem } from "@/shared/types";
