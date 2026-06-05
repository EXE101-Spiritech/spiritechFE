# Product & Catalog API

Base URL: `https://spiritest.duckdns.org`

All public — no auth required. Optional auth may be added later for personalization.

---

## GET /v1/products 🔓 Public

```http
GET /v1/products?limit=20&cursor=
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "b0000000-0000-0000-0000-000000000001",
      "slug": "ban-tho-go-huong-tam-gia-1m2",
      "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
      "name_en": "Altar Table — Rosewood 1.2m",
      "base_price_vnd": 8500000,
      "vat_rate_bps": 0,
      "images": ["https://example.com/img/ban-tho-1.jpg"],
      "status": "active",
      "created_at": "2026-05-27T16:30:56.155927Z"
    }
  ],
  "total": 21
}
```

Cursor-based pagination. Use `next_cursor` from response for the next page.

---

## GET /v1/products/:slug 🔓 Public

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
  "vat_rate_bps": 0,
  "images": ["..."],
  "status": "active",
  "version": 1,
  "variants": [
    {
      "id": "v0000000-...",
      "sku": "SP-BT-001",
      "name": "Mặc định",
      "price_vnd": 8500000,
      "status": "active"
    }
  ]
}
```

---

## GET /v1/search/products 🔓 Public

```http
GET /v1/search/products?q=bàn thờ&category=ban-tho&page=1&size=10
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "sku": "SP-BT-001",
      "slug": "ban-tho-go-huong-tam-gia-1m2",
      "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
      "base_price_vnd": 8500000,
      "category_slug": "ban-tho",
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

## GET /v1/search/blogs 🔓 Public

```http
GET /v1/search/blogs?q=bàn thờ&page=1&size=10
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "title": "Cách chọn bàn thờ",
      "slug": "cach-chon-ban-tho",
      "excerpt": "Hướng dẫn chọn bàn thờ phù hợp...",
      "author": "Admin",
      "created_at": "2026-06-01",
      "_score": 0.92
    }
  ],
  "total": 3,
  "page": 1,
  "size": 10
}
```

---

## GET /v1/combos 🔓 Public

```http
GET /v1/combos
```

**Response 200:**
```json
[
  {
    "slug": "tet-2027",
    "name": "Combo Tết Đinh Mùi 2027",
    "description": "Trọn bộ bàn thờ và đồ thờ cúng.",
    "banner_url": "https://.../tet-2027.jpg",
    "starts_at": "2026-11-30T17:00:00Z",
    "expires_at": "2027-02-15T16:59:59Z",
    "product_count": 3
  }
]
```

---

## GET /v1/combos/:slug 🔓 Public

```http
GET /v1/combos/tet-2027
```

**Response 200:**
```json
{
  "slug": "tet-2027",
  "name": "Combo Tết Đinh Mùi 2027",
  "products": [
    {
      "sku": "SP-BT-001",
      "slug": "ban-tho-go-huong-tam-gia-1m2",
      "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
      "image_url": "https://.../ban-tho-1.jpg",
      "base_price_vnd": 8500000,
      "combo_price_vnd": 7650000,
      "discount_bps": 1000,
      "in_stock": true
    }
  ],
  "total_original_vnd": 36000000,
  "total_combo_vnd": 31300000,
  "savings_vnd": 4700000
}
```

---

## GET /v1/blogs 🔓 Public

```http
GET /v1/blogs?page=1&size=20
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "b0000000-...",
      "slug": "cach-chon-ban-tho",
      "title": "Cách chọn bàn thờ",
      "excerpt": "Hướng dẫn chọn bàn thờ phù hợp...",
      "image_url": "https://.../thumb.jpg",
      "author": "Admin",
      "status": "published",
      "created_at": "2026-06-01T08:00:00Z",
      "updated_at": "2026-06-01T08:00:00Z",
      "published_at": "2026-06-01T08:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "size": 20
}
```

---

## GET /v1/blogs/:slug 🔓 Public

```http
GET /v1/blogs/cach-chon-ban-tho
```

**Response 200:** Same shape as above but with full `content` (HTML/markdown body).

---

## GET /v1/coupons/:code 🔓 Public

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

**Response 400:**
```json
{
  "code": "ERR_COUPON_INVALID",
  "message": "coupon code not found"
}
```
