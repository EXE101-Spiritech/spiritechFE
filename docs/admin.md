# Admin API

Base URL: `https://spiritest.duckdns.org`

All endpoints require JWT with `admin` or `staff` role.

---

## Analytics

Revenue counted from `payments` with `status = 'captured'` only.
Cancelled, failed, and refunded payments are excluded.

**Pending orders** = orders with status `paid`, `confirmed`, or `fulfilling`.

### GET /admin/analytics/dashboard 🔒 Admin

```http
GET /admin/analytics/dashboard
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

### GET /admin/analytics/revenue 🔒 Admin

```http
GET /admin/analytics/revenue?days=30
```

```json
{
  "total_vnd": 125000000,
  "by_date": [
    {"date": "2026-06-01", "revenue_vnd": 8500000, "orders": 3}
  ]
}
```

### GET /admin/analytics/top-products 🔒 Admin

```http
GET /admin/analytics/top-products?days=30&limit=10
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

### GET /admin/analytics/orders-by-status 🔒 Admin

```http
GET /admin/analytics/orders-by-status
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

### GET /admin/analytics/user-engagement 🔒 Admin

```http
GET /admin/analytics/user-engagement?days=30
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
    "top_queries": [{"query": "bàn thờ gỗ", "count": 8}],
    "by_date": []
  },
  "add_to_carts": {
    "total": 15,
    "daily_avg": 0.5,
    "by_date": []
  },
  "cart_abandonment": {
    "rate": 33.3,
    "abandoned_count": 5,
    "completed_count": 10
  }
}
```

### GET /admin/analytics/ai-usage 🔒 Admin

```http
GET /admin/analytics/ai-usage?days=30
```

```json
{
  "sessions": { "total": 27, "active": 27, "by_date": [] },
  "messages": { "total": 46, "daily_avg": 1.53, "by_date": [] },
  "tokens": { "input_tokens": 0, "output_tokens": 1098, "total_cost_cents": 19 },
  "tools": [
    {"tool_name": "search_products", "count": 35, "failures": 0}
  ]
}
```

---

## Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/categories` | List all |
| `POST` | `/admin/categories` | Create |
| `PUT` | `/admin/categories/:id` | Update |
| `DELETE` | `/admin/categories/:id` | Delete |

---

## Inventory

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/inventory/receive` | Receive stock |
| `POST` | `/admin/inventory/adjust` | Adjust stock |

---

## Orders (Admin)

| Method | Endpoint | Description |
|---|---|---|
| `PATCH` | `/admin/orders/:id/shipping` | Set carrier + tracking number |
| `PATCH` | `/admin/orders/:id/status` | Advance order status |

### PATCH /admin/orders/:id/shipping 🔒 Admin

```json
{
  "carrier": "GHN",
  "tracking": "GHN123456789"
}
```

### PATCH /admin/orders/:id/status 🔒 Admin

Advance to the next valid status. Server validates transitions per the order status machine.

---

## Combos (Admin)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/combos` | Create combo |
| `PATCH` | `/admin/combos/:id` | Update combo |
| `DELETE` | `/admin/combos/:id` | Delete combo |
