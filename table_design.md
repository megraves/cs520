

## Campus Quest - Complete Database Schema Design

### Overview

This document provides a comprehensive database schema for Campus Quest, a location-based event discovery and check-in application. The schema supports user authentication, event management, location-based features, check-ins, and gamification.

### Table Overview

| #    | Table               | Purpose            | Key Features                     |
| ---- | ------------------- | ------------------ | -------------------------------- |
| 1    | `auth.users`        | Authentication     | Managed by Supabase              |
| 2    | `user_profiles`     | Extended user data | Stats, achievements, settings    |
| 3    | `events`            | Campus events      | Location, time, creator tracking |
| 4    | `event_categories`  | Event types        | Searchable categories            |
| 5    | `event_checkins`    | Check-in records   | Location verification, points    |
| 6    | `event_favorites`   | Saved events       | User bookmarks                   |
| 7    | `achievements`      | Unlockable badges  | Gamification definitions         |
| 8    | `user_achievements` | Unlocked badges    | User progress tracking           |
| 9    | `notifications`     | In-app alerts      | Achievement, event updates       |
| 10   | `friendships`       | Social connections | Friend relationships (future)    |
| 11   | `event_reports`     | Content moderation | User-reported issues             |

------

### Core Tables

#### `auth.users` (Supabase Managed)

```sql
-- Automatically created by Supabase Auth
-- Contains: id (UUID), email, encrypted_password, metadata
```

------

#### 1. `USERS`

**Purpose:** Authentication and core user identity (managed by Supabase)

**Note:** This table is automatically created and managed by Supabase Auth. We reference it via foreign keys.

| Column               | Type        | Description                  |
| -------------------- | ----------- | ---------------------------- |
| `id`                 | UUID        | Primary key, auto-generated  |
| `email`              | TEXT        | User email (unique)          |
| `encrypted_password` | TEXT        | Hashed password              |
| `email_confirmed_at` | TIMESTAMPTZ | Email verification timestamp |
| `created_at`         | TIMESTAMPTZ | Account creation             |
| `updated_at`         | TIMESTAMPTZ | Last update                  |

> Extra profile data stored in `raw_user_meta_data`, e.g.:
>
> ```
> { "username": "string", "full_name": "string" }
> ```

------

#### 2. `user_profiles`

**Purpose:** Public profile data + gamification stats
**Relationship:** `user_profiles.user_id → auth.users.id (1:1)`

