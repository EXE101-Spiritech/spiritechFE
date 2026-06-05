# Checkout & Payment API

Base URL: `https://spiritest.duckdns.org`

---

## POST /v1/checkout 🔑 Auth

Place an order. Requires `Idempotency-Key` header to prevent double-charge.

```http
POST /v1/checkout
Authorization: Bearer <token>
Idempotency-Key: unique-key-uuid-v4
Content-Type: application/json

{
  "cart_id": "c0000000-...",
  "cart_version": 3,
  "warehouse_id": "d0000000-0000-0000-0000-000000000001",
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
  "note": "Giao giờ hành chính",
  "reservation_ttl_seconds": 900
}
```

**`payment_method` options:** `vnpay`, `payos`, `momo`, `zalopay`, `onepay`, `cod`, `bank_transfer`

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

**Error handling:**

| HTTP | Code | Meaning |
|---|---|---|
| 409 | `ERR_CART_STALE` | Cart version mismatch — re-fetch cart |
| 422 | `ERR_OUT_OF_STOCK` | Item unavailable |
| 422 | `ERR_COUPON_EXHAUSTED` | Coupon used up |

**Important rules:**

| Rule | Detail |
|---|---|
| **Idempotency-Key** | Required header. Prevents double-charge on retry. |
| **Cart Version** | Must match current server version. |
| **Shipping** | **Free.** Overridden to 0 server-side. |
| **Reservation TTL** | Stock reserved for 15min (default). |
| **Payment Redirect** | For PayOS, redirect user to `payment_redirect` URL immediately. |

---

## Price Calculation

```
Gross per line = unit_price × quantity
Discount       = proportional allocation (coupon: % or fixed)
Net per line   = Gross - Discount
Total          = SUM(Net)   (VAT and shipping = 0)
```

---

## PayOS Payment Flow

```
1. Checkout → returns payment_redirect URL
2. Redirect user to PayOS payment page
3. PayOS sends webhook → backend updates order status
4. User returns via return/cancel URL
```

**Webhook URL (PayOS-side config):** `https://spiritest.duckdns.org/v1/payments/payos/webhook`

**Return URLs (configured in .env):**

| URL | When |
|---|---|
| `GET /v1/payments/payos/return?orderCode=X&status=PAID` | Payment success |
| `GET /v1/payments/payos/cancel?orderCode=X` | User cancelled |

Both return URLs render styled HTML directly — no frontend needed.

### Frontend Integration

```typescript
const { payment_redirect, order_id } = await checkout();

// Open PayOS
window.location.href = payment_redirect;

// Poll order status
const pollInterval = setInterval(async () => {
  const order = await fetch(`/v1/orders/${order_id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await order.json();
  if (data.status === 'paid' || data.status === 'cancelled') {
    clearInterval(pollInterval);
    router.push(`/orders/${order_id}`);
  }
}, 3000);
```

---

## Webhook Verification

```http
GET /v1/payments/payos/webhook
```

**Response 200:**
```json
{"code": "00", "desc": "webhook ready"}
```
