import { Pool } from 'pg';
import { CreateGroupDto, GroupDto, UpdateGroupDto } from '../dto/GroupDto';
import { CourseDto } from '../dto';
import { snakeToCamelCase } from '../../helpers';
import { GroupCourseDto } from '../dto/GroupCourseDto';
import { GroupTeacherDto } from '../dto/GroupTeacherDto';

export class GroupData {
  constructor(private pool: Pool) {}

  async createGroup(group: CreateGroupDto) {
    const query = 'INSERT INTO groups (name) VALUES ($1) RETURNING *';
    const result = await this.pool.query<GroupDto>(query, [group.name]);
    return result.rows[0];
  }

  async deleteGroupById(groupId: number) {
    const query = 'DELETE FROM groups WHERE id = $1 RETURNING *';
    const result = await this.pool.query<GroupDto>(query, [groupId]);
    return result.rows[0];
  }

  async getAllGroups() {
    const query = 'SELECT * FROM groups';
    const result = await this.pool.query<GroupDto>(query);
    return result.rows;
  }

  async getGroupById(groupId: number) {
    const query = 'SELECT * FROM groups WHERE id = $1';
    const result = await this.pool.query<GroupDto>(query, [groupId]);
    return result.rows[0];
  }

  async getGroupByName(name: string) {
    const query = 'SELECT * FROM groups WHERE name = $1';
    const result = await this.pool.query<GroupDto>(query, [name]);
    return result.rows[0];
  }

  async updateGroupById(groupObj: UpdateGroupDto, groupId: number) {
    const group = await this.getGroupById(groupId);
    const query = 'UPDATE groups SET name = $1 WHERE id = $2 RETURNING *';
    const result = await this.pool.query<GroupDto>(query, [
      groupObj.name || group.name,
      groupId,
    ]);
    return result.rows[0];
  }

  async getAllGroupCoursesByTeacher(groupId: number, teacherUId: number) {
    const query = `SELECT courses.id, title, description, img_url, is_active, teacher_user_id, year_course FROM courses
    JOIN groups_courses ON groups_courses.course_id = courses.id
    WHERE teacher_user_id = $1 AND group_id = $2`;
    const result = await this.pool.query<CourseDto>(query, [
      teacherUId,
      groupId,
    ]);
    return result.rows.map(snakeToCamelCase) as CourseDto[];
  }

  async getAllGroupCourses(groupId: number) {
    const query = `SELECT courses.id, title, description, img_url, is_active, teacher_user_id, year_course FROM courses
    JOIN groups_courses ON groups_courses.course_id = courses.id
    WHERE group_id = $1`;
    const result = await this.pool.query<CourseDto>(query, [groupId]);
    return result.rows.map(snakeToCamelCase) as CourseDto[];
  }

  async getAllGroupsByTeacher(teacherUId: number) {
    const query = `SELECT name, groups.id FROM groups
    JOIN groups_teachers ON groups_teachers.group_id = groups.id
    WHERE teacher_user_id = $1`;
    const result = await this.pool.query<GroupDto>(query, [teacherUId]);
    return result.rows;
  }

  async isCourseAssignedToGroup(courseId: number, groupId: number) {
    const query = `SELECT * FROM groups_courses WHERE group_id = $1 AND course_id = $2`;
    const result = await this.pool.query(query, [groupId, courseId]);
    return result.rows.length === 1;
  }

  async assignCourseToGroup(courseId: number, groupId: number) {
    const query = `INSERT INTO groups_courses (group_id, course_id) VALUES ($1,$2) RETURNING *`;
    const result = await this.pool.query(query, [groupId, courseId]);
    return result.rows.map(snakeToCamelCase)[0] as GroupCourseDto;
  }

  async unassignCourseFromGroup(courseId: number, groupId: number) {
    const query = `DELETE FROM groups_courses WHERE group_id = $1 AND course_id = $2 RETURNING *`;
    const result = await this.pool.query(query, [groupId, courseId]);
    return result.rows.map(snakeToCamelCase)[0] as GroupCourseDto;
  }

  async addTeacherToGroup(teacherUId: number, groupId: number) {
    const query = `INSERT INTO groups_teachers (group_id, teacher_user_id) VALUES ($1,$2) RETURNING *`;
    const result = await this.pool.query(query, [groupId, teacherUId]);
    return result.rows.map(snakeToCamelCase)[0] as GroupTeacherDto;
  }

  async removeTeacherFromGroup(teacherUId: number, groupId: number) {
    const query = `DELETE FROM groups_teachers WHERE group_id = $1 AND teacher_user_id = $2 RETURNING *`;
    const result = await this.pool.query(query, [groupId, teacherUId]);
    return result.rows.map(snakeToCamelCase)[0] as GroupTeacherDto;
  }

  async getAllGroupsByTeacherId(teacherId: number) {
    const query = `
      SELECT g.id, g.name
      FROM groups g
      JOIN groups_teachers gt ON g.id = gt.group_id
      WHERE gt.teacher_user_id = $1
    `;
    const result = await this.pool.query<GroupDto>(query, [teacherId]);
    return result.rows.map(snakeToCamelCase) as GroupDto[];
  }
}
