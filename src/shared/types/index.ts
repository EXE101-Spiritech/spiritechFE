// ── Auth ───────────────────────────────────────────────────────────────────
export interface UserInfo {
  id: string;
  role: string;
  tier: string;
  locale: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: UserInfo;
}

export interface LoginReq {
  phone: string;
  password: string;
}

export interface RegisterReq {
  phone: string;
  password: string;
  name: string;
}

export interface RefreshReq {
  refresh_token: string;
}

export interface LogoutReq {
  refresh_token: string;
}

export interface SessionItem {
  family_id: string;
  device_fingerprint?: string;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// ── Products ───────────────────────────────────────────────────────────────

/** GET /v1/me response */
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

/** PUT /v1/me body (partial update) */
export interface UserProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// ── Products ───────────────────────────────────────────────────────────────
export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  base_price_vnd: number;
  images: string[];
  quantity: number;
  status: string;
  created_at: string;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  base_price_vnd: number;
  images: string[];
  quantity: number;
  status: string;
  version: number;
  is_combo: boolean;
  combo_original_price_vnd?: number;
}

export interface SearchResultItem {
  id: string;
  slug: string;
  name: string;
  base_price_vnd: number;
  category_slug: string;
  category_name: string;
  image_url: string;
  in_stock: boolean;
  _score: number;
}

export interface ProductListResponse {
  data: ProductListItem[];
  total: number;
}

export interface SearchResponse {
  data: SearchResultItem[];
  total: number;
  page: number;
  size: number;
}

// ── Blogs ───────────────────────────────────────────────────────────────────
export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image_url?: string;
  author: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface BlogDetail extends BlogListItem {
  content: string;
}

export interface BlogSearchResultItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  created_at: string;
  _score: number;
}

export interface BlogSearchResponse {
  data: BlogSearchResultItem[];
  total: number;
  page: number;
  size: number;
}

export interface BlogListResponse {
  data: BlogListItem[];
  total: number;
  page: number;
  size: number;
}

// ── Cart ───────────────────────────────────────────────────────────────────
export interface CreateCartReq {
  session_token?: string;
}

export interface CartResponse {
  cart_id: string;
  version: number;
  status: string;
  created_at?: string;
  expires_at?: string;
}

export interface AddItemReq {
  product_id: string;
  quantity: number;
}

export interface AddItemResponse {
  cart_id: string;
  product_id: string;
  quantity: number;
}

// ── Checkout ───────────────────────────────────────────────────────────────
export interface ShippingAddress {
  street: string;
  city: string;
  district: string;
}

export interface BuyerInfo {
  name: string;
  tax_code?: string;
  email: string;
  phone: string;
  address: string;
}

export interface PlaceOrderReq {
  cart_id: string;
  cart_version: number;
  payment_method: string;
  shipping_vnd: number;
  shipping_address: ShippingAddress;
  buyer: BuyerInfo;
  coupon_code?: string;
  note?: string;
}

export interface PlaceOrderResponse {
  order_id: string;
  order_number: string;
  status: string;
  invoice_status: string;
  subtotal_vnd: number;
  discount_vnd: number;
  vat_vnd: number;
  shipping_vnd: number;
  total_vnd: number;
  payment_ref?: string;
  payment_redirect?: string;
  placed_at: string;
}

// ── Orders ─────────────────────────────────────────────────────────────────
export interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  invoice_status: string;
  subtotal_vnd: number;
  discount_vnd: number;
  vat_vnd: number;
  shipping_vnd: number;
  total_vnd: number;
  placed_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  carrier?: string;
  tracking?: string;
}

export interface CancelOrderResponse {
  order_id: string;
  status: string;
  reservations_released: number;
}

// ── Combos ─────────────────────────────────────────────────────────────────
export interface ComboListItem {
  slug: string;
  name: string;
  description: string;
  banner_url: string;
  starts_at: string;
  expires_at: string;
  product_count: number;
}

export interface ComboProductItem {
  sku: string;
  slug: string;
  name: string;
  image_url: string;
  base_price_vnd: number;
  combo_price_vnd: number;
  discount_bps: number;
  in_stock: boolean;
}

export interface ComboDetail {
  slug: string;
  name: string;
  products: ComboProductItem[];
  total_original_vnd: number;
  total_combo_vnd: number;
  savings_vnd: number;
}

// ── Coupons ────────────────────────────────────────────────────────────────
export interface CouponInfo {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_vnd: number;
  uses: number;
  max_uses: number;
  remaining: number;
  expires_at: string;
  status: string;
}

// ── Chat ───────────────────────────────────────────────────────────────────
export interface StreamEvent {
  chunk?: string;
  done?: boolean;
  tokens_used?: number;
  tool_calls?: string[];
  product_cards?: ProductCard[];
  session_id?: string;
  error?: string;
  error_code?: string;
}

export interface ProductCard {
  slug: string;
  name: string;
  price_vnd: number;
  image_url: string;
  in_stock: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  productCards?: ProductCard[];
  toolCalls?: string[];
  tokensUsed?: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  session_id: string;
  user_id?: string;
  status: string;
  message_count: number;
  tokens_input: number;
  tokens_output: number;
  cost_usd_cents: number;
  started_at: string;
  last_activity_at: string;
}

// ── Tracking ───────────────────────────────────────────────────────────────
export interface TrackEventReq {
  event_type: string;
  payload: Record<string, unknown>;
}

// ── Admin ──────────────────────────────────────────────────────────────────
export interface AdminDashboard {
  total_revenue_vnd: number;
  total_orders: number;
  total_users: number;
  total_products: number;
  pending_orders: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue_vnd: number;
  orders: number;
}

// Revenue over time — returns total + daily breakdown
// When no data, returns { total_vnd: 0, by_date: [] }
export interface RevenueResponse {
  total_vnd: number;
  by_date: RevenueDataPoint[];
}

export interface TopProductItem {
  product_id: string;
  slug: string;
  name: string;
  total_sold: number;
  revenue_vnd: number;
}

// Orders grouped by status — flat object with counts per status
export interface OrdersByStatus {
  pending_payment: number;
  paid: number;
  confirmed: number;
  fulfilling: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
  failed: number;
}

export interface EngagementData {
  total: number;
  daily_avg: number;
  by_date: { date: string; count: number }[];
}

export interface SearchAnalytics {
  total: number;
  daily_avg: number;
  zero_result_count: number;
  zero_result_rate: number;
  top_queries: { query: string; count: number }[];
  by_date: { date: string; count: number }[];
}

export interface CartAbandonment {
  rate: number;
  abandoned_count: number;
  completed_count: number;
}

export interface UserEngagement {
  product_views: EngagementData;
  searches: SearchAnalytics;
  add_to_carts: EngagementData;
  cart_abandonment: CartAbandonment;
}

export interface AIUsage {
  sessions: {
    total: number;
    active: number;
    by_date: { date: string; count: number }[];
  };
  messages: {
    total: number;
    daily_avg: number;
    by_date: { date: string; count: number }[];
  };
  tokens: {
    input_tokens: number;
    output_tokens: number;
    total_cost_cents: number;
  };
  tools: { tool_name: string; count: number; failures: number }[] | null;
}

// ── Error ──────────────────────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
  retry?: boolean;
  metadata?: Record<string, unknown>;
}

// ── Pagination / Common ────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  size?: number;
  limit?: number;
  cursor?: string;
}
