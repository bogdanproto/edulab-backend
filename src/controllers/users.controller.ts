import { UpdateUserDto, UserDto } from '../data/dto/UserDto';
import { userService } from '../services/users.service';
import { ApiError, ApiResponse } from '../helpers';
import userRes from '../consts/successRes/userRes';
import { Context } from 'koa';
import { userError } from '../consts';
import { uploadsService } from '../services/uploads.service';

export default class UsersController {
  static async getAllUsers(ctx: Context) {
    const data = await userService.getAllUsers();
    ApiResponse.success(ctx, { ...userRes.GET_ALL_USERS, data });
  }

  static async getUserById(ctx: Context) {
    const userId = ctx.params.userId;
    const data = await userService.getUserById(parseInt(userId));
    ApiResponse.success(ctx, { ...userRes.GET_USER_BY_ID, data });
  }

  static async createUser(ctx: Context) {
    const userObj = ctx.request.body as UserDto;
    const data = await userService.createUser(userObj);
    ApiResponse.success(ctx, { ...userRes.CREATED_USER, data });
  }

  static async updateUser(ctx: Context) {
    const userObj = ctx.request.body as UpdateUserDto;

    const userId = ctx.params.userId;
    const data = await userService.updateUser(userObj, Number(userId));
    ApiResponse.success(ctx, { ...userRes.UPDATED_USER, data });
  }

  static async deleteUser(ctx: Context) {
    const userId = ctx.params.userId;
    const currentUserId = ctx.state.user.id;
    if (userId === currentUserId.toString()) {
      throw new ApiError(userError.NOT_ALLOWED_DELETE_SELF);
    }
    const data = await userService.deleteUser(parseInt(userId));

    if (data.avatarUrl) {
      uploadsService.deleteFileFromS3(data.avatarUrl);
    }

    ApiResponse.success(ctx, { ...userRes.DELETED_USER, data });
  }
}
