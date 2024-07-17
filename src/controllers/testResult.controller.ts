import { CheckTestResultDto, CreateTestResultDto } from '../data/dto/TestDto';
import { TestResultService } from '../services/testResult.service';
import { testRes, successRes, errors } from '../consts';
import { ApiError, ApiResponse } from '../helpers';
import { Context } from 'koa';
import { notifyService } from '../services/notify.service';
import { UserCurrentDto } from '../data/dto';
import { notifyTypes, sourceTypes } from '../types';

export default class TestResultController {
  static async createTestResult(ctx: Context) {
    const user: UserCurrentDto = ctx.state.user;
    const testResultObj = ctx.request.body! as CreateTestResultDto;
    const data = await TestResultService.createTestResult(testResultObj);

    await notifyService.createNotifyForTask({
      initiatorId: user.id,
      source: testResultObj.taskId,
      sourceType: sourceTypes.TASK,
      type: notifyTypes.STUDENT_HW_DONE,
    });

    ApiResponse.success(ctx, { ...testRes.CREATED_TEST_RESULT, data });
  }

  static async checkTestResult(ctx: Context) {
    const testResultObj = ctx.request.body! as CheckTestResultDto;
    const data = await TestResultService.checkTestResult(testResultObj);

    ApiResponse.success(ctx, { ...testRes.CHECK_TEST_RESULT, data });
  }

  static async getTestResultByTaskId(ctx: Context) {
    const taskId = +ctx.params.id;

    if (Number.isNaN(taskId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const data = await TestResultService.getTestResultByTaskId(taskId);
    ApiResponse.success(ctx, { ...successRes.GET_SUCCESS, data });
  }

  static async deleteTestResultByTaskId(ctx: Context) {
    const taskId = +ctx.params.id;

    if (Number.isNaN(taskId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const data = await TestResultService.deleteTestResultByTaskId(taskId);
    ApiResponse.success(ctx, { ...testRes.DELETE_TEST_RESULT, data });
  }
}
