import { TaskStatus } from '../../../types';

export type DBtaskStatusByGroupDto = {
  groupId: number;
  groupTitle: string;
  courseId: number;
  courseTitle: string;
  taskStatus: TaskStatus;
  taskCount: number;
};

export type DBstudentsGradeAllocationDto = {
  groupId: number;
  groupTitle: string;
  courseId: number;
  courseTitle: string;
  grade: number;
};

export type DBgroupsAverageScoresDto = {
  groupId: number;
  groupTitle: string;
  courseId: number;
  courseTitle: string;
  averageGrade: number;
};
