import { successRes } from '../consts';
import { UserCurrentDto } from '../data/dto';
import { ApiResponse, ApiError } from '../helpers';
import { roleError } from '../consts';
import { Context } from 'koa';
import { dashboardService } from '../services/dashboard.service';
import { Role } from '../types';

export default class DashboardController {
  static async getDashboardTeacher(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;

    const data = await dashboardService.getDashboardTeacher(user);

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async getDashboardStudentData(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    if (user.role !== Role.STUDENT) {
      throw new ApiError(roleError.NOT_RIGHTS);
    }
    const groupName = ctx.query.groupName as string;

    const data = await dashboardService.getDashboardStudentData(groupName);
    ctx.status = 200;
    ctx.body = {
      status: 'success',
      data,
    };
  }
}
