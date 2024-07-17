import { Group } from '../app/group/Group';
import { Student } from '../app/roles/student/Student';
import { studentError } from '../consts';
import { studentData } from '../data';
import { ApiError } from '../helpers';
import { groupService } from './group.service';

class StudentService {
  private studentData = studentData;

  async getStudentById(studentId: number) {
    const student = await this.studentData.getStudentById(studentId);
    if (!student) throw new ApiError(studentError.NOT_FOUND_ID);
    return student;
  }

  async addStudentToGroup(studentId: number, groupId: number) {
    const group = new Group(await groupService.getGroupById(groupId));
    const student = new Student(await this.getStudentById(studentId));
    return await student.addToGroup(group);
  }

  async addUserToGroup(userId: number, groupId: number) {
    return await this.studentData.createStudent({ userId, groupId });
  }

  async updateStudentGroupByUserId(userId: number, groupId: number | null) {
    return await this.studentData.updateStudentGroupByUserId(userId, groupId);
  }


  async deleteStudentByUserId(userId: number) {
    return await this.studentData.deleteStudentByUserId(userId);
  }


}

export const studentService = new StudentService();
