# Admin — Blog API

Base URL: `https://spiritest.duckdns.org`

---

## Blog CRUD (Admin)

All admin endpoints require JWT with `admin` or `staff` role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/blogs` | List all blogs (filter by `?status=`) |
| `POST` | `/admin/blogs` | Create blog |
| `GET` | `/admin/blogs/:id` | Get by ID |
| `PUT` | `/admin/blogs/:id` | Update blog |
| `DELETE` | `/admin/blogs/:id` | Delete blog (soft delete) |

---

### POST /admin/blogs 🔒 Admin

```json
{
  "slug": "cach-chon-ban-tho",
  "title": "Cách chọn bàn thờ",
  "content": "<h1>Hướng dẫn...</h1>",
  "excerpt": "Hướng dẫn chọn bàn thờ phù hợp...",
  "image_url": "https://.../thumb.jpg",
  "author": "Admin",
  "status": "published"
}
```

**Response 201:**
```json
{
  "id": "b0000000-...",
  "slug": "cach-chon-ban-tho",
  "title": "Cách chọn bàn thờ",
  "content": "<h1>Hướng dẫn...</h1>",
  "excerpt": "Hướng dẫn chọn bàn thờ...",
  "image_url": "https://.../thumb.jpg",
  "author": "Admin",
  "status": "published",
  "created_at": "2026-06-01T08:00:00Z",
  "updated_at": "2026-06-01T08:00:00Z",
  "published_at": "2026-06-01T08:00:00Z"
}
```

### PUT /admin/blogs/:id 🔒 Admin

Partial update — send only fields to change.

### DELETE /admin/blogs/:id 🔒 Admin

**Response 204:** No content.

---

## Blog Fields

| Field | Type | Notes |
|---|---|---|
| `slug` | string | Unique URL slug |
| `title` | string | Blog title |
| `content` | string | HTML or markdown body |
| `excerpt` | string | Short preview text |
| `image_url` | string | Featured image |
| `author` | string | Author name |
| `status` | string | `draft`, `published`, or `archived` |

Publishing logic: setting status to `published` auto-sets `published_at` if null.
