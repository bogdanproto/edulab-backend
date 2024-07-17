import 'dotenv/config';
import { Context } from 'koa';
import {
  UserRegistrationRequestDto,
  UserSignInRequestDto,
  UserChangePasswordRequestDto,
  UserCreatePasswordRequestDto,
  UserRecoverPasswordRequestDto,
} from '../data/dto';
import ApiError from '../helpers/ApiError';
import userError from '../consts/errors/userError';
import { userService } from '../services/users.service';
import { setRefreshTokenCookie } from '../helpers';

export default class AuthController {
  static async registerUser(ctx: Context) {
    const newUserData = ctx.request.body as UserRegistrationRequestDto;

    const user = await userService.registerUser(newUserData);
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      message: `${user.first_name} ${user.last_name} successfully registered`,
    };
  }

  static async importUsers(ctx: Context) {
    const newUsersData = ctx.request.body as UserRegistrationRequestDto[];
    const responseMessage = await userService.importUsers(newUsersData);
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      message: responseMessage,
    };
  }

  static async activateUser(ctx: Context) {
    const activationLink = ctx.params.link;
    const result = await userService.activateUser(activationLink);
    if (!result) {
      ctx.redirect(`${process.env.CLIENT_URL}/auth/invalid-activation`);
    } else {
      ctx.redirect(
        `${process.env.CLIENT_URL}/auth/create-password/${activationLink}`,
      );
    }
  }

  static async validateResetPassword(ctx: Context) {
    const activationLink = ctx.params.link;
    const result = await userService.validateResetPassword(activationLink);
    if (!result) {
      ctx.redirect(`${process.env.CLIENT_URL}/auth/invalid-psw-reset-data`);
    } else {
      ctx.redirect(
        `${process.env.CLIENT_URL}/auth/create-password/${activationLink}`,
      );
    }
  }

  static async signInUser(ctx: Context) {
    const userSignInData = ctx.request.body as UserSignInRequestDto;
    const { refreshToken, userData } = await userService.signInUser(
      userSignInData,
    );
    setRefreshTokenCookie(ctx, refreshToken);

    ctx.status = 200;
    ctx.body = {
      status: 'success',
      ...userData,
    };
  }

  static async logoutUser(ctx: Context) {
    if (process.env.NODE_ENV === 'production') {
      const refreshToken: string | undefined = ctx.cookies.get('refreshToken');
      if (!refreshToken) {
        throw new ApiError(userError.UNAUTHORIZED);
      }
      const resultMsg = await userService.logoutUser(refreshToken);
      ctx.cookies.set('refreshToken', '', { maxAge: 0 });
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        message: resultMsg,
      };
    } else {
      ctx.cookies.set('refreshToken', '', { maxAge: 0 });
      ctx.status = 200;
      ctx.body = {
        status: 'success',
        message: 'logout successful',
      };
    }
  }

  static async changePassword(ctx: Context) {
    const { email } = ctx.state.user;
    const changePasswordData = ctx.request.body as UserChangePasswordRequestDto;
    changePasswordData.email = email;
    await userService.changePassword(changePasswordData);
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      message: 'password successfully changed',
    };
  }

  static async createPassword(ctx: Context) {
    const changePasswordData = ctx.request.body as UserCreatePasswordRequestDto;
    await userService.createPassword(changePasswordData);
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      message: 'password successfully created',
    };
  }

  static async recoverCredentials(ctx: Context) {
    const changePasswordData = ctx.request
      .body as UserRecoverPasswordRequestDto;
    await userService.recoverCredentials(changePasswordData);
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      message:
        'An email with instruction for activating your account and creating a password has been sent to your email',
    };
  }

  static async restoreUser(ctx: Context) {
    const { id, accessToken } = ctx.state.user;
    const result = await userService.restoreUser(id);
    if (!result) {
      throw new ApiError(userError.UNAUTHORIZED);
    }
    const { refreshToken, userData } = result;
    setRefreshTokenCookie(ctx, refreshToken);
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      accessToken,
      ...userData,
    };
  }

  static async refreshUser(ctx: Context) {
    const token: string | undefined = ctx.cookies.get('refreshToken');

    if (!token) {
      throw new ApiError(userError.UNAUTHORIZED);
    }
    const result = await userService.refreshUser(token);
    if (!result) {
      throw new ApiError(userError.UNAUTHORIZED);
    }
    const { refreshToken, userData } = result;
    setRefreshTokenCookie(ctx, refreshToken);
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      ...userData,
    };
  }
}
