import { Group } from '../app/group/Group';
import { Student } from '../app/roles/student/Student';
import { errors, groupError } from '../consts';
import { groupData } from '../data';
import { UserCurrentDto } from '../data/dto';
import { CreateGroupDto, GroupDto, UpdateGroupDto } from '../data/dto/GroupDto';
import { ApiError } from '../helpers';
import { studentService } from './student.service';

class GroupService {
  private groupData = groupData;

  async getAllGroups(user: UserCurrentDto) {
    if (user.role === 'admin') {
      return await this.groupData.getAllGroups();
    } else if (user.role === 'teacher') {
      return await this.groupData.getAllGroupsByTeacher(user.id);
    } else {
      throw new ApiError(errors.FORBIDDEN);
    }
  }

  async getGroupById(groupId: number) {
    if (isNaN(groupId)) throw new ApiError(errors.BAD_ID);
    const result = await this.groupData.getGroupById(groupId);
    if (!result) throw new ApiError(groupError.NOT_FOUND);
    return result;
  }

  async getGroupByName(name: string) {
    const result = await this.groupData.getGroupByName(name);
    if (!result) throw new ApiError(groupError.NOT_FOUND);
    return result;
  }

  async createGroup(groupObj: CreateGroupDto) {
    const result = await this.groupData.getGroupByName(groupObj.name);
    if (result) throw new ApiError(groupError.ALREADY_EXIST);
    return await this.groupData.createGroup(groupObj);
  }

  async deleteGroupById(groupId: number) {
    const group = await this.getGroupById(groupId);
    const students = await this.getAllGroupStudents(groupId);
    if (students.length > 0) {
      throw new ApiError({
        ...groupError.STUDENTS_ASSIGNED,
        errorDetail: students,
      });
    }
    return await this.groupData.deleteGroupById(group.id);
  }

  async updateGroupById(groupObj: UpdateGroupDto, groupId: number) {
    const group = await this.getGroupById(groupId);
    return await this.groupData.updateGroupById(groupObj, group.id);
  }

  async addStudentToGroup(studentId: number, groupId: number) {
    const group = new Group(await this.getGroupById(groupId));
    const student = new Student(await studentService.getStudentById(studentId));
    return await group.addStudent(student);
  }

  async getAllGroupStudents(groupId: number) {
    const group = new Group(await this.getGroupById(groupId));
    return await group.getAllStudents();
  }

  async removeStudentFromGroup(studentId: number, groupId: number) {
    const group = new Group(await this.getGroupById(groupId));
    const student = new Student(await studentService.getStudentById(studentId));
    return await group.removeStudent(student);
  }

  async getAllGroupCourses(groupId: number, user: UserCurrentDto) {
    const group = new Group(await this.getGroupById(groupId));
    return await group.getAllCourses(user);
  }

  async updateGroupCourses(
    groupId: number,
    user: UserCurrentDto,
    courses: number[],
  ) {
    const group = new Group(await this.getGroupById(groupId));
    return await group.updateCourses(user, courses);
  }

  async addTeacherToGroup(teacherUId: number, groupId: number) {
    const group = new Group(await this.getGroupById(groupId));
    return await group.addTeacher(teacherUId);
  }

  async removeTeacherFromGroup(teacherUId: number, groupId: number) {
    const group = new Group(await this.getGroupById(groupId));
    return await group.removeTeacher(teacherUId);
  }

  async getAllGroupsByTeacherId(teacherId: number): Promise<GroupDto[]> {
    return await this.groupData.getAllGroupsByTeacherId(teacherId);
  }
}

export const groupService = new GroupService();
