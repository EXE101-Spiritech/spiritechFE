import axiosClient from '@/shared/api/axiosClient';
import type { PlaceOrderReq, PlaceOrderResponse } from '@/shared/types';

export const checkoutApi = {
  /**
   * Place order — requires idempotency key to prevent double-charge.
   * Generate a UUID v4 per attempt.
   */
  placeOrder: (data: PlaceOrderReq, idempotencyKey: string) =>
    axiosClient
      .post<PlaceOrderResponse>('/v1/checkout', data, {
        headers: { 'Idempotency-Key': idempotencyKey },
      })
      .then((r) => r.data),
};

export type { PlaceOrderReq, PlaceOrderResponse } from '@/shared/types';
