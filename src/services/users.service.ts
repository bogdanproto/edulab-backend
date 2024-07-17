/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable indent */
import { errors, groupError, userError } from '../consts';
import { userData } from '../data';
import {
  UpdateUserDto,
  UserDto,
  UserDbDto,
  UserRegistrationRequestDto,
  UserRegistrationDataForDbDto,
  UserChangePasswordRequestDto,
  UserSignInRequestDto,
  UserCreatePasswordRequestDto,
  UserRecoverPasswordRequestDto,
} from '../data/dto/UserDto';

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { MailService } from './mail.service';
import { tokenService } from './token.service';
import { Role } from '../types';
import authPaths from '../consts/paths/authPaths';
import { ApiError } from '../helpers';
import { studentService } from './student.service';
import { groupService } from './group.service';
import { taskService } from './task.service';
import { courseService } from './course.service';

const mailService = new MailService();

class UserService {
  private userData = userData;

  async createUser(userObj: Omit<UserDto, 'id'>): Promise<UserDto> {
    if (!userObj.email) {
      throw new ApiError(userError.VALID_DATA);
    }

    const existingUser = await this.userData.getUserByEmail(userObj.email);

    if (existingUser) throw new ApiError(userError.ALREADY_EXIST);

    const activationLink = uuidv4();
    const activationToken = tokenService.generateActivationToken({
      name: 'edulab',
    });
    const avatarUrl = `${process.env.API_URL}/avatar.png`;

    const newUser = await this.userData.createUser({
      ...userObj,
      email: userObj.email.toLowerCase(),
      password: ' ',
      activationLink,
      avatarUrl,
    });

    await this.handleUserGroupAssignment(newUser, userObj);

    const userObjForMailService = {
      firstName: newUser.firstName,
      email: newUser.email,
      activateAccountLink: `${process.env.API_URL}${authPaths.ROOT}/activate/${activationToken}${newUser.activationLink}`,
    };
    await mailService.sendActivationEmail(userObjForMailService);
    return newUser;
  }

