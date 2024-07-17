import { roleError } from '../consts';
import { dashboardData } from '../data';
import { UserCurrentDto } from '../data/dto';
import {
  ApiError,
  transformDBGroupsAverageScores,
  transformDBStudentsGradeAllocation,
  transformDataDBTaskStatusByGroup,
} from '../helpers';
import { Role } from '../types';

class DashboardService {
  private dashboardData = dashboardData;

  async getDashboardTeacher(user: UserCurrentDto) {
    if (user.role !== Role.TEACHER) {
      throw new ApiError(roleError.NOT_RIGHTS);
    }

    const dbTaskForCheck = await this.dashboardData.getDBTaskForCheck(user.id);

    const dbTaskStatusByGroupResult =
      await this.dashboardData.getDBtaskStatusByGroup(user.id);

    const dbStudentsGradeAllocationResult =
      await this.dashboardData.getDBstudentsGradeAllocation(user.id);

    const dbGroupsAverageScoresResult =
      await this.dashboardData.getDBgroupsAverageScores(user.id);

    const dbTaskStatusByGroup =
      dbTaskStatusByGroupResult.length > 0
        ? transformDataDBTaskStatusByGroup(dbTaskStatusByGroupResult)
        : null;

    const dbStudentsGradeAllocation =
      dbStudentsGradeAllocationResult.length > 0
        ? transformDBStudentsGradeAllocation(dbStudentsGradeAllocationResult)
        : null;

    const dbGroupsAverageScores =
      dbGroupsAverageScoresResult.length > 0
        ? transformDBGroupsAverageScores(dbGroupsAverageScoresResult)
        : null;

    return {
      dbTaskStatusByGroup,
      dbStudentsGradeAllocation,
      dbTaskForCheck,
      dbGroupsAverageScores,
    };
  }

  async getDashboardStudentData(groupName: string) {
    return await this.dashboardData.getTeachersByStudentGroup(groupName);
  }
}

export const dashboardService = new DashboardService();
