import Router from 'koa-router';
import UsersController from '../controllers/users.controller';
import { userPaths } from '../consts';
import { uploadToS3, validateBody } from '../middlewares';
import { userSchemas } from '../schemas/userSchemas';

const router = new Router();

router
  .get(userPaths.BASE, UsersController.getAllUsers)
  .get(userPaths.ID, UsersController.getUserById)
  .post(userPaths.BASE, validateBody(userSchemas.userCreate), UsersController.createUser)
  .patch(userPaths.ID, validateBody(userSchemas.userUpdate),
    uploadToS3({ fieldName: 'avatarUrl', quality: 70, width: 800 }),
    UsersController.updateUser)
  .delete(userPaths.ID, UsersController.deleteUser);

export const usersRouter = router;
