import { UserCurrentDto } from '../UserDto';

export type CourseDto = {
  id: number;
  teacherId: number;
  title: string;
  description: string;
  yearCourse: string;
  isActive: boolean;
  imgUrl?: string;
  file?: string;
};

export type CreateCourseDto = Omit<CourseDto, 'id' | 'teacherId'>;
export type CreateCourseSQLDto = Omit<CourseDto, 'id'>;

export type ChangeStatusCourseDto = {
  isActive: boolean;
};

export type CourseArg = {
  courseObj: CreateCourseDto;
  user: UserCurrentDto;
  status: ChangeStatusCourseDto;
  courseId: number;
};

export type CourseArgGet = Omit<CourseArg, 'courseObj' | 'status'>;
export type CourseArgCreate = Omit<CourseArg, 'courseId' | 'status'>;
export type CourseArgUpdate = Omit<CourseArg, 'status'>;
export type CourseArgStatus = Omit<CourseArg, 'courseObj'>;
export type CourseArgDelete = Omit<CourseArg, 'courseObj' | 'status'>;
