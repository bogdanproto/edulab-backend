import {
  CreateQuestionDto,
  QuestionDto,
  TestDto,
} from '../../data/dto/TestDto';
import { testData } from '../../data';
import { ApiError } from '../../helpers';
import { testError } from '../../consts';

export class Test {
  public id: number | null;
  public title: string;
  public description: string;
  public maxScores: number;
  public teacherId: number | null;
  public questions: QuestionDto[];
  public questionCount?: number;

  constructor({
    id,
    title,
    description,
    maxScores,
    teacherId,
    questions = [],
    questionCount,
  }: TestDto & { questionCount?: number }) {
    this.id = id || null;
    this.title = title;
    this.description = description;
    this.maxScores = maxScores;
    this.teacherId = teacherId || null;
    this.questions = questions || [];
    this.questionCount = questionCount || 0;
  }

  static async getTestById(id: number) {
    const data = await testData.getTestById(id);

    if (!data) throw new ApiError(testError.NOT_FOUND_ID);

    const { title, description, maxScores, questions, teacherId } = data;

    const test = new Test({
      id,
      title,
      description,
      maxScores,
      teacherId,
      questions,
    });

    return test;
  }

  static async getAllTests() {
    const data = await testData.getAllTests();

    if (!data) return [];

    const tests = data.map(
      ({ id, title, description, maxScores, teacherId, questions }) =>
        new Test({
          id,
          title,
          description,
          maxScores,
          teacherId,
          questions,
        }),
    );

    return tests;
  }

  static async getTestIdByTaskId(taskId: number) {
    const data = await testData.getTestIdByTaskId(taskId);

    if (!data) throw new ApiError(testError.NOT_FOUND_TASK_ID);

    const { testId } = data;

    return testId;
  }

  static async getTestsByTeacherId(teacherId: number) {
    const data = await testData.getTestsByTeacherId(teacherId);

    if (!data) return [];

    const tests = data.map(
      ({ id, title, description, maxScores, teacherId, questionCount }) =>
        new Test({
          id,
          title,
          description,
          maxScores,
          teacherId,
          questionCount,
        }),
    );

    return tests;
  }

  static async createTest({ title, description, maxScores, teacherId }) {
    return await testData.createTest({
      title,
      description,
      maxScores,
      teacherId,
    });
  }

  async updateTest({ title, description, maxScores, teacherId }) {
    if (!this.id) throw new ApiError(testError.NOT_FOUND_ID);

    return await testData.updateTestById(
      {
        title,
        description,
        maxScores,
        teacherId,
      },
      this.id,
    );
  }

  async deleteTest() {
    if (!this.id) throw new ApiError(testError.NOT_FOUND_ID);

    const isTestExist = await testData.getTestRelatedToAnyLesson(this.id);

    if (isTestExist) {
      throw new ApiError(testError.ALREADY_USED);
    }

    return await testData.deleteTestById(this.id);
  }

  static async getQuestionById(id: number) {
    return await testData.getQuestionById(id);
  }

  static async addQuestion(questionObj: CreateQuestionDto) {
    return await testData.addQuestion(questionObj);
  }

  static async updateQuestionById(questionObj: CreateQuestionDto, id: number) {
    return await testData.updateQuestionById(questionObj, id);
  }

  static async deleteQuestionById(id: number) {
    return await testData.deleteQuestionById(id);
  }
}

export class Question {
  private id: number | null;
  private testId: number;
  private title: string;
  private typeQuestion: string;
  private answer: string;
  private answers: string[];

  constructor({ id = null, title, testId, typeQuestion, answer, answers }) {
    this.id = id;
    this.testId = testId;
    this.title = title;
    this.typeQuestion = typeQuestion;
    this.answer = answer;
    this.answers = answers;
  }
}
