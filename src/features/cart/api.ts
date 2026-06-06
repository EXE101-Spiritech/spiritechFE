import axiosClient from "@/shared/api/axiosClient";
import type {
  CreateCartReq,
  CartResponse,
  AddItemReq,
  AddItemResponse,
} from "@/shared/types";

export const cartApi = {
  /** Create a new cart */
  create: (data?: CreateCartReq) =>
    axiosClient.post<CartResponse>("/v1/cart", data ?? {}).then((r) => r.data),

  /** Get cart by ID */
  get: (id: string) =>
    axiosClient.get<CartResponse>(`/v1/cart/${id}`).then((r) => r.data),

  /** Add item to cart */
  addItem: (cartId: string, data: AddItemReq) =>
    axiosClient
      .post<AddItemResponse>(`/v1/cart/${cartId}/items`, data)
      .then((r) => r.data),

  /** Remove item from cart */
  removeItem: (cartId: string, productId: string) =>
    axiosClient.delete(`/v1/cart/${cartId}/items/${productId}`),
};
