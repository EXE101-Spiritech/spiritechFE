import axiosClient from '@/shared/api/axiosClient';
import type { CouponInfo } from '@/shared/types';

export const couponApi = {
  /** Lookup coupon by code */
  lookup: (code: string) =>
    axiosClient.get<CouponInfo>(`/v1/coupons/${code}`).then((r) => r.data),
};
