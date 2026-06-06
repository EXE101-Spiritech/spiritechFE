# Spiritech Frontend API Reference

> Kết nối với **Trợ lý An Tâm** và **Spiritech Ecommerce API**

Base URLs:
- **Ecommerce API:** `https://spiritest.duckdns.org`
- **AI Service:** `https://spiritest.duckdns.org/chat`
- **Swagger UI:** `https://spiritest.duckdns.org/swagger/`

---

## Auth Requirements

| Badge | Meaning |
|---|---|
| 🔓 **Public** | No auth required. Works without token. |
| 🔑 **Auth** | Requires `Authorization: Bearer <token>` header. Returns 401 if invalid/missing. |
| 🔒 **Admin** | Requires JWT with admin/staff role. Returns 401/403 if unauthorized. |

Pass the token in all authenticated requests:

```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

---

## Table of Contents

- [1. Auth Flow](#1-auth-flow)
- [2. Products & Catalog](#2-products--catalog)
- [3. Cart Operations](#3-cart-operations)
- [4. Checkout Flow](#4-checkout-flow)
- [5. Orders & Status Machine](#5-orders--status-machine)
- [6. Coupons](#6-coupons)
- [7. Payments (PayOS)](#7-payments-payos)
- [8. User Event Tracking](#8-user-event-tracking)
- [9. AI Chat Service](#9-ai-chat-service)
  - [9.1 SSE Streaming](#91-sse-streaming)
  - [9.2 Event Types](#92-event-types)
  - [9.3 Tool Calling Flow](#93-tool-calling-flow)
  - [9.4 Rendering Guide](#94-rendering-guide)
  - [9.5 Session Management](#95-session-management)
- [10. Admin Analytics](#10-admin-analytics)
- [Appendix: Error Codes](#appendix-error-codes)

---

## 1. Auth Flow

### 1.1 Register 🔓 Public

```http
POST /v1/auth/register
Content-Type: application/json

{
  "phone": "0941237430",
  "password": "admin123",
  "name": "Nguyễn Văn A"
}
```

**Response 201:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "cQhjYByINpuG65D5RT7nkYxxeRe1dTfwwyx2NvLMQ1w",
  "user": {
    "id": "eeeeeeee-0000-0000-0000-000000000001",
    "role": "admin",
    "tier": "standard",
    "locale": "vi-VN"
  }
}
```

### 1.2 Login 🔓 Public

```http
POST /v1/auth/login
Content-Type: application/json

{
  "phone": "0941237430",
  "password": "admin123"
}
```

**Response 200:** (same as register)

**Response 401 (wrong credentials):**
```json
{
  "code": "ERR_INVALID_CREDENTIALS",
  "message": "invalid phone or password"
}
```

### 1.3 Refresh Token 🔓 Public

```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "cQhjYByINpuG65D5RT7nkYxxeRe1dTfwwyx2NvLMQ1w"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "new-refresh-token-value"
}
```

**Important:** Refresh tokens are one-time use. Each refresh rotates both tokens. If a stolen token is replayed after legitimate use, both the stolen and legitimate sessions are revoked (theft detection).

### 1.4 OTP Flow (Secondary) 🔓 Public

**Request OTP:**
```http
POST /v1/auth/otp/request
{"phone": "0941237430"}
```

**Verify OTP:**
```http
POST /v1/auth/otp/verify
{"phone": "0941237430", "code": "123456"}
```

### 1.5 Store Tokens

```typescript
// TypeScript — store on login
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// Attach to all authenticated requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
}

// Refresh on 401
async function refreshToken() {
  const res = await fetch('/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: localStorage.getItem('refresh_token')
    })
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.access_token;
  }
  // Redirect to login
}
```

### 1.6 Logout 🔑 Auth

```http
POST /v1/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "refresh_token": "cQhjYByINpuG65D5RT7nkYxxeRe1dTfwwyx2NvLMQ1w"
}
```

**Response 204:** No content. Session revoked.

### 1.7 List Sessions 🔑 Auth

```http
GET /v1/sessions
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "family_id": "f0000000-0000-0000-0000-000000000001",
    "device_fingerprint": "...",
    "created_at": "2026-06-01T08:00:00Z",
    "expires_at": "2026-06-15T08:00:00Z",
    "is_current": true
  }
]
```

---

## 2. Products & Catalog

### 2.1 List Products 🔓 Public

