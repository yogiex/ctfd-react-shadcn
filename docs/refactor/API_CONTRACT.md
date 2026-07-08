# API Contract — CTFd Frontend (React SPA) to Backend (Flask)

> **File:** `docs/refactor/API_CONTRACT.md`
> **Last Updated:** 2026-07-08
> **Purpose:** Single source of truth for every REST API endpoint consumed by the React SPA frontend.
> **Conventions:**
> - Base URL for API v1: `/api/v1` (prefixed by `urlRoot` from init data)
> - All non-GET requests require `CSRF-Token: <nonce>` header
> - All responses use `Content-Type: application/json` unless noted
> - Auth routes (`/login`, `/register`, `/setup`, `/auth/*`, `/teams/*`) are **HTML responses** with redirects, not JSON API

---

## Common Headers (All API v1 Calls)

```
Content-Type: application/json          (for POST/PATCH/PUT with JSON body)
CSRF-Token: <nonce>                    (all non-GET requests)
Accept: application/json               (all requests)
```

## Common Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Success (paginated):**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "next": 2,
      "prev": null,
      "pages": 5,
      "per_page": 50,
      "total": 203
    }
  }
}
```

**Error:**
```json
{
  "success": false,
  "errors": { "field": ["Error message"] }
}
```

---

# 1. Inisialisasi & Setup

## 1.1 GET /init-data

**Frontend File:** `frontend/src/lib/api/client.ts` (line 28)
**Backend File:** `CTFd/views.py` (line 557)

**Deskripsi:** Mengembalikan data inisialisasi untuk React SPA — CSRF nonce, user info, konfigurasi dasar. Dipanggil sekali saat aplikasi dimulai.

**Headers Required:**
- `Accept: application/json`

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "urlRoot": "",
    "csrfNonce": "a1b2c3d4e5f6...",
    "userMode": "users",
    "userId": 1,
    "userName": "admin",
    "userEmail": "admin@ctfd.local",
    "userVerified": true,
    "isAdmin": true,
    "teamId": null,
    "teamName": null,
    "start": "2025-01-01T00:00:00",
    "end": "2025-12-31T23:59:59",
    "themeSettings": {}
  }
}
```

**Authentication:** None (public; data adjusts based on session)

---

## 1.2 GET /setup (views)

**Frontend File:** `frontend/src/features/setup/pages/SetupPage.tsx` (line 60)
**Backend File:** `CTFd/views.py` (line 65)

**Deskripsi:** Mengecek apakah setup sudah dilakukan. Frontend menggunakan `GET /api/v1/users?view=admin` sebagai pengecekan — jika total users > 0, dianggap sudah setup.

**Request:**
```
GET /api/v1/users?view=admin
```

**Authentication:** None

---

## 1.3 POST /setup

**Frontend File:** `frontend/src/features/setup/pages/SetupPage.tsx` (line 137)
**Backend File:** `CTFd/views.py` (line 65)

**Deskripsi:** Melakukan inisialisasi CTFd — membuat admin account, konfigurasi dasar, dan halaman index. **Bukan JSON API; menggunakan form-urlencoded.**

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
name=admin&email=admin@ctfd.local&password=admin123&ctf_name=CTFd+PuTI&ctf_description=Platform+CTF&user_mode=users&nonce=abc123
```

**Response:** HTTP 302 redirect ke `/` pada sukses. HTML dengan error jika gagal.

**Authentication:** None (bypass CSRF)

---

# 2. Auth (Form-based, HTML Responses)

Auth endpoints menggunakan `application/x-www-form-urlencoded` dan mengembalikan **HTML** (bukan JSON). Frontend memparsing HTML untuk error.

## 2.1 POST /login

**Frontend File:** `frontend/src/features/auth/hooks/useLogin.ts` (line 28)
**Backend File:** `CTFd/auth.py` (line 442)

**Deskripsi:** Login user. Mengembalikan redirect atau halaman login dengan error.

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
name=admin&password=admin123&_submit=Submit&nonce=abc123
```

**Response:** HTTP 302 redirect ke `/challenges` pada sukses. HTML 200 dengan error jika gagal.

**Rate Limit:** 10 request per 5 detik (per IP)

**Authentication:** None

---

## 2.2 POST /auth/register

**Frontend File:** `frontend/src/features/auth/hooks/useRegister.ts` (line 30)
**Backend File:** `CTFd/auth.py` (line 236)

**Deskripsi:** Registrasi user baru. Mengembalikan redirect atau halaman register dengan error.

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
name=user1&email=user1@example.com&password=password123&nonce=abc123
```

**Response:** HTTP 302 redirect ke `/challenges` atau `/auth/confirm` (jika verifikasi email aktif) pada sukses. HTML 200 dengan error jika gagal.

**Rate Limit:** 10 request per 5 detik

**Authentication:** None

---

## 2.3 POST /auth/confirm

**Frontend File:** `frontend/src/features/auth/hooks/useConfirm.ts` (line 21)
**Backend File:** `CTFd/auth.py` (line 37)

**Deskripsi:** Mengirim ulang email konfirmasi. (GET untuk verifikasi token konfirmasi via email link.)

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
nonce=abc123
```

**Response:** HTTP 302 redirect pada sukses.

**Rate Limit:** 10 POST per 60 detik

**Authentication:** Required (session)

---

## 2.4 POST /auth/reset_password

**Frontend File:** `frontend/src/features/auth/hooks/useResetPassword.ts` (line 25)
**Backend File:** `CTFd/auth.py` (line 119)

**Deskripsi:** Meminta reset password via email.

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
email=user@example.com&nonce=abc123
```

**Response:** HTTP 302 redirect pada sukses.

**Rate Limit:** 10 POST per 60 detik

**Authentication:** None

---

## 2.5 POST /auth/reset_password/{token}

**Frontend File:** `frontend/src/features/auth/hooks/useResetPassword.ts` (line 61)
**Backend File:** `CTFd/auth.py` (line 119)

**Deskripsi:** Mengkonfirmasi reset password dengan token dari email.

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
password=newpassword123&nonce=abc123
```

**Response:** HTTP 302 redirect ke `/login` pada sukses.

**Authentication:** None (token-based)

---

## 2.6 GET /logout

**Frontend File:** Belum ada hook terpisah (bisa via window.location)
**Backend File:** `CTFd/auth.py` (line 678)

**Deskripsi:** Logout user dan redirect ke halaman utama.

**Response:** HTTP 302 redirect ke `/`

**Authentication:** Required

---

## 2.7 GET /oauth

**Frontend File:** N/A (server-side redirect)
**Backend File:** `CTFd/auth.py` (line 518)

**Deskripsi:** Redirect ke OAuth provider (MajorLeagueCyber) untuk login.

**Response:** HTTP 302 redirect ke OAuth provider.

---

# 3. Team HTML Routes (Form-based)

## 3.1 POST /teams/new

**Frontend File:** `frontend/src/features/teams/hooks/useCreateTeam.ts` (line 42)
**Backend File:** `CTFd/teams.py` (line 188)

