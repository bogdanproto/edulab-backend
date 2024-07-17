import { Pool, QueryResult } from 'pg';

import {
  AnswerDto,
  CreateQuestionDto,
  QuestionDto,
  TestDto,
  TestsDto,
} from '../dto/TestDto';

export class TestData {
  constructor(private pool: Pool) {}

  // =================================== Test

  async getAllTests() {
    const query = 'SELECT id, title, description, teacher_id FROM tests';
    const result = await this.pool.query<TestDto>(query);
    return TestData.mapTestResult(result);
  }

  async getTestsByTeacherId(teacherId: number) {
    const query = `SELECT tests.*, COUNT(questions.id) AS question_count
FROM tests
LEFT JOIN questions ON tests.id = questions.test_id
WHERE teacher_id = $1
GROUP BY tests.id;`;

    const result = await this.pool.query<TestsDto>(query, [teacherId]);
    return TestData.mapTestsResult(result);
  }

  async getTestById(id: number): Promise<TestDto | undefined> {
    const query = `SELECT
    t.id,
    t.title,
    t.description,
    t.max_scores AS "maxScores",
    t.teacher_id AS "teacherId",
    (SELECT json_agg(
        json_build_object(
			'id', q.id,
			'questionText', q.question_text,
			'questionType', q.question_type,
			'imgUrl', q.img_url,
			'answerOptions', (
				SELECT json_agg(
					json_build_object(
						'id', ao.id,
						'answerText', ao.answer_text,
						'isCorrect', ao.is_correct
					)
					ORDER BY RANDOM()
				)
				FROM answer_options ao
				WHERE ao.question_id = q.id
			)
		)
	)
	FROM questions q
	WHERE q.test_id = t.id
) AS questions
FROM tests t
WHERE t.id = $1;
`;

    const result = await this.pool.query<TestDto>(query, [id]);

    return result.rows[0];
  }

  async getTestIdByTaskId(taskId: number): Promise<{ testId: number }> {
    const query = `SELECT tl.test_id AS "testId"
FROM tests_lessons tl
JOIN tasks t ON tl.lesson_id = t.lesson_id
WHERE t.id =  $1`;

    const result = await this.pool.query(query, [taskId]);

    return result.rows[0];
  }

  async createTest(test: TestDto) {
    const query =
      'INSERT INTO tests (title,description,max_scores,teacher_id) VALUES ($1, $2, $3, $4) RETURNING *';

    const result = await this.pool.query<TestDto>(query, [
      test.title,
      test.description,
      test.maxScores,
      test.teacherId,
    ]);

    return TestData.mapTestResult(result)[0];
  }

  async updateTestById(test: TestDto, id: number) {
    const query = `UPDATE tests  
          SET title = $1, 
          description = $2, 
          max_scores = $3,
          teacher_id = $4
          WHERE id = $5
          RETURNING *`;

    const result = await this.pool.query(query, [
      test.title,
      test.description,
      test.maxScores,
      test.teacherId,
      id,
    ]);

    return TestData.mapTestResult(result)[0];
  }

  async getTestRelatedToAnyLesson(id: number) {
    const query = `SELECT *
                   FROM tests_lessons
                   WHERE test_id = $1`;
    const result = await this.pool.query<TestDto>(query, [id]);

    return result.rows.length;
  }

  async deleteTestById(testId: number) {
    const query = 'DELETE FROM tests WHERE id = $1 RETURNING *';

    const result = await this.pool.query<TestDto>(query, [testId]);

    return TestData.mapTestResult(result)[0];
  }

  // =================================== Question

  async getQuestions(testId: number): Promise<QuestionDto[] | undefined> {
    const query = 'SELECT * FROM questions WHERE test_id = $1';

    const result = await this.pool.query<QuestionDto>(query, [testId]);

    return TestData.mapQuestionResult(result);
  }

  async getQuestionById(
    questionId: number,
  ): Promise<QuestionDto[] | undefined> {
    const query = 'SELECT * FROM questions WHERE id = $1';

    const result = await this.pool.query<QuestionDto>(query, [questionId]);

    return TestData.mapQuestionResult(result);
  }

