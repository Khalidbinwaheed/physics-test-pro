# Physics Exam Hub

Build a complete production-ready web application named “Physics MCQ Examination Portal”.

This is a real client project for managing Physics MCQ assessments for students.

The application must be fully functional, secure, responsive, database-driven, and deployable to production.

Do NOT build an MVP, prototype, static demo, fake dashboard, mock authentication, or frontend-only application.

Every major feature visible in the UI must connect to real backend functionality and persistent database storage.

==================================================

PROJECT OBJECTIVE
==================================================

Build an online Physics MCQ examination platform with two completely separate interfaces:

Teacher/Admin Portal

Student Portal

The core workflow is:

Teacher creates student account
↓
Teacher gives student Login ID and Password
↓
Student logs in
↓
Teacher creates Physics chapters
↓
Teacher creates MCQs
↓
Teacher creates a test
↓
Teacher selects MCQs
↓
Teacher assigns test to selected students
↓
Only assigned students see the test
↓
Student starts test
↓
Student answers MCQs
↓
Answers autosave
↓
Timer runs
↓
Student submits test
↓
Backend calculates result
↓
Result appears immediately
↓
Student can view permitted result details
↓
Teacher can view complete results and analytics

==================================================
2. IMPORTANT ACCOUNT RULE

Students MUST NOT have public registration.

There must be NO:

Student Sign Up

Student Registration

Create Student Account

Public Student Account Creation

Only Teacher/Admin users can create student accounts.

The student receives credentials from the teacher.

Example:

Student Name:
Muhammad Ali

Student Login ID:
PHY-001

Password:
Teacher-generated temporary password

The student uses these credentials to login.

A student account must not exist unless a Teacher/Admin creates it.

==================================================
3. USER ROLES

Implement strict Role-Based Access Control.

ROLE 1: ADMIN / TEACHER

Teacher can:

Login

Create students

Edit students

Disable students

Reset student passwords

Create chapters

Create topics

Create MCQs

Edit MCQs

Delete/archive MCQs

Import MCQs

Create tests

Select MCQs

Configure tests

Assign tests

Monitor attempts

View results

View analytics

Manage classes

Manage student accounts

View audit logs

ROLE 2: STUDENT

Student can:

Login using issued credentials

View own dashboard

View assigned tests

Start available tests

Attempt MCQs

Submit tests

View own results

View permitted answer explanations

View own performance

Change password

Logout

Students must never access teacher functionality.

==================================================
4. AUTHENTICATION

Implement secure authentication.

Teacher authentication:

Email or username

Password

Student authentication:

Student Login ID

Password

Student login example:

Physics MCQ Portal

Student Login ID
[ PHY-001 ]

Password
[ ******** ]

[ Login ]

There must be no registration button.

Implement:

Password hashing

Secure sessions or JWT authentication

Access token handling

Refresh token strategy where appropriate

Logout

Session expiration

Password change

Teacher password reset

Student password reset by teacher

Account activation/deactivation

Rate limiting

Brute-force protection

Authentication audit logging

Use Argon2id or bcrypt for password hashing.

Never store plaintext passwords.

Never expose password hashes through APIs.

==================================================
5. STUDENT ACCOUNT CREATION

Create a Student Management module.

Teacher can create:

Student Login ID

Full Name

Password

Class

Section

Roll Number

Email

Phone

Status

Example:

PHY-001
Muhammad Ali
Class 12
Section A
Active

Student Login ID must be unique.

Teacher can:

Create student

Edit student

Disable student

Enable student

Reset password

Archive student

Search student

Filter students

View student profile

View student test history

View performance

==================================================
6. STUDENT PASSWORD SYSTEM

When the teacher creates a student account:

Generate a secure temporary password.

Hash the password.

Store only the hash.

Display the temporary password to the teacher once.

Teacher gives credentials to student.

Support:

force_password_change = true

If enabled:

Student logs in with temporary password
↓
System requires password change
↓
Student creates new password
↓
Student enters dashboard

Teacher can reset a student's password at any time.

==================================================
7. ACCOUNT STATUS

Support:

