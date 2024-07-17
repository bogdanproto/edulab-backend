// import { testData } from '../data';
import { TestDto, CreateQuestionDto } from '../data/dto/TestDto';
import { testError } from '../consts';

import { ApiError } from '../helpers';
import { Test } from '../app/test/Test';

export class TestService {
  static async createTest(testObj: TestDto, teacherId: number) {
    return await Test.createTest({ ...testObj, teacherId });
  }

  static async getAllTests() {
    return await Test.getAllTests();
  }

  static async getTestsByTeacherId(teacherId: number) {
    const tests = await Test.getTestsByTeacherId(teacherId);
    return tests.map((test) => {
      const { id, title, description, maxScores, teacherId, questionCount } =
        test;

      return {
        id,
        title,
        description,
        maxScores,
        teacherId,
        questionCount,
      };
    });
  }

  static async getTestById(testId: number) {
    const test = await Test.getTestById(testId);

    if (!test) throw new ApiError(testError.NOT_FOUND_ID);

    return test;
  }

  static async getTestByTaskId(taskId: number) {
    const testId = await Test.getTestIdByTaskId(taskId);

    return await Test.getTestById(testId);
  }

  static async deleteTestById(id: number) {
    const test = await Test.getTestById(id);

    if (!test) throw new ApiError(testError.NOT_FOUND_ID);

    return await test.deleteTest();
  }

  static async updateTestById(testObj: TestDto, id: number, teacherId: number) {
    const test = await Test.getTestById(id);

    if (!test) throw new ApiError(testError.NOT_FOUND_ID);

    return await test.updateTest({ ...testObj, teacherId });
  }

  static async addQuestion(questionObj: CreateQuestionDto) {
    const test = await Test.getTestById(questionObj.testId);

    if (!test) throw new ApiError(testError.NOT_FOUND_ID);

    return await Test.addQuestion(questionObj);
  }

  static async deleteQuestionById(questionId: number) {
    const question = await Test.getQuestionById(questionId);

    if (!question) throw new ApiError(testError.NOT_FOUND_ID);

    return await Test.deleteQuestionById(questionId);
  }

  static async updateQuestionById(questionObj: CreateQuestionDto, id: number) {
    const question = await Test.getQuestionById(id);

    if (!question) throw new ApiError(testError.NOT_FOUND_ID);

    if (Object.prototype.hasOwnProperty.call(questionObj, 'file')) {
      questionObj = { ...questionObj, imgUrl: questionObj.file };
    }

    return await Test.updateQuestionById(questionObj, id);
  }
}
