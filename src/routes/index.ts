import Router from 'koa-router';
import { validateAuthorization } from '../middlewares';
import {
  authPaths,
  coursePaths,
  dashboardPaths,
  groupPaths,
  homeWorkPaths,
  lessonPaths,
  materialPaths,
  notifyPaths,
  taskPath,
  testPaths,
  testResultPaths,
  userPaths,
} from '../consts';

import { authRouter } from './auth.router';
import { groupRouter } from './group.router';
import { usersRouter } from './users.router';
import { courseRouter } from './course.router';
import { testsRouter } from './tests.router';
import { testResultRouter } from './testResult.router';
import { homeWorkRouter } from './homeWork.router';
import { materialRouter } from './material.router';
import { lessonRouter } from './lesson.router';
import { taskRouter } from './task.router';
import koaBody from 'koa-body';
import { notifyRouter } from './notify.router';
import { dashboardRouter } from './dashboard.routes';

const router = new Router();

router.use(
  koaBody({
    json: false,
    multipart: true,
    formidable: {
      keepExtensions: true,
      uploadDir: './uploads',
    },
  }),
);

router.use(authPaths.ROOT, authRouter.routes());
router.use(validateAuthorization);

router.use(groupPaths.ROOT, groupRouter.routes());
router.use(userPaths.ROOT, usersRouter.routes());
router.use(coursePaths.ROOT, courseRouter.routes());
router.use(lessonPaths.ROOT, lessonRouter.routes());
router.use(materialPaths.ROOT, materialRouter.routes());
router.use(homeWorkPaths.ROOT, homeWorkRouter.routes());
router.use(testPaths.ROOT, testsRouter.routes());
router.use(testResultPaths.ROOT, testResultRouter.routes());
router.use(taskPath.ROOT, taskRouter.routes());
router.use(notifyPaths.ROOT, notifyRouter.routes());
router.use(dashboardPaths.ROOT, dashboardRouter.routes());

export default router;
