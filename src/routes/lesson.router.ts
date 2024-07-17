import Router from 'koa-router';
import LessonController from '../controllers/lesson.controller';
import { lessonPaths } from '../consts';
import { validateBody } from '../middlewares';
import { assignTestSchema, lessonCreateSchema } from '../schemas';

const router = new Router();

router
  .get(lessonPaths.BASE, LessonController.getAllLessonByCourse)
  .get(lessonPaths.ID, LessonController.getLessonById)
  .get(lessonPaths.LESSON_TEST, LessonController.getTestByLesson)
  .post(
    lessonPaths.BASE,
    validateBody(lessonCreateSchema),
    LessonController.createLesson,
  )
  .post(
    lessonPaths.ASSIGN_TEST,
    validateBody(assignTestSchema),
    LessonController.assignTestToLesson,
  )
  .delete(lessonPaths.REMOVE_TEST, LessonController.removeTestFromLesson)
  .patch(
    lessonPaths.ID,
    validateBody(lessonCreateSchema),
    LessonController.updateLesson,
  )
  .delete(lessonPaths.ID, LessonController.deleteLesson);

export const lessonRouter = router;
