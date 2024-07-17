import { CheckTestResultDto, CreateTestResultDto } from '../data/dto/TestDto';
import ApiError from '../helpers/ApiError';
import { testResultError } from '../consts';
import { TestResult } from '../app/test/TestResult';

export class TestResultService {
  static async createTestResult(testResultObj: CreateTestResultDto) {
    return await TestResult.createTestResult(testResultObj);
  }

  static async checkTestResult(testResultObj: CheckTestResultDto) {
    return TestResult.checkTestResult(testResultObj);
  }

  static async getTestResultByTaskId(taskId: number) {
    const testResult = await TestResult.getTestResultByTaskId(taskId);

    return testResult;
  }

  static async deleteTestResultByTaskId(taskId: number) {
    const testResult = await TestResult.getTestResultByTaskId(taskId);
    if (!testResult) throw new ApiError(testResultError.NOT_FOUND_ID);

    return await testResult.deleteTestResult();
  }
}
