# Physics MCQ Examination Portal

A complete, production-ready, secure, and responsive web application designed for conducting authoritative online Physics MCQ examinations with two completely isolated interfaces: **Teacher/Admin Portal** and **Student Portal**.

---

## 🔬 Project Overview

The **Physics MCQ Examination Portal** provides an academic testing environment tailored specifically for Physics education. It features high-fidelity mathematical and scientific typesetting via **KaTeX** ($F = ma$, $\lambda = \frac{h}{p}$, $E = mc^2$, $V = IR$), server-authoritative countdown timers, real-time autosaving, immutable question snapshotting, and strict role-based access control.

### Core Philosophy & Account Rules
- **No Public Registration**: Students cannot sign up or register themselves. Student accounts can **only** be provisioned by a Teacher or Administrator.
- **Teacher-Issued Credentials**: Each student is assigned a unique **Student Login ID** (e.g. `PHY-001`) and a system-generated secure temporary password.
- **First-Time Password Change**: Supported via `force_password_change`. Students must establish their personal password upon first login before accessing exam dashboards.
- **Server Authoritative Scoring & Timers**: Timers and grades are never calculated or trusted on the client. Negative marking, remaining attempts, and question order are enforced on the backend.
- **Historical Immutability**: Editing or archiving an MCQ in the question bank creates a new version; past student test attempts retain their frozen snapshot and are never altered.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, "Lab Notebook" design system
- **UI Components**: Radix UI primitives, Lucide React icons, Sonner notifications
- **Math Typesetting**: KaTeX (support for equations, fractions, square roots, Greek symbols, units)
- **Data Visualization**: Recharts (Chapter mastery distributions, performance metrics)
- **Forms & Validation**: Zod, React Hook Form

### Backend & Storage
- **Application Server**: TanStack Start / Nitro SSR & Server Functions
- **Database Engine**: PostgreSQL with Row-Level Security (RLS) and custom audit triggers
- **Authorization & RBAC**: Dual-portal role-based access control (Admin / Teacher / Student)
- **Containerization**: Docker, Docker Compose

---

## 🚀 Quick Start & Development

### 1. Prerequisites
- **Node.js**: v20+ (v24 recommended)
- **npm** or **bun**
- **Python**: 3.10+ (for administrative CLI utilities)

### 2. Installation
```bash
git clone https://github.com/Khalidbinwaheed/physics-test-pro.git
cd physics-test-pro
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Ensure your database credentials and API keys are populated.

### 4. Running the Development Server
```bash
npm run dev
```
The application will be live at `http://localhost:5173` or `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🔑 Default Credentials (Development & Demonstration)

| Portal | Identifier | Password | Role |
| :--- | :--- | :--- | :--- |
| **Teacher / Admin** | `teacher@physlab.local` | `AdminPass123!` | Instructor / Admin |
| **Student** | `PHY-001` | `StudentPass123!` | Student (Muhammad Ali) |
| **Student** | `PHY-002` | `StudentPass123!` | Student (Sara Ahmed) |
| **Student (Unchanged)** | `PHY-004` | `TempPass999!` | Student (Force Password Change) |

---

## 📋 Comprehensive Feature Walkthrough

### 1. Teacher / Admin Portal
- **Dashboard**: High-level telemetry displaying total students, active tests, completed attempts, pass rates, average scores, and recent security logs.
- **Student Management**:
  - Add Student: creates account with `Student Login ID`, full name, class, section, and roll number.
  - Automatically generates a secure temporary password shown **once** in a copy modal.
  - Reset student passwords at any time (re-enabling `force_password_change`).
  - Disable or archive student accounts without corrupting historical results.
- **Class & Cohort Management**: Configure classes (e.g. Class 11, Class 12) and sections (A, B, etc.).
- **Dynamic Physics Chapters & Topics**: Create and reorder chapters (e.g., Measurements, Vectors, Motion & Force, Work & Energy, Oscillations, Waves, Thermodynamics, Electrostatics, Electromagnetism, Atomic Physics).
- **Centralized Question Bank**:
  - Full KaTeX formula support with quick formula insertion toolbar ($F=ma$, $\lambda=\frac{h}{p}$, fractions, radicals, Greek letters).
  - Categorization by chapter, topic, difficulty (Easy, Medium, Hard), marks, and negative marks.
  - Live side-by-side equation preview.
  - Immutable question versioning.
  - Bulk CSV import with pre-import validation and error reporting.
  - Export question bank to CSV.
