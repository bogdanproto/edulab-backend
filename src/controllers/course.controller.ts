import { courseRes, successRes } from '../consts';
import {
  ChangeStatusCourseDto,
  CreateCourseDto,
  UserCurrentDto,
} from '../data/dto';
import { ApiResponse } from '../helpers';
import { courseService } from '../services/course.service';
import { Context } from 'koa';
import { uploadsService } from '../services/uploads.service';

export default class CourseController {
  static async getAllCourse(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const isActive = ctx.query?.active === 'true';

    const data = await courseService.getAllCourse(user, isActive);

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async getCourseById(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const courseId = ctx.params.id;

    const data = await courseService.getCourseById({ courseId, user });

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async createCourse(ctx: Context) {
    const courseObj = ctx.request.body as CreateCourseDto;
    const user: UserCurrentDto = ctx.state.user;

    const data = await courseService.createCourse({ courseObj, user });

    ApiResponse.success(ctx, { ...courseRes.CREATED, data });
  }

  static async updateCourse(ctx: Context) {
    const courseObj = ctx.request.body as CreateCourseDto;
    const user: UserCurrentDto = ctx.state.user;
    const courseId = ctx.params.id;

    const data = await courseService.updateCourse({
      courseObj,
      user,
      courseId,
    });

    ApiResponse.success(ctx, { ...courseRes.UPDATE, data });
  }

  static async changeStatusCourse(ctx: Context) {
    const status = ctx.request.body as ChangeStatusCourseDto;
    const user: UserCurrentDto = ctx.state.user;
    const courseId = ctx.params.id;

    const data = await courseService.changeStatusCourse({
      status,
      user,
      courseId,
    });

    ApiResponse.success(ctx, { ...courseRes.STATUS, data });
  }

  static async deleteCourse(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const courseId = ctx.params.id;

    const data = await courseService.deleteCourse({ user, courseId });

    if (data.imgUrl) {
      uploadsService.deleteFileFromS3(data.imgUrl);
    }

    ApiResponse.success(ctx, { ...courseRes.DELETE, data });
  }
}
