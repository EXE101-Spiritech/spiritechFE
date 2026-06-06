import axiosClient from "@/shared/api/axiosClient";
import type {
  AdminDashboard,
  RevenueResponse,
  TopProductItem,
  OrdersByStatus,
  UserEngagement,
  AIUsage,
} from "@/shared/types";

export interface CreateProductReq {
  slug: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  base_price_vnd: number;
  vat_rate_bps?: number;
  weight_grams?: number;
  images?: string[];
  attributes?: Record<string, unknown>;
  sku?: string;
  status?: string;
  is_combo?: boolean;
  combo_original_price_vnd?: number;
}

export interface AddVariantReq {
  sku: string;
  name: string;
  price_vnd: number;
  attributes?: Record<string, unknown>;
  barcode?: string;
  weight_grams?: number;
}

export interface Category {
  ID: string;
  Name: string;
  Slug: string;
  NameEN?: string;
  Description?: string;
  SortOrder?: number;
}

export interface SetShippingReq {
  carrier: string;
  tracking: string;
}

export interface ComboFormData {
  slug: string;
  name: string;
  description: string;
  banner_url?: string;
  starts_at: string;
  expires_at: string;
  products: { sku: string; discount_bps: number }[];
  sort_order?: number;
}

export interface CreateBlogReq {
  slug: string;
  title: string;
  content?: string;
  excerpt?: string;
  image_url?: string;
  author?: string;
  status?: "draft" | "published" | "archived";
}

export interface CreateCouponReq {
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_vnd?: number;
  max_uses?: number;
  expires_at?: string;
}

export const adminApi = {
  // ── Analytics ──────────────────────────────────────────────────────────────

  /** Dashboard summary */
  dashboard: () =>
    axiosClient
      .get<AdminDashboard>("/admin/analytics/dashboard")
      .then((r) => r.data),

  /** Revenue over time */
  revenue: (days = 30) =>
    axiosClient
      .get<RevenueResponse>("/admin/analytics/revenue", { params: { days } })
      .then((r) => r.data),

  /** Top selling products */
  topProducts: (days = 30, limit = 10) =>
    axiosClient
      .get<TopProductItem[]>("/admin/analytics/top-products", {
        params: { days, limit },
      })
      .then((r) => r.data),

  /** Orders grouped by status — returns array of {status, count} */
  ordersByStatus: () =>
    axiosClient
      .get<OrdersByStatus>("/admin/analytics/orders-by-status")
      .then((r) => r.data),

  /** User engagement metrics */
  userEngagement: (days = 30) =>
    axiosClient
      .get<UserEngagement>("/admin/analytics/user-engagement", {
        params: { days },
      })
      .then((r) => r.data),

  /** AI usage metrics */
  aiUsage: (days = 30) =>
    axiosClient
      .get<AIUsage>("/admin/analytics/ai-usage", { params: { days } })
      .then((r) => r.data),

  // ── Categories ─────────────────────────────────────────────────────────────

  /** List all categories */
  listCategories: () =>
    axiosClient.get<Category[]>("/admin/categories").then((r) => r.data),

  /** Create category */
  createCategory: (data: { name: string; slug: string }) =>
    axiosClient.post<Category>("/admin/categories", data).then((r) => r.data),

  /** Update category */
  updateCategory: (id: string, data: { name?: string; slug?: string }) =>
    axiosClient
      .put<Category>(`/admin/categories/${id}`, data)
      .then((r) => r.data),

  /** Delete category */
  deleteCategory: (id: string) => axiosClient.delete(`/admin/categories/${id}`),

  // ── Orders (Admin) ─────────────────────────────────────────────────────────

  /** Set carrier + tracking for an order */
  setShipping: (orderId: string, data: SetShippingReq) =>
    axiosClient.patch(`/admin/orders/${orderId}/shipping`, data),

  /** Advance order to the next valid status */
  advanceOrderStatus: (orderId: string) =>
    axiosClient.patch(`/admin/orders/${orderId}/status`),

  // ── Combos (Admin) ─────────────────────────────────────────────────────────

  /** Create combo */
  createCombo: (data: ComboFormData) =>
    axiosClient.post("/admin/combos", data).then((r) => r.data),

  /** Update combo */
  updateCombo: (id: string, data: Partial<ComboFormData>) =>
    axiosClient.patch(`/admin/combos/${id}`, data).then((r) => r.data),

  /** Delete combo */
  deleteCombo: (id: string) => axiosClient.delete(`/admin/combos/${id}`),
  // ── Products (Admin) ───────────────────────────────────────────────────────

  /** Create product */
  createProduct: (data: CreateProductReq) =>
    axiosClient.post("/admin/products", data).then((r) => r.data),

  /** Update product */
  updateProduct: (id: string, data: Partial<CreateProductReq>) =>
    axiosClient.put(`/admin/products/${id}`, data).then((r) => r.data),

  /** Delete product */
  deleteProduct: (id: string) => axiosClient.delete(`/admin/products/${id}`),

  /** Add variant to product */
  addVariant: (productId: string, data: AddVariantReq) =>
    axiosClient
      .post(`/admin/products/${productId}/variants`, data)
      .then((r) => r.data),

  /** Upload image */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient
      .post<{ url: string; filename: string; bytes: number }>(
        "/admin/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      .then((r) => r.data);
  },

  // ── Blogs (Admin) ──────────────────────────────────────────────────────────

  /** List blogs */
  listBlogs: (params?: { status?: string }) =>
    axiosClient.get("/admin/blogs", { params }).then((r) => r.data),

  /** Create blog */
  createBlog: (data: CreateBlogReq) =>
    axiosClient.post("/admin/blogs", data).then((r) => r.data),

  /** Get blog by ID */
  getBlog: (id: string) =>
    axiosClient.get(`/admin/blogs/${id}`).then((r) => r.data),

  /** Update blog */
  updateBlog: (id: string, data: Partial<CreateBlogReq>) =>
    axiosClient.put(`/admin/blogs/${id}`, data).then((r) => r.data),

  /** Delete blog */
  deleteBlog: (id: string) => axiosClient.delete(`/admin/blogs/${id}`),

  // ── Coupons (Admin) ────────────────────────────────────────────────────────

  /** List coupons */
  listCoupons: () => axiosClient.get("/admin/coupons").then((r) => r.data),

  /** Create coupon */
  createCoupon: (data: CreateCouponReq) =>
    axiosClient.post("/admin/coupons", data).then((r) => r.data),

  /** Delete coupon */
  deleteCoupon: (id: string) => axiosClient.delete(`/admin/coupons/${id}`),
};
