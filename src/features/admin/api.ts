import axiosClient from "@/shared/api/axiosClient";
import type {
  AdminDashboard,
  RevenueResponse,
  TopProductItem,
  OrdersByStatus,
  UserEngagement,
  AIUsage,
} from "@/shared/types";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ReceiveStockReq {
  product_id: string;
  variant_id: string;
  quantity: number;
  note?: string;
}

export interface AdjustStockReq {
  product_id: string;
  variant_id: string;
  delta: number;
  reason: string;
}

export interface SetShippingReq {
  carrier: string;
  tracking: string;
}

export interface ComboFormData {
  name: string;
  description: string;
  banner_url?: string;
  starts_at: string;
  expires_at: string;
  product_slugs: string[];
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

  /** Orders grouped by status */
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

  // ── Inventory ──────────────────────────────────────────────────────────────

  /** Receive stock */
  receiveStock: (data: ReceiveStockReq) =>
    axiosClient.post("/admin/inventory/receive", data),

  /** Adjust stock (positive or negative delta) */
  adjustStock: (data: AdjustStockReq) =>
    axiosClient.post("/admin/inventory/adjust", data),

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
};
