import { Role } from '../../types';

export type UserDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isActivated?: boolean;
  activationLink?: string;
  role: Role;
  avatarUrl?: string;
  isSubscribedToEmails?: boolean;
  groupNames?: string[];
};

export type UserCurrentDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
};

export interface UserDbDto {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_activated: boolean;
  activation_link: string;
  role: Role;
  avatar_url: string;
  is_subscribed_to_emails: boolean;
}

export interface UserDtoTest {
  role: Role;
  userId: number;
}

export type UpdateUserDto = Partial<UserDto> & { userId: number };

export interface UserRegistrationRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  role?: Role;
  group?: string;
}

export interface UserRegistrationDataForDbDto
  extends UserRegistrationRequestDto {
  password: string;
  activationLink: string;
  avatarUrl: string;
}

export interface UserSignInRequestDto {
  email: string;
  password: string;
}

export interface UserAuthenticatedPayloadDto {
  accessToken: string;
  user: Partial<UserDto>;
}

export interface UserChangePasswordRequestDto {
  email: string;
  oldPassword: string;
  newPassword: string;
}

export interface UserCreatePasswordRequestDto {
  email: string;
  password: string;
  activationLink: string;
}

export interface UserRecoverPasswordRequestDto {
  email: string;
}

export interface UserParticipantsDto {
  teacherUserId: number;
  studentUserId: number;
}
