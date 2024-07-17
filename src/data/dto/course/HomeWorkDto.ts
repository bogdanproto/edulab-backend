import { UserCurrentDto } from '../UserDto';

export type HomeWorkDto = {
  id: number;
  title: string;
  sourceUrl: string;
  lessonId: number;
};

export type CreateHomeWorkDto = Omit<HomeWorkDto, 'id' | 'lessonId'>;
export type AddHomeWorkDto = Omit<HomeWorkDto, 'id'>;
export type UpdateHomeWorkDto = Omit<HomeWorkDto, 'lessonId'>;

export type HomeworkArg = {
  homeWorkObj: CreateHomeWorkDto;
  user: UserCurrentDto;
  courseId: number;
  lessonId: number;
  id: number;
};

export type HomeworkArgGet = Omit<HomeworkArg, 'id' | 'homeWorkObj'>;
export type HomeworkArgCreate = Omit<HomeworkArg, 'id'>;
export type HomeworkArgDelete = Omit<HomeworkArg, 'homeWorkObj'>;
