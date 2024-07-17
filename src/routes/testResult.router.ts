import Router from 'koa-router';
import TestsResultController from '../controllers/testResult.controller';
import { testResultSchema } from '../schemas';
import { testResultPaths } from '../consts';
import { validateBody } from '../middlewares';

const router = new Router();

router
  .get(testResultPaths.ID, TestsResultController.getTestResultByTaskId)
  .post(
    testResultPaths.BASE,
    validateBody(testResultSchema),
    TestsResultController.createTestResult,
  )
  .post(
    testResultPaths.CHECK,
    validateBody(testResultSchema),
    TestsResultController.checkTestResult,
  )
  .delete(testResultPaths.ID, TestsResultController.deleteTestResultByTaskId);

export const testResultRouter = router;