```http
GET /v1/products?limit=20&cursor=
```

**Response 200: (cursor-based pagination)**
```json
{
  "data": [
    {
      "id": "b0000000-0000-0000-0000-000000000001",
      "slug": "ban-tho-go-huong-tam-gia-1m2",
      "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
      "name_en": "Altar Table — Rosewood 1.2m",
      "base_price_vnd": 8500000,
      "images": ["https://example.com/img/ban-tho-1.jpg"],
      "status": "active",
      "created_at": "2026-05-27T16:30:56.155927Z"
    }
  ],
  "total": 21
}
```

### 2.2 Get Product Detail 🔓 Public

```http
GET /v1/products/ban-tho-go-huong-tam-gia-1m2
```

**Response 200:**
```json
{
  "id": "b0000000-...",
  "slug": "ban-tho-go-huong-tam-gia-1m2",
  "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
  "description": "...",
  "base_price_vnd": 8500000,
  "images": ["..."],
  "status": "active",
  "version": 1,
  "is_combo": false
}
```

> Products have a single price — no variants.
> See [Admin Product API](./docs/api/admin-product.md) for full admin reference.

### 2.2.1 Combo Products

A combo is a regular product with `is_combo: true`. No separate table or API exists.

**Creating a combo via admin API:**
```js
// POST /admin/products  (requires admin JWT)
const body = {
  slug: "combo-tet-2027",
  name: "Combo Tết Đinh Mùi 2027",
  description: "Trọn bộ bàn thờ và đồ thờ cúng cho dịp Tết.",
  base_price_vnd: 5000000,   // combo price after discount
  images: ["https://.../banner.jpg"],
  is_combo: true,
  combo_original_price_vnd: 6500000  // original undiscounted total
};
```

**Updating a combo (⚠️ full replace — send all fields):**
```js
// First get current product, then overlay changes
const current = await fetch(`/v1/products/${slug}`).then(r => r.json());

// PUT /admin/products/:id
const body = {
  ...current,
  name: "Combo Tết 2027 - Updated",
  base_price_vnd: 4500000
};
```

**Frontend display logic:**
```js
function renderPrice(product) {
  if (product.is_combo && product.combo_original_price_vnd) {
    return `
      <span style="text-decoration: line-through; color: #999;">
        ${formatPrice(product.combo_original_price_vnd)}
      </span>
      <span style="color: red; font-weight: bold; margin-left: 8px;">
        ${formatPrice(product.base_price_vnd)}
      </span>
    `;
  }
  return `<span>${formatPrice(product.base_price_vnd)}</span>`;
}
```

Combos appear in all product endpoints — no special endpoints needed:
- `GET /v1/products` — listed alongside regular products with `is_combo: true`
- `GET /v1/products/:slug` — returns `combo_original_price_vnd`
- `GET /v1/search/products` — searchable by name/description

### 2.3 Search Products 🔓 Public

```http
GET /v1/search/products?q=bàn thờ&category=ban-tho&page=1&size=10
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "slug": "ban-tho-go-huong-tam-gia-1m2",
      "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
      "base_price_vnd": 8500000,
      "category_slug": "ban-tho",
      "category_name": "Bàn thờ",
      "image_url": "https://...",
      "in_stock": true,
      "_score": 0.85
    }
  ],
  "total": 5,
  "page": 1,
  "size": 10
}
```

---

## 3. Cart Operations

Cart uses **optimistic locking** via `cart_version`. Always read version before modifying.

### 3.1 Create Cart 🔑 Auth

```http
POST /v1/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "session_token": "optional-guest-id"
}
```

**Response 201:**
```json
{
  "cart_id": "c0000000-...",
  "version": 1,
  "created_at": "...",
  "expires_at": "..."
}
```

### 3.2 Get Cart 🔑 Auth

```http
GET /v1/cart/{id}
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "cart_id": "c0000000-...",
  "version": 3,
  "status": "open"
}
```

### 3.3 Add Item 🔑 Auth

```http
POST /v1/cart/{id}/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": "b0000000-...",
  "quantity": 1
}
```

**Response 200:**
```json
{
  "cart_id": "c0000000-...",
  "product_id": "b0000000-...",
  "quantity": 1
}
```

### 3.4 Remove Item 🔑 Auth

```http
DELETE /v1/cart/{id}/items/{product_id}
Authorization: Bearer <token>
```

