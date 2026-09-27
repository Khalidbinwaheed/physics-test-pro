import {
  ChapterItem,
  TopicItem,
  MCQItem,
  ClassItem,
  StudentProfile,
  TestItem,
} from "./portal-types";

// Clean state: all dummy seed data removed
export const INITIAL_CLASSES: ClassItem[] = [];
export const INITIAL_STUDENTS: (StudentProfile & { passwordHash: string })[] = [];
export const INITIAL_CHAPTERS: ChapterItem[] = [];
export const INITIAL_TOPICS: TopicItem[] = [];
export const INITIAL_MCQS: MCQItem[] = [];
export const INITIAL_TESTS: TestItem[] = [];
