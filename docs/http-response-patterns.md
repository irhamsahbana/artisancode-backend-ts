# HTTP Response Patterns (PoC Reference)

Referensi dari `core-services` — semua service pakai pattern yang sama.

---

## 1. Success Response

Semua success response pakai envelope `{ success: true, data: T }`:

```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Pagination

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

### Simple Acknowledgment (tanpa data)

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

## 2. Error Response

### Basic Error

```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

### Full Error (dari centralized handler)

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "reason": "BAD_REQUEST",
  "data": null,
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password too short" }
  ]
}
```

---

## 3. Field `code` vs `reason`

### `code` — Machine-readable error identifier

Kode stabil yang bisa di-handle secara programmatic oleh client.

**Penggunaan:**
- Identifikasi error type secara spesifik
- Client bisa switch/if berdasarkan `code`
- Tidak berubah walau message berubah

**Contoh values:**
| Code | Arti |
|------|------|
| `BAD_REQUEST` | Request invalid (generic 400) |
| `UNAUTHORIZED` | Tidak ada/tidak valid auth (401) |
| `FORBIDDEN` | Tidak punya akses (403) |
| `NOT_FOUND` | Resource tidak ada (404) |
| `CONFLICT` | Data conflict/duplicate (409) |
| `VALIDATION_ERROR` | Zod validation gagal |
| `INTERNAL_ERROR` | Server error (500) |

**Di code:**
```ts
// Default mapping di error-handler.ts
function defaultCodeForHttpStatus(status: number): string {
    switch (status) {
        case 400: return "BAD_REQUEST";
        case 401: return "UNAUTHORIZED";
        case 404: return "NOT_FOUND";
        case 409: return "CONFLICT";
        // ...
    }
}

// Custom code bisa di-set manual
throw new DomainHttpError(400, "WALLET_INSUFFICIENT_BALANCE", "Saldo tidak cukup");
```

### `reason` — Human-readable error classification

Kategori/classifikasi error yang lebih deskriptif dari `code`.

**Penggunaan:**
- Logging dan debugging
- Monitoring/alerting ( grup error by reason )
- Audit trail

**Contoh values:**
| Reason | Arti |
|--------|------|
| `BAD_REQUEST` | Request malformed |
| `NOT_FOUND` | Resource tidak ditemukan |
| `CONFLICT` | Data already exists |
| `INTERNAL_ERROR` | Unexpected server error |

**Di code:**
```ts
// RepositoryError otomatis set reason = kind.toUpperCase()
static notFound(message: string, code: string): RepositoryError {
    return new RepositoryError(message, "not_found", code);
}
// → reason: "NOT_FOUND"

// DomainHttpError bisa set reason manual
static badRequest(message: string, code = "BAD_REQUEST"): DomainHttpError {
    return new DomainHttpError(400, code, message, { reason: "BAD_REQUEST" });
}
```

### Ringkasan Perbedaan

| | `code` | `reason` |
|---|---|---|
| **Tujuan** | Programmatic handling | Human debugging/logging |
| **Stability** | Stable, jangan diubah | Bisa lebih flexible |
| **Client use** | `if (error.code === "X")` | Log/monitoring only |
| **Example** | `"WALLET_INSUFFICIENT_BALANCE"` | `"BAD_REQUEST"` |

---

## 4. Error Types di `@jam/hono-error`

### `DomainHttpError`

Application-level errors dengan HTTP status + kode.

```ts
import { DomainHttpError } from "@jam/hono-error";

// Factory methods
throw DomainHttpError.badRequest("Amount must be positive");
throw DomainHttpError.unauthorized("Invalid refresh token");
throw DomainHttpError.forbidden("Admin only");
throw DomainHttpError.notFound("User not found");
throw DomainHttpError.conflict("Email already registered");
throw DomainHttpError.internal("Database connection failed");
throw DomainHttpError.serviceUnavailable("Payment gateway down");

// Custom code + reason
throw new DomainHttpError(400, "WALLET_INSUFFICIENT", "Saldo tidak cukup", {
    reason: "INSUFFICIENT_BALANCE",
    details: { current_balance: 5000, required: 10000 }
});
```

### `RepositoryError`

Persistence-layer errors (tanpa HTTP status, di-mapped oleh handler).

```ts
import { RepositoryError } from "@jam/hono-error";

throw RepositoryError.notFound("User not found", "USER_NOT_FOUND");
throw RepositoryError.conflict("Duplicate entry", "EMAIL_EXISTS");
throw RepositoryError.internal("Query failed");
// → mapped to 404/409/500 + reason: "NOT_FOUND"/"CONFLICT"/"INTERNAL_ERROR"
```

### `ZodError`

Validation errors — otomatis di-handle, return `errors` array.

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    { "field": "email", "message": "Invalid email" },
    { "field": "age", "message": "Number too small" }
  ]
}
```

---

## 5. `AppError` di `@sobatbisnis/api-types`

Error type baru yang lebih structured — bisa carry `details`, `httpStatus`, dan `errorCode`.

```ts
import { AppError, AppErrorCode } from "@sobatbisnis/api-types";
```

