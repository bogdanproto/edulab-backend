import { Pool, QueryResult } from 'pg';
import { AddLessonDto, LessonDto, TestDto } from '../dto';

export class LessonData {
  constructor(private pool: Pool) {}

  async getAllLessonByCourse(courseId: number) {
    const query =
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_number;';
    const result = await this.pool.query<LessonDto>(query, [courseId]);

    return LessonData.mapResult(result);
  }

  async getLessonById(id: number) {
    const query = 'SELECT * FROM lessons WHERE id = $1';
    const result = await this.pool.query<LessonDto>(query, [id]);

    return LessonData.mapResult(result)[0];
  }

  async assignTestToLesson(lessonId: number, testId: number) {
    const query = `INSERT INTO tests_lessons (lesson_id, test_id)
                    VALUES ($1, $2) RETURNING *`;
    return await this.pool.query(query, [lessonId, testId]);
  }

  async removeTestFromLesson(lessonId: number) {
    const query = `DELETE FROM tests_lessons WHERE lesson_id = $1 RETURNING *`;

    return await this.pool.query(query, [lessonId]);
  }

  async getTestRelatedToLesson(lessonId: number) {
    const query = 'SELECT * FROM tests_lessons WHERE lesson_id = $1';
    const result = await this.pool.query(query, [lessonId]);

    return result.rows;
  }

  async getTestByLesson(lessonId: number) {
    const query = `SELECT t.* 
                    FROM tests t
                    JOIN tests_lessons tl ON t.id = tl.test_id
                    WHERE tl.lesson_id = $1`;

    const result = await this.pool.query<TestDto>(query, [lessonId]);

    return result.rows;
  }

  async createLesson(lesson: AddLessonDto) {
    const query = `INSERT INTO lessons (title, description, order_number, course_id)
     VALUES ($1, $2, $3, $4) RETURNING *`;

    const result = await this.pool.query(query, [
      lesson.title,
      lesson.description,
      lesson.orderNumber,
      lesson.courseId,
    ]);

    return LessonData.mapResult(result)[0];
  }

  async updateLessonById(lesson: LessonDto) {
    const query = `UPDATE lessons  
          SET title = $1, 
          description = $2, 
          order_number = $3 
          WHERE id = $4
          RETURNING *`;

    const result = await this.pool.query(query, [
      lesson.title,
      lesson.description,
      lesson.orderNumber,
      lesson.id,
    ]);

    return LessonData.mapResult(result)[0];
  }

  async deleteLessonById(id: number) {
    const client = await this.pool.connect();

    const queryDelMaterials = `DELETE FROM materials WHERE lesson_id = $1`;
    const queryDelHomework = `DELETE FROM homeworks WHERE lesson_id = $1`;
    const queryDelTest = `DELETE FROM tests_lessons WHERE lesson_id = $1`;
    const queryDelLesson = `DELETE FROM lessons WHERE id = $1  RETURNING *`;

    const queryUpdateOrderNumbers = `UPDATE lessons
                                      SET order_number = order_number -1
                                      WHERE course_id = $1
                                      AND order_number > $2`;

    try {
      await client.query('BEGIN');
      await client.query(queryDelMaterials, [id]);
      await client.query(queryDelHomework, [id]);
      await client.query(queryDelTest, [id]);

      const result = await client.query(queryDelLesson, [id]);
      const { course_id: courseId, order_number: orderNumber } = result.rows[0];

      await client.query(queryUpdateOrderNumbers, [courseId, orderNumber]);

      await client.query('COMMIT');

      return LessonData.mapResult(result)[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static mapResult = (res: QueryResult): LessonDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      courseId: r.course_id,
      title: r.title,
      description: r.description,
      orderNumber: r.order_number,
    }));
}
