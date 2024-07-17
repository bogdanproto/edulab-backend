import { Course } from '../app/course/Course';
import { Lesson } from '../app/course/Lesson';
import { errors, lessonError, roleError } from '../consts';
import { lessonData } from '../data';
import {
  LessonArgAssignTest,
  LessonArgCreate,
  LessonArgDelete,
  LessonArgGetAll,
  LessonArgGetById,
  LessonArgUpdate,
} from '../data/dto';
import { ApiError } from '../helpers';
import { Role } from '../types';
import { TestService } from './tests.service';

class LessonService {
  private lessonData = lessonData;

  async getAllLesson({ courseId, user }: LessonArgGetAll) {
    if (isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToUser(user);

    return await course.getCourseLessons();
  }

  async getLessonById({ courseId, lessonId, user }: LessonArgGetById) {
    if (isNaN(courseId) || isNaN(lessonId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToUser(user);

    return await this.lessonData.getLessonById(lessonId);
  }

  async getTestByLesson({ courseId, lessonId, user }: LessonArgGetById) {
    if (isNaN(courseId) || isNaN(lessonId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToUser(user);

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);
    return await lesson.getTest();
  }

  async assignTestToLesson({
    testId,
    courseId,
    lessonId,
    user,
  }: LessonArgAssignTest) {
    if (isNaN(courseId) || isNaN(lessonId) || isNaN(testId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const test = await TestService.getTestById(testId);

    if (test?.teacherId !== user.id) {
      throw new ApiError(roleError.NOT_RIGHTS);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);
    await lesson.isLessonHasAnyTest();
    await lesson.assignTest(testId);

    return;
  }

  async removeTestFromLesson({ courseId, lessonId, user }: LessonArgGetById) {
    if (isNaN(courseId) || isNaN(lessonId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    const lesson = new Lesson(lessonId);
    await lesson.isLessonRelateToCourse(courseId);
    await course.isCourseUsed();

    return await lesson.removeTest();
  }

  async createLesson({ lessonObj, courseId, user }: LessonArgCreate) {
    if (user.role !== Role.TEACHER) {
      throw new ApiError(roleError.NOT_RIGHTS);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    return await course.addLesson(lessonObj);
  }

  async updateLesson({ lessonObj, courseId, lessonId, user }: LessonArgUpdate) {
    if (isNaN(courseId) || isNaN(lessonId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);

    const result = await course.editLesson(lessonObj, lessonId);

    if (!result) {
      throw new ApiError(lessonError.ID_NOT_EXIST);
    }
    return result;
  }

  async deleteLesson({ user, lessonId, courseId }: LessonArgDelete) {
    if (isNaN(courseId) || isNaN(lessonId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    return await course.deleteLesson(lessonId);
  }
}

export const lessonService = new LessonService();
