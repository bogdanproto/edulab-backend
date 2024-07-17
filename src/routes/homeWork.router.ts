import Router from 'koa-router';
import { uploadToS3, validateBody } from '../middlewares';
import HomeWorkController from '../controllers/homeWork.controller';
import { homeWorkPaths } from '../consts';
import { homeWorkCreateSchema } from '../schemas';

const router = new Router();

router
  .get(homeWorkPaths.BASE, HomeWorkController.getHomeWorkByLesson)
  .post(
    homeWorkPaths.BASE,
    validateBody(homeWorkCreateSchema),
    uploadToS3({ fieldName: 'sourceUrl' }),
    HomeWorkController.createHomeWork,
  )
  .patch(
    homeWorkPaths.ID,
    validateBody(homeWorkCreateSchema),
    HomeWorkController.updateHomeWork,
  )
  .delete(homeWorkPaths.ID, HomeWorkController.deleteHomeWork);

export const homeWorkRouter = router;
