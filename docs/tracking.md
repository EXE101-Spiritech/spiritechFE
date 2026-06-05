# Event Tracking API

Base URL: `https://spiritest.duckdns.org`

Fire-and-forget endpoint for frontend telemetry. No auth required, returns 202 immediately.

---

## POST /v1/track 🔓 Public

```http
POST /v1/track
Content-Type: application/json

{
  "event_type": "checkout.step_payment",
  "payload": {
    "cart_id": "c0000000-...",
    "payment_method": "payos"
  }
}
```

**Response 202:**
```json
{"status": "accepted"}
```

---

## Events to Track

| Event | When to fire | Payload |
|---|---|---|
| `checkout.step_cart` | User enters checkout | `cart_id` |
| `checkout.step_address` | User fills address | `cart_id` |
| `checkout.step_payment` | User selects payment | `cart_id`, `payment_method` |
| `page.exited` | User leaves page with cart items | `cart_id`, `item_count` |
| `product.card_clicked` | User clicks AI-recommended product | `session_id`, `product_slug` |
| `ai.feedback` | User rates AI response | `session_id`, `rating`, `message_id` |

---

## TypeScript Helper

```typescript
function track(eventType: string, payload: Record<string, any> = {}) {
  fetch('https://spiritest.duckdns.org/v1/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: eventType, payload })
  }).catch(() => {});
}
```
