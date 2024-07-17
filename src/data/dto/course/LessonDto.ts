import { UserCurrentDto } from '../UserDto';

export type LessonDto = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderNumber: number;
};

export type CreateLessonDto = Omit<LessonDto, 'id' | 'courseId'>;
export type AddLessonDto = Omit<LessonDto, 'id'>;

export type LessonArg = {
  lessonObj: CreateLessonDto;
  user: UserCurrentDto;
  courseId: number;
  lessonId: number;
  testId: number;
};

export type LessonArgGetAll = Omit<
  LessonArg,
  'lessonId' | 'testId' | 'lessonObj'
>;
export type LessonArgGetById = Omit<LessonArg, 'testId' | 'lessonObj'>;
export type LessonArgCreate = Omit<LessonArg, 'lessonId' | 'testId'>;
export type LessonArgUpdate = Omit<LessonArg, 'testId'>;
export type LessonArgDelete = Omit<LessonArg, 'lessonObj' | 'testId'>;
export type LessonArgAssignTest = Omit<LessonArg, 'lessonObj'>;
