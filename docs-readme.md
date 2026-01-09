# Car Detailing App – Full Documentation

> **Purpose**: This document explains every part of the Car Detailing application – from the backend API and database schema to the React‑Native mobile UI, design system, authentication flow, and how to run/develop the project.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Backend (Node/Express)](#backend-nodeexpress)
   - 4.1 [Environment Variables](#environment-variables)
   - 4.2 [Database Schema](#database-schema)
   - 4.3 [API Endpoints](#api-endpoints)
   - 4.4 [Controllers & Routes](#controllers--routes)
   - 4.5 [Authentication & Middleware](#authentication--middleware)
   - 4.6 [Running the Server](#running-the-server)
5. [Frontend (React Native with Expo)](#frontend-react-native-with-expo)
   - 5.1 [Design System (`theme.js`)](#design-system-themejs)
   - 5.2 [Reusable Components](#reusable-components)
   - 5.3 [Screens](#screens)
   - 5.4 [Navigation & Role‑Based Routing](#navigation--role‑based-routing)
   - 5.5 [State Management (AuthContext)](#state-management-authcontext)
   - 5.6 [Running the Mobile App](#running-the-mobile-app)
6. [Detailer Dashboard & Management Features](#detailer-dashboard--management-features)
   - 6.1 [Dashboard Stats Endpoint](#dashboard-stats-endpoint)
   - 6.2 [Service Management API](#service-management-api)
   - 6.3 [Booking Management API](#booking-management-api)
   - 6.4 [Profile Editing API](#profile-editing-api)
   - 6.5 [Frontend Screens for Detailers](#frontend-screens-for-detailers)
7. [Testing & Verification](#testing--verification)
8. [Development Workflow](#development-workflow)
9. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
10. [Future Enhancements](#future-enhancements)
11. [License & Credits]

---

## 1. Project Overview

The **Car Detailing App** connects car owners (customers) with mobile detailers. Customers can browse detailers, view services, book appointments, and pay through Stripe. Detailers have a dedicated dashboard to manage services, view and accept bookings, and edit their business profile.

Key features:
- Modern, dark‑theme UI built with React Native `StyleSheet` (no Tailwind).
- Centralised design system (`theme.js`).
- Role‑based navigation (customer vs. detailer).
- Full CRUD for services, booking lifecycle (pending → confirmed → in‑progress → completed).
- Dashboard statistics for detailers (services count, bookings, rating, revenue).
- Secure authentication using JWT stored via platform‑agnostic storage wrappers.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, PostgreSQL, `pg`, `dotenv`, `bcryptjs`, JWT |
| **Frontend** | React Native (Expo), Axios, React Navigation, custom `StyleSheet` design system |
| **Payments** | Stripe (wrapped for native & web) |
| **Dev Tools** | VS Code, pgAdmin 4, npm, Expo CLI |

---

## 3. Folder Structure

```
car-detailing-app/
├─ backend/                # Node/Express API
│   ├─ src/
│   │   ├─ config/          # DB connection (db.js)
│   │   ├─ controllers/     # Business logic
│   │   │   ├─ userController.js
│   │   │   ├─ serviceController.js
│   │   │   ├─ bookingController.js
│   │   │   └─ detailerController.js   # stats endpoint
│   │   ├─ middleware/      # authMiddleware.js
│   │   ├─ routes/          # Express routers
│   │   │   ├─ authRoutes.js
│   │   │   ├─ userRoutes.js
│   │   │   ├─ serviceRoutes.js
│   │   │   ├─ bookingRoutes.js
│   │   │   └─ detailerRoutes.js
│   │   └─ server.js        # Express app entry point
│   ├─ .env                 # DATABASE_URL, JWT_SECRET, etc.
│   ├─ seed_detailers.js    # Script to seed sample data
│   └─ update_schema.js     # Adds new columns to bookings table
│
├─ mobile/                 # React Native (Expo) app
│   ├─ src/
│   │   ├─ components/      # Reusable UI components (StatCard, ActionButton, …)
│   │   ├─ constants/       # theme.js (design system)
│   │   ├─ context/         # AuthContext (auth state & token handling)
│   │   ├─ navigation/      # AppNavigator (stack navigator)
│   │   ├─ screens/         # All screens (Login, Register, Home, DetailerProfile, …)
│   │   │   ├─ DetailerDashboardScreen.js
│   │   │   ├─ ManageServicesScreen.js
│   │   │   ├─ AddEditServiceScreen.js
│   │   │   ├─ ManageBookingsScreen.js
│   │   │   └─ EditProfileScreen.js
│   │   └─ services/        # API wrappers (api.js / api.web.js)
│   └─ App.js               # Root component
│
├─ QUICK_FIX.md            # Quick‑fix guide for backend restart, etc.
├─ DETAILER_IMPLEMENTATION_STEPS.md   # Step‑by‑step plan we built earlier
├─ docs-readme.md          # **THIS FILE** – full documentation
└─ package.json (both backend & mobile) 
```

---

## 4. Backend (Node/Express)

### 4.1 Environment Variables (`backend/.env`)
```
DATABASE_URL=postgres://username:password@localhost:5432/cardetailing
JWT_SECRET=your-jwt-secret-here
PORT=5000
```
- `DATABASE_URL` is used by `pg` to connect to PostgreSQL (see `.env.example`).
- `JWT_SECRET` signs/validates authentication tokens.
- `PORT` defaults to **5000**.

### 4.2 Database Schema
The main tables are:
```sql
-- users table (stores auth info)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer','detailer')),
    phone_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- profiles table (detailer‑specific info)
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    bio TEXT,
    rating NUMERIC(2,1) DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    service_radius_km INTEGER,
    location_coordinates JSONB,
    business_hours JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- services table (offered by a detailer)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    detailer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- bookings table (customer‑detailer appointments)
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    detailer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMP NOT NULL,
    location_address TEXT,
    total_price NUMERIC(10,2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, in_progress, completed, cancelled
    notes TEXT,
    declined_reason TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```
**Schema updates** (added by `update_schema.js`): `notes`, `declined_reason`, `started_at`, `completed_at` columns.

### 4.3 API Endpoints
All routes are prefixed with `/api`.
| Method | Path | Description | Access |
|--------|------|-------------|--------|
| **Auth** | `POST /api/auth/register` | Register new user (customer or detailer) | Public |
|  | `POST /api/auth/login` | Login & receive JWT | Public |
| **Users** | `GET /api/users/me` | Get logged‑in user profile (includes detailer profile) | Private |
|  | `GET /api/users/detailers` | List all detailers (public) |
|  | `GET /api/users/detailers/:id` | Get a single detailer by id |
|  | `PUT /api/users/profile` | Update detailer profile (business name, bio, radius, etc.) | Private (detailer) |
| **Services** | `GET /api/services/detailer/:detailerId` | Public list of a detailer’s active services |
|  | `GET /api/services/my-services` | Logged‑in detailer’s own services | Private |
|  | `POST /api/services` | Create new service | Private |
|  | `PUT /api/services/:id` | Update service | Private |
|  | `DELETE /api/services/:id` | Delete service (checks for active bookings) | Private |
|  | `PATCH /api/services/:id/toggle` | Enable/disable service | Private |
| **Bookings** | `POST /api/bookings` | Customer creates a booking | Private (customer) |
|  | `GET /api/bookings` | Customer sees own bookings | Private |
|  | `GET /api/bookings/detailer` | Detailer sees own bookings (optional `status` query) | Private |
|  | `PATCH /api/bookings/:id/accept` | Detailer accepts pending booking |
|  | `PATCH /api/bookings/:id/decline` | Detailer declines pending booking (optional reason) |
|  | `PATCH /api/bookings/:id/start` | Detailer starts a confirmed job |
|  | `PATCH /api/bookings/:id/complete` | Detailer completes a job (adds notes, increments jobs_completed) |
|  | `PATCH /api/bookings/:id/status` | Generic status update (kept for backward compatibility) |
| **Detailer Dashboard** | `GET /api/detailer/stats` | Returns aggregated stats for the logged‑in detailer | Private |

### 4.4 Controllers & Routes
- **`userController.js`** – handles profile fetch, detailer list, single detailer fetch, and profile updates.
- **`serviceController.js`** – CRUD for services plus `getMyServices`.
- **`bookingController.js`** – creates bookings, returns bookings for customers/detailers, and implements the lifecycle methods (accept, decline, start, complete).
- **`detailerController.js`** – aggregates stats (service counts, booking counts, rating, revenue).
- **Routes** map directly to these controllers (`authRoutes`, `userRoutes`, `serviceRoutes`, `bookingRoutes`, `detailerRoutes`).
- **`authMiddleware.js`** validates the JWT, attaches `req.user` (id, role, email) to every protected request.

### 4.5 Authentication & Middleware
1. **Register** – password hashed with `bcryptjs` before storing.
2. **Login** – verifies password, issues a JWT (`jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: '7d' })`).
3. **`protect` middleware** – reads `Authorization: Bearer <token>` header, verifies token, populates `req.user`.
4. **Platform‑agnostic storage** – token is stored via `utils/storage` (SecureStore on native, `localStorage` on web).

### 4.6 Running the Server
```bash
# From the backend folder
cd backend
npm install   # (once)
npm start      # runs `node server.js` on PORT 5000
```
- The server prints `Server running on port 5000`.
- If you change any route/controller, **restart** the server (Ctrl‑C then `npm start`).

---

## 5. Frontend (React Native with Expo)

### 5.1 Design System – `theme.js`
Located at `mobile/src/constants/theme.js`. It exports a single object:
```js
export const colors = { primary: '#00e5ff', background: '#121212', surface: '#1e1e1e', text: '#ffffff', success: '#00e676', ... };
export const typography = { h1: { fontSize: 32, fontWeight: 'bold' }, body: { fontSize: 16, lineHeight: 24 }, ... };
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const shadows = { small: { shadowOpacity: 0.25, elevation: 2 }, medium: { ... }, large: { ... } };
export const commonStyles = { card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, ...shadows.medium }, button: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: spacing.sm, alignItems: 'center' } };
```
All screens import `theme` and use `StyleSheet.create({ ... })` with these tokens for **consistent colors, spacing, typography, and shadows**.

### 5.2 Reusable Components
| Component | Purpose |
|-----------|---------|
| `StatCard.js` | Shows a numeric value with an icon/label (used on dashboard). |
| `ActionButton.js` | Large tappable button with icon, title, subtitle – used for quick actions. |
| `BookingCard.js` | Card that displays a booking’s details and status‑specific action buttons. |
| `ServiceCard.js` | Card for a service with edit/delete/toggle actions. |
| `LoadingState.js` | Centered spinner + optional message. |
| `EmptyState.js` | Friendly UI when a list is empty (icon, title, optional button). |
| `DetailerCard.js` (modified) | Shows a detailer on the Home screen with gradient border, rating stars, stats badges, and press animation. |

All components respect the dark theme and use `Pressable` with scale animation for tactile feedback.

### 5.3 Screens
| Screen | Description |
|--------|-------------|
| **LoginScreen** | Email/password login; on success navigates based on `user.role`. |
| **RegisterScreen** | Account creation with role selector (customer/detailer). |
| **HomeScreen** (customer) | Hero greeting, stats bar, list of nearby detailers (`DetailerCard`). Uses `LoadingState`/`EmptyState`. |
| **DetailerProfileScreen** | Shows a single detailer’s profile, services, contact button. |
| **BookingScreen** | Service summary + date/time pickers → creates a booking. |
| **PaymentScreen** | Stripe wrapper (platform‑agnostic) to process payment. |
| **DetailerDashboardScreen** | Hero greeting for detailer, stat cards (`StatCard`), quick action buttons (Manage Services, View Bookings, Edit Profile), recent bookings preview (`BookingCard`). |
| **ManageServicesScreen** | List of the detailer’s services, add button → `AddEditServiceScreen`. |
| **AddEditServiceScreen** | Form for creating or editing a service (name, description, price, duration, active toggle). |
| **ManageBookingsScreen** | Tabbed view (Pending, Confirmed, In‑Progress, Completed, All). Each booking displayed with `BookingCard` and appropriate actions (accept/decline/start/complete). |
| **EditProfileScreen** | Form to edit business name, bio, phone, service radius, location coordinates, business hours. |

### 5.4 Navigation & Role‑Based Routing
`AppNavigator.js` defines a **Native Stack**. After login, `AuthContext` checks `user.role`:
- **customer** → `Home`, `DetailerProfile`, `Booking`, `Payment`.
- **detailer** → `DetailerDashboard`, `ManageServices`, `AddEditService`, `ManageBookings`, `EditProfile`.
All routes are registered; the initial route is set dynamically based on the stored token.

### 5.5 State Management – `AuthContext`
- Holds `user` (id, email, role) and JWT token.
- Provides `login`, `logout`, `register` helpers that call the backend auth endpoints.
- Persists token using the platform‑agnostic storage wrapper.
- On app start, attempts to load token → validates → sets `user`.
- Exposes `isLoading` flag for splash screen handling.

### 5.6 Running the Mobile App
```bash
# From the mobile folder
cd mobile
npm install   # (once)
# Start Expo dev server (default runs on localhost:19000)
npx expo start
# Choose "Run on Android device/emulator", "Run on iOS simulator", or "Run in web".
```
- The app automatically hot‑reloads when you edit source files.
- Ensure the backend server (`npm start` in `backend`) is running so the mobile app can reach `http://localhost:5000` (or the URL defined in `api.js`).

---

## 6. Detailer Dashboard & Management Features

### 6.1 Dashboard Stats Endpoint (`GET /api/detailer/stats`)
Returns JSON:
```json
{
  "services": { "total": 5, "active": 4 },
  "bookings": { "total": 27, "pending": 2, "confirmed": 5, "in_progress": 1, "completed": 19 },
  "rating": 4.8,
  "jobs_completed": 127,
  "revenue": { "total": 12450.00, "month": 3200.00 }
}
```
Used by `DetailerDashboardScreen` to populate `StatCard` components.

### 6.2 Service Management API
- **GET /api/services/my-services** – list all services for logged‑in detailer.
- **POST /api/services** – create new service.
- **PUT /api/services/:id** – update.
- **DELETE /api/services/:id** – delete (fails if there are pending/confirmed bookings).
- **PATCH /api/services/:id/toggle** – quick enable/disable.

### 6.3 Booking Management API
- **GET /api/bookings/detailer?status=…** – filter by status.
- **PATCH /api/bookings/:id/accept** – set status to `confirmed`.
- **PATCH /api/bookings/:id/decline** – set status to `cancelled` + optional reason.
- **PATCH /api/bookings/:id/start** – set status to `in_progress` & `started_at`.
- **PATCH /api/bookings/:id/complete** – set status to `completed`, store `notes`, `completed_at`, and increment `jobs_completed` in the profile.

### 6.4 Profile Editing API (`PUT /api/users/profile`)
Accepts JSON:
```json
{ "business_name": "…", "bio": "…", "phone_number": "…", "service_radius_km": 30, "location_coordinates": { "lat": 40.7128, "lng": -74.0060 } }
```
Updates the `profiles` row for the logged‑in detailer.

### 6.5 Frontend Screens for Detailers
- **DetailerDashboardScreen** – shows stats, quick actions, recent bookings.
- **ManageServicesScreen** – list with `ServiceCard`; add/edit via `AddEditServiceScreen`.
- **AddEditServiceScreen** – form with validation; re‑uses same component for both add and edit modes.
- **ManageBookingsScreen** – tabbed filter; each booking rendered with `BookingCard` that shows appropriate buttons based on status.
- **EditProfileScreen** – pre‑filled form; on submit calls `PUT /api/users/profile`.

All screens use the same `theme` for colors, spacing, and typography, and all touchables have press animations for a premium feel.

---

## 7. Testing & Verification
1. **Backend unit tests** (if you add Jest/Mocha) – test each controller method with mock `db`.
2. **Manual API testing** – use Postman or `curl`:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"yourpassword"}'
   ```
3. **Mobile UI testing** – run the app on a device/emulator, log in as a detailer, verify:
   - Dashboard stats load correctly.
   - Service CRUD works (add, edit, toggle, delete).
   - Booking lifecycle works (accept → start → complete).
   - Profile updates persist.
4. **End‑to‑end flow** – Customer creates a booking → Detailer accepts → completes → Customer sees completed status.
5. **Database verification** – open pgAdmin, run queries to ensure rows are created/updated as expected.

---

## 8. Development Workflow
1. **Start backend** – `cd backend && npm start`.
2. **Start mobile** – `cd mobile && npx expo start`.
3. **Make changes** – edit code; hot‑reload will update the app automatically.
4. **When you modify routes/controllers** – stop the backend (`Ctrl‑C`) and restart to load new code.
5. **Seeding data** – run `node seed_detailers.js` (once) to populate sample detailers and services.
6. **Schema migrations** – run `node update_schema.js` after adding new columns.
7. **Version control** – commit changes regularly; the project uses a standard Git repo.

---

## 9. Common Issues & Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|---------------|-----|
| **404 on `/api/users/detailers`** | Backend not restarted after route change | Stop server (`Ctrl‑C`) → `npm start` again |
| **Login 401 Unauthorized** | Password mismatch or user not seeded | Verify credentials or re-run `seed_detailers.js` |
| **Empty list on Home screen** | No detailer rows in DB | Run `node seed_detailers.js` or check `SELECT * FROM users WHERE role='detailer'` in pgAdmin |
| **Cannot delete a service** | Service has pending/confirmed bookings | Either cancel those bookings first or use the UI to decline them |
| **`Cannot read property 'id' of undefined` in mobile** | `AuthContext` token missing or expired | Clear storage (`AsyncStorage.clear()` or SecureStore) and log in again |
| **pgAdmin cannot connect** | PostgreSQL service not running | Start PostgreSQL from Windows Services or run `pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start` |
| **CORS errors when testing from web** | Missing CORS headers for new routes | Ensure `app.use(cors())` is present in `server.js` (it is) and that the request origin is allowed |

---

## 10. Future Enhancements
- **Detailer Dashboard Analytics** – charts for revenue over time (use `react-native-svg-charts`).
- **Push Notifications** – inform detailers of new bookings, customers of status changes.
- **Image Uploads** – allow detailers to add portfolio photos (store in S3 or Cloudinary).
- **Search & Filters** – customers can filter detailers by rating, distance, price range.
- **Stripe Webhooks** – automatically mark bookings as paid/completed.
- **Multi‑language support** – i18n for international markets.
- **Unit & Integration Tests** – Jest for backend, React Native Testing Library for UI.

---

## 11. License & Credits
- **License:** MIT – feel free to use, modify, and distribute.
- **Credits:**
  - **React Native** – UI framework.
  - **Expo** – development tooling.
  - **PostgreSQL** – database.
  - **Stripe** – payment processing.
  - **pgAdmin 4** – DB admin UI.
  - **OpenAI** – assistance in planning and documentation.

---

*End of documentation.*
