import Router from 'koa-router';
import { uploadToS3, validateBody } from '../middlewares';
import { materialPaths } from '../consts';
import MaterialController from '../controllers/material.controller';
import { materialCreateSchema } from '../schemas';

const router = new Router();

router
  .get(materialPaths.BASE, MaterialController.getAllMaterialByLesson)
  .post(
    materialPaths.BASE,
    validateBody(materialCreateSchema),
    uploadToS3({ fieldName: 'sourceUrl' }),
    MaterialController.createMaterial,
  )
  .patch(
    materialPaths.ID,
    validateBody(materialCreateSchema),
    MaterialController.updateMaterial,
  )
  .delete(materialPaths.ID, MaterialController.deleteMaterial);

export const materialRouter = router;
