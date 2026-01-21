# DooShort - URL Shortener

DooShort is a URL shortener and analytics platform built with **DooLang**, a modern compiled language that generates native binaries via LLVM. This project demonstrates the power of DooLang's backend capabilities, featuring a type-safe FFI, declarative routing, and built-in architectural patterns.

## 🚀 Technology Stack

- **Language:** [DooLang](https://github.com/nynrathod/doolang) (Rust + LLVM)
- **Frontend:** React (TypeScript, Vite, Tailwind CSS)
- **Database:** PostgreSQL
- **Deployment:** Docker / Cloud Native

## ⚡ Key Features

Built entirely in DooLang (`server/`), leveraging standard library primitives for maximum performance and safety:

- **High-Performance Native Binary**: Compiles directly to machine code using LLVM.
- **Declarative Routing**: Expressive, type-safe route definitions with built-in group support.
- **Built-in Authentication**: One-line JWT authentication setup (`app.auth`).
- **Middleware**: Built-in CORS and Rate Limiting features.
- **FFI Integration**: Uses `std/Random.doo` (Base62) via FFI for efficient short code generation.
- **RFC-Compliant Responses**: All API responses follow standard JSON structures effortlessly.

---

## 🛠 Backend Architechture (`server/`)

### Entry Point (`main.doo`)

The server setup is minimalist yet powerful, handling middleware, auth, and routing in under 60 lines of code.

```rust
// server/main.doo

// 1. Initialize Database
let db = Database::postgres()?;

// 2. Setup Server
let app = Server::new(":3001");

// 3. Middleware
app.cors();          // Open CORS policy
app.ratelimit();     // 100 requests/min per IP

// 4. Authentication (Auto-generated Signup/Login routes)
app.auth("/api/auth/signup", "/api/auth/login", User, db);

// 5. Protected Routes (Grouped)
app.group("/api/links", jwt(), {
    post("/", CreateLink),
    get("/", ListLinks),
    // ... other routes
});

app.start();
```

### Data Models & Decorators (`models.doo`)

DooLang uses a powerful decorator system to define schema validation, database relationships, and API behavior in a single definition.

#### Decorator Reference

| Decorator         | Scope      | Description                                                                               |
| :---------------- | :--------- | :---------------------------------------------------------------------------------------- |
| `@primary`        | DB         | Marks the field as the primary key.                                                       |
| `@table`          | DB         | Creates a direct database table via schema.                                               |
| `@autoTimestamp`  | DB         | Automatically manages `created_at` and `updated_at` timestamps.                           |
| `@redirect`       | Logic      | Automatically sends a redirect HTTP response if the field is defined.                     |
| `@foreign(Table)` | DB         | Defines a foreign key relationship, taking the ID from the specified table.               |
| `@auto`           | DB/API     | Auto-incrementing (DB) and strictly **Output-Only** in API (Response).                    |
| `@unique`         | DB         | Enforces unique constraint in the database.                                               |
| `@writeOnly`      | API        | **Input-Only**. Field is required in Request but never sent in Response (e.g., Password). |
| `@readOnly`       | API        | **Output-Only**. Field appears in Response but is ignored/forbidden in Request.           |
| `@internal`       | Internal   | Private field. Neither accepted in Request nor sent in Response.                          |
| `@hash`           | Logic      | Automatically hashes the value before saving (e.g., Bcrypt).                              |
| `@email`          | Validation | Validates string format as an email.                                                      |
| `@url`            | Validation | Validates string format as a URL.                                                         |
| `@min(n)`         | Validation | Enforces minimum length/value.                                                            |
| `@default(v)`     | DB/Logic   | Sets a default value if not provided.                                                     |

#### Field Visibility Rules

| Case                  | Decorator             | Example                     | Behavior                              |
| :-------------------- | :-------------------- | :-------------------------- | :------------------------------------ |
| **In Req / Not Res**  | `@writeOnly`          | `Password: Str @writeOnly`  | Confidential inputs (sensitive data). |
| **In Req / In Res**   | _(None)_              | `Name: Str`                 | Standard read-write fields.           |
| **Not Req / In Res**  | `@auto` / `@readOnly` | `id: Int @auto`             | Auto-generated or computed fields.    |
| **Not Req / Not Res** | `@internal`           | `InternalID: Int @internal` | Hidden internal state.                |

**Optional Modifiers (`?`):**

- `expiresAt?: DateTime`: Optional in both Request and Response.
- `password?: Str @writeOnly`: Optional in Request, never in Response.

#### Schema Example

```rust
struct Link @table @autoTimestamp(read) {
    id: Int @primary @auto,

    // ShortCode is generated by server, effectively readonly to user
    ShortCode: Str @unique @readOnly,

    // Redirect logic handled by standard lib
    DestinationUrl: Str @url @redirect,

    // Foreign key relationship
    UserId: Int @foreign(User),

    // Default 0, read-only to API consumers
    ClickCount: Int @readOnly @default(0),

    // Optional fields
    ExpiresAt?: Str,
}
```

---

## 🔒 Security & Performance

- **Base62 Generation**: Utilizes `std/Random.doo` via FFI for cryptographically secure, collision-resistant short codes.
- **Rate Limiting**: Integrated token bucket rate limiter (`app.ratelimit()`) protects against abuse.
- **JWT Auth**: Stateless authentication baked into the core library.

## 🐳 Deployment

The application is containerized for easy deployment.

The native binary size is extremely small compared to managed languages, and memory footprint is minimal due to manual memory management at the LLVM level.
