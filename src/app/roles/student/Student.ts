import { studentData } from '../../../data';
import { StudentDto } from '../../../data/dto/StudentDto';
import { Group } from '../../group/Group';
import { Roles } from '../Roles';

export class Student extends Roles {
  declare groupId?: number;
  declare id: number;

  constructor(student: StudentDto) {
    super(student.userId);
    this.groupId = student.groupId;
    this.id = student.id;
  }

  public async checkUserRole() {}

  async addToGroup(group: Group) {
    return await studentData.updateStudentGroup(this.id, group.id);
  }

  async removeFromGroup() {
    return await studentData.updateStudentGroup(this.id, null);
  }
}
