import { Pool, QueryResult } from 'pg';
import {
  DBgroupsAverageScoresDto,
  DBstudentsGradeAllocationDto,
  DBtaskStatusByGroupDto,
  DbTeacherDataByGroupDto,
} from '../dto';

export class DashboardData {
  constructor(private pool: Pool) {}

  async getDBtaskStatusByGroup(userId: number) {
    const query = `
        SELECT
            g.id AS group_id,
            g.name AS group_name,
            c.id AS course_id,
            c.title AS course_title,
            t.status AS task_status,
            COUNT(t.id) AS task_count
        FROM
            groups_teachers gt
        JOIN
            groups g ON gt.group_id = g.id
        JOIN
            groups_courses gc ON g.id = gc.group_id
        JOIN
            courses c ON gc.course_id = c.id
        LEFT JOIN
            students s ON s.group_id = gc.group_id
        LEFT JOIN
            lessons l ON c.id = l.course_id
        LEFT JOIN
            tasks t ON l.id = t.lesson_id AND t.student_id = s.id
        WHERE
            gt.teacher_user_id = $1 AND c.teacher_user_id = $1
        GROUP BY
            g.id, g.name, c.id, c.title, t.status`;

    const result = await this.pool.query(query, [userId]);

    return DashboardData.mapResult(result);
  }

  async getDBstudentsGradeAllocation(userId: number) {
    const query = `
        SELECT
            g.id AS group_id,
            g.name AS group_name,
            c.id AS course_id,
            c.title AS course_title,
            t.id AS task_id,
            t.student_id,
            t.grade AS student_grade
                FROM
                    tasks t
                JOIN
                    students s ON t.student_id = s.id
                JOIN
                    groups g ON s.group_id = g.id
                JOIN
                    groups_teachers gt ON g.id = gt.group_id
                JOIN
                    lessons l ON t.lesson_id = l.id
                JOIN
                    courses c ON l.course_id = c.id
                WHERE
                    t.status = 'check' AND t.grade IS NOT NULL AND
                    gt.teacher_user_id = $1 AND c.teacher_user_id = $1
                GROUP BY
                    g.id, g.name, c.id, c.title, t.id, t.student_id, t.grade`;

    const result = await this.pool.query(query, [userId]);

    return DashboardData.mapResultDBGradeAllocation(result);
  }

  async getDBgroupsAverageScores(userId: number) {
    const query = `
        SELECT
            g.id AS group_id,
            g.name AS group_name,
            c.id AS course_id,
            c.title AS course_title,
            AVG(t.grade) AS average_grade
                FROM
                    tasks t
                JOIN
                    students s ON t.student_id = s.id
                JOIN
                    groups g ON s.group_id = g.id
                JOIN
                    groups_teachers gt ON g.id = gt.group_id
                JOIN
                    lessons l ON t.lesson_id = l.id
                JOIN
                    courses c ON l.course_id = c.id
                WHERE
                    t.status = 'check' AND t.grade IS NOT NULL AND
                    gt.teacher_user_id = $1 AND c.teacher_user_id = $1
                GROUP BY
                    g.id, g.name, c.id, c.title
                ORDER BY
                    g.id, c.id`;

    const result = await this.pool.query(query, [userId]);

    return DashboardData.mapResultDBgroupsAverageScores(result);
  }

  async getDBTaskForCheck(userId: number) {
    const query = `
        SELECT
            COUNT(t.id) AS taskcount
        FROM
            groups_teachers gt
        JOIN
            groups g ON gt.group_id = g.id
        JOIN
            groups_courses gc ON g.id = gc.group_id
        JOIN
            courses c ON gc.course_id = c.id
        JOIN
            lessons l ON c.id = l.course_id
        JOIN
            tasks t ON l.id = t.lesson_id
        WHERE
            gt.teacher_user_id = $1 AND c.teacher_user_id = $1
            AND t.status = 'done'`;

    const data = await this.pool.query(query, [userId]);

    const result = Number(data?.rows[0]?.taskcount || 0);

    return {
      taskcount: result,
    };
  }

  async getTeachersByStudentGroup(groupName: string) {
    const query = `SELECT
      c.title AS course_title,
      u.first_name,
      u.last_name
    FROM
      users u
      JOIN courses c ON c.teacher_user_id = u.id
      JOIN groups_courses gc ON gc.course_id = c.id
      JOIN groups g ON gc.group_id = g.id
    WHERE
      g.name = $1 AND
      u.role = 'teacher'`;
    const result = await this.pool.query(query, [groupName]);
    const teachersList: DbTeacherDataByGroupDto[] = result.rows;
    return teachersList;
  }

  private static mapResult = (res: QueryResult): DBtaskStatusByGroupDto[] =>
    res.rows.map((r) => ({
      groupId: r.group_id,
      groupTitle: r.group_name,
      courseId: r.course_id,
      courseTitle: r.course_title,
      taskStatus: r.task_status,
      taskCount: r.task_count,
    }));

  private static mapResultDBGradeAllocation = (
    res: QueryResult,
  ): DBstudentsGradeAllocationDto[] =>
    res.rows.map((r) => ({
      groupId: r.group_id,
      groupTitle: r.group_name,
      courseId: r.course_id,
      courseTitle: r.course_title,
      grade: r.student_grade,
    }));

  private static mapResultDBgroupsAverageScores = (
    res: QueryResult,
  ): DBgroupsAverageScoresDto[] =>
    res.rows.map((r) => ({
      groupId: r.group_id,
      groupTitle: r.group_name,
      courseId: r.course_id,
      courseTitle: r.course_title,
      averageGrade: r.average_grade,
    }));
}
