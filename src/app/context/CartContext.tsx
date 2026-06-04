import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { cartApi } from "@/features/cart/api";
import { getAccessToken } from "@/shared/api/axiosClient";

// Local cart item — holds both server and client data
export interface CartItem {
  id: string;
  variantId?: string;
  type: "product" | "combo";
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  cartId: string | null;
  version: number;
  loading: boolean;
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CART_ID_KEY = "spiritech_cart_id";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem(CART_ID_KEY),
  );
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(false);
  const synced = useRef(false);

  // On mount, if logged in and we have a cart ID, fetch it from server
  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    if (cartId && getAccessToken()) {
      cartApi
        .get(cartId)
        .then((res) => {
          setVersion(res.version);
        })
        .catch(() => {
          // Cart expired or missing — clear
          localStorage.removeItem(CART_ID_KEY);
          setCartId(null);
        });
    }
  }, [cartId]);

  // Ensure cart exists on server when user is logged in
  useEffect(() => {
    if (!getAccessToken() || cartId) return;

    cartApi
      .create()
      .then((res) => {
        setCartId(res.cart_id);
        setVersion(res.version);
        localStorage.setItem(CART_ID_KEY, res.cart_id);
      })
      .catch(() => {
        // Silently fail — cart will be created on next action
      });
  }, [cartId]);

  const addItem = useCallback(
    async (
      item: Omit<CartItem, "quantity"> & {
        type?: "product" | "combo";
        variantId?: string;
      },
    ) => {
      const token = getAccessToken();

      if (token && item.variantId) {
        // Server-side cart
        let cid = cartId;

        if (!cid) {
          const created = await cartApi.create();
          cid = created.cart_id;
          setCartId(cid);
          setVersion(created.version);
          localStorage.setItem(CART_ID_KEY, cid);
        }

        await cartApi.addItem(cid, { variant_id: item.variantId, quantity: 1 });
        const updated = await cartApi.get(cid);
        setVersion(updated.version);
      }

      // Update local state
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    },
    [cartId],
  );

  const removeItem = useCallback(
    async (variantId: string) => {
      if (cartId && getAccessToken()) {
        await cartApi.removeItem(cartId, variantId).catch(() => {});
      }

      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
    },
    [cartId],
  );

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeItem(variantId);
      }

      if (cartId && getAccessToken()) {
        await cartApi
          .addItem(cartId, { variant_id: variantId, quantity })
          .catch(() => {});
        const updated = await cartApi.get(cartId).catch(() => null);
        if (updated) setVersion(updated.version);
      }

      setItems((prev) =>
        prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
      );
    },
    [cartId, removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartId,
        version,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
