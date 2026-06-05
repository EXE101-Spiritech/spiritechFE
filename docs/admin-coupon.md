# Admin — Coupon API

Base URL: `https://spiritest.duckdns.org`

All endpoints require JWT with `admin` or `staff` role.

---

## Coupons

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/coupons` | List all coupons |
| `POST` | `/admin/coupons` | Create coupon |
| `DELETE` | `/admin/coupons/:id` | Delete coupon |

---

## POST /admin/coupons 🔒 Admin

```json
{
  "code": "TET2027",
  "discount_type": "percent",
  "discount_value": 1000,
  "min_order_vnd": 500000,
  "max_uses": 100,
  "expires_at": "2027-02-15T16:59:59Z"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `code` | string | ✅ | Unique coupon code |
| `discount_type` | string | ✅ | `"percent"` or `"fixed"` |
| `discount_value` | int64 | ✅ | In bps for percent (1000 = 10%), VND for fixed |
| `min_order_vnd` | int64 | | Minimum order subtotal |
| `max_uses` | int32 | | `null` = unlimited |
| `expires_at` | string | | RFC3339 timestamp |

**Response 201:** The created coupon object.
