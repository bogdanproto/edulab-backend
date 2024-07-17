import { TaskStatus, TaskType } from '../../types';

export type TaskDto = {
  id: number;
  lessonId: number;
  studentId: number;
  status: TaskStatus;
  taskType: TaskType;
  grade: number | null;
};

export type BaseTaskDetails = TaskDto & {
  lessonTitle: string;
  courseTitle: string;
};

export type HomeworkDetails = BaseTaskDetails & {
  homework: {
    homeworkId: number;
    homeworkTitle: string;
    sourceURL: string;
    homeworkUrl?: string;
  };
};

export type TestDetails = BaseTaskDetails & {
  test: {
    testId: number;
    testTitle: string;
    description: string;
    maxScores: number;
    scores: number | null;
    correctAnswers: number | null;
    totalQuestions: number | null;
  };
};

export type ExtendedDetails = BaseTaskDetails & {
  groupName: string;
  lastName: string;
  firstName: string;
};
export type TaskParticipantsDto = {
  teacherUserId: number;
  studentUserId: number;
};
export type TeacherHomeworkDetails = ExtendedDetails & HomeworkDetails;
export type TeacherTestDetails = ExtendedDetails & TestDetails;
export type StudentHomeworkDetails = BaseTaskDetails & HomeworkDetails;
export type StudentTestDetails = BaseTaskDetails & TestDetails;
