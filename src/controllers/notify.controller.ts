import { Context } from 'koa';
import { UserCurrentDto } from '../data/dto';
import { notifyService } from '../services/notify.service';
import { ApiResponse } from '../helpers';
import { notifyRes, successRes } from '../consts';
import { Pagination, notifyStatus } from '../types';

export default class NotifyController {
  static async getAllNotify(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const pagination = ctx.query as Pagination;

    const data = await notifyService.getAllNotify(user, pagination);

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async getQntNotifyByStatus(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const status = ctx.params.status as notifyStatus;

    const data = await notifyService.getQntNotifyByStatus({
      userId: user.id,
      status,
    });

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async updateStatus(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;

    await notifyService.updateStatus(user.id);

    ApiResponse.success(ctx, { ...notifyRes.UPDATE_STATUS });
  }
}
