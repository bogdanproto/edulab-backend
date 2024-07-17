import { errors, groupError } from '../../consts';
import { groupData, studentData } from '../../data';
import { UserCurrentDto } from '../../data/dto';
import { GroupCourseDto } from '../../data/dto/GroupCourseDto';
import { GroupDto } from '../../data/dto/GroupDto';
import { ApiError } from '../../helpers';
import { taskService } from '../../services/task.service';
import { Course } from '../course/Course';
import { Student } from '../roles/student/Student';

export class Group {
  declare id: number;
  declare name: string;

  constructor(group: GroupDto) {
    this.name = group.name;
    this.id = group.id;
  }

  async addStudent(student: Student) {
    return await student.addToGroup(this);
  }

  async getAllStudents() {
    return await studentData.getAllStudentsByGroup(this.id);
  }

  async removeStudent(student: Student) {
    return await student.removeFromGroup();
  }

  async getAllCourses(user: UserCurrentDto) {
    if (user.role === 'admin') {
      return await groupData.getAllGroupCourses(this.id);
    } else if (user.role === 'teacher') {
      return await groupData.getAllGroupCoursesByTeacher(this.id, user.id);
    } else {
      throw new ApiError(errors.FORBIDDEN);
    }
  }

  async updateCourses(user: UserCurrentDto, newIds: number[]) {
    const oldIds = (await this.getAllCourses(user)).map((course) => course.id);
    const results: GroupCourseDto[] = [];

    const students = await this.getAllStudents();

    for (let id = 0; id < oldIds.length; id++) {
      if (!newIds.includes(oldIds[id])) {
        if (students) {
          throw new ApiError({
            ...groupError.COURSE_ASSIGNED,
            errorDetail: students,
          });
        }
        const result = await this.unassignCourse(new Course(oldIds[id]));
        if (result) results.push(result);
      }
    }

    for (let id = 0; id < newIds.length; id++) {
      const result = await this.assignCourse(new Course(newIds[id]));
      if (result) {
        await taskService.createTasksForStudentFromGroup(this.id, newIds[id]);
        results.push(result);
      }
    }

    return results;
  }

  async assignCourse(course: Course) {
    if (await this.isCourseAssigned(course)) return false;
    return await groupData.assignCourseToGroup(course.id, this.id);
  }

  async unassignCourse(course: Course) {
    if (await this.isCourseAssigned(course)) {
      return await groupData.unassignCourseFromGroup(course.id, this.id);
    }
    return false;
  }

  async isCourseAssigned(course: Course) {
    return await groupData.isCourseAssignedToGroup(course.id, this.id);
  }

  async addTeacher(teacherUId: number) {
    return await groupData.addTeacherToGroup(teacherUId, this.id);
  }

  async removeTeacher(teacherUId: number) {
    return await groupData.removeTeacherFromGroup(teacherUId, this.id);
  }
}
