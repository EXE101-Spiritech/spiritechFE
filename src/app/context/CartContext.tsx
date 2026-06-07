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
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number,
  ) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("spiritech_cart_items");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartId, setCartId] = useState<string | null>(() =>
    localStorage.getItem("spiritech_cart_id"),
  );
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(false);
  const synced = useRef(false);

  // Save items to localStorage on change
  useEffect(() => {
    localStorage.setItem("spiritech_cart_items", JSON.stringify(items));
  }, [items]);

  // Fetch cart from server on mount (logged in users only)
  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    if (getAccessToken()) {
      cartApi
        .get()
        .then((res) => {
          setCartId(res.cart_id);
          setVersion(res.version);
          localStorage.setItem("spiritech_cart_id", res.cart_id);
        })
        .catch(() => {
          localStorage.removeItem("spiritech_cart_id");
          setCartId(null);
        });
    }
  }, []);

  const addItem = useCallback(
    async (
      item: Omit<CartItem, "quantity"> & {
        type?: "product" | "combo";
        variantId?: string;
      },
      qty: number = 1,
    ) => {
      const token = getAccessToken();

      if (token && item.variantId) {
        // Server-side cart
        await cartApi
          .addItem({ product_id: item.variantId, quantity: qty })
          .catch(() => {});
        const updated = await cartApi.get().catch(() => null);
        if (updated) {
          setCartId(updated.cart_id);
          setVersion(updated.version);
          localStorage.setItem("spiritech_cart_id", updated.cart_id);
        }
      }

      // Update local state
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + qty } : i,
          );
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    [],
  );

  const removeItem = useCallback(async (variantId: string) => {
    if (getAccessToken()) {
      await cartApi.removeItem(variantId).catch(() => {});
    }

    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeItem(variantId);
      }

      if (getAccessToken()) {
        await cartApi
          .addItem({ product_id: variantId, quantity })
          .catch(() => {});
        const updated = await cartApi.get().catch(() => null);
        if (updated) setVersion(updated.version);
      }

      setItems((prev) =>
        prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("spiritech_cart_items");
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
