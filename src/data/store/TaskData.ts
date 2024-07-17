import { Pool } from 'pg';
import {
  ExtendedDetails,
  StudentHomeworkDetails,
  StudentTestDetails,
  TaskDto,
  TeacherHomeworkDetails,
  TeacherTestDetails,
  UserParticipantsDto,
  BaseTaskDetails,
  TaskParticipantsDto,
} from '../dto';

import { TaskStatus, TaskType } from '../../types';

export class TaskData {
  constructor(private pool: Pool) {}

  async createTaskForStudentsFromGroup(
    studentId: number,
    lessonId: number,
    taskType: TaskType,
    status: TaskStatus,
    grade: number | null,
  ): Promise<TaskDto> {
    const query = `
      INSERT INTO tasks (student_id, lesson_id, task_type, status, grade)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await this.pool.query<TaskDto>(query, [
      studentId,
      lessonId,
      taskType,
      status,
      grade,
    ]);
    return result.rows[0];
  }

  async getInfoForTasks(groupId: number, courseId: number): Promise<TaskDto[]> {
    const query = `
    SELECT s.id AS "studentId", l.id AS "lessonId",'homework' AS "taskType"
    FROM students s
    JOIN groups_courses gc ON s.group_id = gc.group_id
    JOIN lessons l ON gc.course_id = l.course_id
    JOIN homeworks h ON l.id = h.lesson_id
    WHERE gc.group_id = $1 AND gc.course_id = $2

    UNION ALL

    SELECT s.id AS "studentId", l.id AS "lessonId", 'test' AS "taskType"
    FROM students s
    JOIN groups_courses gc ON s.group_id = gc.group_id
    JOIN lessons l ON gc.course_id = l.course_id
    JOIN tests_lessons t ON l.id = t.lesson_id
    WHERE gc.group_id = $1 AND gc.course_id = $2`;
    const result = await this.pool.query(query, [groupId, courseId]);
    return result.rows;
  }
  async getTasksByStudentId(userId: number): Promise<BaseTaskDetails[]> {
    const query = `
   SELECT  
    t.id,
    t.lesson_id AS "lessonId",
    t.student_id AS "studentId",
    t.status,
    t.task_type AS "taskType",
    t.grade,
    lessons.title AS "lessonTitle",
    courses.title AS "courseTitle"
   FROM tasks t
   JOIN lessons ON t.lesson_id = lessons.id
   JOIN courses ON lessons.course_id = courses.id
   JOIN students ON t.student_id = students.id
   WHERE students.user_id = $1;
    `;
    const result = await this.pool.query<BaseTaskDetails>(query, [userId]);
    return result.rows;
  }
  async getAllTasksByTeacher(teacherId: number): Promise<ExtendedDetails[]> {
    const query = `
      SELECT
        t.id,
        t.lesson_id AS "lessonId",
        t.student_id AS "studentId",
        t.status,
        t.task_type AS "taskType",
        t.grade,
        g.name AS "groupName",
        c.title AS "courseTitle",
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        l.title AS "lessonTitle"
      FROM tasks t
      JOIN lessons l ON t.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      JOIN students s ON t.student_id = s.id
      JOIN groups g ON s.group_id = g.id
      JOIN users u ON s.user_id = u.id
      WHERE c.teacher_user_id = $1;
    `;
    const result = await this.pool.query<ExtendedDetails>(query, [teacherId]);
    return result.rows;
  }

  async getTaskById(taskId: number): Promise<TaskDto | null> {
    const taskQuery = `
      SELECT id, lesson_id AS "lessonId", student_id AS "studentId", status, task_type AS "taskType", grade
      FROM tasks WHERE id = $1;
    `;
    const result = await this.pool.query<TaskDto>(taskQuery, [taskId]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }
  async getTaskHomeworkDetailsStudent(
    taskId: number,
    studentUserId: number,
  ): Promise<StudentHomeworkDetails> {
    const query = `
      SELECT
        t.id,
        t.lesson_id AS "lessonId",
        t.student_id AS "studentId",
        t.status,
        t.task_type AS "taskType",
        t.grade,
        l.title AS "lessonTitle",
        c.title AS "courseTitle",
        json_build_object(
          'id', h.id,
          'title', h.title,
          'sourceURL', h.source_url,
          'homeworkUrl', hr.homework_url
        ) AS "homeworks"
      FROM tasks t
      JOIN lessons l ON t.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      JOIN homeworks h ON l.id = h.lesson_id
      JOIN students s ON t.student_id = s.id
      LEFT JOIN homework_result hr ON t.id = hr.task_id
      WHERE t.id = $1 AND t.task_type = 'homework' AND s.user_id = $2;`;
    const result = await this.pool.query<StudentHomeworkDetails>(query, [
      taskId,
      studentUserId,
    ]);
    return result.rows[0];
  }

  async getTaskTestDetailsStudent(
    taskId: number,
    studentUserId: number,
  ): Promise<StudentTestDetails> {
    const query = `
    SELECT
      t.id,
      t.lesson_id AS "lessonId",
      t.student_id AS "studentId",
      t.status,
      t.task_type AS "taskType",
      t.grade,
      l.title AS "lessonTitle",
      c.title AS "courseTitle",
      json_build_object(
        'id', ts.id,
        'title', ts.title,
        'description', ts.description,
        'maxScores', ts.max_scores,
        'scores', tr.scores,
        'correctAnswers', tr.correct_answers,
        'totalQuestions', tr.total_questions
      ) AS "test"
    FROM tasks t
    JOIN lessons l ON t.lesson_id = l.id
    JOIN courses c ON l.course_id = c.id
    JOIN tests_lessons tl ON tl.lesson_id = l.id
    JOIN tests ts ON tl.test_id = ts.id
    JOIN students s ON t.student_id = s.id
    LEFT JOIN test_results tr ON tr.task_id = t.id AND tr.test_id = ts.id
    WHERE t.id = $1 AND t.task_type = 'test' AND s.user_id = $2;
    `;
    const result = await this.pool.query<StudentTestDetails>(query, [
      taskId,
      studentUserId,
    ]);
    return result.rows[0];
  }
  async getTaskHomeworkDetailsForTeacher(
    taskId: number,
    teacherUserId: number,
  ): Promise<TeacherHomeworkDetails> {
    const query = `
    SELECT
     t.id,
     t.lesson_id AS "lessonId",
     t.student_id AS "studentId",
     t.status,
     t.task_type AS "taskType",
     t.grade,
     l.title AS "lessonTitle",
     c.title AS "courseTitle",
     g.name AS "groupName",
     u.last_name AS "lastName",
     u.first_name AS "firstName",
     json_build_object(
        'id', h.id,
        'title', h.title,
        'sourceURL', h.source_url,
        'homeworkUrl', hr.homework_url
      ) AS "homework"
    FROM tasks t
    JOIN lessons l ON t.lesson_id = l.id
    JOIN courses c ON l.course_id = c.id
    JOIN students s ON t.student_id = s.id
    JOIN groups g ON s.group_id = g.id
    JOIN users u ON s.user_id = u.id
    JOIN homeworks h ON l.id = h.lesson_id
    LEFT JOIN homework_result hr ON t.id = hr.task_id
    WHERE t.id = $1 AND t.task_type = 'homework'
    AND c.teacher_user_id = $2;
    `;
    const result = await this.pool.query<TeacherHomeworkDetails>(query, [
      taskId,
      teacherUserId,
    ]);

    return result.rows[0];
  }
  async getTaskTestDetailsForTeacher(
    taskId: number,
    teacherUserId: number,
  ): Promise<TeacherTestDetails> {
    const query = `
    SELECT
     t.id,
     t.lesson_id AS "lessonId",
     t.student_id AS "studentId",
     t.status,
     t.task_type AS "taskType",
     t.grade,
     l.title AS "lessonTitle",
     c.title AS "courseTitle",
     g.name AS "groupName",
     u.last_name AS "lastName",
     u.first_name AS "firstName",
     json_build_object(
        'id', ts.id,
        'title', ts.title,
        'description', ts.description,
        'maxScores', ts.max_scores,
        'scores', tr.scores,
        'correctAnswers', tr.correct_answers,
        'totalQuestions', tr.total_questions
      ) AS "test"
    FROM tasks t
    JOIN lessons l ON t.lesson_id = l.id
    JOIN courses c ON l.course_id = c.id
    JOIN students s ON t.student_id = s.id
    JOIN groups g ON s.group_id = g.id
    JOIN users u ON s.user_id = u.id
    JOIN tests_lessons tl ON tl.lesson_id = l.id
    JOIN tests ts ON tl.test_id = ts.id
    LEFT JOIN test_results tr ON tr.task_id = t.id AND tr.test_id = ts.id
    WHERE t.id = $1 AND t.task_type = 'test'
    AND c.teacher_user_id = $2;
    `;
    const result = await this.pool.query<TeacherTestDetails>(query, [
      taskId,
      teacherUserId,
    ]);
    return result.rows[0];
  }

  async updateTaskStatus(taskId: number, newStatus: TaskStatus) {
    const query = `UPDATE tasks
      SET  status = $2
      WHERE id = $1
      RETURNING id, lesson_id AS "lessonId", student_id AS "studentId", status, task_type AS "taskType", grade;`;
    const result = await this.pool.query(query, [taskId, newStatus]);
    return result.rows[0];
  }

  async createTaskGrade(
    taskId: number,
    grade: number,
    newStatus: TaskStatus,
  ): Promise<TaskDto> {
    const query = `
      UPDATE tasks
      SET grade = $2, status = $3
      WHERE id = $1
      RETURNING id, lesson_id AS "lessonId", student_id AS "studentId", status, task_type AS "taskType", grade;
    `;
    const result = await this.pool.query<TaskDto>(query, [
      taskId,
      grade,
      newStatus,
    ]);
    if (result.rows.length === 0) {
      throw new Error('Task not found or update failed');
    }
    return result.rows[0];
  }

  async deleteTaskGrade(
    taskId: number,
    newStatus: TaskStatus,
  ): Promise<TaskDto> {
    const query = `
      UPDATE tasks
      SET grade = NULL, status = $2
      WHERE id = $1
      RETURNING id, lesson_id AS "lessonId", student_id AS "studentId", status, task_type AS "taskType", grade;
    `;
    const result = await this.pool.query<TaskDto>(query, [taskId, newStatus]);
    return result.rows[0];
  }

  async updateTaskGrade(taskId: number, grade: number): Promise<TaskDto> {
    const query = `
      UPDATE tasks
      SET grade = $2
      WHERE id = $1
      RETURNING id, lesson_id AS "lessonId", student_id AS "studentId", status, task_type AS "taskType", grade;
    `;
    const result = await this.pool.query<TaskDto>(query, [taskId, grade]);
    return result.rows[0];
  }

  async sendHomework(taskId: number, homeworkUrl: string, status: string) {
    const client = await this.pool.connect();

    const queryUpdateTask = `UPDATE tasks SET status = $2 WHERE id = $1`;
    const queryInsertHomeworkAnswer = `INSERT INTO homework_result (task_id, homework_url) VALUES ($1, $2)`;

    try {
      await client.query('BEGIN');
      await client.query(queryUpdateTask, [taskId, status]);
      await client.query(queryInsertHomeworkAnswer, [taskId, homeworkUrl]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  async getTaskRelatedParticipants(
    taskId: number,
  ): Promise<TaskParticipantsDto> {
    const query = `
    SELECT
     c.teacher_user_id AS "teacherUserId",
     s.user_id AS "studentUserId"
    FROM tasks t
    JOIN lessons l ON t.lesson_id = l.id
    JOIN courses c ON l.course_id = c.id
    JOIN students s ON s.id = t.student_id
    WHERE t.id = $1;`;
    const result = await this.pool.query<UserParticipantsDto>(query, [taskId]);
    return result.rows[0];
  }
  async isHomeworkHaveResule(taskId: number) {
    const query = `
    SELECT h_r.id as "homeworkResId"
    FROM tasks t
    JOIN homework_result h_r ON h_r.task_id = t.id
    WHERE t.id = $1; `;
    const result = await this.pool.query<TaskDto>(query, [taskId]);
    return result.rows[0];
  }
}
