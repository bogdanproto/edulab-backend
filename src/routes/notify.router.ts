import Router from 'koa-router';
import { notifyPaths } from '../consts';
import NotifyController from '../controllers/notify.controller';

const router = new Router();

router
  .get(notifyPaths.BASE, NotifyController.getAllNotify)
  .get(notifyPaths.STATUS, NotifyController.getQntNotifyByStatus)
  .patch(notifyPaths.BASE, NotifyController.updateStatus);

export const notifyRouter = router;