### Important: Optimistic Locking

```typescript
// Checkout requires the latest cart_version
// Always fetch cart before checkout:
const cart = await fetch(`/v1/cart/${cartId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { version } = await cart.json();
// Pass version to checkout
```

---

## 4. Checkout Flow

### 4.1 Place Order 🔑 Auth

```http
POST /v1/checkout
Authorization: Bearer <token>
Idempotency-Key: unique-key-uuid-v4
Content-Type: application/json

{
  "cart_id": "c0000000-...",
  "cart_version": 3,
  "payment_method": "payos",
  "shipping_vnd": 0,
  "shipping_address": {
    "street": "123 Nguyễn Huệ",
    "city": "Hồ Chí Minh",
    "district": "1"
  },
  "buyer": {
    "name": "Nguyễn Văn A",
    "tax_code": "",
    "email": "a@example.com",
    "phone": "0941237430",
    "address": "123 Nguyễn Huệ, Q1, HCM"
  },
  "coupon_code": "TET2027",
  "note": "Giao giờ hành chính"
}
```

**Response 200:**
```json
{
  "order_id": "o0000000-...",
  "order_number": "SP-250715-00001",
  "status": "pending_payment",
  "invoice_status": "queued",
  "subtotal_vnd": 7650000,
  "discount_vnd": 850000,
  "vat_vnd": 0,
  "shipping_vnd": 0,
  "total_vnd": 7650000,
  "payment_ref": "payos_123456",
  "payment_redirect": "https://pay.payos.vn/...",
  "placed_at": "2025-07-15T08:30:00Z"
}
```

### 4.2 Important Rules

| Rule | Detail |
|---|---|
| **Idempotency-Key** | Required header. Prevents double-charge on retry. |
| **Cart Version** | Must match current server version. |
| **Shipping** | **Free.** Overridden to 0 server-side. |
| **Coupon** | Applied atomically during checkout. Uses counter decremented. |
| **Payment Redirect** | For PayOS, redirect user to `payment_redirect` URL immediately. |

### 4.3 Error Handling

```typescript
// Handle checkout errors
if (res.status === 409) {
  // ERR_CART_STALE — cart_version mismatch
  const cart = await fetchCart();
  showCartChanges(cart);
}

if (res.status === 422) {
  // ERR_OUT_OF_STOCK or ERR_COUPON_EXHAUSTED
  const err = await res.json();
  showError(err.message);
}
```

---

## Price Calculation

```
Gross per line = unit_price × quantity
Discount       = proportional allocation (coupon: % or fixed)
Net per line   = Gross - Discount
Total          = SUM(Net)   (VAT and shipping = 0)
```

---

## 5. Orders & Status Machine

### 5.1 Get Order 🔑 Auth

```http
GET /v1/orders/{id}
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": "o0000000-...",
  "order_number": "SP-250715-00001",
  "status": "shipped",
  "invoice_status": "issued",
  "subtotal_vnd": 7650000,
  "discount_vnd": 850000,
  "vat_vnd": 0,
  "shipping_vnd": 0,
  "total_vnd": 7650000,
  "placed_at": "2025-07-15T08:30:00Z",
  "paid_at": "2025-07-15T08:32:00Z",
  "shipped_at": "2025-07-16T09:00:00Z",
  "delivered_at": null,
  "carrier": "GHN",
  "tracking": "GHN123456789"
}
```

### 5.2 Order Status Machine

```
pending_payment ──→ paid ──→ confirmed ──→ fulfilling ──→ shipped ──→ delivered
       │              │          │               │            │             │
       ├── cancelled  ├── refunded ←─────────────┴────────────┴── refunded  │
       │              │                                                    │
       └── failed ────┘                                                    │
            │                                                              │
            └── pending_payment (retry)                                    │
                                                                           │
                                                                      refunded
