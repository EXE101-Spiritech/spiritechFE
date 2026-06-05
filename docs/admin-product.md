# Admin — Product API

Base URL: `https://spiritest.duckdns.org`

All endpoints require JWT with `admin` or `staff` role.

> **Elasticsearch indexing:** Products are auto-indexed on create, update, and delete.
> On server restart, a full re-index runs — this resolves `category_slug`, `category_name`,
> and `in_stock` which the realtime index skips for performance.

---

## Products

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/products` | Create product |
| `PUT` | `/admin/products/:id` | Update product |
| `DELETE` | `/admin/products/:id` | Delete product |

### POST /admin/products 🔒 Admin

```json
{
  "slug": "ban-tho-go-huong-tam-gia-1m2",
  "name": "Bàn Thờ Gỗ Hương Tăm 1m2",
  "name_en": "Altar Table — Rosewood 1.2m",
  "description": "...",
  "description_en": "...",
  "base_price_vnd": 8500000,
  "vat_rate_bps": 0,
  "weight_grams": 15000,
  "images": ["https://.../img1.jpg"],
  "category_id": "a0000000-...",
  "attributes": {"material": "gỗ hương"}
}
```

**Response 201:**
```json
{"product_id": "b0000000-...", "slug": "ban-tho-go-huong-tam-gia-1m2"}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | ✅ | Unique URL slug |
| `name` | string | ✅ | Product name (Vietnamese) |
| `name_en` | string | | English name |
| `description` | string | | Vietnamese description |
| `description_en` | string | | English description |
| `base_price_vnd` | int64 | ✅ | Base price in VND |
| `vat_rate_bps` | int32 | | VAT rate in bps, 0 = no VAT |
| `weight_grams` | int32 | | Product weight in grams |
| `images` | array | | Array of image URLs |
| `category_id` | uuid | | Category UUID |
| `attributes` | object | | Arbitrary JSON attributes |
| `sku` | string | | Auto-generated if empty (`SP-00001`, `SP-00002`, ...). Not unique. |

---

## Variants

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/products/:id/variants` | Add variant |

### POST /admin/products/:id/variants 🔒 Admin

```json
{
  "sku": "SP-BT-001-1m2",
  "name": "1m2",
  "price_vnd": 8500000,
  "attributes": {"color": "nâu"},
  "barcode": "8931234567890",
  "weight_grams": 15000
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `sku` | string | ✅ | SKU code. Not unique. |
| `name` | string | ✅ | Variant name |
| `price_vnd` | int64 | ✅ | Variant price in VND |
| `attributes` | object | | JSON attributes (color, size, etc.) |
| `barcode` | string | | Barcode |
| `weight_grams` | int32 | | Variant weight in grams |

---

## Upload Image

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/upload` | Upload product image to R2 |

Upload multipart form with `file` field. Returns:

```json
{"url": "https://r2.example.com/images/abc.jpg", "filename": "abc.jpg", "bytes": 123456}
```

### Product Creation Flow

1. **Upload images** via `POST /admin/upload` (one per call or a batch) → collect the returned `url` values
2. **Create product** via `POST /admin/products`, passing the collected URLs in the `images` array
