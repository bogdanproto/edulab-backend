import { Pool, QueryResult } from 'pg';

import { CreateTestResultDto, TestResultDto } from '../dto/TestDto';

export class TestResultData {
  constructor(private pool: Pool) {}

  // =================================== Test Result

  async getTestResultByTaskId(taskId: number) {
    const query = 'SELECT * FROM test_results WHERE task_id = $1';
    const result = await this.pool.query<TestResultDto>(query, [taskId]);
    return TestResultData.mapTestResultResult(result)[0];
  }

  async createTestResult(
    testResult: CreateTestResultDto,
    testId: number,
    status: string,
    scores: number,
    totalQuestions: number,
    correctAnswers: number,
  ) {
    const query = `INSERT INTO test_results 
    (test_id, task_id, scores, answers, status, total_questions, correct_answers) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

    const result = await this.pool.query<TestResultDto>(query, [
      testId,
      testResult.taskId,
      scores,
      JSON.stringify(testResult.answers),
      status,
      totalQuestions,
      correctAnswers,
    ]);

    return TestResultData.mapTestResultResult(result)[0];
  }

  async updateTestResultByTaskId(
    testResult: CreateTestResultDto,
    status: string,
    scores: number,
    totalQuestions: number,
    correctAnswers: number,
    id: number,
  ) {
    const query = `UPDATE test_results  
          SET scores = $1, 
          answers = $2,
          status = $3,
          total_questions = $4,
          correct_answers = $5
          WHERE task_id = $6
          RETURNING *`;

    const result = await this.pool.query(query, [
      scores,
      JSON.stringify(testResult.answers),
      status,
      totalQuestions,
      correctAnswers,
      id,
    ]);

    return TestResultData.mapTestResultResult(result)[0];
  }

  async deleteTestResultByTaskId(testId: number) {
    const query = 'DELETE FROM test_results WHERE task_id = $1 RETURNING *';

    const result = await this.pool.query<TestResultDto>(query, [testId]);

    return TestResultData.mapTestResultResult(result)[0];
  }

  // =================================== Maping

  private static mapTestResultResult = (res: QueryResult): TestResultDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      testId: r.test_id,
      taskId: r.task_id,
      scores: r.scores,
      status: r.status,
      totalQuestions: r.total_questions,
      correctAnswers: r.correct_answers,
      answers: JSON.parse(r.answers),
    }));
}