Active
Disabled
Archived

Only Active students can login.

When a student is disabled:

Block new login

Invalidate active sessions

Hide available tests

Prevent test attempts

Preserve historical results

Do not delete historical assessment data when a student is archived.

==================================================
8. TEACHER DASHBOARD

Create a professional teacher dashboard.

Sidebar:

Dashboard
Students
Classes
Chapters
Question Bank
MCQs
Tests
Assignments
Attempts
Results
Analytics
Audit Logs
Settings
Logout

Dashboard cards:

Total Students
Active Students
Total Chapters
Total MCQs
Active Tests
Completed Attempts
Average Score

Recent activity:

Student created

MCQ added

Test created

Test assigned

Student started test

Student submitted test

==================================================
9. STUDENT DASHBOARD

Create a clean student dashboard.

Sidebar:

Dashboard
My Tests
Results
Performance
Profile
Change Password
Logout

Dashboard:

Welcome, Muhammad Ali

Student ID:
PHY-001

Statistics:

Assigned Tests
Pending Tests
Completed Tests
Average Score

Show:

Available Tests
Recent Results
Chapter Performance

Example:

Motion and Force 85%
Work and Energy 72%
Waves 91%

Students must only see their own information.

==================================================
10. PHYSICS CHAPTER MANAGEMENT

Do not hard-code chapters.

Teachers must be able to create and manage chapters dynamically.

Chapter fields:

Chapter name

Chapter number

Description

Status

Display order

Example chapters:

Measurements
Vectors and Equilibrium
Motion and Force
Work and Energy
Circular Motion
Fluid Dynamics
Oscillations
Waves
Thermodynamics
Electrostatics
Current Electricity
Electromagnetism
Electronics
Atomic Physics
Nuclear Physics

Teacher can:

Create

Edit

Archive

Reorder

Activate/deactivate

==================================================
11. TOPIC MANAGEMENT

Allow chapters to contain topics.

Example:

Chapter:
Motion and Force

Topics:

Newton's Laws
Momentum
Acceleration
Friction
Projectile Motion

MCQs can be associated with:

Chapter
Topic

==================================================
12. QUESTION BANK

Create a centralized Physics question bank.

Each MCQ should contain:

Question

Chapter

Topic

Option A

Option B

Option C

Option D

Correct answer

Explanation

Difficulty

Marks

Negative marks

Status

Created by

Created date

Updated date

Difficulty:

Easy
Medium
Hard

Status:

Draft
Active
Archived

==================================================
13. PHYSICS FORMULA SUPPORT

MCQ questions must support mathematical notation.

Support:

Fractions

Superscripts

Subscripts

Greek letters

Mathematical symbols

Units

Equations

Physics formulas

Use KaTeX or MathJax.

Examples:

F = ma

v = u + at

E = mc²

V = IR

λ = h/p

The teacher must have a proper question editor with formula support.

==================================================
14. MCQ MANAGEMENT

Teacher can:

Add MCQ

Edit MCQ

Preview MCQ

Duplicate MCQ

Archive MCQ

Search MCQ

Filter by chapter

Filter by topic

Filter by difficulty

Filter by status

Sort MCQs

Bulk import

Bulk export

Use server-side pagination.

Do not load the entire question bank into the browser.

==================================================
15. BULK MCQ IMPORT

Support CSV and Excel import.

Expected columns:

chapter
topic
question
option_a
option_b
option_c
option_d
correct_answer
explanation
difficulty
marks
negative_marks

Before importing:

Validate every row.

Show:

Total rows
Valid rows
Invalid rows
Errors

Allow the teacher to review errors before final import.

==================================================
16. TEST BUILDER

Create a professional Test Builder.

Teacher creates:

Test title
Description
Chapter
Questions
Duration
Total marks
Passing percentage
Negative marking
Start date/time
End date/time
Maximum attempts
Random question order
Random option order
Show result
Show correct answers
Show explanations

Test status:

Draft
Scheduled
Active
Expired
Archived

==================================================
17. SELECTING MCQs FOR TEST

Teacher must be able to select specific MCQs from the question bank.

Example:

