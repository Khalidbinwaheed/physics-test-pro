# Physics MCQ Examination Portal — Roadmap

Design direction: "Lab Notebook" (approved).
Backend: Lovable Cloud (Postgres + Auth), persistent authoritative scoring and state management.

## Phases
- [x] P1 Database schema + RLS + grants + roles
- [x] P2 Auth: teacher email login, student Login ID login, first-admin bootstrap, password change/reset
- [x] P3 Student & class management (create/edit/disable/archive/reset password with one-time temporary password display)
- [x] P4 Chapters + topics (dynamic curriculum management)
- [x] P5 Question bank (CRUD, filters, KaTeX formula editor, CSV bulk import/export, immutable version snapshots)
- [x] P6 Test builder (config + question selection/reorder, negative marking, randomized order, visibility toggles)
- [x] P7 Assignment (student / class / section with strict authorization)
- [x] P8 Student portal + exam interface (distraction-free, navigator, responsive tap targets)
- [x] P9 Autosave + server-authoritative timer + attempt restore on reload
- [x] P10 Server-side scoring, instant result, result history, teacher results + export to CSV
- [x] P11 Analytics (teacher + student, Recharts chapter mastery & distributions)
- [x] P12 Audit logs + security hardening
- [x] P13 Docker deployment (Dockerfile, docker-compose.yml) + verification test suite + documentation
