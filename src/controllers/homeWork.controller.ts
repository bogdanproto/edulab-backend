import { homeWorkRes, successRes } from '../consts';
import { CreateHomeWorkDto, UserCurrentDto } from '../data/dto';
import { ApiResponse } from '../helpers';
import { homeWorkService } from '../services/homeWork.service';
import { Context } from 'koa';
import { uploadsService } from '../services/uploads.service';

export default class HomeWorkController {
  static async getHomeWorkByLesson(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await homeWorkService.getHomeWorkByLesson({
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async createHomeWork(ctx: Context) {
    const homeWorkObj = ctx.request.body as CreateHomeWorkDto;
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await homeWorkService.createHomeWork({
      homeWorkObj,
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...homeWorkRes.CREATED, data });
  }

  static async updateHomeWork(ctx: Context) {
    const homeWorkObj = ctx.request.body as CreateHomeWorkDto;
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const id = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;

    const data = await homeWorkService.updateHomeWork({
      homeWorkObj,
      courseId,
      lessonId,
      id,
      user,
    });

    ApiResponse.success(ctx, { ...homeWorkRes.UPDATE, data });
  }

  static async deleteHomeWork(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const id = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;

    const data = await homeWorkService.deleteHomeWork({
      user,
      courseId,
      lessonId,
      id,
    });

    if (data.sourceUrl) {
      uploadsService.deleteFileFromS3(data.sourceUrl);
    }

    ApiResponse.success(ctx, { ...homeWorkRes.DELETE, data });
  }
}