### Konstruktor

```ts
new AppError(
  AppErrorCode.VALIDATION_ERROR,  // required — typed error code
  "Email sudah terdaftar",        // required — human message
  { httpStatus: 409, details: { email: "john@example.com" } }
)
```

### Factory Methods

```ts
// Validation
AppError.validation("Field wajib", [{ field: "email", message: "Required" }])
AppError.validation("Invalid input", [{ field: "age", message: "Must be > 0" }], { type: "zod" })

// Not Found
AppError.notFound("User")

// Conflict
AppError.conflict("Email sudah terdaftar")

// Business Logic
AppError.business("Saldo tidak cukup", {
  code: "INSUFFICIENT_BALANCE",
  details: { current: 5000, required: 10000 }
})

// Internal
AppError.internal("Database connection failed", { cause: dbError })
```

### Error Codes (lengkap)

| Code                | Default HTTP | Arti                          |
| ------------------- | ------------ | ----------------------------- |
| `VALIDATION_ERROR`  | 400          | Input validation gagal        |
| `UNAUTHORIZED`      | 401          | Tidak ada/tidak valid auth    |
| `FORBIDDEN`         | 403          | Tidak punya akses             |
| `NOT_FOUND`         | 404          | Resource tidak ditemukan      |
| `CONFLICT`          | 409          | Data conflict/duplicate       |
| `RATE_LIMITED`      | 429          | Too many requests             |
| `INTERNAL_ERROR`    | 500          | Server error                  |
| `BAD_GATEWAY`       | 502          | Upstream error                |
| `SERVICE_UNAVAILABLE` | 503        | Service down                  |
| `GATEWAY_TIMEOUT`   | 504          | Upstream timeout              |

### `toJSON()` — Output

```json
{
  "success": false,
  "message": "Email sudah terdaftar",
  "code": "CONFLICT",
  "reason": "CONFLICT",
  "data": null
}
```

Dengan `details`:

```json
{
  "success": false,
  "message": "Saldo tidak cukup",
  "code": "INSUFFICIENT_BALANCE",
  "reason": "BUSINESS_ERROR",
  "data": null,
  "details": {
    "current": 5000,
    "required": 10000
  }
}
```

### Cara Pakai di Router

```ts
import { AppError, AppErrorCode } from "@sobatbisnis/api-types";

app.post("/users", async (c) => {
  const body = c.req.valid("json");

  // 1. Throw langsung — auto-mapped oleh centralized handler
  if (!body.email) {
    throw AppError.validation("Email wajib", [
      { field: "email", message: "Required" }
    ]);
  }

  // 2. Custom code + details
  const wallet = await getWallet(userId);
  if (wallet.balance < amount) {
    throw AppError.business("Saldo tidak cukup", {
      code: "INSUFFICIENT_BALANCE",
      details: { current: wallet.balance, required: amount }
    });
  }

  // 3. Check existing data
  const existing = await findUserByEmail(body.email);
  if (existing) {
    throw AppError.conflict("Email sudah terdaftar");
  }

  // 4. Success
  return c.json({ success: true, data: newUser }, 201);
});
```

### `AppError` vs `DomainHttpError`

| | `AppError` | `DomainHttpError` |
|---|---|---|
| **Package** | `@sobatbisnis/api-types` | `@jam/hono-error` |
| **Error codes** | Typed enum (`AppErrorCode`) | String自由 |
| **Details** | Built-in `Record<string, unknown>` | Via `options.details` |
| **HTTP status** | Auto-mapped from code | Explicit (1st param) |
| **Recommended** | ✅ For new code | Legacy/existing |

---

## 6. Usage di Router (Hono)

### Success

```ts
// Service layer sudah return { success, data }
const result = await userService.getUser(id);
return c.json(result, 200);

// atau inline
return c.json({ success: true, data: user }, 200);
```

### Error (inline)

```ts
return c.json({ success: false, message: "Unauthorized" }, 401);
return c.json({ success: false, message: "Store not found" }, 404);
```

### Error (throw — biar centralized handler handle)

```ts
import { DomainHttpError } from "@jam/hono-error";

// Di service layer
if (!user) {
    throw DomainHttpError.notFound("User not found");
}
// → auto return { success: false, message: "User not found", code: "NOT_FOUND", data: null }
```

---

## 6. HTTP Client (Service-to-Service)

Package `@jam/http-client` punya `ApiResponse<T>` local interface:

```ts
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// Usage
const response = await serviceClient.get<ApiResponse<User>>("/internal/users/123");
if (response.data.success) {
    const user = response.data.data;
}
```

---

## 7. PoC Recommendation

Untuk PoC project, pakai pattern yang sama:

```ts
// Response type
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

interface ApiErrorResponse {
    success: false;
    message: string;
    code?: string;
    reason?: string;
    data: null;
    errors?: Array<{ field: string; message: string }>;
}

// Router usage
app.get("/users/:id", async (c) => {
    const user = await getUser(c.req.param("id"));
    if (!user) {
        return c.json({ success: false, message: "User not found", data: null }, 404);
    }
    return c.json({ success: true, data: user }, 200);
});
```
