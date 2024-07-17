import { DBstudentsGradeAllocationDto } from '../../data/dto';
import { DBStudentsGradeAllocationTypes } from '../../types';

const transformDBStudentsGradeAllocation = (
  data: DBstudentsGradeAllocationDto[],
): DBStudentsGradeAllocationTypes => {
  const result: DBStudentsGradeAllocationTypes = {};

  data.forEach((item) => {
    const { groupId, groupTitle, courseId, courseTitle, grade } = item;
    const gradeLevel = getGradeLevel(grade);

    if (!result[groupId]) {
      result[groupId] = {
        label: groupTitle,
        courses: [],
        items: [],
      };
    }

    const group = result[groupId];
    let courseIndex = group.courses.findIndex(
      (course) => course.id === courseId,
    );

    if (courseIndex === -1) {
      group.courses.push({ id: courseId, label: courseTitle });
      courseIndex = group.courses.length - 1;
    }

    const courseItem = group.items.find(
      (item) => item.gradeLevel === gradeLevel,
    );
    if (!courseItem) {
      const newItem: { [key: string]: number | string } = { gradeLevel };
      newItem[`${courseId}`] = 1;
      group.items.push(newItem);
    } else if (courseItem[`${courseId}`]) {
      courseItem[`${courseId}`] = (courseItem[`${courseId}`] as number) + 1;
    } else {
      courseItem[`${courseId}`] = 1;
    }
  });

  return fillMissingGradeRanges(result);
};

function getGradeLevel(grade: number): string {
  if (grade >= 0 && grade < 20) {
    return '0-20';
  } else if (grade >= 20 && grade < 40) {
    return '20-40';
  } else if (grade >= 40 && grade < 60) {
    return '40-60';
  } else if (grade >= 60 && grade < 80) {
    return '60-80';
  } else if (grade >= 80 && grade <= 100) {
    return '80-100';
  } else {
    return '';
  }
}

function fillMissingGradeRanges(
  data: DBStudentsGradeAllocationTypes,
): DBStudentsGradeAllocationTypes {
  const newData: DBStudentsGradeAllocationTypes = { ...data };

  for (const groupId in newData) {
    const group = newData[groupId];

    group.courses.forEach((course) => {
      if (!group.items.length) {
        group.items = [];
      }

      for (let grade = 0; grade <= 100; grade += 20) {
        const gradeLevel = getGradeLevel(grade);

        const existingItem = group.items.find(
          (item) => item.gradeLevel === gradeLevel,
        );

        if (!existingItem) {
          const newItem: { [key: string]: number | string } = { gradeLevel };
          newItem[`${course.id}`] = 0;
          group.items.push(newItem);
        } else if (!existingItem[`${course.id}`]) {
          existingItem[`${course.id}`] = 0;
        }
      }
    });

    group.items.sort((a, b) => a.gradeLevel[0] - b.gradeLevel[0]);
  }

  return newData;
}

export default transformDBStudentsGradeAllocation;