Test:
Chapter 3 Physics Test

Questions selected:

MCQ #21
MCQ #24
MCQ #31
MCQ #42
MCQ #55

Display:

Selected Questions: 20
Total Marks: 20
Duration: 20 minutes

Allow teachers to:

Search questions

Filter questions

Preview questions

Add questions

Remove questions

Reorder questions

==================================================
18. TEST ASSIGNMENT

This is a critical feature.

Teacher can assign a test to:

One student

Multiple students

Entire class

Entire section

Example:

Test:
Motion and Force Test

Assigned to:

PHY-001
PHY-004
PHY-008
PHY-012

Only those students should see the test.

Students not assigned to the test must not see it.

Even if they know the Test ID or URL, backend authorization must reject access.

==================================================
19. ASSIGNMENT DATA

Store:

Test ID
Student ID
Assigned By
Assigned At
Available From
Available Until
Maximum Attempts
Assignment Status

Statuses:

Assigned
Not Started
In Progress
Completed
Expired

==================================================
20. STUDENT TEST ACCESS

Before starting a test, backend must verify:

Student is authenticated

Student account is active

Student is assigned to the test

Test is active

Current time is inside test availability window

Student has remaining attempts

If any condition fails:

Deny access.

Never rely on frontend checks alone.

==================================================
21. TEST INTERFACE

Create a distraction-free exam interface.

Header:

Test Name
Question 7 of 30
Time Remaining

Question:

A body moves with a velocity of...

A. 10 m/s
B. 20 m/s
C. 30 m/s
D. 40 m/s

Navigation:

Previous
Next
Question Navigator
Submit Test

Question navigator states:

Answered
Unanswered
Current

==================================================
22. TIMER

Implement a server-authoritative countdown timer.

Example:

Time Remaining
19:42

Do not trust only the browser timer.

Store:

Attempt start time
Attempt expiry time
Submission time

If student refreshes the browser:

Restore attempt

Restore answers

Restore remaining time

If time expires:

Automatically submit the attempt.

==================================================
23. ANSWER AUTOSAVE

Every selected answer should be persisted.

When student selects an answer:

Frontend
↓
API
↓
Database

If the student:

Refreshes

Closes browser

Reopens browser

Experiences temporary connection loss

The system should restore the attempt state where possible.

Prevent duplicate answers.

==================================================
24. TEST SUBMISSION

Before submission:

“You have answered 27 of 30 questions. Are you sure you want to submit?”

After submission:

Lock attempt

Calculate result

Save result

Mark attempt completed

Prevent further modification

A submitted attempt must become immutable.

==================================================
25. RESULT CALCULATION

All scoring must happen on the backend.

Example:

30 questions
1 mark each

Correct:
24

Incorrect:
5

Unanswered:
1

Score:
24 / 30

Percentage:
80%

Support negative marking.

Example:

Correct = 24 × 1
Incorrect = 5 × 0.25

Final Score:
22.75

The frontend must never be trusted to submit the final score.

==================================================
26. INSTANT RESULT

After submission, immediately display:

Test Result

Score:
24 / 30

Percentage:
80%

Correct:
24

Incorrect:
5

Unanswered:
1

Time Taken:
17 minutes

Status:
Passed

Teacher settings control whether students see:

Correct answers

Wrong answers

Explanations

Question review

==================================================
27. RESULT HISTORY

Students can see their own previous results.

Example:

| Test | Score | Percentage | Date |
| Motion Test | 24/30 | 80% | 27 Sep |
| Energy Test | 18/20 | 90% | 24 Sep |

Students cannot edit results.

Students cannot delete results.

Students cannot see other students' results.

==================================================
28. TEACHER RESULT MANAGEMENT

Teacher can:

View all results

Search students

Search tests

Filter by chapter

Filter by class

Filter by date

Sort by score

View individual attempt

Export results

Print results

Result fields:

Student
Student ID
Test
Chapter
Score
Percentage
Correct
Incorrect
Unanswered
Time Taken
Attempt Number
Submitted At

==================================================
29. ANALYTICS

Teacher dashboard should provide:

