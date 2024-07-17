import { TestDto, CreateQuestionDto } from '../data/dto/TestDto';
import { TestService } from '../services/tests.service';
import { testRes, successRes, errors } from '../consts';
import { ApiError, ApiResponse } from '../helpers';
import { Context } from 'koa';
import { uploadsService } from '../services/uploads.service';

export default class TestsController {
  static async getTestsByTeacherId(ctx: Context) {
    const user = ctx.state.user;
    const data = await TestService.getTestsByTeacherId(user.id);
    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async createTest(ctx: Context) {
    const testObj = ctx.request.body as TestDto;
    const user = ctx.state.user;
    const data = await TestService.createTest(testObj, user.id);
    ApiResponse.success(ctx, { ...testRes.CREATED_TEST, data });
  }

  static async getTestById(ctx: Context) {
    const testId = +ctx.params.id;

    if (Number.isNaN(testId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const data = await TestService.getTestById(testId);
    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async getTestByTaskId(ctx: Context) {
    const taskId = +ctx.params.id;

    if (Number.isNaN(taskId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const data = await TestService.getTestByTaskId(taskId);
    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async deleteTest(ctx: Context) {
    const testId = +ctx.params.id;

    if (Number.isNaN(testId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const data = await TestService.deleteTestById(testId);
    ApiResponse.success(ctx, { ...testRes.DELETE_TEST, data });
  }

  static async updateTest(ctx: Context) {
    const id = +ctx.params.id;

    if (Number.isNaN(id)) {
      throw new ApiError(errors.BAD_ID);
    }

    const testObj = ctx.request.body! as TestDto;
    const user = ctx.state.user;
    const data = await TestService.updateTestById(testObj, id, user.id);
    ApiResponse.success(ctx, { ...testRes.UPDATE_TEST, data });
  }

  static async addQuestion(ctx: Context) {
    const questionObj = ctx.request.body as CreateQuestionDto;
    const data = await TestService.addQuestion(questionObj);
    ApiResponse.success(ctx, { ...testRes.ADD_QUESTION, data });
  }

  static async deleteQuestion(ctx: Context) {
    const questionId = +ctx.params.id;

    if (Number.isNaN(questionId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const data = await TestService.deleteQuestionById(questionId);

    if (data.imgUrl) {
      uploadsService.deleteFileFromS3(data.imgUrl);
    }

    if (data.file) {
      uploadsService.deleteFileFromS3(data.file);
    }

    ApiResponse.success(ctx, { ...testRes.DELETE_QUESTION, data });
  }

  static async updateQuestion(ctx: Context) {
    const id = +ctx.params.id;

    if (Number.isNaN(id)) {
      throw new ApiError(errors.BAD_ID);
    }

    const questionObj = ctx.request.body as CreateQuestionDto;
    const data = await TestService.updateQuestionById(questionObj, id);
    ApiResponse.success(ctx, { ...testRes.UPDATE_QUESTION, data });
  }
}