- **Test Builder**:
  - Configure test title, instructions, chapter association, duration in minutes, pass percentage.
  - Negative marking toggle, randomized question order, randomized option order.
  - Student review permissions (show score immediately, show correct answers, show explanations).
  - Search and select specific MCQs from the Question Bank with live marks/duration calculation.
- **Test Assignment**:
  - Assign to specific individual students, an entire class, or an entire section.
  - Strict backend authorization ensures unassigned students cannot view or launch tests.
- **Results & Inspection**:
  - Comprehensive results grid with student ID, score, percentage, pass/fail status, accuracy counts, and elapsed time.
  - Individual attempt inspection showing student's chosen answer vs. correct answer and full KaTeX physics explanation.
  - Export examination results to CSV.
- **Security Audit Logs**: Chronological log of all administrative actions, student logins, and test attempts.

### 2. Student Portal
- **Student Dashboard**: Welcome card, personal student ID, assigned test count, pending tests, completed tests, and chapter mastery analytics.
- **Examination Room (Distraction-Free)**:
  - Sticky header displaying test title, question counter, server-authoritative timer, and submit button.
  - Large tap targets for options A, B, C, D on both mobile and desktop.
  - Real-time autosave on every selection.
  - Question Navigator showing states: **Answered**, **Unanswered**, and **Current**.
  - Submit confirmation dialog warning if any questions remain unanswered.
  - Automatic submission when time expires.
  - Attempt restoration on page reload or connection interruption.
- **Instant Result Screen**:
  - Immediate score calculation, percentage, correct/incorrect/unanswered breakdown, and pass/fail status.
  - Permitted question review (if enabled by teacher) showing explanations and formulas.
- **Assessment History**: Table of previous attempts with historical score retention.
- **Profile & Security**: Review student details and update personal password.

---

## 🧪 Automated Testing

An automated verification test suite exercises the complete examination lifecycle:
```bash
npx tsx tests/portal_verification.test.mjs
```
The test suite validates:
1. Teacher authentication and rejection of invalid credentials.
2. Student creation and secure temporary password generation.
3. Student login with Login ID and account disabling/reenabling checks.
4. MCQ snapshot versioning (updating an MCQ creates a new version without corrupting past tests).
5. Test creation and assignment access control.
6. Server-authoritative timer, autosaving, negative marking, and grading.
7. Audit log event recording.

---

## 🐳 Docker Deployment

### Run with Docker Compose
```bash
docker compose up -d --build
```
The application will be accessible at `http://localhost:3000`.

### Manual Docker Build
```bash
docker build -t physics-mcq-portal .
docker run -p 3000:3000 physics-mcq-portal
```

---

## 🗄️ Database Backup & Restoration

### Manual PostgreSQL Backup
```bash
pg_dump -h localhost -U postgres -d physics_exam_db -F c -b -v -f /var/backups/physics_portal_$(date +%Y%m%d).dump
```

### Automated Backup via Cron
```bash
0 2 * * * pg_dump -h localhost -U postgres -d physics_exam_db -F c -b -f /var/backups/physics_$(date +\%Y\%m\%d_\%H\%M).dump
```

### Restoration
```bash
pg_restore -h localhost -U postgres -d physics_exam_db -v /var/backups/physics_portal_20260927.dump
```

---

## 🛡️ Security Highlights
- **Role-Based Access Control (RBAC)**: Distinct permissions for instructors and students.
- **Zero Public Signups**: Public student registration is strictly disabled.
- **Immutable Historical Attempts**: Stored question snapshots guarantee that test grades are permanently reproducible.
- **Authoritative Grading**: The client never calculates or submits final test scores.
- **Audit Trail**: Every significant administrative and student action is logged with actor identification and timestamps.
