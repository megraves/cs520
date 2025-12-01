# Campus Quest — Feature Documentation & Architecture Plan

## 🎯 Executive Summary

Campus Quest is a location-aware event discovery and check-in app for UMass Amherst.
 The product vision is to make campus engagement intuitive, social, and rewarding — connecting students to events happening around them.

To scale development, the codebase is being migrated to a **feature-based architecture** with modular services, clear boundaries, and future-ready gamification components.

------

## ✅ Current Feature Set (MVP Achieved)

### 1️⃣ Authentication & Profiles

- Secure login/signup (Supabase Auth)
- Profile editing (display name, avatar coming soon)
- Strong password validation + error feedback

### 2️⃣ Event Discovery (“Wander Mode”)

- Browse public campus events (chronological)
- Searchable card interface with:
  - Title, date/time summary
  - Official vs User-Created origin badge
- Navigation from feed → details page

### 3️⃣ Event Creation & Management (“My Events”)

- Users can create/edit/delete their own events
- Location picker with:
  - Search by address (Nominatim)
  - Precise drag-to-place mapping
- Coordinates stored for location-aware features
- User dashboard listing created events

### 4️⃣ Event Details & Check-In (“Go Mode”)

- Interactive map: user vs event location
- Real-time GPS tracking:
  - Watch position updates
  - Permission monitoring
  - HTTPS enforcement
- Check-in rule: **within 100m**
- Dynamic distance feedback: ✅ visual + numeric

### 5️⃣ Location Services

- Haversine distance calculation
- UMass-bounded geocoding search
- Fault-tolerant geolocation:
  - Secure context errors
  - Permission denied states
  - Retry handling

------

## 🚧 Technical Shortcomings Today

✅ Functionality exists
 ⚠️ Maintainability does **not** scale

| Issue                              | Result                         |
| ---------------------------------- | ------------------------------ |
| Logic duplicated across components | Harder to update & debug       |
| Monolithic components              | 200+ lines mixing UI + data    |
| No shared service layer            | Direct Supabase everywhere     |
| Limited type/API organization      | Risk of inconsistent data flow |
| Hard to onboard new developers     | No layering structure          |

------

## ✅ Proposed Architecture Upgrade

### 🗂 New Project Structure (Feature-Based)

```
src/
├── features/
│   ├── auth/
│   ├── events/
│   ├── location/
│   ├── checkin/
│   └── profile/
│
├── shared/ (reusable UI + utils + types)
├── pages/ (feature orchestrators)
├── lib/ (supabase client + infra)
└── App.tsx (routing only)
```

### 📌 Architecture Principles

| Layer         | Responsibility                             |
| ------------- | ------------------------------------------ |
| UI Components | Pure rendering + user interaction          |
| Services      | Business logic + Supabase queries          |
| Hooks         | State + orchestrating async flows          |
| Utils         | Pure functions (time, distance, constants) |

✅ No component should query Supabase directly
 ✅ Every domain has its **own folder, services, hooks, components**

------

## 🧩 Service Responsibilities (High-Level)

| Feature  | Key Services                            | Responsibilities                 |
| -------- | --------------------------------------- | -------------------------------- |
| Auth     | `authService`                           | Login, signup, session restore   |
| Events   | `eventService`, `geocodingService`      | CRUD + geocoding                 |
| Check-In | `checkinService`                        | Check-in existence & persistence |
| Location | `geolocationService`, `distanceService` | GPS + proximity logic            |
| Profiles | `profileService` (later)                | Profile fetch + stats surfacing  |

✅ Replacing direct DB calls
 ✅ Fully testable
 ✅ Shared across pages

------

## ✅ Roadmap to Modularization

| Phase                     | Timeline | Goals                                   |
| ------------------------- | -------- | --------------------------------------- |
| 1 — Service Extraction    | ✅ Week 1 | Move business logic out of UI           |
| 2 — Utils Standardization | ✅ Week 1 | Shared constants + time/distance tools  |
| 3 — Component Separation  | Week 2   | Each feature folder owns its components |
| 4 — Check-In Integration  | Week 2–3 | Persist check-ins, track history        |
| 5 — Gamification Layer    | Week 3–4 | Leaderboards + badges (future)          |
| 6 — Social Features       | Later    | Friend feed + notifications             |

------

## 🚀 Future Features (Strategic Vision)

| Category        | Feature                             | Value Created         |
| --------------- | ----------------------------------- | --------------------- |
| Gamification    | Points, achievements, weekly quests | Boost daily usage     |
| Social          | Friend check-ins, attendance feed   | Community building    |
| Personalization | Event recommendations               | Better discovery      |
| Moderation      | Report events + admin dashboard     | Safety + quality      |
| Analytics       | Heatmaps of event activity          | Insights for planners |

📌 The platform is built to turn student engagement into a **meaningful interactive experience**.