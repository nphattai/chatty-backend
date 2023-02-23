import { authRoutes } from '@auth/routes/auth.routes';
import { healthRoutes } from '@health/routes/health.routes';
import { postRoutes } from '@post/routes/post.routes';
import { serverAdapter } from '@service/queues/base.queue';
import { userRoutes } from '@user/routes/user.routes';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());

    app.use('', healthRoutes.health());
    app.use('', healthRoutes.env());
    app.use('', healthRoutes.instance());
    app.use('', healthRoutes.fiboRoutes());

    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, userRoutes.routes());
    app.use(BASE_PATH, postRoutes.routes());
  };

  routes();
};