**Deskripsi:** Membuat tim baru. Form-urlencoded, redirect on success.

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
name=teamname&password=teampass&website=https://...&affiliation=Univ&country=ID&bracket_id=1&nonce=abc123
```

**Response:** HTTP 302 redirect ke `/challenges` pada sukses.

**Authentication:** Required (authed_only)

---

## 3.2 POST /teams/join

**Frontend File:** `frontend/src/features/teams/hooks/useJoinTeam.ts` (line 23)
**Backend File:** `CTFd/teams.py` (line 124)

**Deskripsi:** Bergabung ke tim yang sudah ada menggunakan password.

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Request Body:**
```
name=teamname&password=teampass&nonce=abc123
```

**Response:** HTTP 302 redirect ke `/challenges` pada sukses.

**Rate Limit:** 10 POST per 5 detik

**Authentication:** Required

---

## 3.3 POST /teams/invite?code={code}

**Frontend File:** `frontend/src/features/teams/hooks/useAcceptInvite.ts` (line 20)
**Backend File:** `CTFd/teams.py` (line 56)

**Deskripsi:** Menerima invite code untuk bergabung ke tim.

**Headers Required:**
- `Content-Type: application/x-www-form-urlencoded`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | Invite code |

**Response:** HTTP 302 redirect ke `/challenges` pada sukses.

**Authentication:** Required

---

## 3.4 GET /teams/invite?code={code}

**Frontend File:** `frontend/src/features/teams/pages/TeamInvitePage.tsx` (line 20)
**Backend File:** `CTFd/teams.py` (line 56)

**Deskripsi:** Mendapatkan informasi tim dari invite code (nama tim).

**Headers Required:**
- `Accept: application/json` (tapi endpoint ini mengembalikan HTML)

**Response:** HTML pada sukses.

**Authentication:** Required

---

# 4. API Challenges

## 4.1 GET /api/v1/challenges

**Frontend File:** `frontend/src/features/challenges/hooks/useChallenges.ts` (line 9)
**Backend File:** `CTFd/api/v1/challenges.py` (line 107)

**Deskripsi:** Mendapatkan daftar semua challenge yang visible.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | No | null | Filter by name |
| `category` | string | No | null | Filter by category |
| `type` | string | No | null | Filter by type (standard, dynamic) |
| `state` | string | No | null | Filter by state (admin only) |
| `value` | int | No | null | Filter by value |
| `max_attempts` | int | No | null | Filter by max_attempts |
| `q` | string | No | null | Search query |
| `field` | string | No | null | Search field (name, description, category, type, state) |
| `view` | string | No | null | `admin` untuk admin view |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "standard",
      "name": "Baby's First",
      "value": 100,
      "position": 1,
      "solves": 42,
      "solved_by_me": false,
      "category": "Web",
      "tags": ["web", "easy"],
      "template": "/plugins/challenges/assets/view.html",
      "script": "/plugins/challenges/assets/view.js"
    }
  ]
}
```

**Authentication:** Depends on challenge visibility config

---

## 4.2 POST /api/v1/challenges

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 58)
**Backend File:** `CTFd/api/v1/challenges.py` (line 265)

**Deskripsi:** Membuat challenge baru. Admin only.

**Request Body:**
```json
{
  "name": "New Challenge",
  "category": "Web",
  "value": 500,
  "description": "Challenge description",
  "type": "standard",
  "max_attempts": 0,
  "state": "hidden"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New Challenge",
    "type": "standard",
    "value": 500,
    "category": "Web",
    "state": "hidden",
    "max_attempts": 0,
    "description": "Challenge description",
    "connection_info": null,
    "next_id": null
  }
}
```

**Authentication:** Admin

---

## 4.3 GET /api/v1/challenges/types

**Frontend File:** `frontend/src/features/admin/plugin/hooks/useChallengeTypes.ts` (line 14)
**Backend File:** `CTFd/api/v1/challenges.py` (line 300)

**Deskripsi:** Mendapatkan semua tipe challenge yang terdaftar (standard, dynamic, dll).

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "standard": {
      "id": "standard",
      "name": "Standard",
      "templates": {
        "create": "/plugins/challenges/assets/create.html",
        "update": "/plugins/challenges/assets/update.html",
        "view": "/plugins/challenges/assets/view.html"
      },
      "scripts": {
        "create": "/plugins/challenges/assets/create.js",
        "update": "/plugins/challenges/assets/update.js",
        "view": "/plugins/challenges/assets/view.js"
      },
      "create": "<form>...</form>"
    },
    "dynamic": {
      "id": "dynamic",
      "name": "Dynamic Value",
      "templates": { ... },
      "scripts": { ... },
      "create": "<form>...</form>"
    }
  }
}
```

**Authentication:** Admin

---

## 4.4 GET /api/v1/challenges/{challenge_id}

**Frontend File:** `frontend/src/features/challenges/hooks/useChallengeDetail.ts` (line 9)
**Backend File:** `CTFd/api/v1/challenges.py` (line 320)

**Deskripsi:** Mendapatkan detail lengkap sebuah challenge termasuk hint, files, tags, dan rating.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "standard",
    "name": "Baby's First",
    "value": 100,
    "category": "Web",
    "solves": 42,
    "solved_by_me": false,
    "attempts": 3,
    "max_attempts": 10,
    "description": "<p>Find the flag!</p>",
    "connection_info": "http://example.com",
    "next_id": 2,
    "files": [
      "/files/abc123/flag.txt?token=xxx"
    ],
    "tags": ["web", "easy"],
    "hints": [
      { "id": 1, "cost": 0, "title": "Hint 1", "content": "Look harder" },
      { "id": 2, "cost": 50, "title": "Hint 2" }
    ],
    "view": "<div>...</div>",
    "template": "/plugins/challenges/assets/view.html",
    "script": "/plugins/challenges/assets/view.js",
    "solution_id": null,
    "solution_state": "hidden",
    "rating": { "value": 1, "review": "Great challenge!" },
    "ratings": { "up": 10, "down": 2, "count": 12 }
  }
}
```

**Authentication:** Depends on challenge visibility

---

## 4.5 PATCH /api/v1/challenges/{challenge_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 69)
**Backend File:** `CTFd/api/v1/challenges.py` (line 595)

**Deskripsi:** Mengupdate challenge. Admin only.

**Request Body (partial):**
```json
{
  "name": "Updated Name",
  "value": 200,
  "state": "visible"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Authentication:** Admin

---

## 4.6 DELETE /api/v1/challenges/{challenge_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 81)
**Backend File:** `CTFd/api/v1/challenges.py` (line 630)

**Deskripsi:** Menghapus challenge. Admin only.

**Response Success (200):**
```json
{ "success": true }
```

**Authentication:** Admin

---

## 4.7 POST /api/v1/challenges/attempt

**Frontend File:** `frontend/src/features/challenges/hooks/useSubmitFlag.ts` (line 10)
**Backend File:** `CTFd/api/v1/challenges.py` (line 646)

**Deskripsi:** Mengirimkan jawaban (flag) untuk sebuah challenge.

**Request Body:**
```json
{
  "challenge_id": 1,
  "submission": "flag{example_flag}"
}
```

**Response Success — Correct:**
```json
{
  "success": true,
  "data": {
    "status": "correct",
    "message": "Correct!"
  }
}
```

**Response — Incorrect:**
```json
{
  "success": true,
  "data": {
    "status": "incorrect",
    "message": "Incorrect. You have 2 tries remaining."
  }
}
```

**Response — Already Solved:**
```json
{
  "success": true,
  "data": {
    "status": "already_solved",
    "message": "Correct! but you already solved this"
  }
}
```

**Response — Ratelimited:**
```json
{
  "success": true,
  "data": {
    "status": "ratelimited",
    "message": "You're submitting flags too fast. Try again in 30 seconds."
  }
}
```

**Response — Paused:**
```json
{
  "success": true,
  "data": {
    "status": "paused",
    "message": "CTF is paused"
  }
}
```

**Authentication:** Required

---

## 4.8 GET /api/v1/challenges/{challenge_id}/solves

**Frontend File:** `frontend/src/features/challenges/hooks/useChallengeSolves.ts` (line 9)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1014)

**Deskripsi:** Mendapatkan daftar solve untuk sebuah challenge.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "account_id": 1,
      "account_url": "/users/1",
      "name": "user1",
      "date": "2025-01-15T10:30:00+00:00",
      "score": 100
    }
  ]
}
```

