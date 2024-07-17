import Router from 'koa-router';
import authPaths from '../consts/paths/authPaths';
import { validateBody } from '../middlewares';
import { authSchemas } from '../schemas';
import validateAuthorization from '../middlewares/validateAuthorization';
import AuthController from '../controllers/auth.controller';

const router = new Router();

router
  .post(
    authPaths.REGISTER,
    validateBody(authSchemas.userRegistration),
    AuthController.registerUser,
  )
  .post(
    authPaths.SIGNIN,
    validateBody(authSchemas.userSignIn),
    AuthController.signInUser,
  )
  .post(
    authPaths.IMPORT,
    validateBody(authSchemas.importUsers),
    AuthController.importUsers,
  )
  .patch(
    authPaths.CHANGE_PASSWORD,
    validateBody(authSchemas.changePassword),
    validateAuthorization,
    AuthController.changePassword,
  )
  .patch(
    authPaths.CREATE_PASSWORD,
    validateBody(authSchemas.createPassword),
    AuthController.createPassword,
  )
  .patch(
    authPaths.RECOVER_CREDENTIALS,
    validateBody(authSchemas.recoverCredentials),
    AuthController.recoverCredentials,
  )
  .get(authPaths.LOGOUT, AuthController.logoutUser)
  .get(
    authPaths.RESTORE_USER,
    validateAuthorization,
    AuthController.restoreUser,
  )
  .get(authPaths.REFRESH_USER, AuthController.refreshUser)
  .get(authPaths.ACTIVATE, AuthController.activateUser)
  .get(authPaths.VALIDATE_RESET_PSW, AuthController.validateResetPassword);

export const authRouter = router;
