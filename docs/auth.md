# Auth API

Base URL: `https://spiritest.duckdns.org`

## Auth Requirements

| Badge | Meaning |
|---|---|
| 🔓 Public | No auth required |
| 🔑 Auth | Requires `Authorization: Bearer <token>` header |

---

## POST /v1/auth/register 🔓 Public

```json
{
  "phone": "0941237430",
  "password": "admin123",
  "full_name": "Nguyễn Văn A"
}
```

**Response 201:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "cQhjYByINpuG65D5RT7nkYxxeRe1dTfwwyx2NvLMQ1w",
  "user": {
    "id": "eeeeeeee-0000-0000-0000-000000000001",
    "role": "admin",
    "tier": "standard",
    "locale": "vi-VN"
  }
}
```

**Response 409:** Phone already registered.

---

## POST /v1/auth/login 🔓 Public

```json
{
  "phone": "0941237430",
  "password": "admin123"
}
```

**Response 200:** Same as register.

**Response 401:**
```json
{
  "code": "ERR_INVALID_CREDENTIALS",
  "message": "invalid phone or password"
}
```

---

## POST /v1/auth/refresh 🔓 Public

```json
{
  "refresh_token": "cQhjYByINpuG65D5RT7nkYxxeRe1dTfwwyx2NvLMQ1w"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "new-refresh-token-value"
}
```

Refresh tokens are one-time use. Each refresh rotates both tokens.

---

## POST /v1/auth/otp/request 🔓 Public

```json
{"phone": "0941237430"}
```

**Response 200:**
```json
{"expires_in": 300}
```

---

## POST /v1/auth/otp/verify 🔓 Public

```json
{"phone": "0941237430", "code": "123456"}
```

**Response 200:** Token pair (same shape as register).

---

## POST /v1/logout 🔑 Auth

```json
{"refresh_token": "cQhjYByINpuG65D5RT7nkYxxeRe1dTfwwyx2NvLMQ1w"}
```

**Response 204:** No content.

---

## GET /v1/sessions 🔑 Auth

**Response 200:**
```json
[
  {
    "family_id": "f0000000-0000-0000-0000-000000000001",
    "device_fingerprint": "...",
    "created_at": "2026-06-01T08:00:00Z",
    "expires_at": "2026-06-15T08:00:00Z",
    "is_current": true
  }
]
```

---

## Token Storage

```typescript
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// Attach to requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
}

// Refresh on 401
async function refreshToken() {
  const res = await fetch('/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: localStorage.getItem('refresh_token')
    })
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data.access_token;
  }
  // Redirect to login
}
```

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `ERR_VALIDATION` | 400 | Invalid input |
| `ERR_UNAUTHENTICATED` | 401 | Missing/invalid token |
| `ERR_FORBIDDEN` | 403 | Insufficient role |
| `ERR_NOT_FOUND` | 404 | Resource not found |
| `ERR_CONFLICT` | 409 | Duplicate / cart stale |
| `ERR_RATE_LIMITED` | 429 | Too many requests |
| `ERR_INTERNAL` | 500 | Server error |
