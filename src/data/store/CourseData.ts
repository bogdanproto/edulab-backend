import { Pool, QueryResult } from 'pg';
import { CourseDto, CreateCourseDto, CreateCourseSQLDto } from '../dto';

export class CourseData {
  constructor(private pool: Pool) {}

  async getAllCourse(isActive?: boolean) {
    const activeFilter =
      isActive && isActive === true ? ' WHERE is_active = true' : '';

    const query = `SELECT * FROM courses${activeFilter}`;
    const result = await this.pool.query<CourseDto>(query);

    return CourseData.mapResult(result);
  }

  async getAllCourseByTeacherId(teacherId: number, isActive?: boolean) {
    const activeFilter =
      isActive && isActive === true ? ' AND is_active = true' : '';

    const query = `SELECT * FROM courses WHERE teacher_user_id = $1${activeFilter}`;
    const result = await this.pool.query<CourseDto>(query, [teacherId]);

    return CourseData.mapResult(result);
  }

  async getAllCourseByStudentId(id: number) {
    const query = `SELECT DISTINCT c.* FROM courses c
                  JOIN groups_courses gc ON c.id = gc.course_id
                  JOIN groups g ON gc.group_id = g.id
                  JOIN students s ON s.group_id = g.id
                  WHERE s.user_id = $1`;

    const result = await this.pool.query<CourseDto>(query, [id]);

    return CourseData.mapResult(result);
  }

  async getCourseById(id: number) {
    const query = 'SELECT * FROM courses WHERE id = $1';
    const result = await this.pool.query<CourseDto>(query, [id]);

    return CourseData.mapResult(result)[0];
  }

  async getCourseByIdForStudent({ courseId, userId }) {
    const query = `SELECT  c.*
                  FROM courses c
                  JOIN groups_courses gc ON c.id = gc.course_id
                  JOIN groups g ON gc.group_id = g.id
                  JOIN students s ON s.group_id = g.id
                  WHERE c.id = $1 AND s.user_id = $2`;
    const result = await this.pool.query<CourseDto>(query, [courseId, userId]);
    return CourseData.mapResult(result)[0];
  }

  async getCourseRelatedToAnyGroup(id: number) {
    const query = `SELECT *
                   FROM groups_courses c
                   WHERE course_id = $1`;
    const result = await this.pool.query<CourseDto>(query, [id]);

    return result.rows.length;
  }

  async createCourse(course: CreateCourseSQLDto) {
    const query = `INSERT INTO courses (title, description, year_course, is_active, img_url, teacher_user_id  )
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;

    const result = await this.pool.query(query, [
      course.title,
      course.description,
      course.yearCourse,
      course.isActive,
      course.imgUrl,
      course.teacherId,
    ]);

    return CourseData.mapResult(result)[0];
  }

  async updateCourseById(course: CreateCourseDto, id: number) {
    let query = `UPDATE courses
          SET title = $1,
          description = $2,
          year_course = $3,
          is_active = $4`;

    const params = [
      course.title,
      course.description,
      course.yearCourse,
      course.isActive,
    ];

    if (course.imgUrl || course.imgUrl === '') {
      query += `, img_url = $5`;
      params.push(course.imgUrl);
    }

    const result = await this.pool.query(
      `${query} WHERE id = $${params.length + 1} RETURNING *`,
      [...params, id],
    );

    return CourseData.mapResult(result)[0];
  }

  async updateCourseStatusById(isActive: boolean, courseId: number) {
    const query = `UPDATE courses
          SET is_active = $1
          WHERE id = $2
          RETURNING *`;

    const result = await this.pool.query(query, [isActive, courseId]);

    return CourseData.mapResult(result)[0];
  }

  async deleteCourseById(id: number) {
    const client = await this.pool.connect();

    const queryDelMaterials = `DELETE FROM materials WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = $1)`;
    const queryDelHomework = `DELETE FROM homeworks WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = $1)`;
    const queryDelTest = `DELETE FROM tests_lessons WHERE lesson_id IN (SELECT id FROM lessons WHERE course_id = $1)`;
    const queryDelLesson = `DELETE FROM lessons WHERE course_id = $1`;
    const queryDelCourse = `DELETE FROM courses WHERE id = $1 RETURNING *`;

    try {
      await client.query('BEGIN');
      await client.query(queryDelMaterials, [id]);
      await client.query(queryDelHomework, [id]);
      await client.query(queryDelTest, [id]);
      await client.query(queryDelLesson, [id]);
      const result = await client.query(queryDelCourse, [id]);
      await client.query('COMMIT');

      return CourseData.mapResult(result)[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private static mapResult = (res: QueryResult): CourseDto[] =>
    res.rows.map((r) => ({
      id: r.id,
      teacherId: r.teacher_user_id,
      title: r.title,
      description: r.description,
      yearCourse: r.year_course,
      isActive: r.is_active,
      imgUrl: r.img_url,
    }));
}
