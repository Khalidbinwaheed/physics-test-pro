import assert from "node:assert";
import { portalStorage, DEFAULT_SUPER_ADMIN, DEFAULT_ADMIN, DEFAULT_TEACHER } from "../src/lib/portal-storage.ts";

async function testPrivacyAndSuperAdmin() {
  console.log("=== RUNNING PRIVACY & SUPER ADMIN VERIFICATION TESTS ===");

  // 1. Authenticate as Super Admin
  console.log("1. Testing Super Admin Authentication...");
  const saAuth = portalStorage.authenticateTeacher("superadmin@physlab.local", "SuperAdminPass123!");
  assert.strictEqual(saAuth.success, true, "Super Admin should authenticate successfully");
  assert.strictEqual(saAuth.user?.role, "super_admin", "Role must be super_admin");
  console.log("✓ Super Admin Authentication Passed");

  // 2. Authenticate as Admin
  console.log("2. Testing Admin Authentication...");
  const adminAuth = portalStorage.authenticateTeacher("admin@physlab.local", "AdminPass123!");
  assert.strictEqual(adminAuth.success, true, "Admin should authenticate successfully");
  assert.strictEqual(adminAuth.user?.role, "admin", "Role must be admin");
  console.log("✓ Admin Authentication Passed");

  // 3. Authenticate as Teacher
  console.log("3. Testing Teacher Authentication...");
  const teacherAuth = portalStorage.authenticateTeacher("teacher@physlab.local", "AdminPass123!");
  assert.strictEqual(teacherAuth.success, true, "Teacher should authenticate successfully");
  assert.strictEqual(teacherAuth.user?.role, "teacher", "Role must be teacher");
  console.log("✓ Teacher Authentication Passed");

  // 4. Privacy Check: Teacher cannot add student
  console.log("4. Testing Privacy Policy: Teacher CANNOT add student...");
  portalStorage.setCurrentStaff(teacherAuth.user);
  assert.throws(
    () => {
      portalStorage.createStudent({
        login_id: "STU-DENIED-01",
        full_name: "Blocked Student",
      });
    },
    /Access Denied: Only administrators and super administrators have permission to add students/,
    "Teacher must not be able to create student"
  );
  console.log("✓ Blocked Teacher from creating student Passed");

  // 5. Privacy Check: Teacher cannot add teacher
  console.log("5. Testing Privacy Policy: Teacher CANNOT add teacher...");
  assert.throws(
    () => {
      portalStorage.createTeacher({
        full_name: "Blocked Teacher",
        email: "blocked.teacher@physlab.local",
      });
    },
    /Access Denied: Only administrators and super administrators can add teachers/,
    "Teacher must not be able to create teacher"
  );
  console.log("✓ Blocked Teacher from creating teacher Passed");

  // 6. Admin CAN add teacher and student
  console.log("6. Testing Admin Privileges: Admin CAN add teacher and student...");
  portalStorage.setCurrentStaff(adminAuth.user);
  const newTeacher = portalStorage.createTeacher({
    full_name: "Prof. Newton",
    email: "newton@physlab.local",
  });
  assert.strictEqual(newTeacher.role, "teacher");
  assert.strictEqual(newTeacher.email, "newton@physlab.local");

  const newStudent = portalStorage.createStudent({
    login_id: "PHY-NEWTON-01",
    full_name: "Student Newton",
  });
  assert.strictEqual(newStudent.student.login_id, "PHY-NEWTON-01");
  console.log("✓ Admin created teacher and student successfully Passed");

  // 7. Admin CANNOT promote to Super Admin
  console.log("7. Testing Admin CANNOT promote to Super Admin...");
  assert.throws(
    () => {
      portalStorage.makeSuperAdmin(newTeacher.email);
    },
    /Access Denied: Only a Super Administrator can promote accounts to Super Admin/,
    "Admin must not be able to promote to Super Admin"
  );
  console.log("✓ Admin blocked from promoting to Super Admin Passed");

  // 8. Super Admin CAN promote user to Super Admin
  console.log("8. Testing Super Admin CAN promote user to Super Admin...");
  portalStorage.setCurrentStaff(saAuth.user);
  const promotion = portalStorage.makeSuperAdmin(newTeacher.email);
  assert.strictEqual(promotion.success, true);
  const updatedStaff = portalStorage.getStaffUsers().find((s) => s.email === newTeacher.email);
  assert.strictEqual(updatedStaff?.role, "super_admin");
  console.log("✓ Super Admin promoted user to Super Admin Passed");

  console.log("\n=======================================================");
  console.log("ALL PRIVACY & SUPER ADMIN VERIFICATION TESTS PASSED!");
  console.log("=======================================================");
}

testPrivacyAndSuperAdmin().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
