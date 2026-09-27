import assert from "node:assert";
import { portalStorage } from "../src/lib/portal-storage.js";

async function runTests() {
  console.log("=== RUNNING PHYSICS MCQ EXAMINATION PORTAL VERIFICATION TESTS ===");

  // 1. Teacher Authentication
  console.log("1. Testing Teacher Authentication...");
  const teacherAuth = portalStorage.authenticateTeacher("teacher@physlab.local", "AdminPass123!");
  assert.strictEqual(teacherAuth.success, true, "Teacher should authenticate successfully");
  assert.strictEqual(teacherAuth.user?.role, "teacher", "Role should be teacher");

  const badTeacher = portalStorage.authenticateTeacher("teacher@physlab.local", "WrongPass");
  assert.strictEqual(badTeacher.success, false, "Invalid password should be rejected");
  console.log("✓ Teacher Authentication Passed");

  // 2. Student Management: Create student & temporary password
  console.log("2. Testing Student Account Creation & Temporary Password...");
  const newStudentData = {
    login_id: "PHY-TEST-99",
    full_name: "Test Physics Scholar",
    class_id: "cls-1",
    roll_number: "999",
  };
  const created = portalStorage.createStudent(newStudentData);
  assert.strictEqual(created.student.login_id, "PHY-TEST-99");
  assert.strictEqual(created.student.status, "active");
  assert.strictEqual(created.student.force_password_change, true);
  assert.ok(created.temporaryPassword.length >= 8, "Temporary password must be generated");
  console.log("✓ Student Creation & Temporary Password Passed");

  // 3. Student Authentication & Status Control
  console.log("3. Testing Student Login with Login ID...");
  const stuAuth = portalStorage.authenticateStudent("PHY-TEST-99", created.temporaryPassword);
  assert.strictEqual(stuAuth.success, true, "Student should log in with issued credentials");
  assert.strictEqual(stuAuth.student?.force_password_change, true, "Must flag force_password_change");

  // Disable student and verify login is blocked
  portalStorage.setStudentStatus(created.student.id, "disabled");
  const disabledAuth = portalStorage.authenticateStudent("PHY-TEST-99", created.temporaryPassword);
  assert.strictEqual(disabledAuth.success, false, "Disabled student must not be allowed to log in");
  assert.ok(disabledAuth.error?.includes("disabled"), "Error message should state account is disabled");

  // Re-enable student
  portalStorage.setStudentStatus(created.student.id, "active");
  const reenabledAuth = portalStorage.authenticateStudent("PHY-TEST-99", created.temporaryPassword);
  assert.strictEqual(reenabledAuth.success, true, "Re-enabled student should log in");
  console.log("✓ Student Login & Access Control Passed");

  // 4. MCQ Snapshot Versioning
  console.log("4. Testing MCQ Snapshotting & Versioning...");
  const createdMCQ = portalStorage.createMCQ({
    chapter_id: "ch-3",
    topic_id: "top-1",
    question: "What is kinetic energy formula? $E_k = \\frac{1}{2}mv^2$",
    option_a: "$\\frac{1}{2}mv^2$",
    option_b: "$mv$",
    option_c: "$mgh$",
    option_d: "$\\frac{1}{2}kx^2$",
    correct_answer: "A",
    explanation: "Standard kinetic energy formula",
    difficulty: "easy",
    marks: 2,
    negative_marks: 0.5,
    status: "active",
  });
  assert.strictEqual(createdMCQ.version, 1, "Initial MCQ version must be 1");

  // Update MCQ -> version must increment to 2
  const updatedMCQ = portalStorage.updateMCQ(createdMCQ.id, {
    question: "Updated Question Text: $E_k = \\frac{1}{2}mv^2$ (modified)",
  });
  assert.strictEqual(updatedMCQ.version, 2, "MCQ version must increment on edit to protect historical attempts");
  console.log("✓ MCQ Snapshotting & Versioning Passed");

  // 5. Test Creation & Assignment
  console.log("5. Testing Test Creation & Assignment...");
  const newTest = portalStorage.createTest({
    title: "Unit Test: Dynamics & Energy",
    description: "Assessment on Newton's laws and work-energy theorem",
    chapter_id: "ch-3",
    duration_minutes: 10,
    passing_percentage: 50,
    negative_marking: true,
    starts_at: new Date(Date.now() - 3600000).toISOString(),
    ends_at: new Date(Date.now() + 3600000 * 24).toISOString(),
    max_attempts: 2,
    randomize_questions: false,
    randomize_options: false,
    show_result: true,
    show_correct_answers: true,
    show_explanations: true,
    status: "active",
    question_ids: ["mcq-1", "mcq-2", createdMCQ.id],
  });
  assert.strictEqual(newTest.question_count, 3, "Test must contain 3 questions");

  // Assign to test student
  const asgRes = portalStorage.assignTest({
    testId: newTest.id,
    studentIds: [created.student.id],
  });
  assert.strictEqual(asgRes.count, 1, "Must assign test to selected student");
  console.log("✓ Test Creation & Assignment Passed");

  // 6. Examination Attempt, Autosave, & Authoritative Scoring
  console.log("6. Testing Exam Attempt, Autosave & Authoritative Scoring...");
  const attempt = portalStorage.startAttempt(newTest.id, created.student.id);
  assert.strictEqual(attempt.status, "in_progress", "Attempt must be in_progress");
  assert.strictEqual(attempt.questions.length, 3, "Attempt must freeze question snapshot");

  // Verify timer expiration date is in the future
  const expiresAt = new Date(attempt.expires_at).getTime();
  assert.ok(expiresAt > Date.now(), "Expiry must be in future");

  // Autosave answers: Answer Q1 correctly (mcq-1: B), Answer Q2 incorrectly (mcq-2: pick A instead of B)
  const q1 = attempt.questions[0];
  const q2 = attempt.questions[1];
  portalStorage.saveAnswer(attempt.id, created.student.id, q1.tqId, "B"); // Correct (+1)
  portalStorage.saveAnswer(attempt.id, created.student.id, q2.tqId, "A"); // Incorrect (-0.25)
  // Q3 is left unanswered (0)

  // Submit attempt
  const result = portalStorage.submitAttempt(attempt.id, created.student.id, false);
  assert.strictEqual(result.total_questions, 3);
  assert.strictEqual(result.correct_count, 1);
  assert.strictEqual(result.incorrect_count, 1);
  assert.strictEqual(result.unanswered_count, 1);

  // Score calculation: Correct (+1) - Incorrect (0.25) = 0.75
  assert.strictEqual(result.score, 0.75, "Backend authoritative scoring with negative marking must equal 0.75");
  assert.strictEqual(result.passed, false, "Score below 50% must not pass");

  // Verify attempt is now immutable
  assert.throws(
    () => {
      portalStorage.saveAnswer(attempt.id, created.student.id, q1.tqId, "C");
    },
    /already submitted/,
    "Submitted attempts must be immutable"
  );
  console.log("✓ Examination, Autosave & Authoritative Scoring Passed");

  // 7. Audit Log Verification
  console.log("7. Testing Audit Logging...");
  const logs = portalStorage.getAuditLogs();
  assert.ok(logs.length > 5, "Audit logs must record all system events");
  const attemptLogged = logs.some((l) => l.action === "attempt_submitted");
  assert.strictEqual(attemptLogged, true, "Attempt submission must be audited");
  console.log("✓ Audit Logging Passed");

  console.log("\n=======================================================");
  console.log("ALL 7 VERIFICATION TEST SUITES PASSED SUCCESSFULLY!");
  console.log("=======================================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