| Column                               | Type        | Constraints / Notes      |
| ------------------------------------ | ----------- | ------------------------ |
| id                                   | UUID (PK)   |                          |
| user_id                              | UUID FK     | UNIQUE, CASCADE DELETE   |
| display_name                         | TEXT        | Nullable                 |
| username                             | TEXT UNIQUE | Searchable handle        |
| avatar_url                           | TEXT        | Supabase Storage         |
| bio                                  | TEXT        | Profile description      |
| total_points                         | INT         | ≥ 0                      |
| level                                | INT         | ≥ 1 (# points / 100 + 1) |
| checkin_count                        | INT         | ≥ 0                      |
| events_created_count                 | INT         | ≥ 0                      |
| events_attended_count                | INT         | ≥ 0                      |
| notification_enabled                 | BOOL        | Default TRUE             |
| location_sharing_enabled             | BOOL        | Default TRUE             |
| created_at / updated_at / deleted_at | TIMESTAMPTZ | Tracked/soft delete      |

------

#### 3. `events`

**Purpose:** Campus events — official + user-created
**Relationship:** `creator_id → auth.users.id`

| Column                               | Type        | Notes                               |
| ------------------------------------ | ----------- | ----------------------------------- |
| id                                   | UUID PK     |                                     |
| title                                | TEXT        | Required                            |
| description                          | TEXT        |                                     |
| location_name                        | TEXT        | Required                            |
| location_address                     | TEXT        |                                     |
| latitude / longitude                 | NUMERIC     | Both NULL or both filled            |
| checkin_radius_meters                | INT         | Default 100m                        |
| event_date / start_time / end_time   | DATE/TIME   | Required, end > start               |
| timezone                             | TEXT        | Default EST                         |
| date_time_text                       | TEXT        | Precomputed for UI                  |
| image_url                            | TEXT        |                                     |
| external_url                         | TEXT        |                                     |
| category                             | TEXT        | Slug for filtering                  |
| tags                                 | TEXT[]      | List of keywords                    |
| max_capacity                         | INT         | Optional limit                      |
| current_attendees                    | INT         | Auto-increment                      |
| requires_registration                | BOOL        | Default FALSE                       |
| creator_id                           | UUID FK     | User who created event              |
| is_official                          | BOOL        | Default FALSE                       |
| status                               | ENUM        | draft/published/cancelled/completed |
| is_featured                          | BOOL        | UI highlight                        |
| created_at / updated_at / deleted_at | TIMESTAMPTZ |                                     |

📌 Indexing for:

- event_date ordering
- geospatial lookup
- featured events
- full-text search over name + description

------

#### 4. `event_categories`

**Purpose:** Controlled vocabulary for discovery UI
**Referenced by:** `events.category`

| Column     | Type        | Notes           |
| ---------- | ----------- | --------------- |
| id         | UUID PK     |                 |
| name       | TEXT UNIQUE | Display         |
| slug       | TEXT UNIQUE | URL-safe        |
| icon_name  | TEXT        | UI icons        |
| color_hex  | TEXT CHECK  | Theme           |
| sort_order | INT         | Display rank    |
| is_active  | BOOL        | For deprecation |
| created_at | TIMESTAMPTZ |                 |

Pre-seeded: academic, social, sports, arts, etc.

------

#### 5. `event_checkins`

**Purpose:** Verified event attendance
**Relationship:** Unique (`user_id`, `event_id`)

| Column                   | Type        | Notes                        |
| ------------------------ | ----------- | ---------------------------- |
| id                       | UUID PK     |                              |
| event_id                 | UUID FK     | CASCADE                      |
| user_id                  | UUID FK     | CASCADE                      |
| checked_in_at            | TIMESTAMPTZ | Default now                  |
| user_latitude/longitude  | NUMERIC     | Required                     |
| distance_meters          | INT         | ≥ 0                          |
| location_accuracy_meters | NUMERIC     | Optional                     |
| points_awarded           | INT         | Default 10                   |
| bonus_points             | INT         | Default 0                    |
| bonus_reason             | TEXT        | Optional                     |
| is_verified              | BOOL        | Fraud check                  |
| verification_method      | ENUM        | proximity/qr_code/manual/nfc |
| created_at               | TIMESTAMPTZ |                              |

📌 Triggers:

- Auto-update user stats
- Auto-increment event attendance
- Achievement awarding

------

#### 6. `event_favorites`

**Purpose:** User-saved events (bookmarks)

| Column                     | Type               | Notes   |
| -------------------------- | ------------------ | ------- |
| id                         | UUID PK            |         |
| event_id                   | UUID FK            | CASCADE |
| user_id                    | UUID FK            | CASCADE |
| created_at                 | TIMESTAMPTZ        |         |
| UNIQUE (user_id, event_id) | Prevent duplicates |         |

------

#### 7.  `achievements`

**Purpose:** Badge definitions

| Column                  | Type        | Description   |
| ----------------------- | ----------- | ------------- |
| id                      | UUID PK     |               |
| name                    | TEXT UNIQUE | Name          |
| slug                    | TEXT UNIQUE | URL-friendly  |
| description             | TEXT        |               |
| requirement_type        | ENUM        | Progress rule |
| requirement_value       | INT         | Threshold     |
| points_reward           | INT         | Bonus         |
| icon_url                | TEXT        | Badge icon    |
| sort_order              | INT         | Ranking       |
| is_active               | BOOL        | Visibility    |
| created_at / updated_at | TIMESTAMPTZ |               |

------

#### 8.  `user_achievements`

**Purpose:** Player progression → unlocked rewards
 **Relationship:** Unique(`user_id`,`achievement_id`)

| Column         | Type        | Notes               |
| -------------- | ----------- | ------------------- |
| id             | UUID PK     |                     |
| user_id        | UUID FK     |                     |
| achievement_id | UUID FK     |                     |
| unlocked_at    | TIMESTAMPTZ |                     |
| progress       | INT         | Partial achievement |

------

#### 9. `notifications`

**Purpose:** In-app notifications

| Column         | Type        | Example                   |
| -------------- | ----------- | ------------------------- |
| id             | UUID PK     |                           |
| user_id        | UUID FK     | receiver                  |
| type           | ENUM        | event_reminder / level_up |
| title          | TEXT        | “New Event Tonight!”      |
| message        | TEXT        | Details                   |
| event_id       | UUID FK     | optional                  |
| achievement_id | UUID FK     | optional                  |
| is_read        | BOOL        | default FALSE             |
| read_at        | TIMESTAMPTZ |                           |
| created_at     | TIMESTAMPTZ |                           |

------

#### 10.  `friendships` (Future)

Tracks social connections between users

| Column       | Type        | Notes                    |
| ------------ | ----------- | ------------------------ |
| id           | UUID PK     |                          |
| user_id      | UUID FK     | Sender                   |
| friend_id    | UUID FK     | Recipient                |
| status       | ENUM        | pending/accepted/blocked |
| requested_at | TIMESTAMPTZ |                          |
| accepted_at  | TIMESTAMPTZ |                          |

------

#### 11. `event_reports`

**Purpose:** Content moderation

| Column           | Type        | Notes                                |
| ---------------- | ----------- | ------------------------------------ |
| id               | UUID PK     |                                      |
| event_id         | UUID FK     |                                      |
| reported_by      | UUID FK     |                                      |
| reason           | ENUM        | abuse type                           |
| description      | TEXT        | optional                             |
| status           | ENUM        | pending/reviewing/resolved/dismissed |
| reviewed_by      | UUID FK     | Moderator                            |
| reviewed_at      | TIMESTAMPTZ |                                      |
| resolution_notes | TEXT        | optional                             |
| created_at       | TIMESTAMPTZ |                                      |