```

**Frontend display statuses:**

| API Status | Display (vi) | User Action |
|---|---|---|
| `pending_payment` | Chờ thanh toán | Redirect to payment |
| `paid` | Đã thanh toán | Wait for confirmation |
| `confirmed` | Đã xác nhận | Wait for shipping |
| `fulfilling` | Đang chuẩn bị | Wait for shipping |
| `shipped` | Đã giao vận chuyển | Track via carrier |
| `delivered` | Đã nhận hàng | Confirm receipt |
| `cancelled` | Đã huỷ | Re-order if needed |
| `refunded` | Đã hoàn tiền | Check bank account |
| `failed` | Thanh toán thất bại | Retry payment |

### 5.3 Cancel Order 🔑 Auth

```http
POST /v1/orders/{id}/cancel
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "order_id": "o0000000-...",
  "status": "cancelled"
}
```

---

## 6. Coupons

### 6.1 Lookup Coupon 🔓 Public

```http
GET /v1/coupons/TET2027
```

**Response 200:**
```json
{
  "code": "TET2027",
  "discount_type": "percent",
  "discount_value": 1000,
  "min_order_vnd": 500000,
  "uses": 0,
  "max_uses": 100,
  "remaining": 100,
  "expires_at": "2027-02-15T16:59:59Z",
  "status": "active"
}
```

**Response 400 (invalid):**
```json
{
  "code": "ERR_COUPON_INVALID",
  "message": "coupon code not found"
}
```

---

## 7. Payments (PayOS)

### 7.1 Flow

```
1. Checkout → returns payment_redirect URL
2. Redirect user to PayOS payment page
3. PayOS sends webhook to backend (status update)
4. User returns via return/cancel URL
```

### 7.2 Return URLs (configured on ecommerce)

| Page | URL | When |
|---|---|---|
Backend handles PayOS webhook automatically via `POST /v1/payments/payos/webhook`.

The return/cancel pages render **styled HTML** directly — no frontend needed for those.

### 7.3 Vue/React Integration

```typescript
// After checkout redirect to payment
const { payment_redirect, order_id } = await checkout();

// Open PayOS in new tab/window
window.location.href = payment_redirect;

