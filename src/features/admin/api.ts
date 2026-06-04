import axiosClient from '@/shared/api/axiosClient';
import type {
  AdminDashboard,
  RevenueResponse,
  TopProductItem,
  OrdersByStatus,
  UserEngagement,
  AIUsage,
} from '@/shared/types';

export const adminApi = {
  /** Dashboard summary */
  dashboard: () =>
    axiosClient
      .get<AdminDashboard>('/admin/analytics/dashboard')
      .then((r) => r.data),

  /** Revenue over time */
  revenue: (days = 30) =>
    axiosClient
      .get<RevenueResponse>('/admin/analytics/revenue', { params: { days } })
      .then((r) => r.data),

  /** Top selling products */
  topProducts: (days = 30, limit = 10) =>
    axiosClient
      .get<TopProductItem[]>('/admin/analytics/top-products', {
        params: { days, limit },
      })
      .then((r) => r.data),

  /** Orders grouped by status */
  ordersByStatus: () =>
    axiosClient
      .get<OrdersByStatus>('/admin/analytics/orders-by-status')
      .then((r) => r.data),

  /** User engagement metrics */
  userEngagement: (days = 30) =>
    axiosClient
      .get<UserEngagement>('/admin/analytics/user-engagement', {
        params: { days },
      })
      .then((r) => r.data),

  /** AI usage metrics */
  aiUsage: (days = 30) =>
    axiosClient
      .get<AIUsage>('/admin/analytics/ai-usage', { params: { days } })
      .then((r) => r.data),
};
