# Learnova

Assignment & Submission Management System, built for the Assistant Software Engineer recruitment project at OnnoRokom Projukti Limited.

It's a role-based system for a school/college setup, where Admin manages the structure (courses, subjects, users), Teachers create and grade assignments, and Students submit work and see their results. Built with ASP.NET Core on the backend and Next.js on the frontend.

## Live Demo

**Live Application:** https://learnova-sepia-delta.vercel.app/

> **Note:** The backend is hosted on Render's free tier, so the first request may take a few seconds while the server wakes up.

## Project Overview

The whole thing runs on three roles that don't overlap in what they can do:

- **Admin** sets up the structure — creates courses and subjects, assigns teachers to subjects, enrolls students into courses, and can promote a student to teacher when needed.
- **Teacher** creates assignments for the subjects they're assigned to, publishes them (or leaves them as drafts), reviews what students submit, and grades with marks and feedback.
- **Student** sees the courses they're enrolled in, views published assignments, submits an answer before the deadline, can edit that answer until the deadline passes, and checks their grade and feedback once a teacher grades it.

Every one of these rules is enforced on the backend, not just hidden in the UI. A request to an endpoint you're not allowed to touch gets rejected regardless of what the frontend shows you.

## Main Features

- JWT-based authentication with role-based authorization (Admin / Teacher / Student)
- Course, Subject, Enrollment, Assignment, and Submission management, each with real ownership and validation rules, not just plain CRUD
- Draft/Publish workflow for assignments — students only see published ones
- Deadline-enforced submissions, editable up until the deadline, locked after
- Grading workflow: marks, feedback, validated against the assignment's max marks
- Admin can promote a Student to Teacher (one-way, Student → Teacher only)
- Swagger/OpenAPI docs for browsing and testing the API directly
- Seed data on startup so the app is usable immediately after setup
- Unit tests covering the core business rules around submissions, ownership, and authorization

## Technology Stack

**Backend**

- ASP.NET Core Web API (.NET 10)
- Entity Framework Core
- PostgreSQL (hosted on Supabase)
- JWT authentication
- Swagger / OpenAPI

**Frontend**

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Zustand (auth state)
- React Hook Form + Zod (form validation)
- Axios

**Testing**

- xUnit
- EF Core In-Memory provider

## Project Structure

```text
Learnova/
├── backend/
│   ├── Controllers/          # API endpoints
│   ├── Services/              # Business logic, one service per domain
│   ├── Models/                # EF Core entities and result/status enums
│   ├── DTOs/                  # Request/response shapes per feature
│   ├── Data/
│   │   ├── AppDbContext.cs    # EF Core context, relationships, constraints
│   │   └── DatabaseSeeder.cs  # Seeds Admin/Teacher/Student + sample data
│   ├── Migrations/            # EF Core migration history
│   ├── appsettings.json       # Committed, no real secrets
│   ├── appsettings.Example.json  # Template for local config
│   └── Program.cs
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/         # Admin dashboard, courses, subjects, enrollments, users
│   │   │   ├── teacher/       # Teacher dashboard, assignments, submissions/grading
│   │   │   ├── student/       # Student dashboard, courses, assignments, submissions
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── components/
│   │   │   ├── ui/            # Shared primitives: Button, Card, Modal, DataTable, etc.
│   │   │   ├── layout/        # DashboardLayout, Sidebar, PageHeader
│   │   │   ├── AuthProvider.tsx
│   │   │   └── RoleGuard.tsx
│   │   ├── lib/
│   │   │   ├── api.ts         # Axios instance
│   │   │   └── validation/    # Zod schemas
│   │   ├── store/
│   │   │   └── authStore.ts   # Zustand auth state
│   │   ├── config/
│   │   │   └── navigation.ts  # Role-based nav config
│   │   └── types/
│   └── .env.example
│
└── Learnova.Tests/
    ├── AssignmentServiceTests.cs
    ├── EnrollmentServiceTests.cs
    ├── SubmissionServiceTests.cs
    └── Learnova.Tests.csproj

```

## Setup Instructions

### Requirements

- .NET 10 SDK
- Node.js 20+
- A PostgreSQL database (Supabase free tier works fine, or any Postgres instance)

### Backend

1. Go into the backend folder:

   ```bash
   cd backend
   ```

2. Copy the example config and fill in your real values:

   ```bash
   cp appsettings.Example.json appsettings.Development.json
   ```

   Then open `appsettings.Development.json` and set:
   - `ConnectionStrings.DefaultConnection` — your PostgreSQL connection string
   - `Jwt.Key` — any long random string, used to sign JWTs

   `appsettings.Development.json` is gitignored, so this stays local to your machine.

3. Run the API:

   ```bash
   dotnet run
   ```

   On startup, the app automatically applies any pending EF Core migrations and seeds the database with demo accounts and sample data. You don't need to create tables manually or run migrations yourself.

   The API runs on `http://localhost:5151` by default. Swagger UI is available at `http://localhost:5151/swagger` in development.

### Frontend

1. Go into the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the example env file:

   ```bash
   cp .env.example .env.local
   ```

   By default `NEXT_PUBLIC_API_URL` points to `http://localhost:5151`, which matches the backend's default port. Change it if your backend is running somewhere else.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   The app runs on `http://localhost:3000`.

## Database Setup

