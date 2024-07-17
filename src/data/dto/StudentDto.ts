import { UserDto } from './UserDto';

export type StudentDto = {
  id: number;
  userId: number;
  groupId?: number;
};

export type CreateStudentDto = Omit<StudentDto, 'id'>;
export type GetAllStudentsDto = StudentDto &
  Pick<UserDto, 'lastName' | 'firstName'>;
