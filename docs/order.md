# Order API

Base URL: `https://spiritest.duckdns.org`

---

## GET /v1/orders/:id 🔑 Auth

Get order details.

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

---

## POST /v1/orders/:id/cancel 🔑 Auth

Cancel an order if it's in a cancellable state.

**Response 200:**
```json
{
  "order_id": "o0000000-...",
  "status": "cancelled",
  "reservations_released": 1
}
```

---

## Order Status Machine

```
pending_payment ──→ paid ──→ confirmed ──→ fulfilling ──→ shipped ──→ delivered
       │              │          │               │            │             │
       ├── cancelled  ├── refunded ←─────────────┴────────────┴── refunded  │
       │              │                                                    │
       └── failed ────┘                                          └── refunded
```

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
