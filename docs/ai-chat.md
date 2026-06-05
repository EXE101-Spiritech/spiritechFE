# AI Chat Service API

Base URL: `https://spiritest.duckdns.org/chat` (Traefik strips `/chat` prefix)

---

## POST /v1/chat/stream 🔓 Public (🔑 Optional auth)

Server-Sent Events (SSE) streaming endpoint.

```http
POST https://spiritest.duckdns.org/chat/v1/chat/stream
Content-Type: application/json
Authorization: Bearer <token>  // optional

{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "có bán bàn thờ gỗ không?"
}
```

If no `session_id`, one is auto-generated and returned in the final event.

---

## SSE Event Types

Each event is `event: message` with a JSON `data` field.

### Text Chunk

```
data: {"chunk":"Dạ,","done":false}
data: {"chunk":" mình","done":false}
data: {"chunk":" tìm","done":false}
```

Append each `chunk` to build the response text.

### Tool Call Event

```
data: {"chunk":"","done":false,"tool_calls":["search_products"]}
```

Optionally show a "🔍 Đang tìm kiếm..." indicator.

### Product Cards Event

```
data: {"chunk":"","done":false,"product_cards":[
  {"slug":"ban-tho-go-huong-tam-gia-1m2","name":"Bàn Thờ Gỗ Hương Tăm 1m2","price_vnd":8500000,"image_url":"https://...","in_stock":true}
]}
```

Render as clickable product cards.

### Final Event

```
data: {"chunk":"","done":true,"tokens_used":114,"tool_calls":["search_products"],"session_id":"550e8400-..."}
```

| Field | Type | Description |
|---|---|---|
| `done` | boolean | `true` = stream ended |
| `tokens_used` | number | Total tokens consumed |
| `tool_calls` | string[] | Tools called in this turn |
| `session_id` | string | Session UUID (for next request) |
| `error` | string | Error message (on failure) |
| `error_code` | string | Machine error code (on failure) |

### Error Event

```
data: {"chunk":"","done":true,"error":"rate limit exceeded","error_code":"ERR_RATE_LIMITED"}
```

---

## Tool Calling

The LLM handles tool execution server-side. Frontend only receives event indicators.

| Tool | Description |
|---|---|
| `search_products` | Tìm sản phẩm |
| `get_product` | Xem chi tiết |
| `check_stock` | Kiểm tra tồn kho |
| `list_categories` | Danh mục |
| `lookup_order` | Tra cứu đơn |
| `list_my_orders` | Đơn hàng của tôi |
| `cancel_order` | Hủy đơn |
| `check_coupon` | Mã giảm giá |
| `create_ticket` | Tạo ticket hỗ trợ |

---

## Session Management

### POST /v1/chat/sessions 🔓 Public

Create a new chat session.

```http
POST https://spiritest.duckdns.org/chat/v1/chat/sessions

{}
```

**Response 200:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### GET /v1/chat/sessions/{id} 🔓 Public

```http
GET https://spiritest.duckdns.org/chat/v1/chat/sessions/{id}
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

### GET /v1/chat/sessions/{id}/messages 🔓 Public

Fetch all past messages for a session. Restores chat history on page reload.

```http
GET https://spiritest.duckdns.org/chat/v1/chat/sessions/{id}/messages
```

**Response 200:**
```json
[
  {"role": "user", "content": "có bán bàn thờ không?"},
  {"role": "assistant", "content": "Dạ có bạn ơi!..."}
]
```

---

## Important Notes

| Note | Detail |
|---|---|
| **Auth** | JWT required for `list_my_orders`. Without JWT, anonymous. |
| **Rate Limits** | 10 req/min, 100 req/hour, 50k tokens/session |
| **SSE Cache** | If client reconnects within 5 min with same `session_id`, cached response returned. |
| **Locale** | Always Vietnamese. |
