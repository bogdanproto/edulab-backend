import { Course } from '../app/course/Course';
import { Teacher } from '../app/roles/teacher/Teacher';
import { errors, roleError } from '../consts';
import { courseData } from '../data';
import {
  CourseArgCreate,
  CourseArgDelete,
  CourseArgGet,
  CourseArgStatus,
  CourseArgUpdate,
  CourseDto,
  UserCurrentDto,
} from '../data/dto';
import { ApiError } from '../helpers';
import { Role } from '../types';

class CourseService {
  private courseData = courseData;

  async getAllCourse(user: UserCurrentDto, isActive?: boolean) {
    if (user.role === Role.STUDENT) {
      return await this.courseData.getAllCourseByStudentId(user.id);
    }

    if (user.role === Role.TEACHER) {
      const teacher = new Teacher(user.id);
      return await teacher.getMyCourses(isActive);
    }

    return await this.courseData.getAllCourse(isActive);
  }

  async getCourseById({ courseId, user }: CourseArgGet) {
    let data: CourseDto | null = null;

    if (isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);

    if (user.role === Role.STUDENT) {
      data = await course.isCourseRelateToStudent(user.id);
    }

    if (user.role === Role.TEACHER) {
      data = await course.isCourseRelateToTeacher(user.id);
    }

    if (user.role === Role.ADMIN) {
      data = await this.courseData.getCourseById(courseId);
    }

    const lessons = await course.getCourseLessons();

    return { ...data, lessons };
  }

  async createCourse({ courseObj, user }: CourseArgCreate) {
    if (user.role !== Role.TEACHER) {
      throw new ApiError(roleError.NOT_RIGHTS);
    }

    const teacher = new Teacher(user.id);

    return await teacher.addCourse(courseObj);
  }

  async updateCourse({ courseObj, user, courseId }: CourseArgUpdate) {
    if (isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);

    const teacher = new Teacher(user.id);

    if (Object.prototype.hasOwnProperty.call(courseObj, 'file')) {
      courseObj = { ...courseObj, imgUrl: courseObj.file };
    }

    return await teacher.editCourse(courseObj, courseId);
  }

  async changeStatusCourse({
    status: { isActive },
    user,
    courseId,
  }: CourseArgStatus) {
    if (isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    const teacher = new Teacher(user.id);

    return await teacher.setStatusCourse(isActive, courseId);
  }

  async deleteCourse({ user, courseId }: CourseArgDelete) {
    if (isNaN(courseId)) {
      throw new ApiError(errors.BAD_ID);
    }

    const course = new Course(courseId);
    await course.isCourseRelateToTeacher(user.id);
    await course.isCourseUsed();

    const teacher = new Teacher(user.id);

    return await teacher.deleteCourse(courseId);
  }
}

export const courseService = new CourseService();