**Authentication:** Depends on visibility settings

---

## 4.9 GET /api/v1/challenges/{challenge_id}/files

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 181)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1043)

**Deskripsi:** Mendapatkan daftar file untuk sebuah challenge. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "challenge",
      "location": "abc123/file.txt",
      "sha1sum": "da39a3ee5e6b4b0d3255bfef95601890afd80709"
    }
  ]
}
```

**Authentication:** Admin

---

## 4.10 GET /api/v1/challenges/{challenge_id}/tags

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 215)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1065)

**Deskripsi:** Mendapatkan tags untuk sebuah challenge. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "challenge_id": 1, "value": "web" }
  ]
}
```

**Authentication:** Admin

---

## 4.11 GET /api/v1/challenges/{challenge_id}/topics

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 245)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1080)

**Deskripsi:** Mendapatkan topics untuk sebuah challenge. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "challenge_id": 1,
      "topic_id": 1,
      "value": "Cryptography"
    }
  ]
}
```

**Authentication:** Admin

---

## 4.12 GET /api/v1/challenges/{challenge_id}/hints

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 139)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1100)

**Deskripsi:** Mendapatkan daftar hint untuk sebuah challenge. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "challenge_id": 1, "type": "standard", "title": "Hint 1", "content": "Look here", "cost": 0 }
  ]
}
```

**Authentication:** Admin

---

## 4.13 GET /api/v1/challenges/{challenge_id}/flags

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 98)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1114)

**Deskripsi:** Mendapatkan daftar flag untuk sebuah challenge. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "challenge_id": 1, "type": "static", "content": "flag{...}", "data": "" }
  ]
}
```

**Authentication:** Admin

---

## 4.14 GET /api/v1/challenges/{challenge_id}/requirements

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 284)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1128)

**Deskripsi:** Mendapatkan requirements (prerequisites) untuk sebuah challenge. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "prerequisites": [1, 2],
    "anonymize": "preview"
  }
}
```

**Authentication:** Admin

---

## 4.15 PUT /api/v1/challenges/{challenge_id}/ratings

**Frontend File:** `frontend/src/features/challenges/hooks/useRating.ts` (line 9)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1183)

**Deskripsi:** Memberikan rating (upvote/downvote) pada sebuah challenge. User harus sudah menyelesaikan challenge.

**Request Body:**
```json
{
  "value": 1,
  "review": "Great challenge!"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "challenge_id": 1,
    "value": 1,
    "review": "Great challenge!",
    "date": "2025-01-15T10:30:00+00:00"
  }
}
```

**Authentication:** Required (authed_only)

---

## 4.16 GET /api/v1/challenges/{challenge_id}/ratings

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 351)
**Backend File:** `CTFd/api/v1/challenges.py` (line 1136)

**Deskripsi:** Mendapatkan daftar rating untuk sebuah challenge (dengan pagination). Admin only.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | 1 | Halaman pagination |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "challenge_id": 1,
      "value": 1,
      "review": "Great!",
      "date": "2025-01-15T10:30:00+00:00",
      "user": { "name": "user1" }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "next": 2,
      "prev": null,
      "pages": 5,
      "per_page": 50,
      "total": 203
    },
    "summary": {
      "up": 10,
      "down": 2,
      "count": 12
    }
  }
}
```

**Authentication:** Admin

---

## 4.17 GET /api/v1/challenges/{challenge_id}/solution

**Frontend File:** Belum ada hook terpisah
**Backend File:** `CTFd/api/v1/challenges.py` (line 1278)

**Deskripsi:** Mendapatkan informasi solution untuk sebuah challenge (apakah solution visible untuk user).

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "state": "visible"
  }
}
```

**Authentication:** Required

---

# 5. API Scoreboard

## 5.1 GET /api/v1/scoreboard

**Frontend Files:**
- `frontend/src/features/scoreboard/hooks/useScoreboard.ts` (line 9)
- `frontend/src/features/admin/scoreboard/pages/AdminScoreboardPage.tsx` (line 29)

**Backend File:** `CTFd/api/v1/scoreboard.py` (line 23)

**Deskripsi:** Mendapatkan standings/scoreboard. Di-cache selama 60 detik.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "pos": 1,
      "account_id": 1,
      "account_url": "/users/1",
      "account_type": "users",
      "oauth_id": null,
      "name": "admin",
      "score": 1500,
      "bracket_id": null,
      "bracket_name": null,
      "members": [
        { "id": 1, "oauth_id": null, "name": "member1", "score": 500, "bracket_id": null, "bracket_name": null }
      ]
    }
  ]
}
```

> **Catatan:** `members` hanya muncul jika mode teams. Setiap entry memiliki `pos` (peringkat 1-indexed).

**Authentication:** Depends on score/account visibility

---

## 5.2 GET /api/v1/scoreboard/top/{count}

**Frontend File:** `frontend/src/features/scoreboard/hooks/useScoreboard.ts` (line 18)
**Backend File:** `CTFd/api/v1/scoreboard.py` (line 89)

**Deskripsi:** Mendapatkan top N standings. Count dibatasi antara 1-50.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `bracket_id` | int | No | null | Filter by bracket |

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "1": { "name": "admin", "score": 1500, "members": [...] },
    "2": { "name": "user2", "score": 1200, "members": [...] }
  }
}
```

**Authentication:** Depends on visibility settings

---

# 6. API Users

## 6.1 GET /api/v1/users

**Frontend File:** `frontend/src/features/users/pages/UsersListPage.tsx` (line 58)
**Backend File:** `CTFd/api/v1/users.py` (line 69)

**Deskripsi:** Mendapatkan daftar user (paginated).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | 1 | Halaman |
| `q` | string | No | null | Search query |
| `field` | string | No | null | Field to search (name, website, country, bracket, affiliation, email) |
| `affiliation` | string | No | null | Filter by affiliation |
| `country` | string | No | null | Filter by country |
| `bracket` | string | No | null | Filter by bracket |
| `view` | string | No | null | `admin` untuk admin view (melihat banned/hidden) |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "email": "admin@ctfd.local",
      "website": null,
      "affiliation": null,
      "country": null,
      "bracket_id": null,
      "bracket_name": null,
      "fields": [],
      "place": 1,
      "score": 1500,
      "banned": false,
      "hidden": false,
      "verified": true,
      "type": "admin",
      "created": "2025-01-01T00:00:00+00:00",
      "secret": "abc123..."
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "next": 2,
      "prev": null,
      "pages": 1,
      "per_page": 50,
      "total": 1
    }
  }
}
```

**Authentication:** Depends on account visibility. Admin view requires admin.

---

## 6.2 POST /api/v1/users

**Frontend File:** `frontend/src/features/admin/users/hooks/useAdminUsers.ts` (line 153)
**Backend File:** `CTFd/api/v1/users.py` (line 151)

**Deskripsi:** Membuat user baru. Admin only.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `notify` | bool | No | Kirim email notifikasi ke user |

**Request Body:**
```json
{
  "name": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "type": "user",
  "verified": true,
  "hidden": false,
  "banned": false,
  "affiliation": "Univ",
  "country": "ID",
  "website": "https://example.com"
}
```

**Authentication:** Admin

---

## 6.3 GET /api/v1/users/{user_id}

**Frontend File:** `frontend/src/features/admin/users/hooks/useAdminUsers.ts` (line 117)
**Backend File:** `CTFd/api/v1/users.py` (line 191)

**Deskripsi:** Mendapatkan detail user.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin",
    "email": "admin@ctfd.local",
    "website": null,
    "affiliation": null,
    "country": null,
    "bracket_id": null,
    "bracket_name": null,
    "fields": [],
    "place": 1,
    "score": 1500,
    "banned": false,
    "hidden": false,
    "verified": true,
    "type": "admin",
    "created": "2025-01-01T00:00:00+00:00",
    "secret": "abc123..."
  }
}
```

