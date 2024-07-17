import { Course } from '../app/course/Course';
import { Lesson } from '../app/course/Lesson';
import { errors } from '../consts';
import {
  HomeworkArg,
  HomeworkArgCreate,
  HomeworkArgDelete,
  HomeworkArgGet,
} from '../data/dto';
import { ApiError } from '../helpers';

class HomeWorkService {
  async getHomeWorkByLesson({ courseId, lessonId, user }: HomeworkArgGet) {
    if (isNaN(lessonId) || isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToUser(user);

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);

    return await lesson.getHomeWork();
  }

  async createHomeWork({
    homeWorkObj,
    courseId,
    lessonId,
    user,
  }: HomeworkArgCreate) {
    if (isNaN(lessonId) || isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);
    await lesson.isLessonHasHomeWork();

    return await lesson.addHomeWork(homeWorkObj);
  }

  async updateHomeWork({
    homeWorkObj,
    courseId,
    lessonId,
    id,
    user,
  }: HomeworkArg) {
    if (isNaN(lessonId) || isNaN(courseId) || isNaN(id)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);

    return await lesson.editHomeWork({ ...homeWorkObj, id });
  }

  async deleteHomeWork({ id, courseId, lessonId, user }: HomeworkArgDelete) {
    if (isNaN(lessonId) || isNaN(courseId) || isNaN(id)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);

    return await lesson.deleteHomeWork(id);
  }
}

export const homeWorkService = new HomeWorkService();
