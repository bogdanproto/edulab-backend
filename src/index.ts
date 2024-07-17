import 'dotenv/config';
import Koa from 'koa';
import path from 'path';
import cors from '@koa/cors';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import { koaSwagger } from 'koa2-swagger-ui';

import spec from './swagger/swagger.json';

const IS_PROD = process.env.NODE_ENV === 'production';

import {
  handleErrors,
  logRequestResults,
  calculateResponseTime,
  pageNotFound,
} from './middlewares';
import router from './routes';

const app = new Koa();

app.use(handleErrors);
app.use(logRequestResults);
app.use(calculateResponseTime);
app.use(serve(path.join(process.cwd(), 'src', 'public')));
app.use(
  cors(IS_PROD ? { origin: 'https://edulab.pp.ua', credentials: true } : {}),
);
app.use(bodyParser());
app.use(json());

app.use(
  koaSwagger({
    routePrefix: '/api/docs',
    swaggerOptions: {
      spec,
    },
  }),
);

app.use(router.allowedMethods());
app.use(router.routes());
app.use(pageNotFound);

const PORT = process.env.DEV_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is up and running on port ${PORT}`);
});