**Authentication:** Depends on account visibility. Admin sees all fields.

---

## 6.4 PATCH /api/v1/users/{user_id}

**Frontend File:** `frontend/src/features/admin/users/hooks/useAdminUsers.ts` (line 162)
**Backend File:** `CTFd/api/v1/users.py` (line 222)

**Deskripsi:** Mengupdate user. Admin only.

**Request Body (partial):**
```json
{
  "name": "updatedname",
  "email": "newemail@example.com",
  "password": "newpassword",
  "banned": false,
  "hidden": false,
  "verified": true,
  "type": "admin"
}
```

**Authentication:** Admin

---

## 6.5 DELETE /api/v1/users/{user_id}

**Frontend File:** `frontend/src/features/admin/users/hooks/useAdminUsers.ts` (line 174)
**Backend File:** `CTFd/api/v1/users.py` (line 266)

**Deskripsi:** Menghapus user. Admin only. Admin tidak bisa menghapus diri sendiri.

**Authentication:** Admin

---

## 6.6 GET /api/v1/users/me

**Frontend File:** `frontend/src/features/users/pages/UserPrivateProfile.tsx` (line 80)
**Backend File:** `CTFd/api/v1/users.py` (line 296)

**Deskripsi:** Mendapatkan data user yang sedang login (self profile).

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin",
    "email": "admin@ctfd.local",
    "website": null,
    "affiliation": null,
    "country": null,
    "bracket_id": null,
    "bracket_name": null,
    "language": null,
    "place": 1,
    "score": 1500
  }
}
```

**Authentication:** Required

---

## 6.7 PATCH /api/v1/users/me

**Frontend File:** Belum diimplementasikan di SPA
**Backend File:** `CTFd/api/v1/users.py` (line 321)

**Deskripsi:** Mengupdate profile user sendiri.

**Request Body:**
```json
{
  "name": "newname",
  "website": "https://example.com",
  "affiliation": "Univ",
  "country": "ID"
}
```

**Authentication:** Required

---

## 6.8 GET /api/v1/users/me/solves

**Frontend File:** `frontend/src/features/users/pages/UserPrivateProfile.tsx` (line 81)
**Backend File:** `CTFd/api/v1/users.py` (line 374)

**Deskripsi:** Mendapatkan daftar solve user yang sedang login.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "challenge_id": 1,
      "user_id": 1,
      "team_id": null,
      "provided": "flag{...}",
      "type": "correct",
      "date": "2025-01-15T10:30:00+00:00",
      "challenge": { "id": 1, "name": "Baby's First", "category": "Web", "value": 100 }
    }
  ],
  "meta": { "count": 1 }
}
```

**Authentication:** Required

---

## 6.9 GET /api/v1/users/me/fails

**Frontend File:** Belum diimplementasikan di SPA
**Backend File:** `CTFd/api/v1/users.py` (line 391)

**Deskripsi:** Mendapatkan daftar fail user yang sedang login. Non-admin hanya mendapat count.

**Response Success (200):**
```json
{
  "success": true,
  "data": [],
  "meta": { "count": 5 }
}
```

**Authentication:** Required

---

## 6.10 GET /api/v1/users/me/awards

**Frontend File:** `frontend/src/features/users/pages/UserPrivateProfile.tsx` (line 82)
**Backend File:** `CTFd/api/v1/users.py` (line 416)

**Deskripsi:** Mendapatkan daftar award user yang sedang login.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "First Blood",
      "description": "First to solve a challenge",
      "value": 100,
      "category": "special",
      "icon": null,
      "date": "2025-01-15T10:30:00+00:00"
    }
  ],
  "meta": { "count": 1 }
}
```

**Authentication:** Required

---

## 6.11 GET /api/v1/users/{user_id}/solves

**Frontend File:** `frontend/src/features/admin/users/hooks/useAdminUsers.ts` (line 126)
**Backend File:** `CTFd/api/v1/users.py` (line 434)

**Deskripsi:** Mendapatkan solves untuk user tertentu.

**Authentication:** Depends on visibility settings

---

## 6.12 GET /api/v1/users/{user_id}/fails

**Frontend File:** `frontend/src/features/admin/users/hooks/useAdminUsers.ts` (line 135)
**Backend File:** `CTFd/api/v1/users.py` (line 457)

**Deskripsi:** Mendapatkan fails untuk user tertentu. Non-admin hanya mendapat count.

**Authentication:** Depends on visibility settings

---

## 6.13 GET /api/v1/users/{user_id}/awards

**Frontend File:** `frontend/src/features/admin/users/hooks/useAdminUsers.ts` (line 144)
**Backend File:** `CTFd/api/v1/users.py` (line 487)

**Deskripsi:** Mendapatkan awards untuk user tertentu.

**Authentication:** Depends on visibility settings

---

## 6.14 POST /api/v1/users/{user_id}/email

**Frontend File:** Belum diimplementasikan di SPA
**Backend File:** `CTFd/api/v1/users.py` (line 509)

**Deskripsi:** Mengirim email ke user. Admin only.

**Request Body:**
```json
{
  "text": "Your message here"
}
```

**Rate Limit:** 10 POST per 60 detik

**Authentication:** Admin

---

# 7. API Teams

## 7.1 GET /api/v1/teams

**Frontend File:** `frontend/src/features/teams/pages/TeamsListPage.tsx` (line 58)
**Backend File:** `CTFd/api/v1/teams.py` (line 63)

**Deskripsi:** Mendapatkan daftar team (paginated). Hanya muncul di mode teams.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | int | No | 1 | Halaman |
| `q` | string | No | null | Search query |
| `field` | string | No | null | Search field |
| `affiliation` | string | No | null | Filter |
| `country` | string | No | null | Filter |
| `view` | string | No | null | `admin` untuk admin view |

**Response Success (200):** Sama format dengan users list (paginated) dengan data team.

**Authentication:** Depends on visibility

---

## 7.2 POST /api/v1/teams

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts` (line 141)
**Backend File:** `CTFd/api/v1/teams.py` (line 150)

**Deskripsi:** Membuat team. Admin only.

**Request Body:**
```json
{
  "name": "Team Name",
  "email": "team@example.com",
  "password": "teampass",
  "affiliation": "Univ",
  "country": "ID",
  "website": "https://example.com",
  "hidden": false,
  "banned": false
}
```

**Authentication:** Admin

---

## 7.3 GET /api/v1/teams/{team_id}

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts` (line 105)
**Backend File:** `CTFd/api/v1/teams.py` (line 183)

**Deskripsi:** Mendapatkan detail team.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Team Name",
    "email": "team@example.com",
    "website": null,
    "affiliation": null,
    "country": null,
    "bracket_id": null,
    "bracket_name": null,
    "captain_id": 1,
    "members": [
      { "id": 1, "name": "captain", "score": 500 }
    ],
    "fields": [],
    "place": 1,
    "score": 1500,
    "banned": false,
    "hidden": false,
    "created": "2025-01-01T00:00:00+00:00",
    "secret": "abc123..."
  }
}
```

**Authentication:** Admin

---

## 7.4 PATCH /api/v1/teams/{team_id}

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts` (line 149)
**Backend File:** `CTFd/api/v1/teams.py` (line 216)

**Deskripsi:** Mengupdate team. Admin only.

**Request Body (partial):**
```json
{
  "name": "New Name",
  "banned": false,
  "hidden": false,
  "captain_id": 2
}
```

**Authentication:** Admin

---

## 7.5 DELETE /api/v1/teams/{team_id}

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts` (line 161)
**Backend File:** `CTFd/api/v1/teams.py` (line 249)

