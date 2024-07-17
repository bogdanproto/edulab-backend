import { DBtaskStatusByGroupDto } from '../../data/dto';
import { DBtaskStatusByGroupTypes } from '../../types';

const transformDBStudentsGradeAllocation = (
  data: DBtaskStatusByGroupDto[],
): DBtaskStatusByGroupTypes => {
  const result: DBtaskStatusByGroupTypes = {};

  data.forEach((entry) => {
    const {
      groupId,
      groupTitle,
      courseId,
      courseTitle,
      taskStatus,
      taskCount,
    } = entry;

    if (!result[groupId]) {
      result[groupId] = { label: groupTitle, courses: {} };
    }

    if (!result[groupId].courses[courseId]) {
      result[groupId].courses[courseId] = { label: courseTitle, item: [] };
    }

    if (!taskStatus) {
      return;
    }

    result[groupId].courses[courseId].item.push({
      id: result[groupId].courses[courseId].item.length + 1,
      value: taskCount,
      label: taskStatus,
    });
  });

  return result;
};

export default transformDBStudentsGradeAllocation;
