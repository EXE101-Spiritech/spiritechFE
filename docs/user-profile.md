# User Profile API

Base URL: `https://spiritest.duckdns.org`

All endpoints require `Authorization: Bearer <token>`.

---

## GET /v1/me 🔑 Auth

Get the current user's profile. Returns empty stubs if no profile saved yet.

**Response 200:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "a@gmail.com",
  "phone": "0941237430",
  "address": "123 Nguyễn Huệ, Q1, HCM"
}
```

---

## PUT /v1/me 🔑 Auth

Partial update — only send the fields you want to change.

```json
{
  "name": "Nguyễn Văn B",
  "email": "b@gmail.com",
  "address": "456 Lê Lợi, Q1, HCM"
}
```

**Response 200:** Full profile after update (same shape as GET).

| Field | Type | Notes |
|---|---|---|
| `name` | string | Display name |
| `email` | string | For event notifications |
| `phone` | string | Mirrors auth phone |
| `address` | string | Free-form address |