**Deskripsi:** Menghapus team. Admin only.

**Authentication:** Admin

---

## 7.6 GET /api/v1/teams/me

**Frontend File:** `frontend/src/features/teams/pages/TeamPrivatePage.tsx` (line 97)
**Backend File:** `CTFd/api/v1/teams.py` (line 274)

**Deskripsi:** Mendapatkan data team user yang sedang login.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Team",
    "email": null,
    "website": null,
    "affiliation": null,
    "country": null,
    "bracket_id": null,
    "bracket_name": null,
    "captain_id": 1,
    "members": [
      { "id": 1, "name": "captain", "score": 500, "bracket_id": null, "bracket_name": null, "oauth_id": null }
    ],
    "fields": [],
    "place": 1,
    "score": 1500
  }
}
```

**Authentication:** Required (must have team)

---

## 7.7 PATCH /api/v1/teams/me

**Frontend File:** `frontend/src/features/teams/pages/TeamPrivatePage.tsx` (line 143)
**Backend File:** `CTFd/api/v1/teams.py` (line 305)

**Deskripsi:** Mengupdate data team sendiri. Hanya captain yang bisa.

**Request Body:**
```json
{
  "name": "New Team Name",
  "website": "https://example.com",
  "affiliation": "Univ",
  "country": "ID"
}
```

**Authentication:** Required (captain only)

---

## 7.8 DELETE /api/v1/teams/me

**Frontend File:** Belum diimplementasikan di SPA
**Backend File:** `CTFd/api/v1/teams.py` (line 342)

**Deskripsi:** Membubarkan team. Hanya captain, dan hanya jika team belum melakukan aksi apapun.

**Authentication:** Required (captain only)

---

## 7.9 POST /api/v1/teams/me/members

**Frontend File:** `frontend/src/features/teams/pages/TeamPrivatePage.tsx` (line 128)
**Backend File:** `CTFd/api/v1/teams.py` (line 410)

**Deskripsi:** Generate invite code untuk team. Hanya captain.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "code": "invite_code_here"
  }
}
```

**Authentication:** Required (captain only)

---

## 7.10 GET /api/v1/teams/{team_id}/members

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts` (line 131)
**Backend File:** `CTFd/api/v1/teams.py` (line 432)

**Deskripsi:** Mendapatkan daftar member team. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "member1", "score": 500 }
  ]
}
```

**Authentication:** Admin

---

## 7.11 POST /api/v1/teams/{team_id}/members

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts` (line 169)
**Backend File:** `CTFd/api/v1/teams.py` (line 452)

**Deskripsi:** Menambahkan member ke team. Admin only.

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "member1", "score": 500 },
    { "id": 2, "name": "member2", "score": 200 }
  ]
}
```

**Authentication:** Admin

---

## 7.12 DELETE /api/v1/teams/{team_id}/members
(With `user_id` in request body)

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts` (line 182)
**Backend File:** `CTFd/api/v1/teams.py` (line 488)

**Deskripsi:** Menghapus member dari team. Admin only.

**Request Body:**
```json
{
  "user_id": 2
}
```

**Authentication:** Admin

---

## 7.13 GET /api/v1/teams/me/solves

**Frontend File:** `frontend/src/features/teams/pages/TeamPrivatePage.tsx` (line 105)
**Backend File:** `CTFd/api/v1/teams.py` (line 523)

**Deskripsi:** Mendapatkan solves team yang sedang login.

**Response:** Sama format dengan user solves.

**Authentication:** Required (must have team)

---

## 7.14 GET /api/v1/teams/me/awards

**Frontend File:** `frontend/src/features/teams/pages/TeamPrivatePage.tsx` (line 106)
**Backend File:** `CTFd/api/v1/teams.py` (line 574)

**Deskripsi:** Mendapatkan awards team yang sedang login.

**Authentication:** Required (must have team)

---

## 7.15 GET /api/v1/teams/{team_id}/solves
## 7.16 GET /api/v1/teams/{team_id}/awards

**Frontend File:** `frontend/src/features/admin/teams/hooks/useAdminTeams.ts`
**Backend File:** `CTFd/api/v1/teams.py` (lines 594, 653)

**Deskripsi:** Mendapatkan solves/awards untuk team tertentu. Admin view.

**Authentication:** Admin

---

# 8. API Submissions

## 8.1 GET /api/v1/submissions

**Frontend File:** `frontend/src/features/admin/submissions/hooks/useAdminSubmissions.ts` (line 22)
**Backend File:** `CTFd/api/v1/submissions.py` (line 44)

**Deskripsi:** Mendapatkan daftar submission (paginated). Admin only.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Halaman |
| `challenge_id` | int | No | Filter by challenge |
| `user_id` | int | No | Filter by user |
| `team_id` | int | No | Filter by team |
| `type` | string | No | Filter by type (correct, incorrect, etc) |
| `ip` | string | No | Filter by IP |
| `provided` | string | No | Filter by submitted flag |
| `view` | string | No | `admin` untuk admin view |

**Response Success (200):** Paginated dengan data submission.

**Authentication:** Admin

---

## 8.2 POST /api/v1/submissions

**Frontend File:** Belum diimplementasikan di SPA
**Backend File:** `CTFd/api/v1/submissions.py` (line 117)

**Deskripsi:** Membuat submission secara manual. Admin only.

**Authentication:** Admin

---

## 8.3 PATCH /api/v1/submissions/{submission_id}

**Frontend File:** `frontend/src/features/admin/submissions/hooks/useAdminSubmissions.ts` (line 30)
**Backend File:** `CTFd/api/v1/submissions.py` (line 175)

**Deskripsi:** Mengubah status submission (correct/incorrect). Admin only.

**Request Body:**
```json
{
  "type": "correct"
}
```

**Authentication:** Admin

---

## 8.4 DELETE /api/v1/submissions/{submission_id}

**Frontend File:** `frontend/src/features/admin/submissions/hooks/useAdminSubmissions.ts` (line 38)
**Backend File:** `CTFd/api/v1/submissions.py` (line 248)

**Deskripsi:** Menghapus submission. Admin only.

**Authentication:** Admin

---

# 9. API Notifications

## 9.1 GET /api/v1/notifications

**Frontend File:** `frontend/src/features/notifications/pages/NotificationsPage.tsx` (line 23)
**Backend File:** `CTFd/api/v1/notifications.py` (line 40)

**Deskripsi:** Mendapatkan daftar notifikasi.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `since_id` | int | No | Hanya notifikasi dengan ID > since_id |
| `title` | string | No | Filter by title |
| `user_id` | int | No | Filter by user |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "CTF Started",
      "content": "The competition has begun!",
      "date": "2025-01-15T10:00:00+00:00",
      "user_id": null,
      "team_id": null
    }
  ]
}
```

**Authentication:** None

---

## 9.2 HEAD /api/v1/notifications

**Backend File:** `CTFd/api/v1/notifications.py` (line 104)

**Deskripsi:** Mendapatkan count notifikasi. Berguna untuk polling.

**Response Headers:**
```
Result-Count: 5
```

**Authentication:** None

---

## 9.3 POST /api/v1/notifications

**Backend File:** `CTFd/api/v1/notifications.py` (line 120)

**Deskripsi:** Membuat notifikasi baru. Admin only. Notifikasi juga dipublish via SSE.

**Request Body:**
```json
{
  "title": "Important Notice",
  "content": "Server will restart in 5 minutes",
  "type": "alert",
  "sound": true
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": { "id": 2, "title": "Important Notice", "content": "...", "date": "...", "type": "alert", "sound": true }
}
```

**Authentication:** Admin

---

# 10. API Pages

## 10.1 GET /api/v1/pages

