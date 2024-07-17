import { UserCurrentDto } from '../UserDto';

export type MaterialDto = {
  id: number;
  title: string;
  sourceUrl: string;
  lessonId: number;
};

export type CreateMaterialDto = Omit<MaterialDto, 'id' | 'lessonId'>;
export type AddMaterialDto = Omit<MaterialDto, 'id'>;
export type UpdateMaterialDto = Omit<MaterialDto, 'lessonId'>;

export type MaterialArg = {
  materialObj: CreateMaterialDto;
  user: UserCurrentDto;
  courseId: number;
  lessonId: number;
  id: number;
};

export type MaterialArgGetAll = Omit<MaterialArg, 'id' | 'materialObj'>;
export type MaterialArgCreate = Omit<MaterialArg, 'id'>;
export type MaterialArgDelete = Omit<MaterialArg, 'materialObj'>;
