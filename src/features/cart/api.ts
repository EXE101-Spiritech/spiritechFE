import axiosClient from "@/shared/api/axiosClient";
import type { CartResponse, AddItemReq, AddItemResponse } from "@/shared/types";

export const cartApi = {
  /** Get my cart — auto-creates if none exists */
  get: () => axiosClient.get<CartResponse>("/v1/cart").then((r) => r.data),

  /** Add item to my cart (upserts quantity) */
  addItem: (data: AddItemReq) =>
    axiosClient
      .post<AddItemResponse>("/v1/cart/items", data)
      .then((r) => r.data),

  /** Remove item from my cart */
  removeItem: (productId: string) =>
    axiosClient.delete(`/v1/cart/items/${productId}`),
};
