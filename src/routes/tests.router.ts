import Router from 'koa-router';
import TestsController from '../controllers/tests.controller';
import { questionSchema, testSchema } from '../schemas';
import { testPaths, questionPaths } from '../consts';
import { uploadToS3, validateBody } from '../middlewares';

const router = new Router();

router
  .get(testPaths.BASE, TestsController.getTestsByTeacherId)
  .get(testPaths.ID, TestsController.getTestById)
  .get(testPaths.TASK_ID, TestsController.getTestByTaskId)
  .post(testPaths.BASE, validateBody(testSchema), TestsController.createTest)
  .put(testPaths.ID, validateBody(testSchema), TestsController.updateTest)
  .delete(testPaths.ID, TestsController.deleteTest)
  .post(
    questionPaths.BASE,
    validateBody(questionSchema),
    uploadToS3({ fieldName: 'imgUrl' }),
    TestsController.addQuestion,
  )
  .put(
    questionPaths.ID,
    validateBody(questionSchema),
    uploadToS3({ fieldName: 'imgUrl' }),
    TestsController.updateQuestion,
  )
  .delete(questionPaths.ID, TestsController.deleteQuestion);

export const testsRouter = router;
