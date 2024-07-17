import { Pool } from 'pg';
import {
  CreateStudentDto,
  GetAllStudentsDto,
  StudentDto,
} from '../dto/StudentDto';
import { snakeToCamelCase } from '../../helpers';

export class StudentData {
  constructor(private pool: Pool) {}

  async createStudent(student: CreateStudentDto) {
    const query =
      'INSERT INTO students (user_id, group_id) VALUES ($1, $2) RETURNING *';

    const result = await this.pool.query<StudentDto>(query, [
      student.userId,
      student.groupId || null,
    ]);

    return result.rows[0];
  }

  async deleteStudentById(studentId: number) {
    const query = 'DELETE FROM students WHERE id = $1 RETURNING *';

    const result = await this.pool.query<StudentDto>(query, [studentId]);

    return result.rows[0];
  }

  async deleteStudentByUserId(userId: number) {
    const query = 'DELETE FROM students WHERE user_id = $1 RETURNING *';

    const result = await this.pool.query<StudentDto>(query, [userId]);

    return result.rows[0];
  }

  async getAllStudents() {
    const query = 'SELECT * FROM students';

    const result = await this.pool.query<StudentDto>(query);

    return result.rows;
  }

  async getStudentById(studentId: number) {
    const query = 'SELECT * FROM students WHERE id = $1';

    const result = await this.pool.query<StudentDto>(query, [studentId]);

    return result.rows[0];
  }

  async getAllStudentsByGroup(groupId: number) {
    const query = `SELECT group_id, students.id, user_id, first_name, last_name FROM students
    JOIN users ON users.id = students.user_id
    WHERE group_id = $1`;

    const result = await this.pool.query<GetAllStudentsDto>(query, [groupId]);

    return result.rows.map(snakeToCamelCase) as GetAllStudentsDto[];
  }

  async updateStudentGroup(studentId: number, groupId: number | null) {
    const query = 'UPDATE students SET group_id = $1 WHERE id = $2 RETURNING *';

    const result = await this.pool.query<StudentDto>(query, [
      groupId,
      studentId,
    ]);

    return result.rows[0];
  }

  async updateStudentGroupByUserId(userId: number, groupId: number | null) {
    const query =
      'UPDATE students SET group_id = $1 WHERE user_id = $2 RETURNING *';

    const result = await this.pool.query<StudentDto>(query, [groupId, userId]);
    return result.rows[0];
  }
}
