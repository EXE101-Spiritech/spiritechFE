import axiosClient from '@/shared/api/axiosClient';
import type { OrderDetail, CancelOrderResponse } from '@/shared/types';

export const orderApi = {
  /** Get order by ID */
  get: (id: string) =>
    axiosClient.get<OrderDetail>(`/v1/orders/${id}`).then((r) => r.data),

  /** Cancel an order */
  cancel: (id: string) =>
    axiosClient
      .post<CancelOrderResponse>(`/v1/orders/${id}/cancel`)
      .then((r) => r.data),
};

export type { OrderDetail } from '@/shared/types';
