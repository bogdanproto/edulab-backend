import { Context } from 'koa';
import { lessonRes, successRes, testRes } from '../consts';
import { CreateLessonDto, TestDtoId, UserCurrentDto } from '../data/dto';
import { ApiResponse } from '../helpers';
import { lessonService } from '../services/lesson.service';

export default class LessonController {
  static async getAllLessonByCourse(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.getAllLesson({ courseId, user });

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async getTestByLesson(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.getTestByLesson({
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async getLessonById(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.getLessonById({
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, {
      ...successRes.GET_SUCCESS,
      data,
    });
  }

  static async assignTestToLesson(ctx: Context) {
    const testObj = ctx.request.body as TestDtoId;
    const testId = Number(testObj.testId);
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.assignTestToLesson({
      testId,
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...testRes.ADD_TO_LESSON, data });
  }

  static async removeTestFromLesson(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.lessonId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.removeTestFromLesson({
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...testRes.REMOVE_FROM_LESSON, data });
  }

  static async createLesson(ctx: Context) {
    const lessonObj = ctx.request.body as CreateLessonDto;
    const courseId = +ctx.params.courseId;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.createLesson({
      lessonObj,
      courseId,
      user,
    });

    ApiResponse.success(ctx, { ...lessonRes.CREATED, data });
  }

  static async updateLesson(ctx: Context) {
    const lessonObj = ctx.request.body as CreateLessonDto;
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.updateLesson({
      lessonObj,
      courseId,
      lessonId,
      user,
    });

    ApiResponse.success(ctx, { ...lessonRes.UPDATE, data });
  }

  static async deleteLesson(ctx: Context) {
    const courseId = +ctx.params.courseId;
    const lessonId = +ctx.params.id;
    const user: UserCurrentDto = ctx.state.user;

    const data = await lessonService.deleteLesson({
      user,
      courseId,
      lessonId,
    });

    ApiResponse.success(ctx, { ...lessonRes.DELETE, data });
  }
}
