import { authRoutes } from '@auth/routes/auth.routes';
import { serverAdapter } from '@service/queues/base.queue';
import { userRoutes } from '@user/routes/user.routes';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, userRoutes.routes());
  };

  routes();
};
