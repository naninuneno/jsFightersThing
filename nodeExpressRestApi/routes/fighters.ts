import {Fighter} from '../dto/fighter';

import {Client} from 'pg';
import * as express from 'express';

class FightersRouter {

  router: any;

  constructor() {
    this.router = express.Router();
    this.initRouter();
  }

  private initRouter() {
    this.router.get('/', (req: any, res: any, next: any) => {
      try {
        getFighters(res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.post('/create', (req: any, res: any, next: any) => {
      try {
        const fighter: Fighter = req.body.fighter;
        createFighter(fighter, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.post('/:id', (req: any, res: any, next: any) => {
      try {
        const fighter: Fighter = req.body.fighter;
        updateFighter(fighter, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.post('/:id/delete', (req: any, res: any, next: any) => {
      try {
        const id: number = req.body.id;
        deleteFighter(id, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    function getFighters(res: any) {
      const query = 'SELECT id, name FROM fighters;';
      const params = [] as any[];

      executeQueryAndReturnFighters(query, params, res);
    }

    function createFighter(fighter: Fighter, res: any) {
      const query = 'INSERT INTO fighters(name) VALUES ($1) returning *;';
      const params = [fighter.name];

      executeQueryAndReturnFighters(query, params, res);
    }

    function updateFighter(fighter: Fighter, res: any) {
      const query = 'UPDATE fighters SET name = $1 WHERE id = $2 returning *;';
      const params = [fighter.name, fighter.id];

      executeQueryAndReturnFighters(query, params, res);
    }

    function deleteFighter(id: number, res: any) {
      const query = 'DELETE FROM fighters WHERE id = $1 returning *;';
      const params = [id];

      executeQueryAndReturnFighters(query, params, res);
    }

    function executeQueryAndReturnFighters(query: string, params: any[], res: any) {
      const client = createClient();

      client.connect();
      client.query(query, params, (err: any, response: any) => {
        client.end();
        if (err) {
          console.log(err);
          res.send('{ "error": "Unexpected failure while performing request" }');
        } else {
          const fighters = response.rows.map((row: any) => new Fighter(row.id, row.name));
          res.send(JSON.stringify(fighters));
        }
      });
    }

    // TODO query pool instead?
    function createClient() {
      return new Client({
        user: 'neilb',
        host: 'localhost',
        database: 'fighters_app',
        password: '',
        port: 5432,
      });
    }
  }
}

export = FightersRouter;