  async addQuestion(question: CreateQuestionDto): Promise<QuestionDto> {
    const query = `INSERT INTO questions 
      (question_text, test_id, question_type, img_url) VALUES ($1, $2, $3, $4) RETURNING *`;

    const result = await this.pool.query<QuestionDto>(query, [
      question.questionText,
      question.testId,
      question.questionType,
      question.imgUrl,
    ]);

    const answerOptions: AnswerDto[] = [];
    if (question.answerOptions) {
      await Promise.all(
        JSON.parse(question.answerOptions).map(async (option: AnswerDto) => {
          const answer = await this.addAnswer(option, result.rows[0].id!);

          answerOptions.push(answer);
        }),
      );
    }

    return {
      ...TestData.mapQuestionResult(result)[0],
      answerOptions,
    };
  }

  async updateQuestionById(question: CreateQuestionDto, id: number) {
    const params = [
      question.questionText,
      question.questionType,
      question.testId,
    ];

    let query = `UPDATE questions  
          SET question_text = $1, 
          question_type = $2, 
          test_id = $3`;

    if (question.imgUrl || question.imgUrl === '') {
      query += `, img_url = $4`;
      params.push(question.imgUrl);
    }

    const result = await this.pool.query(
      `${query} WHERE id = $${params.length + 1} RETURNING *`,
      [...params, id],
    );

    const answers = await this.getAnswers(id);
    if (answers) {
      await Promise.all(
        answers.map(async (answer) => {
          if (
            !JSON.parse(question.answerOptions).find(
              (item: AnswerDto) => item.id === answer.id,
            )
          ) {
            this.deleteAnswerById(answer.id);
          }
        }),
      );
    }

    const answerOptions: AnswerDto[] = [];
    if (question.answerOptions) {
      await Promise.all(
        JSON.parse(question.answerOptions).map(async (option: AnswerDto) => {
          if (option.id) {
            const answer = await this.updateAnswerById(option, option.id);
            answerOptions.push(answer);
          } else {
            const answer = await this.addAnswer(option, id);
            answerOptions.push(answer);
          }
        }),
      );
    }

    return {
      ...TestData.mapQuestionResult(result)[0],
      answerOptions,
    };
  }

  async deleteQuestionById(questionId: number) {
    const query = 'DELETE FROM questions WHERE id = $1 RETURNING *';

    const result = await this.pool.query<QuestionDto>(query, [questionId]);

    return TestData.mapQuestionResult(result)[0];
  }

  // =================================== Answer

  async getAnswers(questionId: number): Promise<AnswerDto[] | undefined> {
    const query =
      'SELECT id, answer_text, is_correct, question_id FROM answer_options WHERE question_id = $1';

    const result = await this.pool.query<AnswerDto>(query, [questionId]);

    return TestData.mapAnswerResult(result);
  }

  async addAnswer(answer: AnswerDto, id: number): Promise<AnswerDto> {
    const query =
      'INSERT INTO answer_options (answer_text, is_correct, question_id) VALUES ($1, $2, $3) RETURNING *';

    const result = await this.pool.query<AnswerDto>(query, [
      answer.answerText,
      answer.isCorrect,
      id,
    ]);

    return TestData.mapAnswerResult(result)[0];
  }

  async updateAnswerById(answer: AnswerDto, id: number) {
    const query = `UPDATE answer_options  
          SET answer_text = $1, 
          is_correct = $2          
          WHERE id = $3
          RETURNING *`;

    const result = await this.pool.query(query, [
      answer.answerText,
      answer.isCorrect,
      id,
    ]);

    return TestData.mapAnswerResult(result)[0];
  }

  async deleteAnswerById(id: number) {
    const query = 'DELETE FROM answer_options WHERE id = $1 RETURNING *';

    const result = await this.pool.query<AnswerDto>(query, [id]);

    return TestData.mapAnswerResult(result)[0];
  }

  // =================================== Maping

  private static mapAnswerResult = (res: QueryResult): AnswerDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      answerText: r.answer_text,
      isCorrect: r.is_correct,
      questionId: r.question_id,
    }));

  private static mapQuestionResult = (res: QueryResult): QuestionDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      questionText: r.question_text,
      testId: r.test_id,
      questionType: r.question_type,
      imgUrl: r.img_url,
    }));

  private static mapTestResult = (res: QueryResult): TestDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      maxScores: r.max_scores,
      teacherId: r.teacher_id,
    }));

  private static mapTestsResult = (res: QueryResult): TestsDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      maxScores: r.max_scores,
      teacherId: r.teacher_id,
      questionCount: r.question_count,
    }));
}
