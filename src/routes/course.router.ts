import Router from 'koa-router';
import CourseController from '../controllers/course.controller';
import { coursePaths } from '../consts';
import { courseSchema, courseStatusSchema } from '../schemas';
import { uploadToS3, validateBody } from '../middlewares';

const router = new Router();

router
  .get(coursePaths.BASE, CourseController.getAllCourse)
  .get(coursePaths.ID, CourseController.getCourseById)
  .post(
    coursePaths.BASE,
    validateBody(courseSchema),
    uploadToS3({ fieldName: 'imgUrl', quality: 70, width: 800 }),
    CourseController.createCourse,
  )
  .patch(
    coursePaths.ID,
    validateBody(courseSchema),
    uploadToS3({ fieldName: 'imgUrl', quality: 70, width: 800 }),
    CourseController.updateCourse,
  )
  .patch(
    coursePaths.STATUS,
    validateBody(courseStatusSchema),
    CourseController.changeStatusCourse,
  )
  .delete(coursePaths.ID, CourseController.deleteCourse);

export const courseRouter = router;
