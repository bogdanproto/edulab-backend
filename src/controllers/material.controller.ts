import { Context } from 'koa';
import { materialRes, successRes } from '../consts';
import { CreateMaterialDto, UserCurrentDto } from '../data/dto';
import { ApiResponse } from '../helpers';
import { materialService } from '../services/material.service';
import { uploadsService } from '../services/uploads.service';

export default class MaterialController {
  static async getAllMaterialByLesson(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await materialService.getAllMaterialsByLesson({
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async createMaterial(ctx: Context) {
    const materialObj = ctx.request.body as CreateMaterialDto;
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await materialService.createMaterial({
      materialObj,
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...materialRes.CREATED, data });
  }

  static async updateMaterial(ctx: Context) {
    const materialObj = ctx.request.body as CreateMaterialDto;
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const id = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;

    const data = await materialService.updateMaterial({
      materialObj,
      courseId,
      lessonId,
      id,
      user,
    });

    ApiResponse.success(ctx, { ...materialRes.UPDATE, data });
  }

  static async deleteMaterial(ctx: Context) {
    const id = +ctx.params.id;
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await materialService.deleteMaterial({
      user,
      courseId,
      lessonId,
      id,
    });

    if (data.sourceUrl) {
      uploadsService.deleteFileFromS3(data.sourceUrl);
    }

    ApiResponse.success(ctx, { ...materialRes.DELETE, data });
  }
}
