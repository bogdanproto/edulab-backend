import {
  Answers,
  CheckTestResultDto,
  CreateTestResultDto,
  TestResultDto,
} from '../../data/dto/TestDto';
import { taskData, testResultData } from '../../data';
import { ApiError } from '../../helpers';
import { testError, testResultError } from '../../consts';
import { TaskStatus } from '../../types';
import { Test } from './Test';

export class TestResult {
  public id: number | null;
  public taskId: number | null;
  public testId: number | null;
  public scores: number;
  public totalQuestions: number;
  public correctAnswers: number;
  public status: string;
  public answers: Answers[];

  constructor({
    id,
    taskId,
    testId,
    scores,
    totalQuestions,
    correctAnswers,
    status,
    answers,
  }: TestResultDto) {
    this.id = id || null;
    this.taskId = taskId || null;
    this.testId = testId || null;
    this.scores = scores;
    this.totalQuestions = totalQuestions;
    this.correctAnswers = correctAnswers;
    this.status = status;
    this.answers = answers;
  }

  static getCorrectAnswers(test: Test, answers: Answers[]) {
    let correctCount = 0;

    answers.forEach((question) => {
      question.answers.forEach((answer) => {
        const originalQuestion = test.questions?.find(
          (item) => item.id === question.questionId,
        );

        const answerOptions = originalQuestion?.answerOptions || [];

        const correctAnswer = answerOptions.find(
          (item) => item.id === answer.answerId && item.isCorrect,
        );

        if (originalQuestion?.questionType !== 'open' && correctAnswer) {
          correctCount += 1;
        }

        if (
          originalQuestion?.questionType === 'open' &&
          answer.answerText?.trim().toLowerCase() ===
            answerOptions[0].answerText.trim().toLowerCase()
        ) {
          correctCount += 1;
        }
      });
    });

    return correctCount;
  }

  static async createTestResult(testResultObj: CreateTestResultDto) {
    const testId = await Test.getTestIdByTaskId(testResultObj.taskId);

    const test = await Test.getTestById(testId);

    const totalQuestions = test.questions.length;

    const correctCount = TestResult.getCorrectAnswers(
      test,
      testResultObj.answers,
    );

    const scores =
      totalQuestions !== 0
        ? (test.maxScores * correctCount) / totalQuestions
        : 0;

    const testResult = await testResultData.getTestResultByTaskId(
      testResultObj.taskId,
    );

    if (testResult) {
      taskData.updateTaskStatus(testResultObj.taskId, TaskStatus.Done);

      return await testResultData.updateTestResultByTaskId(
        {
          ...testResultObj,
        },
        'done',
        scores,
        totalQuestions,
        correctCount,
        testResultObj.taskId,
      );
    }

    taskData.updateTaskStatus(testResultObj.taskId, TaskStatus.Done);

    return await testResultData.createTestResult(
      {
        ...testResultObj,
      },
      testId,
      'done',
      scores,
      totalQuestions,
      correctCount,
    );
  }

  static async checkTestResult(testResultObj: CheckTestResultDto) {
    const { testId } = testResultObj;

    const test = await Test.getTestById(testId);

    if (!test) throw new ApiError(testError.NOT_FOUND_ID);
    const totalQuestions = test.questions.length;

    const correctCount = TestResult.getCorrectAnswers(
      test,
      testResultObj.answers,
    );

    const scores =
      totalQuestions !== 0
        ? (test.maxScores * correctCount) / totalQuestions
        : 0;

    return {
      taskId: 0,
      testId,
      status: 'done',
      scores,
      totalQuestions,
      correctAnswers: correctCount,
      answers: testResultObj.answers,
    };
  }

  static async getTestResultByTaskId(taskId: number) {
    const data = await testResultData.getTestResultByTaskId(taskId);

    if (!data) {
      const testResult = new TestResult({
        testId: 0,
        taskId,
        scores: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        status: 'null',
        answers: [],
      });

      return testResult;
    }

    const {
      id,
      testId,
      scores,
      totalQuestions,
      correctAnswers,
      status,
      answers,
    } = data;

    const testResult = new TestResult({
      id,
      testId,
      taskId,
      scores,
      totalQuestions,
      correctAnswers,
      status,
      answers,
    });

    return testResult;
  }

  async deleteTestResult() {
    if (!this.taskId) throw new ApiError(testResultError.NOT_FOUND_ID);
    const testResult = await TestResult.getTestResultByTaskId(this.taskId);
    if (!testResult) throw new ApiError(testResultError.NOT_FOUND_ID);

    await testResultData.deleteTestResultByTaskId(this.taskId);

    return {
      testId: this.testId,
      taskId: this.taskId,
      scores: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      status: 'null',
      answers: '',
    };
  }
}