**Frontend File:** `frontend/src/features/admin/pages/hooks/useAdminPages.ts` (line 35)
**Backend File:** `CTFd/api/v1/pages.py` (line 40)

**Deskripsi:** Mendapatkan daftar semua halaman (tanpa konten). Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "Home", "route": "index", "draft": false, "hidden": false, "auth_required": false, "format": "html", "link_target": null }
  ]
}
```

**Authentication:** Admin

---

## 10.2 POST /api/v1/pages

**Frontend File:** `frontend/src/features/admin/pages/hooks/useAdminPages.ts` (line 52)
**Backend File:** `CTFd/api/v1/pages.py` (line 88)

**Deskripsi:** Membuat halaman baru. Admin only.

**Request Body:**
```json
{
  "title": "About",
  "route": "about",
  "content": "<h1>About Us</h1>",
  "draft": false,
  "hidden": false,
  "auth_required": false,
  "format": "html"
}
```

**Authentication:** Admin

---

## 10.3 GET /api/v1/pages/{page_id}

**Frontend File:** `frontend/src/features/admin/pages/hooks/useAdminPages.ts` (line 43)
**Backend File:** `CTFd/api/v1/pages.py` (line 130)

**Deskripsi:** Mendapatkan detail halaman (dengan konten). Admin only.

**Authentication:** Admin

---

## 10.4 PATCH /api/v1/pages/{page_id}

**Frontend File:** `frontend/src/features/admin/pages/hooks/useAdminPages.ts` (line 60)
**Backend File:** `CTFd/api/v1/pages.py` (line 143)

**Deskripsi:** Mengupdate halaman. Admin only.

**Authentication:** Admin

---

## 10.5 DELETE /api/v1/pages/{page_id}

**Frontend File:** `frontend/src/features/admin/pages/hooks/useAdminPages.ts` (line 72)
**Backend File:** `CTFd/api/v1/pages.py` (line 164)

**Deskripsi:** Menghapus halaman. Admin only.

**Authentication:** Admin

---

## 10.6 GET /api/v1/pages/{route} (GAP — Public Page Lookup by Route)

**Frontend File:** `frontend/src/features/pages/pages/StaticPage.tsx` (line 30)

**Deskripsi:** Frontend SPA memanggil `/api/v1/pages/{route}` (misal: `/api/v1/pages/index`) untuk mendapatkan konten halaman publik berdasarkan route name.

**MASALAH:** Backend hanya menyediakan:
- `GET /api/v1/pages` (admin-only, list)
- `GET /api/v1/pages/<id>` (admin-only, by numeric ID)

**Endpoint ini BELUM ADA di backend.** Perlu ditambahkan endpoint publik baru seperti:
```
GET /api/v1/pages/by-route/<route>
```

Atau menggunakan endpoint views `/<path:route>` yang sudah ada (mengembalikan HTML, bukan JSON).

**Status:** GAP — perlu diimplementasikan

---

# 11. API Config

## 11.1 GET /api/v1/configs

**Frontend File:** `frontend/src/features/admin/config/hooks/useAdminConfig.ts` (line 32)
**Backend File:** `CTFd/api/v1/config.py` (line 40)

**Deskripsi:** Mendapatkan semua konfigurasi. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "key": "ctf_name", "value": "CTFd" },
    { "id": 2, "key": "user_mode", "value": "users" }
  ]
}
```

**Authentication:** Admin

---

## 11.2 PATCH /api/v1/configs

**Frontend File:** `frontend/src/features/admin/config/hooks/useAdminConfig.ts` (line 40)
**Backend File:** `CTFd/api/v1/config.py` (line 106)

**Deskripsi:** Mengupdate banyak konfigurasi sekaligus. Admin only.

**Request Body:**
```json
{
  "ctf_name": "New CTF Name",
  "user_mode": "teams",
  "team_size": 5
}
```

**Response:**
```json
{ "success": true }
```

**Authentication:** Admin

---

## 11.3 GET /api/v1/configs/{config_key}

**Backend File:** `CTFd/api/v1/config.py` (line 128)

**Deskripsi:** Mendapatkan satu konfigurasi spesifik. Admin only.

**Authentication:** Admin

---

## 11.4 PATCH /api/v1/configs/{config_key}

**Backend File:** `CTFd/api/v1/config.py` (line 147)

**Deskripsi:** Mengupdate satu konfigurasi spesifik. Admin only.

**Authentication:** Admin

---

## 11.5 DELETE /api/v1/configs/{config_key}

**Backend File:** `CTFd/api/v1/config.py` (line 184)

**Deskripsi:** Menghapus satu konfigurasi. Admin only.

**Authentication:** Admin

---

# 12. API Files

## 12.1 POST /api/v1/files

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 195)
**Backend File:** `CTFd/api/v1/files.py` (line 77)

**Deskripsi:** Upload file(s). Admin only. Menggunakan `multipart/form-data`.

**Request Body (form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | File to upload (bisa multiple) |
| `challenge_id` | int | No | Associate with challenge |
| `page_id` | int | No | Associate with page |
| `solution_id` | int | No | Associate with solution |
| `type` | string | No | File type |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "type": "challenge", "location": "abc123/file.txt", "sha1sum": "da39a3ee5e6b4b0d..." }
  ]
}
```

**Authentication:** Admin

---

## 12.2 DELETE /api/v1/files/{file_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 206)
**Backend File:** `CTFd/api/v1/files.py` (line 168)

**Deskripsi:** Menghapus file. Admin only.

**Authentication:** Admin

---

# 13. API Hints

## 13.1 GET /api/v1/hints/{hint_id}

**Frontend File:** `frontend/src/features/challenges/hooks/useHint.ts` (line 14)
**Backend File:** `CTFd/api/v1/hints.py` (line 107)

**Deskripsi:** Mendapatkan detail hint. Jika hint memiliki cost, hanya bisa dilihat setelah di-unlock. Jika tidak ada cost, bisa dilihat langsung.

**Response — Hint sudah di-unlock / gratis:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "standard",
    "challenge_id": 1,
    "title": "Hint Title",
    "content": "Hint content",
    "cost": 0,
    "requirements": null
  }
}
```

**Response — Hint terkunci (belum di-unlock):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cost": 50,
    "title": "Hint Title"
  }
}
```

**Authentication:** Public (jika gratis), Required (jika berbayar)

---

## 13.2 PATCH /api/v1/hints/{hint_id}
## 13.3 DELETE /api/v1/hints/{hint_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (lines 159, 171)
**Backend File:** `CTFd/api/v1/hints.py` (lines 203, 231)

**Deskripsi:** Update / hapus hint. Admin only.

**Authentication:** Admin

---

# 14. API Unlocks

## 14.1 POST /api/v1/unlocks

**Frontend File:** `frontend/src/features/challenges/hooks/useHint.ts` (line 21)
**Backend File:** `CTFd/api/v1/unlocks.py` (line 87)

**Deskripsi:** Membuka (unlock) hint atau solution. Untuk hint, akan mengurangi score user sesuai cost hint.

**Request Body:**
```json
{
  "target": 1,
  "type": "hints"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "team_id": null,
    "target": 1,
    "type": "hints",
    "date": "2025-01-15T10:30:00+00:00"
  }
}
```

**Error — Tidak cukup score:**
```json
{
  "success": false,
  "errors": { "score": "You do not have enough points to unlock this hint" }
}
```

**Error — Sudah di-unlock:**
```json
{
  "success": false,
  "errors": { "target": "You've already unlocked this target" }
}
```

**Authentication:** Required

---

# 15. API Flags

## 15.1 GET /api/v1/flags

**Backend File:** `CTFd/api/v1/flags.py` (line 38)

**Deskripsi:** Mendapatkan daftar flag. Admin only.

**Authentication:** Admin

---

## 15.2 POST /api/v1/flags

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 108)
**Backend File:** `CTFd/api/v1/flags.py` (line 80)

**Deskripsi:** Membuat flag baru. Admin only.

**Request Body:**
```json
{
  "challenge_id": 1,
  "type": "static",
  "content": "flag{example}",
  "data": ""
}
```

**Authentication:** Admin

---

## 15.3 GET /api/v1/flags/types

**Frontend File:** `frontend/src/features/admin/plugin/hooks/useFlagTypes.ts` (line 14)
**Backend File:** `CTFd/api/v1/flags.py` (line 113)

**Deskripsi:** Mendapatkan semua tipe flag yang terdaftar.

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "static": {
      "name": "Static",
      "templates": { "create": "/plugins/flags/static/create.html" }
    },
    "regex": {
      "name": "Regex",
      "templates": { "create": "/plugins/flags/regex/create.html" }
    }
  }
}
```