Total students
Total tests
Total attempts
Average score
Pass rate
Highest score
Lowest score

Charts:

Chapter performance

Student performance

Test performance

Correct vs incorrect

Average score over time

Test completion rate

Student dashboard:

Personal average

Chapter-wise performance

Test history

Correct vs incorrect

Progress over time

Do not expose private student analytics to other students.

==================================================
30. QUESTION VERSIONING

Historical attempts must remain unchanged.

If a teacher edits an MCQ after it has been used in a test, old student attempts must continue showing the original question and options.

Store a question snapshot/version with each test attempt.

Example:

Current MCQ:
Question version 3

Old attempt:
Question version 2

This prevents historical results from changing.

==================================================
31. RANDOMIZATION

Support:

Random question order
Random option order

Once an attempt starts, its order must remain fixed.

Refreshing the page must not reshuffle questions.

==================================================
32. CLASS MANAGEMENT

Allow teacher to create:

Classes
Sections

Example:

Class 11
Section A

Class 12
Section B

Students can belong to a class/section.

Teacher can assign tests to an entire class or section.

==================================================
33. SEARCH AND FILTERING

Implement server-side search.

Students:

Student ID

Name

Class

Section

MCQs:

Question

Chapter

Topic

Difficulty

Tests:

Test name

Chapter

Status

Date

Results:

Student

Test

Chapter

Date

Use pagination.

==================================================
34. SECURITY

Implement production-grade security.

Include:

Argon2id/bcrypt

RBAC

API authorization

Rate limiting

Brute-force protection

Input validation

XSS protection

SQL injection protection

Secure HTTP headers

CORS configuration

Secure cookies

CSRF protection where applicable

Audit logging

Secure file uploads

Error sanitization

Never expose:

Password hashes

Secrets

API keys

Database credentials

Internal stack traces

==================================================
35. DATABASE

Use PostgreSQL.

Recommended entities:

users
student_profiles
teacher_profiles
classes
sections
chapters
topics
mcqs
mcq_versions
tests
test_questions
test_assignments
attempts
attempt_answers
results
audit_logs

Use:

Primary keys
Foreign keys
Unique constraints
Indexes
Transactions
Timestamps

Use UUIDs where appropriate.

Use Alembic migrations.

==================================================
36. RECOMMENDED TECH STACK

Frontend:

React
TypeScript
Vite
Tailwind CSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Recharts
KaTeX

Backend:

Python
FastAPI
Pydantic
SQLAlchemy
Alembic

Database:

PostgreSQL

Infrastructure:

Docker
Docker Compose

Optional:

Redis

Testing:

Pytest
Playwright

==================================================
37. FRONTEND ARCHITECTURE

Use modular architecture.

Example:

frontend/
src/
components/
layouts/
pages/
features/
auth/
students/
classes/
chapters/
mcqs/
tests/
assignments/
attempts/
results/
analytics/
hooks/
services/
lib/
types/

Create separate:

TeacherLayout
StudentLayout
AuthLayout

Protect routes according to role.

==================================================
38. BACKEND ARCHITECTURE

Use modular architecture.

Example:

backend/
app/
api/
core/
models/
schemas/
services/
repositories/
middleware/
utils/
tests/

Create separate modules for:

Authentication
Users
Students
Teachers
Classes
Chapters
Topics
MCQs
Tests
Assignments
Attempts
Results
Analytics
Audit Logs

Do not create one giant backend file.

==================================================
39. API

Create documented REST APIs.

Examples:

POST /auth/login
POST /auth/logout
POST /auth/change-password

GET /students
POST /students
GET /students/{id}
PUT /students/{id}
PATCH /students/{id}/status
POST /students/{id}/reset-password

GET /chapters
POST /chapters
PUT /chapters/{id}

GET /mcqs
POST /mcqs
GET /mcqs/{id}
PUT /mcqs/{id}
DELETE /mcqs/{id}

GET /tests
POST /tests
GET /tests/{id}
PUT /tests/{id}

POST /tests/{id}/assign

GET /student/tests
POST /tests/{id}/attempts

