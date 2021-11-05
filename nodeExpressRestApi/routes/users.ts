import * as express from 'express';

class UsersRouter {

  router: any;

  constructor() {
    this.router = express.Router();
    this.initRouter();
  }

  private initRouter() {
    this.router.get('/', (req: any, res: any, next: any) => {
      res.send('Hitting users route');
    });
  }
}

export = UsersRouter;