Migrations and seeding both run automatically the first time you start the backend — there's no separate step. As long as your connection string in `appsettings.Development.json` points to a valid, empty (or already-migrated) PostgreSQL database, `dotnet run` handles the rest.

The migration history is committed under `backend/Migrations/`, so the schema can be reproduced from source without needing a separate SQL dump or backup file.

## Demo Credentials

Seeded automatically on first run:

| Role    | Email                                               | Password            |
| ------- | --------------------------------------------------- | ------------------- |
| Admin   | [admin@learnova.com](mailto:admin@learnova.com)     | Admin@Learnova123   |
| Teacher | [teacher@learnova.com](mailto:teacher@learnova.com) | Teacher@Learnova123 |
| Student | [student@learnova.com](mailto:student@learnova.com) | Student@Learnova123 |

The seeded data also includes one course, one subject, one published assignment, and one ungraded submission, so there's something real to look at and grade right after setup rather than starting from a completely empty database.

## Running Tests

Tests live in `Learnova.Tests/` and use xUnit with EF Core's in-memory provider, so no real database connection is needed to run them.

From the repo root:

```bash
cd Learnova.Tests
dotnet test
```

The tests focus on the parts of the app where getting the logic wrong would actually matter — deadline enforcement on submissions, duplicate submission prevention, ownership checks (a teacher can't touch another teacher's assignment or grade outside their own), marks validation against an assignment's maximum, and enrollment duplication. These are tested at the service layer, since that's where the actual business rules live, rather than testing controllers, which are mostly thin routing on top of the services.

Course, Subject, and Auth logic aren't independently unit-tested — they're covered indirectly through the same role-based authorization pattern used everywhere else, but given the time available for this project, testing effort went toward the submission and grading workflow specifically, since that's the part the spec calls out directly.

## Assumptions

A few things in the spec weren't explicitly defined, so here's what I decided and why.

**Authentication** Email and password only. No social login for this version — didn't want to add OAuth complexity for a recruitment project scope. Passwords are hashed with ASP.NET Core's built-in `IPasswordHasher<User>`.

**Roles and registration** Every new registration defaults to Student. There's no way to register directly as Teacher or Admin — that's on purpose. An Admin can promote a Student to Teacher through `PUT /api/User/{id}/promote-to-teacher`, but that's the only direction it goes. Demoting a Teacher back to Student is blocked, because a Teacher owns Subjects and Assignments — letting them get demoted would leave that data pointing at someone who technically can't manage it anymore. Promotion to or from Admin isn't possible through this endpoint at all; Admin accounts only exist through seeding.

**Course and Subject structure** A Subject belongs to exactly one Course. A Course can't be deleted if it still has Subjects, Assignments, or Enrollments attached to it — same for deleting a Subject with Assignments attached. This is enforced two ways: the database itself blocks it with `DeleteBehavior.Restrict` on the foreign keys, and the service layer checks first so it can return a clean error message instead of letting a raw database exception bubble up. A Subject name has to be unique within its Course, but the same name can exist in a different Course.

**Teacher assignment** One teacher per subject at a time (`Subject.TeacherId` is nullable, since a subject can exist before anyone's assigned to it). When a Teacher creates an assignment, they don't get to freely pick any course/subject combination — the backend checks that the subject they picked is actually assigned to them. Changing who's assigned to a subject later doesn't retroactively change who owns the assignments already created for it; those stay with whoever made them.

**Enrollment** Enrollment is Admin-managed, not something a student does themselves. I went back and forth on this one — self-enrollment is the more common pattern for course platforms, but it doesn't really fit here. The spec already gives Admin control over teacher assignment and course structure, so having Admin also control who's enrolled in what keeps that same pattern consistent, and it fits a school/college context better than a self-serve model would. The obvious tradeoff is that it doesn't scale well past a small number of students, since Admin has no way to know who wants to be enrolled where. A request-approval flow (student requests, Admin approves) would fix that, and the data model already has room for it — just didn't build it out for this submission.

**Submissions** Submitted as plain text, not file uploads. A student can edit their answer any time before the deadline; after the deadline, it's locked, and this is checked server-side, not just hidden as a disabled button. One submission per student per assignment, enforced with a unique constraint at the database level so it holds even if something upstream has a bug. Marks and feedback are null until a teacher actually grades it.

## Known Limitations

- No file upload for submissions — plain text only for now. A rich text editor and file support would be the natural next step.
- No search or filtering on the admin list views (Users, Courses, etc.) — fine for the current data volume, wouldn't scale to a large dataset as-is.
- No pagination on list views, for the same reason.
- Enrollment is Admin-only with no student-facing request flow yet, as covered above.
- Logging is limited to a global exception handler; there isn't per-action logging (e.g. tracking every login attempt or every create/delete action individually).
- `GET /api/Subject` doesn't currently require authentication. This was intentional — the idea was that course/subject info could eventually be shown on a public homepage before login, but that homepage was never built for this submission, so right now it's just an open endpoint without a public UI in front of it.
- The frontend keeps the JWT in localStorage rather than an HttpOnly cookie. Fine for this scope, but a production version would probably want the more hardened cookie-based approach.
- No social login, as mentioned above. If added later, accounts should be matched by provider + provider ID, not just by email, since the same email could otherwise show up across different providers and get incorrectly treated as the same account.
- Test coverage is concentrated on Submission and Assignment/Enrollment business rules rather than spread evenly across every service. Given the time available, that felt like the better place to spend it, since that's where the actual grading and deadline logic lives.
