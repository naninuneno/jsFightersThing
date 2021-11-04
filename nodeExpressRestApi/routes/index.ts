import {Fighter} from '../dto/fighter';

import {Client} from 'pg';
import * as express from 'express';

class IndexRouter {

  router: any;

  constructor() {
    this.router = express.Router();
    this.initRequest();
  }

  private initRequest() {
    this.router.get('/', (req: any, res: any, next: any) => {
      try {
        queryClient(res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    // TODO query pool instead?
    const queryClient = (res: any) => {
      const client = new Client({
        user: 'neilb',
        host: 'localhost',
        database: 'fighters_app',
        password: '',
        port: 5432,
      });

      client.connect();
      client.query('SELECT id, name FROM fighters;', (err: any, response: any) => {
        client.end();
        if (err) {
          console.log(err);
          res.send('{ "error": "Unexpected failure while performing request" }');
        } else {
          const fighters = response.rows.map((row: any) => new Fighter(row.name));
          res.send(JSON.stringify(fighters));
        }
      });
    };
  }
}

export = IndexRouter;
