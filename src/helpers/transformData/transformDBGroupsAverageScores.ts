import { DBgroupsAverageScoresDto } from '../../data/dto';
import { DBgroupsAverageScoresTypes } from '../../types';

const transformDBGroupsAverageScores = (
  data: DBgroupsAverageScoresDto[],
): DBgroupsAverageScoresTypes => {
  const coursesMap = new Map<number, string>();
  const itemsMap = new Map<number, string>();

  data.forEach((item) => {
    const { groupId, groupTitle, courseId, courseTitle, averageGrade } = item;
    const avgGrade = Math.round(averageGrade);

    if (!coursesMap.has(courseId)) {
      coursesMap.set(courseId, courseTitle);
    }

    if (!itemsMap[groupId]) {
      itemsMap[groupId] = { group: groupTitle };
    }

    itemsMap[groupId][courseId] = avgGrade;
  });

  const courses = Array.from(coursesMap, ([id, label]) => ({ id, label }));

  const items = Object.values(itemsMap).map((item) => {
    courses.map((course) => {
      if (!(course.id in item)) {
        item[course.id] = 0;
      }
    });
    return item;
  });

  return { courses, items };
};

export default transformDBGroupsAverageScores;