// Poll order status to detect payment completion
const pollInterval = setInterval(async () => {
  const order = await fetch(`/v1/orders/${order_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await order.json();
  if (data.status === 'paid' || data.status === 'cancelled') {
    clearInterval(pollInterval);
    // Navigate to order detail page
    router.push(`/orders/${order_id}`);
  }
}, 3000);
```

---

---

## 8. User Event Tracking 🔓 Public

Fire-and-forget endpoint for frontend telemetry. No auth required, returns 202 immediately.

```http
POST /v1/track
Content-Type: application/json

{
  "event_type": "ai.feedback",
  "payload": {
    "session_id": "550e8400-...",
    "rating": "thumbs_up",
    "message_id": "..."
  }
}
```

**Response 202:**
```json
{"status": "accepted"}
```

### Recommended events to track from frontend

| Event | When to fire | Payload |
|---|---|---|
| `checkout.step_cart` | User enters checkout | `cart_id` |
| `checkout.step_address` | User fills address | `cart_id` |
| `checkout.step_payment` | User selects payment | `cart_id`, `payment_method` |
| `page.exited` | User leaves page with cart items | `cart_id`, `item_count` |
| `product.card_clicked` | User clicks AI-recommended product card | `session_id`, `product_slug` |

### TypeScript helper

```typescript
// Fire-and-forget tracking — never await, never catch errors
function track(eventType: string, payload: Record<string, any> = {}) {
  fetch('https://spiritest.duckdns.org/v1/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: eventType, payload })
  }).catch(() => {}); // Silently ignore errors
}

// Usage
track('ai.feedback', { session_id, rating: 'thumbs_up' });
track('checkout.step_payment', { cart_id, payment_method: 'payos' });
```

> **Note:** The back button / page exit can be tracked via `beforeunload`:
> ```typescript
> window.addEventListener('beforeunload', () => {
>   track('page.exited', { cart_id: getCartId(), item_count: getItemCount() });
> }, { capture: true });
> ```

---

## 9. AI Chat Service

### 9.1 SSE Streaming 🔓 Public

The AI service uses **Server-Sent Events (SSE)** for real-time token streaming.

```http
POST https://spiritest.duckdns.org/chat/v1/chat/stream  🔓 Public (🔑 Auth for user-specific features)
Content-Type: application/json
Authorization: Bearer <token>  // optional — anonymous without JWT

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "có bán bàn thờ gỗ không?"
}
```

**If no `session_id`**, one is auto-generated and returned in the final event. Use it for subsequent messages.

### 9.2 Event Types

Each SSE event is `event: message` with a JSON `data` field.

#### Text Chunk (streaming token-by-token)

```
event: message
data: {"chunk":"Dạ,","done":false}

event: message
data: {"chunk":" mình","done":false}

event: message
data: {"chunk":" tìm","done":false}

event: message
data: {"chunk":" thấy","done":false}
...
```

**Frontend:** Append each `chunk` to a string builder.

#### Intermediate Tool Call Event

```
event: message
data: {"chunk":"","done":false,"tool_calls":["search_products"]}
```

**Frontend:** Optionally show a "🔍 Đang tìm kiếm..." indicator.

#### Product Cards Event

```
event: message
data: {"chunk":"","done":false,"product_cards":[
  {
    "slug":"ban-tho-go-huong-tam-gia-1m2",
    "name":"Bàn Thờ Gỗ Hương Tăm 1m2",
    "price_vnd":8500000,
    "image_url":"https://example.com/img/ban-tho-1.jpg",
    "in_stock":true
  },
  {
    "slug":"ban-tho-go-mit-1m6",
    "name":"Bàn Thờ Gỗ Mít 1m6",
    "price_vnd":22000000,
    "image_url":"https://example.com/img/ban-tho-2.jpg",
    "in_stock":true
  }
]}
```

#### Order Info Event

> *Coming soon — structured order cards similar to product cards.*

#### Final Event

```
event: message
data: {"chunk":"","done":true,"tokens_used":114,"tool_calls":["search_products"],"session_id":"550e8400-..."}
```

| Field | Type | Description |
|---|---|---|
| `done` | boolean | `true` = stream ended |
| `tokens_used` | number | Total tokens consumed |
| `tool_calls` | string[] | Tools called during this turn |
| `session_id` | string | Session UUID (for next request) |
| `error` | string | Error message (on failure) |
| `error_code` | string | Machine error code (on failure) |

#### Error Event

```
event: message
data: {"chunk":"","done":true,"error":"rate limit exceeded","error_code":"ERR_RATE_LIMITED"}
```

### 9.3 Tool Calling Flow

The LLM can call **8 tools** during a conversation. The frontend doesn't need to do anything — the AI service handles tool execution server-side. But the frontend receives **events** that indicate what's happening.

```
User sends message
  → AI may call tool(s) ← happens server-side
    → Tool call event emitted to frontend
    → Tool executes (gRPC to ecommerce)
    → Result fed back to LLM
    → LLM generates text response
      → Text chunk events stream to frontend
    → Product card events emitted
  → Final event (done: true)
```

**Available tools (for frontend informational display):**

| Tool | Trigger Phrase | Card Event |
|---|---|---|
| `search_products` | "tìm sản phẩm..." | ✅ product_cards |
| `get_product` | "xem chi tiết..." | ❌ |
| `check_stock` | "còn hàng không?" | ❌ |
| `list_categories` | "có những loại gì?" | ❌ |
| `lookup_order` | "kiểm tra đơn..." | ❌ |
| `list_my_orders` | "đơn của tôi..." | ❌ |
| `cancel_order` | "hủy đơn..." | ❌ |
| `check_coupon` | "mã giảm giá..." | ❌ |
| `create_ticket` | Unknown issue | ❌ |

### 9.4 Rendering Guide

#### TypeScript SSE Client

```typescript
// Complete SSE client for AI chat
interface StreamEvent {
  chunk?: string;
  done?: boolean;
  tokens_used?: number;
  tool_calls?: string[];
  product_cards?: ProductCard[];
  session_id?: string;
  error?: string;
  error_code?: string;
}

interface ProductCard {
  slug: string;
  name: string;
  price_vnd: number;
  image_url: string;
  in_stock: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  productCards?: ProductCard[];
  toolCalls?: string[];
  tokensUsed?: number;
  isStreaming?: boolean;
}

async function streamChat(
  message: string,
  sessionId: string | null,
  token: string | null,
  onEvent: (msg: ChatMessage) => void
): Promise<string> {
  const body: any = { message };
  if (sessionId) body.session_id = sessionId;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(
    'https://spiritest.duckdns.org/chat/v1/chat/stream',
    { method: 'POST', headers, body: JSON.stringify(body) }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const assistantMsg: ChatMessage = {
    role: 'assistant',
    content: '',
    isStreaming: true,
  };
  onEvent(assistantMsg);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const ev: StreamEvent = JSON.parse(line.slice(6));

          // 1. Append text chunks
          if (ev.chunk) {
            assistantMsg.content += ev.chunk;
            onEvent({ ...assistantMsg });
          }

          // 2. Handle tool calls
          if (ev.tool_calls && ev.tool_calls.length > 0) {
            assistantMsg.toolCalls = ev.tool_calls;
            onEvent({ ...assistantMsg });
          }

          // 3. Handle product cards
          if (ev.product_cards && ev.product_cards.length > 0) {
            assistantMsg.productCards = ev.product_cards;
            onEvent({ ...assistantMsg });
          }

          // 4. Handle final event
          if (ev.done) {
            assistantMsg.isStreaming = false;
            assistantMsg.tokensUsed = ev.tokens_used;
            if (ev.session_id) sessionId = ev.session_id;
            onEvent({ ...assistantMsg });
            return sessionId!;
          }

          // 5. Handle error
          if (ev.error) {
            throw new Error(ev.error);
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }
  }

  return sessionId!;
}
```

#### React/Vue Rendering

```tsx
// React component for AI chat messages
function ChatMessage({ msg }: { msg: ChatMessage }) {
  return (
    <div className={`message ${msg.role}`}>
      {/* Text content with streaming cursor */}
      <div className="bubble">
        <MDXRenderer content={msg.content} />
        {msg.isStreaming && <span className="cursor">|</span>}
      </div>

      {/* Tool call indicator */}
      {msg.toolCalls?.map(tool => (
        <div key={tool} className="tool-badge">
          🔧 {toolName(tool)}
        </div>
      ))}

      {/* Product cards */}
      {msg.productCards && (
        <div className="product-cards-row">
          {msg.productCards.map(card => (
            <a key={card.slug}
               href={`/products/${card.slug}`}
               className="product-card">
              <img src={card.image_url}
                   alt={card.name}
                   onError={(e) => e.target.src = '/placeholder.png'} />
              <div className="card-info">
                <h4>{card.name}</h4>
                <span className="price">
                  {formatPrice(card.price_vnd)}
                </span>
                {card.in_stock
                  ? <Badge color="green">Còn hàng</Badge>
                  : <Badge color="red">Hết hàng</Badge>}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Tokens used */}
      {!msg.isStreaming && msg.tokensUsed && (
        <small className="tokens">{msg.tokensUsed} tokens</small>
      )}
    </div>
  );
}

// Helper
function formatPrice(vnd: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(vnd);
}

function toolName(tool: string): string {
  const names: Record<string, string> = {
    search_products: 'Tìm sản phẩm',
    get_product: 'Xem chi tiết',
    check_stock: 'Kiểm tra tồn kho',
    list_categories: 'Danh mục',
    lookup_order: 'Tra cứu đơn',
    list_my_orders: 'Đơn hàng của tôi',
    cancel_order: 'Hủy đơn',
    check_coupon: 'Mã giảm giá',
    create_ticket: 'Tạo ticket hỗ trợ',
  };
  return names[tool] || tool;
}
```

### 9.5 Session Management 🔓 Public

**Create a session** (optional — auto-created on first stream if omitted):

```http
POST https://spiritest.duckdns.org/chat/v1/chat/sessions
Authorization: Bearer <token> (optional)
Content-Type: application/json

{}
```

**Response 200:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Get session details:**

```http
GET https://spiritest.duckdns.org/chat/v1/chat/sessions/{id}
Authorization: Bearer <token> (optional)
```

**Response 200:**
```json
{
  "session_id": "550e8400-...",
  "user_id": null,
  "status": "active",
  "message_count": 5,
  "tokens_input": 450,
  "tokens_output": 1200,
  "cost_usd_cents": 1,
  "started_at": "2026-06-01T08:30:00+07:00",
  "last_activity_at": "2026-06-01T08:35:00+07:00"
}
```

### 9.6 Important AI Notes

| Note | Detail |
|---|---|
| **Auth** | JWT required for `list_my_orders`. Without JWT, anonymous. |
| **Rate Limits** | 10 req/min, 100 req/hour, 50k tokens/session |
| **SSE Cache** | If client disconnects and reconnects within 5 min with same `session_id`, cached response returned. Header `X-Cache-Hit: true`. |
| **Streaming** | First round (before tool call) is token-by-token. After tool call, response is buffered then dumped as one chunk. |
| **Locale** | Always Vietnamese. |

---

## 10. Admin Analytics

All admin endpoints require JWT with `admin` or `staff` role.

### 10.1 Dashboard 🔒 Admin

```http
GET /admin/analytics/dashboard
Authorization: Bearer <token>
```

```json
{
  "total_revenue_vnd": 0,
  "total_orders": 0,
  "total_users": 4,
  "total_products": 21,
  "pending_orders": 0
}
```

### 10.2 Revenue 🔒 Admin

```http
GET /admin/analytics/revenue?days=30
Authorization: Bearer <token>
```

```json
{
  "total_vnd": 125000000,
  "by_date": [
    {"date": "2026-06-01", "revenue_vnd": 8500000, "orders": 3}
  ]
}
```

### 10.3 Top Products 🔒 Admin

```http
GET /admin/analytics/top-products?days=30&limit=10
Authorization: Bearer <token>
```

```json
[
  {
    "product_id": "b0000000-...",
    "slug": "ban-tho-go-huong-tam-gia-1m2",
    "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
    "total_sold": 42,
    "revenue_vnd": 357000000
  }
]
```

### 10.4 Orders by Status 🔒 Admin

```http
GET /admin/analytics/orders-by-status
Authorization: Bearer <token>
```

```json
{
  "pending_payment": 5,
  "paid": 3,
  "confirmed": 2,
  "fulfilling": 1,
  "shipped": 8,
  "delivered": 45,
  "cancelled": 4,
  "refunded": 2,
  "failed": 1
}
```

### 10.5 User Engagement 🔒 Admin

```http
GET /admin/analytics/user-engagement?days=30
Authorization: Bearer <token>
```

```json
{
  "product_views": {
    "total": 48,
    "daily_avg": 1.6,
    "by_date": [{"date": "2026-05-01", "count": 12}]
  },
  "searches": {
    "total": 23,
    "daily_avg": 0.8,
    "zero_result_count": 5,
    "zero_result_rate": 21.7,
    "top_queries": [
      {"query": "bàn thờ gỗ", "count": 8}
    ],
    "by_date": [...]
  },
  "add_to_carts": {
    "total": 15,
    "daily_avg": 0.5,
    "by_date": [...]
  },
  "cart_abandonment": {
    "rate": 33.3,
    "abandoned_count": 5,
    "completed_count": 10
  }
}
```

### 10.6 AI Usage 🔒 Admin

```http
GET /admin/analytics/ai-usage?days=30
Authorization: Bearer <token>
```

```json
{
  "sessions": {
    "total": 27,
    "active": 27,
    "by_date": [...]
  },
  "messages": {
    "total": 46,
    "daily_avg": 1.53,
    "by_date": [...]
  },
  "tokens": {
    "input_tokens": 0,
    "output_tokens": 1098,
    "total_cost_cents": 19
  },
  "tools": [
    {"tool_name": "search_products", "count": 35, "failures": 0},
    {"tool_name": "lookup_order", "count": 12, "failures": 2}
  ]
}
```

---

## Appendix: Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `ERR_VALIDATION` | 400 | Invalid input |
| `ERR_UNAUTHENTICATED` | 401 | Missing/invalid token |
| `ERR_FORBIDDEN` | 403 | Insufficient role |
| `ERR_NOT_FOUND` | 404 | Resource not found |
| `ERR_CONFLICT` | 409 | Cart stale or duplicate |
| `ERR_RATE_LIMITED` | 429 | Too many requests |
| `ERR_INTERNAL` | 500 | Server error |
| `ERR_LLM_UNAVAILABLE` | 503 | AI service down |
| `ERR_COUPON_INVALID` | 400 | Coupon not found |
| `ERR_COUPON_EXHAUSTED` | 422 | Coupon used up |
| `ERR_OUT_OF_STOCK` | 422 | Item unavailable |
| `ERR_CART_STALE` | 409 | Cart version mismatch |
| `ERR_ORDER_NOT_FOUND` | 404 | Order not found |
| `ERR_ILLEGAL_ORDER_TRANSITION` | 400 | Invalid status change |
| `ERR_PROMPT_INJECTION` | 400 | Input flagged as abuse |
| `ERR_TOKEN_BUDGET_BUST` | 429 | Token limit exceeded |

---

> **Document generated for frontend team — Spiritech SME Platform**
> Base URLs: `https://spiritest.duckdns.org` (ecom), `https://spiritest.duckdns.org/chat` (AI)
> Trợ lý An Tâm — trợ lý mua sắm thông minh