GET /attempts/{id}
PUT /attempts/{id}/answers
POST /attempts/{id}/submit

GET /results
GET /results/{id}

Use consistent response formats.

Generate OpenAPI documentation.

==================================================
40. UI DESIGN

Create a professional education platform.

Design requirements:

Modern

Clean

Academic

Professional

Responsive

Fast

Accessible

Support:

Desktop
Laptop
Tablet
Mobile

Use:

Cards
Tables
Tabs
Dropdowns
Dialogs
Toasts
Pagination
Search
Filters
Loading states
Skeleton states
Empty states
Error states

Do not overload the interface with unnecessary animations.

The examination interface should prioritize readability and speed.

==================================================
41. MOBILE RESPONSIVENESS

The entire application must work on:

1920px desktop
1440px laptop
1024px tablet
768px tablet
390px mobile
360px mobile

The test interface must remain usable on mobile.

Options should be large enough to tap.

Timer should remain visible.

Question navigation should be accessible.

==================================================
42. ACCESSIBILITY

Implement:

Semantic HTML
Keyboard navigation
Focus states
ARIA labels where needed
Accessible dialogs
Proper form labels
Good contrast
Screen reader support

==================================================
43. AUDIT LOGS

Track important actions.

Examples:

Teacher login
Student login
Student created
Student disabled
Password reset
Chapter created
MCQ created
MCQ edited
Test created
Test assigned
Attempt started
Answer submitted
Test submitted

Store:

User ID
Action
Resource
Resource ID
Timestamp
IP where appropriate
User agent where appropriate

==================================================
44. PERFORMANCE

The system should support a growing number of students and MCQs.

Implement:

Database indexes
Pagination
Efficient queries
Caching where appropriate
Frontend query caching
Lazy loading
Optimized API responses
Avoid N+1 queries

Do not load thousands of MCQs at once.

==================================================
45. DEPLOYMENT

Prepare for real production deployment.

Use Docker.

Services:

frontend
backend
postgres

Optional:

redis

Create:

Dockerfile
docker-compose.yml
.env.example

Include:

Production configuration

Health checks

Database migrations

Logging

Error handling

Backup strategy

SSL should be configured through the deployment environment.

==================================================
46. BACKUPS

Implement a practical database backup strategy.

Provide documentation for:

Manual PostgreSQL backup

Automated scheduled backup

Database restoration

Do not store backups inside the public web directory.

==================================================
47. TESTING

Create automated tests.

Backend:

Authentication

Student authorization

Teacher authorization

Student creation

MCQ CRUD

Test creation

Assignment

Attempt creation

Answer saving

Timer

Submission

Result calculation

Negative marking

Access control

Frontend:

Login

Student dashboard

Teacher dashboard

MCQ creation

Test creation

Assignment

Test attempt

Result display

End-to-end test:

Teacher login
↓
Create student
↓
Create chapter
↓
Create MCQs
↓
Create test
↓
Assign test
↓
Student login
↓
Student sees assigned test
↓
Student starts test
↓
Student answers questions
↓
Student submits
↓
Result appears
↓
Teacher sees result

==================================================
48. DEVELOPMENT SEED DATA

Provide a development-only seed script.

Create:

One teacher

Several students

Physics chapters

Sample MCQs

Sample test

Sample assignments

Clearly separate seed/demo data from production data.

Do not depend on fake data for application functionality.

==================================================
49. ENVIRONMENT VARIABLES

Use environment variables for:

DATABASE_URL
SECRET_KEY
JWT_SECRET
JWT_REFRESH_SECRET
CORS_ORIGINS
REDIS_URL
APP_ENV

Never hard-code secrets.

Provide:

.env.example

==================================================
50. ADMIN INITIALIZATION

Do not hard-code an administrator account into the source code.

Create a secure command such as:

python -m app.create_admin

The command should:

Ask for admin credentials

Hash password

Create admin account

Prevent duplicate initialization

==================================================
51. ERROR HANDLING

Create clean user-facing errors.

Examples:

“Invalid Login ID or password.”

“Your account is disabled.”

“You are not assigned to this test.”

“This test is no longer available.”