**Authentication:** Admin

---

## 15.4 PATCH /api/v1/flags/{flag_id}
## 15.5 DELETE /api/v1/flags/{flag_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (lines 119, 130)
**Backend File:** `CTFd/api/v1/flags.py` (lines 175, 166)

**Deskripsi:** Update / hapus flag. Admin only.

**Authentication:** Admin

---

# 16. API Tags

## 16.1 POST /api/v1/tags

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 224)
**Backend File:** `CTFd/api/v1/tags.py` (line 77)

**Deskripsi:** Membuat tag. Admin only.

**Request Body:**
```json
{
  "challenge_id": 1,
  "value": "web"
}
```

**Authentication:** Admin

---

## 16.2 DELETE /api/v1/tags/{tag_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 236)
**Backend File:** `CTFd/api/v1/tags.py` (line 160)

**Deskripsi:** Menghapus tag. Admin only.

**Authentication:** Admin

---

# 17. API Topics

## 17.1 POST /api/v1/topics

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 254)
**Backend File:** `CTFd/api/v1/topics.py` (line 75)

**Deskripsi:** Membuat topic baru (atau menambahkan topic ke challenge). Admin only.

**Request Body:**
```json
{
  "value": "Cryptography",
  "type": "challenge",
  "challenge_id": 1
}
```

**Authentication:** Admin

---

## 17.2 DELETE /api/v1/topics?type=challenge&target_id={id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 272)
**Backend File:** `CTFd/api/v1/topics.py` (line 122)

**Deskripsi:** Menghapus topic dari challenge. Admin only.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `challenge` |
| `target_id` | int | Yes | ID ChallengeTopic |

**Authentication:** Admin

---

# 18. API Solutions

## 18.1 POST /api/v1/solutions

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 301)
**Backend File:** `CTFd/api/v1/solutions.py` (line 97)

**Deskripsi:** Membuat solution untuk challenge. Admin only.

**Request Body:**
```json
{
  "challenge_id": 1,
  "content": "Step-by-step solution...",
  "state": "hidden"
}
```

**Authentication:** Admin

---

## 18.2 GET /api/v1/solutions/{solution_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 292)
**Backend File:** `CTFd/api/v1/solutions.py` (line 144)

**Deskripsi:** Mendapatkan solution. Untuk non-admin, hanya visible jika state='visible' atau state='solved' dan user sudah solve.

**Response — Admin view:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "challenge_id": 1,
    "content": "Step-by-step solution...",
    "state": "hidden"
  }
}
```

**Authentication:** Depends on solution state

---

## 18.3 PATCH /api/v1/solutions/{solution_id}

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 317)
**Backend File:** `CTFd/api/v1/solutions.py` (line 199)

**Deskripsi:** Mengupdate solution. Admin only.

**Authentication:** Admin

---

# 19. API Comments

## 19.1 GET /api/v1/comments

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 329)
**Backend File:** `CTFd/api/v1/comments.py` (line 60)

**Deskripsi:** Mendapatkan komentar (paginated). Admin only.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `challenge_id` | int | No | Filter by challenge |
| `user_id` | int | No | Filter by user |
| `team_id` | int | No | Filter by team |
| `page_id` | int | No | Filter by page |

**Authentication:** Admin

---

## 19.2 POST /api/v1/comments

**Frontend File:** `frontend/src/features/admin/challenges/hooks/useAdminChallenges.ts` (line 339)
**Backend File:** `CTFd/api/v1/comments.py` (line 117)

**Deskripsi:** Membuat komentar baru. Admin only.

**Request Body:**
```json
{
  "challenge_id": 1,
  "content": "Great challenge!"
}
```

Atau untuk user/team/page comments:
```json
{
  "user_id": 1,
  "content": "Message for user"
}
```

> **Catatan:** `author_id` selalu dipaksa menjadi ID session user.

**Authentication:** Admin

---

# 20. API Brackets

## 20.1 GET /api/v1/brackets

**Frontend Files:**
- `frontend/src/features/scoreboard/hooks/useScoreboard.ts` (line 31)
- `frontend/src/features/admin/config/hooks/useAdminConfig.ts` (line 76)

**Backend File:** `CTFd/api/v1/brackets.py` (line 14)

**Deskripsi:** Mendapatkan daftar bracket (divisi/kelompok).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by type (users, teams) |

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Beginner", "description": "For beginners", "type": "users" }
  ]
}
```

**Authentication:** None (public)

---

## 20.2 POST /api/v1/brackets

**Frontend File:** `frontend/src/features/admin/config/hooks/useAdminConfig.ts` (line 85)
**Backend File:** `CTFd/api/v1/brackets.py` (line 44)

**Deskripsi:** Membuat bracket baru. Admin only.

**Authentication:** Admin

---

## 20.3 PATCH /api/v1/brackets/{bracket_id}
## 20.4 DELETE /api/v1/brackets/{bracket_id}

**Frontend File:** `frontend/src/features/admin/config/hooks/useAdminConfig.ts` (lines 94, 102)
**Backend File:** `CTFd/api/v1/brackets.py` (lines 62, 82)

**Deskripsi:** Update / hapus bracket. Admin only.

**Authentication:** Admin

---

# 21. API Fields (Config)

## 21.1 GET /api/v1/configs/fields

**Frontend File:** `frontend/src/features/admin/config/hooks/useAdminConfig.ts` (line 110)
**Backend File:** `CTFd/api/v1/config.py` (line 203)

**Deskripsi:** Mendapatkan daftar custom fields. Admin only.

