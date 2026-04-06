# Zorvyn Fintech Backend

A backend REST API for a finance dashboard system with role-based access control, financial records management, and dashboard analytics.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| PostgreSQL (Supabase) | Database |
| Prisma ORM | Database queries and migrations |
| JWT | Authentication tokens |
| bcrypt | Password hashing |

---

## Features

- JWT based authentication
- Role based access control (Admin, Analyst, Viewer)
- Financial records management with filtering
- Dashboard analytics (summary, category totals, monthly trends)
- User management (Admin only)
- Password change functionality
- Audit trail (tracks who created and last updated each record)

---

## Roles and Permissions

| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View records | ✅ | ✅ | ✅ |
| Create / Update / Delete records | ❌ | ❌ | ✅ |
| View dashboard summary | ❌ | ✅ | ✅ |
| View category totals | ❌ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Change own password | ✅ | ✅ | ✅ |

---

## Project Structure

```
src/
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── record.routes.js
│   └── dashboard.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── record.controller.js
│   └── dashboard.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── role.middleware.js
├── prisma.js
└── index.js
prisma/
├── schema.prisma
├── seed.js
└── migrations/
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/KeshavAjagaonkar/zorvyn-fintech-backend.git
cd zorvyn-fintech-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your_supabase_pooling_connection_string"
DIRECT_URL="your_supabase_direct_connection_string"
JWT_SECRET="your_jwt_secret_key"
PORT=3000
```

> You can get `DATABASE_URL` and `DIRECT_URL` from Supabase → Settings → Database → Connection String

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Seed the database (creates default admin user)

```bash
npm run seed
```

Default admin credentials:
```
Email:    admin@finance.com
Password: admin1234
```

### 6. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

---

## API Endpoints

### Auth Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /auth/login | Public | Login and get JWT token |
| PATCH | /auth/change-password | All logged in users | Change own password |

#### POST /auth/login
```json
Request Body:
{
    "email": "admin@finance.com",
    "password": "admin1234"
}

Response:
{
    "token": "eyJhbGci..."
}
```

#### PATCH /auth/change-password
```json
Headers:
Authorization: Bearer <token>

Request Body:
{
    "oldPassword": "admin1234",
    "newPassword": "newpass123"
}
```

---

### User Routes (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | /users | Get all users |
| GET | /users/:id | Get one user |
| POST | /users | Create new user |
| PATCH | /users/:id | Update role or status |
| DELETE | /users/:id | Delete user |

#### POST /users
```json
Headers:
Authorization: Bearer <admin_token>

Request Body:
{
    "name": "John Analyst",
    "email": "analyst@finance.com",
    "password": "analyst1234",
    "role": "ANALYST"
}
```

> Role must be one of: ADMIN, ANALYST, VIEWER

---

### Record Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /records | All roles | Get all records (supports filters) |
| GET | /records/:id | All roles | Get one record |
| POST | /records | Admin only | Create a record |
| PATCH | /records/:id | Admin only | Update a record |
| DELETE | /records/:id | Admin only | Delete a record |

#### POST /records
```json
Headers:
Authorization: Bearer <admin_token>

Request Body:
{
    "amount": 50000,
    "type": "income",
    "category": "salary",
    "date": "2026-03-01",
    "note": "March salary"
}
```

> type must be either: income or expense

#### GET /records (with filters)
```
GET /records?type=income
GET /records?category=salary
GET /records?from=2026-01-01&to=2026-03-31
GET /records?type=expense&category=food
```

---

### Dashboard Routes (Admin and Analyst only)

| Method | Endpoint | Description |
|---|---|---|
| GET | /dashboard/summary | Total income, expenses, net balance |
| GET | /dashboard/category-totals | Totals grouped by category |
| GET | /dashboard/trends | Monthly income vs expense trends |

#### GET /dashboard/summary
```json
Response:
{
    "totalIncome": 150000,
    "totalExpenses": 80000,
    "netBalance": 70000,
    "totalRecords": 20
}
```

#### GET /dashboard/category-totals
```json
Response:
[
    { "category": "salary", "type": "income", "total": 100000 },
    { "category": "food", "type": "expense", "total": 15000 }
]
```

#### GET /dashboard/trends
```json
Response:
[
    { "month": "2026-01", "income": 50000, "expenses": 20000 },
    { "month": "2026-02", "income": 45000, "expenses": 25000 }
]
```

---

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

Get a token by calling `POST /auth/login`.

---

## Error Responses

| Status Code | Meaning |
|---|---|
| 400 | Bad request — missing or invalid input |
| 401 | Unauthorized — invalid or missing token |
| 403 | Forbidden — role does not have permission |
| 404 | Not found — resource does not exist |
| 500 | Internal server error |

---

## Database Schema

### User
```
id          Int       Primary key
name        String
email       String    Unique
password    String    Hashed with bcrypt
role        Enum      ADMIN / ANALYST / VIEWER
status      String    active / inactive
createdAt   DateTime
```

### Record
```
id           Int       Primary key
amount       Float
type         String    income / expense
category     String
date         DateTime
note         String    Optional
createdById  Int       Foreign key → User.id
updatedById  Int       Foreign key → User.id (nullable)
createdAt    DateTime
updatedAt    DateTime  Auto updated
```

---

## Assumptions Made

1. **No public registration** — Only admin can create user accounts. This makes sense for an internal company finance system where access should be controlled.

2. **Single role per user** — Each user has exactly one role. Simplifies permission logic.

3. **Financial records are company level** — Records belong to the company, not individual users. Any admin can update any record.

4. **Audit trail** — Every record tracks who created it and who last updated it via `createdById` and `updatedById` fields.

5. **Password flow** — Admin creates user with a temporary password. User logs in and changes password via `PATCH /auth/change-password`.

6. **Soft delete not implemented** — Records and users are hard deleted. Can be added as an enhancement.

---

## Tradeoffs Considered

- **Prisma over raw SQL** — Prisma gives type safety, auto migrations, and clean query API. Tradeoff is slightly less flexibility for complex raw queries.
- **JWT stateless auth** — Simple to implement and scale. Tradeoff is tokens cannot be invalidated before expiry without a token blacklist.
- **In-memory trend calculation** — Monthly trends are calculated in JavaScript rather than raw SQL for readability. For large datasets, a raw SQL GROUP BY query would be more efficient.

---

## Live API

Base URL: `https://your-render-url.onrender.com`

> Test credentials available on request.