“You have reached the maximum number of attempts.”

“Your session has expired.”

Never show raw backend exceptions.

==================================================
52. DATA INTEGRITY

Ensure:

Submitted attempts are immutable

Scores cannot be modified by students

Historical results remain unchanged

Historical questions remain unchanged

Archived students retain historical records

Deleted/archived MCQs do not corrupt old tests

Test assignments remain auditable

Use database transactions for critical operations.

==================================================
53. PRODUCTION PROJECT QUALITY

Do NOT:

Hard-code test results

Hard-code student accounts

Use fake authentication

Store passwords in plaintext

Trust frontend scores

Trust frontend authorization

Store critical data only in localStorage

Create fake charts

Create fake API responses

Use dummy data as the application's actual data layer

Leave unfinished TODO functionality

Put the entire application in one file

Build real database-backed functionality.

==================================================
54. README

Create a professional README containing:

Project overview
Features
Architecture
Tech stack
Installation
Environment variables
Database setup
Migration commands
Development commands
Testing
Docker deployment
Production deployment
Backup and restore
Security
API documentation
Admin initialization
Student account creation
Teacher workflow

==================================================
55. FINAL ACCEPTANCE TEST

The application will be considered complete only when this complete scenario works.

TEACHER:

Teacher logs in.

Teacher creates Class 12-A.

Teacher creates student PHY-001.

System generates a secure password.

Teacher receives the credentials.

Teacher creates Physics Chapter 1.

Teacher adds 20 MCQs.

Teacher creates a test.

Teacher selects 10 MCQs.

Teacher sets 10-minute duration.

Teacher sets test availability.

Teacher assigns test to PHY-001.

Teacher publishes test.

STUDENT:

Student receives Login ID and password.

Student opens portal.

Student logs in.

Student sees only their own dashboard.

Student sees the assigned test.

Student starts the test.

Timer starts.

Student answers MCQs.

Answers autosave.

Student refreshes page.

Answers remain available.

Timer remains synchronized.

Student submits.

Backend calculates result.

Result appears immediately.

Student sees only the information permitted by teacher.

TEACHER:

Teacher opens Results.

Teacher sees PHY-001.

Teacher sees test score.

Teacher sees correct/incorrect/unanswered.

Teacher sees time taken.

Teacher views chapter performance.

Teacher exports results.

SECURITY TEST:

Verify that:

Unregistered users cannot access student portal

Students cannot register themselves

Invalid credentials cannot login

Disabled students cannot login

Student A cannot access Student B data

Student cannot access teacher dashboard

Student cannot access unassigned tests

Student cannot modify score

Student cannot submit another student's attempt

Expired tests cannot be started

Submitted tests cannot be modified

Frontend manipulation cannot bypass backend authorization

Historical results remain unchanged after MCQ editing

==================================================
56. IMPLEMENTATION INSTRUCTIONS FOR THE AI CODING AGENT

Before writing application code:

Analyze the requirements.

Design the complete database schema.

Design authentication and RBAC.

Design API contracts.

Design frontend route architecture.

Design teacher workflow.

Design student workflow.

Identify security boundaries.

Create the project structure.

Then begin implementation.

Implement the project in logical phases:

Phase 1:
Architecture + database

Phase 2:
Authentication + RBAC

Phase 3:
Teacher + student management

Phase 4:
Classes + chapters + topics

Phase 5:
Question bank + MCQ management

Phase 6:
Test builder

Phase 7:
Assignment system

Phase 8:
Student examination interface

Phase 9:
Autosave + timer + attempts

Phase 10:
Result calculation

Phase 11:
Analytics

Phase 12:
Security hardening

Phase 13:
Testing

Phase 14:
Docker deployment

Phase 15:
Production documentation

After each phase, verify that the implementation works before moving to the next phase.

Fix errors rather than bypassing them.

Do not remove functionality to make implementation easier.

Keep the code clean, modular, documented, secure, maintainable, and production-ready.

The final result must be a complete deployable Physics MCQ Examination Portal suitable for real students and teachers.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/58445b11-f764-436d-bd47-68bfe3ebc0db).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
