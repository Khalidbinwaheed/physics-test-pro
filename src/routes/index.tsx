import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { LoginView } from "@/features/auth/LoginView";
import { ForcePasswordChangeModal } from "@/features/auth/ForcePasswordChangeModal";
import { TeacherLayout } from "@/layouts/TeacherLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { TeacherDashboard } from "@/features/teacher/TeacherDashboard";
import { StudentManagement } from "@/features/teacher/StudentManagement";
import { ClassManagement } from "@/features/teacher/ClassManagement";
import { ChapterManagement } from "@/features/teacher/ChapterManagement";
import { QuestionBank } from "@/features/teacher/QuestionBank";
import { TestBuilder } from "@/features/teacher/TestBuilder";
import { AssignmentManager } from "@/features/teacher/AssignmentManager";
import { ResultsManager } from "@/features/teacher/ResultsManager";
import { AuditLogsView } from "@/features/teacher/AuditLogsView";
import { StudentDashboard } from "@/features/student/StudentDashboard";
import { MyTestsView } from "@/features/student/MyTestsView";
import { ExamInterface } from "@/features/student/ExamInterface";
import { ExamResultView } from "@/features/student/ExamResultView";
import { StudentResultsHistory } from "@/features/student/StudentResultsHistory";
import { StudentProfileView } from "@/features/student/StudentProfileView";
import { ResultItem } from "@/lib/portal-types";
import { portalStorage } from "@/lib/portal-storage";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: PortalApp,
});

function PortalApp() {
  const { role, teacher, student, isLoading } = useAuth();

  // Active tabs
  const [teacherTab, setTeacherTab] = useState("dashboard");
  const [studentTab, setStudentTab] = useState("dashboard");

  // Assignment preselection from test builder
  const [preselectedAssignTestId, setPreselectedAssignTestId] = useState<string | undefined>(undefined);

  // Examination flow states
  const [activeExamAttemptId, setActiveExamAttemptId] = useState<string | null>(null);
  const [viewingResult, setViewingResult] = useState<ResultItem | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground font-mono text-xs">
        <div className="p-6 rounded-2xl neu-raised flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold">Initializing Physics Portal...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login view
  if (!role || (!teacher && !student)) {
    return <LoginView />;
  }

  // Active examination interface (fullscreen, distraction-free)
  if (role === "student" && student && activeExamAttemptId) {
    return (
      <ExamInterface
        attemptId={activeExamAttemptId}
        studentId={student.id}
        onSubmitted={(res) => {
          setActiveExamAttemptId(null);
          setViewingResult(res);
        }}
        onExit={() => setActiveExamAttemptId(null)}
      />
    );
  }

  // Viewing exam result
  if (role === "student" && student && viewingResult) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8">
        <ExamResultView
          result={viewingResult}
          onReturn={() => {
            setViewingResult(null);
            setStudentTab("dashboard");
          }}
        />
      </div>
    );
  }

  // TEACHER PORTAL
  if (role === "teacher" && teacher) {
    return (
      <TeacherLayout currentTab={teacherTab} onSelectTab={setTeacherTab}>
        {teacherTab === "dashboard" && <TeacherDashboard onNavigateTab={setTeacherTab} />}
        {teacherTab === "students" && <StudentManagement />}
        {teacherTab === "classes" && <ClassManagement />}
        {teacherTab === "chapters" && <ChapterManagement />}
        {teacherTab === "mcqs" && <QuestionBank />}
        {teacherTab === "tests" && (
          <TestBuilder
            onAssignTest={(testId) => {
              setPreselectedAssignTestId(testId);
              setTeacherTab("assignments");
            }}
          />
        )}
        {teacherTab === "assignments" && (
          <AssignmentManager preselectedTestId={preselectedAssignTestId} />
        )}
        {teacherTab === "results" && <ResultsManager />}
        {teacherTab === "audit" && <AuditLogsView />}
      </TeacherLayout>
    );
  }

  // STUDENT PORTAL
  if (role === "student" && student) {
    const handleStartExam = (testId: string) => {
      try {
        const attempt = portalStorage.startAttempt(testId, student.id);
        setActiveExamAttemptId(attempt.id);
      } catch (err: any) {
        toast.error(err.message || "Cannot start examination.");
      }
    };

    const handleViewExistingResult = (attemptId: string) => {
      const res = portalStorage.getResultByAttemptId(attemptId);
      if (res) {
        setViewingResult(res);
      } else {
        toast.error("Result not found.");
      }
    };

    return (
      <>
        <ForcePasswordChangeModal />
        <StudentLayout currentTab={studentTab} onSelectTab={setStudentTab}>
          {studentTab === "dashboard" && (
            <StudentDashboard
              onStartExam={handleStartExam}
              onViewResult={handleViewExistingResult}
              onNavigateTab={setStudentTab}
            />
          )}
          {studentTab === "tests" && <MyTestsView onStartExam={handleStartExam} />}
          {studentTab === "results" && (
            <StudentResultsHistory onViewResult={handleViewExistingResult} />
          )}
          {studentTab === "profile" && <StudentProfileView />}
        </StudentLayout>
      </>
    );
  }

  return <LoginView />;
}
