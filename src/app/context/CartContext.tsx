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
import type { CartItemResponse } from "@/shared/types";

// Local cart item — holds display + server data
export interface CartItem {
  id: string; // slug (for display/routing)
  variantId: string; // product_id UUID from server
  type: "product" | "combo";
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Metadata cache keyed by product_id — populated when adding items
type ItemMeta = {
  slug: string;
  type: "product" | "combo";
  image: string;
};

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

function parseItems(
  serverItems: CartItemResponse[] | undefined,
  metaCache: Map<string, ItemMeta>,
): CartItem[] {
  if (!serverItems) return [];
  return serverItems.map((si) => {
    const meta = metaCache.get(si.product_id);
    return {
      id: meta?.slug || si.product_id,
      variantId: si.product_id,
      type: meta?.type || "product",
      name: si.name,
      price: si.unit_price,
      image: meta?.image || "",
      quantity: si.quantity,
    };
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const synced = useRef(false);
  // Metadata cache: product_id → { slug, type, image }
  const [metaCache] = useState(() => new Map<string, ItemMeta>());

  const refreshFromServer = useCallback(async () => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    try {
      const res = await cartApi.get();
      setCartId(res.cart_id);
      setVersion(res.version);
      setItems(parseItems(res.items, metaCache));
    } catch {
      setCartId(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [metaCache]);

  // Fetch cart from server on mount
  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    refreshFromServer();
  }, [refreshFromServer]);

  const addItem = useCallback(
    async (
      item: Omit<CartItem, "quantity"> & {
        type?: "product" | "combo";
        variantId?: string;
      },
      qty: number = 1,
    ) => {
      const token = getAccessToken();
      if (!token || !item.variantId) return;

      // Cache display metadata for when we reload from server
      metaCache.set(item.variantId, {
        slug: item.id,
        type: item.type as "product" | "combo",
        image: item.image,
      });

      await cartApi.addItem({ product_id: item.variantId, quantity: qty });
      await refreshFromServer();
    },
    [metaCache, refreshFromServer],
  );

  const removeItem = useCallback(
    async (variantId: string) => {
      if (!getAccessToken()) return;
      await cartApi.removeItem(variantId).catch(() => {});
      await refreshFromServer();
    },
    [refreshFromServer],
  );

  const updateQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      if (quantity <= 0) return removeItem(variantId);
      if (!getAccessToken()) return;

      await cartApi
        .addItem({ product_id: variantId, quantity })
        .catch(() => {});
      await refreshFromServer();
    },
    [removeItem, refreshFromServer],
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