**Response Success (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "University", "type": "text", "field_type": "user", "required": true, "public": true, "editable": true, "options": null }
  ]
}
```

**Authentication:** Admin

---

## 21.2 POST /api/v1/configs/fields
## 21.3 PATCH /api/v1/configs/fields/{field_id}
## 21.4 DELETE /api/v1/configs/fields/{field_id}

**Frontend File:** `frontend/src/features/admin/config/hooks/useAdminConfig.ts` (lines 126, 143, 151)
**Backend File:** `CTFd/api/v1/config.py` (lines 229, 247, 279)

**Deskripsi:** CRUD custom fields. Admin only.

**Authentication:** Admin

---

# 22. API Export/Import (Backup)

## 22.1 GET /api/v1/exports/raw (POST)

**Frontend File:** `frontend/src/features/admin/config/components/ConfigBackupTab.tsx` (line 18)
**Backend File:** `CTFd/api/v1/exports.py` (line 14)

**Deskripsi:** Export data CTFd (full backup ZIP atau CSV). Admin only.

**Request Body:**
```json
{
  "type": "csv",
  "args": { "table": "challenges" }
}
```

Atau tanpa body untuk full export ZIP.

**Response:** Binary file download (ZIP atau CSV).

**Rate Limit:** 10 POST per 60 detik

**Authentication:** Admin

---

## 22.2 POST /admin/import

**Frontend File:** `frontend/src/features/admin/config/components/ConfigBackupTab.tsx` (line 42)
**Backend File:** `CTFd/admin/__init__.py` (line 105)

**Deskripsi:** Import backup ZIP. Admin only. Menggunakan `multipart/form-data`.

**Request Body (form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `backup` | file | Yes | .zip backup file |

> **Catatan:** Frontend memanggil `/api/v1/configs/import` tapi backend menyediakan `/admin/import`. Ini adalah **GAP**.

**Authentication:** Admin

---

# 23. Admin Reset

## 23.1 POST /admin/reset

**Frontend File:** `frontend/src/features/admin/reset/pages/AdminResetPage.tsx` (line 64)
**Backend File:** `CTFd/admin/__init__.py` (line 218)

**Deskripsi:** Mereset data CTFd. Admin only. Menggunakan `multipart/form-data`.

**Request Body (form-data):**
| Field | Type | Description |
|-------|------|-------------|
| `submissions` | string | `true` untuk reset submissions |
| `accounts` | string | `true` untuk reset accounts |
| `challenges` | string | `true` untuk reset challenges |
| `pages` | string | `true` untuk reset pages |
| `notifications` | string | `true` untuk reset notifications |

**Response:** Redirect atau HTML.

**Authentication:** Admin

---

# 24. Email & Test

## 24.1 POST /api/v1/configs/email/test (GAP)

**Frontend File:** `frontend/src/features/admin/config/components/ConfigEmailTab.tsx` (line 52)

**Deskripsi:** Mengirim test email. Frontend memanggil `/api/v1/configs/email/test` tapi endpoint ini **tidak ada** di backend.

**Endpoint aktual:** Tidak ditemukan di API v1 atau admin routes. Perlu ditambahkan atau disesuaikan.

**Status:** GAP — perlu diimplementasikan

---

# 25. SSE Events (Real-time)

## 25.1 GET /events

**Backend File:** `CTFd/events/__init__.py` (line 10)

**Deskripsi:** Server-Sent Events untuk notifikasi real-time. Tidak digunakan oleh frontend SPA saat ini (masih polling GET /api/v1/notifications setiap 30 detik).

**Headers Required:**
- `Accept: text/event-stream`

**Response:** `text/event-stream`

```
data: {"id": 1, "title": "Notification", "content": "...", "date": "..."}
```

**Authentication:** Required

---

# 26. File Download

## 26.1 GET /files/{path}

**Backend File:** `CTFd/views.py` (line 394)

**Deskripsi:** Mendownload file challenge/solution. Link didapat dari response challenge detail. Untuk challenge yang tidak visible, perlu token.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | No | Signed token untuk akses file |

**Authentication:** Depends on challenge visibility

---

# Ringkasan Gaps / Issues

Berikut endpoint yang dipanggil frontend SPA tapi **BELUM ADA** atau berbeda di backend:

| # | Frontend Call | Backend Reality | Severity |
|---|---------------|-----------------|----------|
| 1 | `GET /api/v1/pages/{route}` — public page lookup by route name | Hanya `GET /api/v1/pages/<id>` (admin, numeric ID) | **Critical** |
| 2 | `POST /api/v1/configs/email/test` — test email | Endpoint tidak ada di API v1 atau admin | **High** |
| 3 | `GET /api/v1/configs/import` (via api.upload) | Endpoint aktual: `POST /admin/import` | **High** |
| 4 | `GET /api/v1/configs/export` (via api.get) | Endpoint aktual: `POST /api/v1/exports/raw` atau `GET /admin/export` | **High** |

---

# Index Endpoints by Category

| Category | Endpoints |
|----------|-----------|
| **Init** | `GET /init-data` |
| **Setup** | `POST /setup`, `GET /api/v1/users?view=admin` (check) |
| **Auth** | `POST /login`, `POST /auth/register`, `POST /auth/confirm`, `POST /auth/reset_password`, `POST /auth/reset_password/{token}`, `GET /logout` |
| **Challenges** | `GET/POST /api/v1/challenges`, `GET/PATCH/DELETE /api/v1/challenges/{id}`, `GET /api/v1/challenges/types`, `POST /api/v1/challenges/attempt`, `GET /api/v1/challenges/{id}/solves`, `GET /api/v1/challenges/{id}/files`, `GET /api/v1/challenges/{id}/tags`, `GET /api/v1/challenges/{id}/topics`, `GET /api/v1/challenges/{id}/hints`, `GET /api/v1/challenges/{id}/flags`, `GET /api/v1/challenges/{id}/requirements`, `PUT /api/v1/challenges/{id}/ratings`, `GET /api/v1/challenges/{id}/ratings`, `GET /api/v1/challenges/{id}/solution` |
| **Scoreboard** | `GET /api/v1/scoreboard`, `GET /api/v1/scoreboard/top/{count}` |
| **Users** | `GET/POST /api/v1/users`, `GET/PATCH/DELETE /api/v1/users/{id}`, `GET/PATCH /api/v1/users/me`, `GET /api/v1/users/me/solves`, `GET /api/v1/users/me/fails`, `GET /api/v1/users/me/awards`, `GET /api/v1/users/{id}/solves`, `GET /api/v1/users/{id}/fails`, `GET /api/v1/users/{id}/awards`, `POST /api/v1/users/{id}/email` |
| **Teams** | `GET/POST /api/v1/teams`, `GET/PATCH/DELETE /api/v1/teams/{id}`, `GET/PATCH/DELETE /api/v1/teams/me`, `POST /api/v1/teams/me/members`, `GET/POST/DELETE /api/v1/teams/{id}/members`, `GET /api/v1/teams/me/solves`, `GET /api/v1/teams/me/awards`, `GET /api/v1/teams/{id}/solves`, `GET /api/v1/teams/{id}/awards`, `POST /teams/new`, `POST /teams/join`, `POST /teams/invite` |
| **Submissions** | `GET/POST /api/v1/submissions`, `PATCH/DELETE /api/v1/submissions/{id}` |
| **Notifications** | `GET/HEAD/POST /api/v1/notifications` |
| **Pages** | `GET/POST /api/v1/pages`, `GET/PATCH/DELETE /api/v1/pages/{id}`, `GET /api/v1/pages/{route}` (GAP) |
| **Config** | `GET/PATCH /api/v1/configs`, `GET/PATCH/DELETE /api/v1/configs/{key}`, `GET/POST /api/v1/configs/fields`, `GET/PATCH/DELETE /api/v1/configs/fields/{id}` |
| **Files** | `POST /api/v1/files`, `DELETE /api/v1/files/{id}`, `GET /files/{path}` |
| **Hints** | `GET /api/v1/hints/{id}`, `PATCH/DELETE /api/v1/hints/{id}` |
| **Flags** | `GET/POST /api/v1/flags`, `GET /api/v1/flags/types`, `PATCH/DELETE /api/v1/flags/{id}` |
| **Tags** | `POST /api/v1/tags`, `DELETE /api/v1/tags/{id}` |
| **Topics** | `POST /api/v1/topics`, `DELETE /api/v1/topics` |
| **Solutions** | `POST /api/v1/solutions`, `GET/PATCH/DELETE /api/v1/solutions/{id}` |
| **Comments** | `GET/POST /api/v1/comments` |
| **Unlocks** | `POST /api/v1/unlocks` |
| **Brackets** | `GET/POST /api/v1/brackets`, `PATCH/DELETE /api/v1/brackets/{id}` |
| **Export** | `POST /api/v1/exports/raw` |
| **Admin** | `POST /admin/reset`, `POST /admin/import` |
| **SSE** | `GET /events` |

---

*Dokumen ini adalah single source of truth untuk frontend-backend contract. Update jika ada perubahan API.*
