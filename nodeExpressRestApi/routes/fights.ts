import * as express from 'express';
import {Fighter} from '../dto/fighter';
import {Client} from 'pg';
import {Fight} from '../dto/fight';

class FightsRouter {

  router: any;

  constructor() {
    this.router = express.Router();
    this.initRouter();
  }

  private initRouter() {
    this.router.get('/', (req: any, res: any, next: any) => {
      try {
        getFights(res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.post('/create', (req: any, res: any, next: any) => {
      try {
        const fight: Fight = req.body.fight;
        createFight(fight, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    function getFights(res: any) {
      const query = 'SELECT f.ID, f.fighter_1, f.fighter_2, f.date, f1.name as fighter_1_name, f2.name as fighter_2_name ' +
        'FROM fights f ' +
        'INNER JOIN fighters f1 ON f.fighter_1 = f1.id ' +
        'INNER JOIN fighters f2 ON f.fighter_2 = f2.id;';
      const params = [] as any[];

      executeQueryAndReturnFights(query, params, res);
    }

    function createFight(fight: Fight, res: any) {
      const query = 'INSERT INTO fights(fighter_1, fighter_2, date) VALUES ($1, $2, $3) returning *;';
      const params = [fight.fighter1.id, fight.fighter2.id, fight.date];

      executeQueryAndReturnFights(query, params, res);
    }

    // TODO duplicated in fighters route, extract to common
    function executeQueryAndReturnFights(query: string, params: any[], res: any) {
      const client = createClient();

      client.connect();
      client.query(query, params, (err: any, response: any) => {
        client.end();
        if (err) {
          console.log(err);
          res.send('{ "error": "Unexpected failure while performing request" }');
        } else {
          const fights = response.rows.map((row: any) => {
            // TODO ORM would make this + query nicer
            const fighter1 = new Fighter(row.fighter_1, row.fighter_1_name);
            const fighter2 = new Fighter(row.fighter_2, row.fighter_2_name);
            return new Fight(row.id, fighter1, fighter2, row.date);
          });
          res.send(JSON.stringify(fights));
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

export = FightsRouter;