  private async handleUserGroupAssignment(
    newUser: UserDto,
    userObj: Omit<UserDto, 'id'>,
  ) {
    if (newUser.role === Role.STUDENT && userObj.groupNames) {
      const group = await groupService.getGroupByName(userObj.groupNames[0]);
      if (!group) {
        await groupService.createGroup({ name: userObj.groupNames[0] });
      }
      await studentService.addUserToGroup(newUser.id, group.id);
      newUser.groupNames = [group.name];
    } else if (newUser.role === Role.TEACHER && userObj.groupNames) {
      for (const groupName of userObj.groupNames) {
        let group = await groupService.getGroupByName(groupName);
        if (!group) {
          group = await groupService.createGroup({ name: groupName });
        }
        await groupService.addTeacherToGroup(newUser.id, group.id);
      }
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    const rows = await this.userData.getAllUsers();
    return rows;
  }

  async getUserById(userId: number): Promise<UserDto | null> {
    if (!userId) {
      throw new ApiError(userError.VALID_DATA);
    }

    const user = await this.userData.getUserById(userId);
    if (!user) throw new ApiError(userError.NOT_FOUND_ID);

    return user;
  }

  async updateUser(userObj: UpdateUserDto, userId: number): Promise<UserDto> {
    this.validateUpdateUserInput(userObj, userId);

    const user = await this.userData.getUserById(userId);

    if (!user) throw new ApiError(userError.NOT_FOUND_ID);

    const updatedUser = await this.userData.updateUser(userObj, userId);

    await this.handleGroupUpdate(updatedUser, userObj);

    if (userObj.email && userObj.email !== user.email) {
      await this.updateUserEmail(updatedUser);
    }

    return updatedUser;
  }

  private validateUpdateUserInput(userObj: UpdateUserDto, userId: number) {
    if (!userObj) {
      throw new ApiError(userError.VALID_DATA);
    }

    if (isNaN(userId)) {
      throw new ApiError(errors.BAD_ID);
    }
  }

  private async handleGroupUpdate(
    updatedUser: UserDto,
    userObj: UpdateUserDto,
  ) {
    if (updatedUser.role === Role.STUDENT && userObj.groupNames) {
      const group = await groupService.getGroupByName(userObj.groupNames[0]);
      if (!group) {
        throw new ApiError(groupError.NOT_FOUND);
      }

      await studentService.updateStudentGroupByUserId(updatedUser.id, group.id);
    } else if (updatedUser.role === Role.TEACHER && userObj.groupNames) {
      await this.updateTeacherGroups(updatedUser.id, userObj.groupNames);
    }
  }

  private async updateTeacherGroups(userId: number, newGroupNames: string[]) {
    const currentGroups = await groupService.getAllGroupsByTeacherId(userId);
    const currentGroupNames = currentGroups.map((group) => group.name);

    const groupsToAdd = newGroupNames.filter(
      (name) => !currentGroupNames.includes(name),
    );
    const groupsToRemove = currentGroupNames.filter(
      (name) => !newGroupNames.includes(name),
    );

    await Promise.all([
      ...groupsToAdd.map(async (groupName) => {
        const group = await groupService.getGroupByName(groupName);
        if (group) {
          await groupService.addTeacherToGroup(userId, group.id);
        }
      }),
      ...groupsToRemove.map(async (groupName) => {
        const group = await groupService.getGroupByName(groupName);
        if (group) {
          await groupService.removeTeacherFromGroup(userId, group.id);
        }
      }),
    ]);
  }

  private async updateUserEmail(updatedUser: UserDto) {
    const userObjForMailService = {
      firstName: updatedUser.firstName,
      email: updatedUser.email,
    };
    await mailService.sendUpdateEmail(userObjForMailService);
  }

  async deleteUser(userId: number): Promise<UserDto> {
    const user = await this.userData.getUserById(userId);

    if (!user) {
      throw new ApiError(userError.NOT_FOUND_ID);
    }

    const hasDependencies = await this.checkUserDependencies(userId);

    if (hasDependencies && user.role === Role.STUDENT) {
      throw new ApiError(userError.HAS_DEPENDENCIES_STUDENT);
    }

    if (hasDependencies && user.role === Role.TEACHER) {
      throw new ApiError(userError.HAS_DEPENDENCIES_TEACHER);
    }

    if (user.role === Role.STUDENT) {
      await this.deleteStudentFromGroup(userId);
    } else if (user.role === Role.TEACHER) {
      await this.deleteTeacherFromGroups(userId);
    }

    await this.userData.deleteUser(userId);

    return user;
  }

  private async deleteStudentFromGroup(userId: number): Promise<void> {
    await studentService.deleteStudentByUserId(userId);
  }

  private async deleteTeacherFromGroups(userId: number): Promise<void> {
    const teacherGroups = await groupService.getAllGroupsByTeacherId(userId);

    await Promise.all(
      teacherGroups.map(async (group) => {
        await groupService.removeTeacherFromGroup(userId, group.id);
      }),
    );
  }

  async checkUserDependencies(userId: number): Promise<boolean> {
    const user = await this.userData.getUserById(userId);

    if (!user) {
      throw new ApiError(userError.NOT_FOUND_ID);
    }

    if (user.role === Role.STUDENT) {
      const tasks = await taskService.getTasksByUserId(user);
      if (tasks.length > 0) {
        return true;
      }
    } else if (user.role === Role.TEACHER) {
      const courses = await courseService.getAllCourse(user);
      if (courses.length > 0) {
        return true;
      }
    }

    return false;
  }

  async registerUser(newUserData: UserRegistrationRequestDto) {
    const existingUser = await this.userData.findUserByEmail(newUserData.email);
    if (existingUser) {
      throw new ApiError(userError.ALREADY_EXIST);
    }

    const activationLink = uuidv4();
    const activationToken = tokenService.generateActivationToken({
      name: 'edulab',
    });
    const avatarUrl = `${process.env.API_URL}/avatar.png`;

    const userForDb: UserRegistrationDataForDbDto = {
      ...newUserData,
      email: newUserData.email.toLowerCase(),
      password: ' ',
      activationLink,
      avatarUrl,
    };
    const justRegisteredUser = await this.userData.addUser(userForDb);

    const userObjForMailService = {
      firstName: justRegisteredUser.first_name,
      email: justRegisteredUser.email,
      activateAccountLink: `${process.env.API_URL}${authPaths.ROOT}/activate/${activationToken}${justRegisteredUser.activation_link}`,
    };
    await mailService.sendActivationEmail(userObjForMailService);
    return justRegisteredUser;
  }

  async importUsers(usersToRegister: UserRegistrationRequestDto[]) {
    // находження юзерів зі списку в базі вже зареєстрованих юзерів
    const normalizedUsersToRegister = usersToRegister.map((user) => ({
      ...user,
      email: user.email.toLowerCase(),
    }));
    const alreadyExistingUsers = await this.userData.findUsersByEmails(
      normalizedUsersToRegister.map(({ email }) => email),
    );

    // формування списку саме нових юзерів для додавання у базу даних
    const newUsersToRegister = alreadyExistingUsers.length
      ? normalizedUsersToRegister.filter(
          (user) =>
            !alreadyExistingUsers
              .map(({ email }) => email.toLowerCase())
              .includes(user.email.toLowerCase()),
        )
      : normalizedUsersToRegister;

    // якщо масив newUsersToRegister пустий - повертаємо про це message
    if (!newUsersToRegister.length) {
      throw new ApiError(userError.ALREADY_EXIST);
    }

    const newUsersToRegisterForDb: UserRegistrationDataForDbDto[] = [];

    for (const user of newUsersToRegister) {
      const password = ' ';
      const activationLink = uuidv4();
      const newUserToRegisterForDb: UserRegistrationDataForDbDto = {
        ...user,
        role: Role.STUDENT,
        password,
        activationLink,
        avatarUrl: `${process.env.API_URL}/avatar.png`,
      };
      newUsersToRegisterForDb.push(newUserToRegisterForDb);
    }

    // додавання нових юзерів до бази даних
    await this.userData.addUsersWithGroups(newUsersToRegisterForDb);

    // розсилка листів для підтвердження електронної пошти користувача
    for (const user of newUsersToRegisterForDb) {
      const activationToken = tokenService.generateActivationToken({
        name: 'edulab',
      });
      await mailService.sendActivationEmail({
        firstName: user.firstName,
        email: user.email,
        activateAccountLink: `${process.env.API_URL}${authPaths.ROOT}/activate/${activationToken}${user.activationLink}`,
      });
    }
    // формування message для фронту про вже зареєстрованих юзерах якщо такі є
    const alreadyExistingUsersEmailsString = alreadyExistingUsers
      .map(({ email }) => email)
      .join(', ');
    const justRegisteredUsersEmailsString = newUsersToRegisterForDb
      .map(({ email }) => email)
      .join(', ');
    const responseMessage = alreadyExistingUsers.length
      ? `Users with email addresses: ${alreadyExistingUsersEmailsString} are already in the database. Users with email addresses: ${justRegisteredUsersEmailsString} successfully added to the database`
      : `Users with email addresses: ${justRegisteredUsersEmailsString} successfully added to the database`;

    return responseMessage;
  }

  async activateUser(activationLink: string) {
    const uuidLength = 36;
    const token = activationLink.slice(0, -uuidLength);
    const uuid = activationLink.slice(-uuidLength);

    const isValidToken = tokenService.validateToken(token);

    const existingUser: UserDbDto =
      await this.userData.findUserByActivationLink(uuid);

    if (!existingUser || !isValidToken) {
      return null;
    }
    if (existingUser && existingUser.is_activated === false) {
      await this.userData.activateUserById(existingUser.id);
      return 'User successfully activated';
    }
    return 'User already activated';
  }

  async validateResetPassword(activationLink: string) {
    const uuidLength = 36;
    const token = activationLink.slice(0, -uuidLength);
    const uuid = activationLink.slice(-uuidLength);

    const isValidToken = tokenService.validateToken(token);

    const existingUser: UserDbDto =
      await this.userData.findUserByActivationLink(uuid);

    if (!existingUser || !isValidToken) {
      return null;
    }
    return 'Validation successful';
  }

  async signInUser(userSignInData: UserSignInRequestDto) {
    const existingUser = await this.userData.findUserByEmail(
      userSignInData.email,
    );
    if (!existingUser) {
      throw new ApiError(userError.INVALID_CREDENTIALS);
    }

    if (!existingUser.is_activated) {
      throw new ApiError(userError.NOT_ACTIVATED);
    }

    const isPasswordEquals = await bcrypt.compare(
      userSignInData.password,
      existingUser.password,
    );

    if (!isPasswordEquals) {
      throw new ApiError(userError.WRONG_PASSWORD);
    }

    const userObjForTokenService = {
      id: existingUser.id,
      firstName: existingUser.first_name,
      lastName: existingUser.last_name,
      email: existingUser.email,
      role: existingUser.role,
    };

    const tokens = tokenService.generateTokens({ ...userObjForTokenService });
    await tokenService.saveToken(
      userObjForTokenService.id,
      tokens.refreshToken,
    );

    const userData = {
      accessToken: tokens.accessToken,
      user: {
        ...userObjForTokenService,
        avatarUrl: existingUser.avatar_url,
        isSubscribedToEmails: existingUser.is_subscribed_to_emails,
      },
    };

    return {
      refreshToken: tokens.refreshToken,
      userData,
    };
  }

  async logoutUser(refreshToken: string) {
    const deletedTokenCount: number | null = await tokenService.removeToken(
      refreshToken,
    );

    if (!deletedTokenCount) {
      throw new ApiError(userError.NOT_FOUND_TOKEN);
    }
    return 'User successfully logged out';
  }

  async createPassword(changePasswordData: UserCreatePasswordRequestDto) {
    const uuidLength = 36;
    const token = changePasswordData.activationLink.slice(0, -uuidLength);
    const uuid = changePasswordData.activationLink.slice(-uuidLength);

    const isValidToken = tokenService.validateToken(token);
    if (!isValidToken) {
      throw new ApiError(userError.WRONG_USER_DATA);
    }

    const existingUser: UserDbDto =
      await this.userData.findUserByActivationLink(uuid);

    if (!existingUser) {
      throw new ApiError(userError.NOT_FOUND_EMAIL);
    }

    if (
      existingUser.email !== changePasswordData.email.toLocaleLowerCase().trim()
    ) {
      throw new ApiError(userError.WRONG_USER_DATA);
    }

    if (existingUser.is_activated === false) {
      throw new ApiError(userError.NOT_ACTIVATED);
    }

    const hashedPassword = await bcrypt.hash(changePasswordData.password, 7);
    await this.userData.updateUserPasswordByEmail(
      existingUser.email,
      hashedPassword,
    );
  }

  async changePassword(changePasswordData: UserChangePasswordRequestDto) {
    const existingUser = await this.userData.findUserByEmail(
      changePasswordData.email,
    );
    if (!existingUser) {
      throw new ApiError(userError.NOT_FOUND_EMAIL);
    }

    const isPasswordEquals = await bcrypt.compare(
      changePasswordData.oldPassword,
      existingUser.password,
    );
    if (!isPasswordEquals) {
      throw new ApiError(userError.WRONG_PASSWORD2);
    }

    const hashedPassword = await bcrypt.hash(changePasswordData.newPassword, 7);
    await this.userData.updateUserPasswordByEmail(
      existingUser.email,
      hashedPassword,
    );
  }
  async recoverCredentials(recoverPasswordData: UserRecoverPasswordRequestDto) {
    const existingUser = await this.userData.findUserByEmail(
      recoverPasswordData.email.toLocaleLowerCase().trim(),
    );
    if (!existingUser) {
      throw new ApiError(userError.NOT_FOUND_EMAIL);
    }

    if (!existingUser.is_activated) {
      throw new ApiError(userError.NOT_ACTIVATED);
    }

    const resetPswToken = tokenService.generateResetPswToken({
      name: 'edulab',
    });

    const userObjForMailService = {
      firstName: existingUser.first_name,
      email: existingUser.email,
      activateAccountLink: `${process.env.API_URL}${authPaths.ROOT}/validate-reset-psw/${resetPswToken}${existingUser.activation_link}`,
    };
    await mailService.sendResetPasswordEmail(userObjForMailService);
  }

  async restoreUser(id: string) {
    const restoredUser = await this.userData.findUserById(id);

    if (!restoredUser) {
      throw new ApiError(userError.UNAUTHORIZED);
    }

    const userObjForTokenService = {
      id: restoredUser.id,
      firstName: restoredUser.first_name,
      lastName: restoredUser.last_name,
      email: restoredUser.email,
      role: restoredUser.role,
    };

    const tokens = tokenService.generateTokens({ ...userObjForTokenService });
    await tokenService.saveToken(
      userObjForTokenService.id,
      tokens.refreshToken,
    );

    const userData = {
      user: {
        ...userObjForTokenService,
        avatarUrl: restoredUser.avatar_url,
        isSubscribedToEmails: restoredUser.is_subscribed_to_emails,
      },
    };

    return {
      refreshToken: tokens.refreshToken,
      userData,
    };
  }

  async refreshUser(refreshToken: string) {
    let restoredUser: UserDbDto | null = null;

    const data = tokenService.validateRefreshToken(refreshToken);
    if (typeof data === 'object' && 'id' in data) {
      restoredUser = await this.userData.findUserById(data.id);
    } else {
      return null;
    }

    //added check for user existence
    const tokenData = await tokenService.findToken(refreshToken);
    if (!tokenData) {
      return null;
    }
    if (tokenData.user_id !== restoredUser.id) {
      return null;
    }
    //added check for user existence

    const userObjForTokenService = {
      id: restoredUser.id,
      firstName: restoredUser.first_name,
      lastName: restoredUser.last_name,
      email: restoredUser.email,
      role: restoredUser.role,
    };

    const tokens = tokenService.generateTokens({ ...userObjForTokenService });
    await tokenService.saveToken(
      userObjForTokenService.id,
      tokens.refreshToken,
    );

    const userData = {
      accessToken: tokens.accessToken,
      user: {
        ...userObjForTokenService,
        avatarUrl: restoredUser.avatar_url,
        isSubscribedToEmails: restoredUser.is_subscribed_to_emails,
      },
    };

    return {
      refreshToken: tokens.refreshToken,
      userData,
    };
  }
}

export const userService = new UserService();
