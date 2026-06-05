# Cart API

Base URL: `https://spiritest.duckdns.org`

All endpoints require `Authorization: Bearer <token>`.

Uses **optimistic locking** via `cart_version`. Always read version before modifying.

---

## POST /v1/cart 🔑 Auth

Create a new shopping cart.

```json
{}
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

---

## GET /v1/cart/:id 🔑 Auth

Get cart state (current version, status).

**Response 200:**
```json
{
  "cart_id": "c0000000-...",
  "version": 3,
  "status": "open"
}
```

---

## POST /v1/cart/:id/items 🔑 Auth

Add a product variant to cart.

```json
{
  "variant_id": "v0000000-...",
  "quantity": 1
}
```

**Response 200:**
```json
{
  "cart_id": "c0000000-...",
  "variant_id": "v0000000-...",
  "quantity": 1
}
```

---

## DELETE /v1/cart/:id/items/:variant_id 🔑 Auth

Remove an item from cart.

**Response 204:** No content.

---

## Optimistic Locking

```typescript
// Always fetch cart before checkout to get latest version
const cart = await fetch(`/v1/cart/${cartId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
const { version } = await cart.json();
// Pass version to checkout
```
