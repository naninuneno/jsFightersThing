import {Client} from 'pg';
import * as express from 'express';
import {Event} from '../dto/event';
import {FightQuery} from '../db/fight-query';

class EventsRouter {

  router: any;
  fightQuery: FightQuery;

  constructor() {
    this.router = express.Router();
    this.fightQuery = new FightQuery();
    this.initRouter();
  }

  private initRouter() {
    this.router.get('/', (req: any, res: any, next: any) => {
      try {
        getEvents(req, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.get('/:id/fights', (req: any, res: any, next: any) => {
      try {
        const fightsQuery = 'SELECT f.id, f.event, ev.date, f.fighter_1, f.fighter_2, f.weight_class, f.result, f.round, f.time\n' +
          'FROM fights f \n' +
          'INNER JOIN fighters f1 ON f.fighter_1 = f1.id \n' +
          'INNER JOIN fighters f2 ON f.fighter_2 = f2.id\n' +
          'INNER JOIN events ev ON f.event = ev.id\n' +
          'WHERE ev.id = $1\n' +
          'ORDER BY ev.date DESC;';
        const fightsParams = [req.params.id] as any[];
        this.fightQuery.getFights(fightsQuery, fightsParams)
          .then(fights => res.send(JSON.stringify(fights)))
          .catch(err => console.log(err));
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    function getEvents(req: any, res: any) {
      const query = 'SELECT id, date, name FROM events ORDER BY date DESC;';
      const params = [] as any[];

      executeQueryAndSendEventsInResponse(query, params, res);
    }

    function executeQueryAndSendEventsInResponse(query: string, params: any[], res: any) {
      const client = createClient();

      client.connect();
      client.query(query, params, (err: any, response: any) => {
        client.end();
        if (err) {
          console.log(err);
          res.send('{ "error": "Unexpected failure while performing request" }');
        } else {
          console.log('Events: ', response.rows[0]);
          const events = response.rows.map((row: any) => new Event(row.id, row.date, row.name));
          res.send(JSON.stringify(events));
        }
      });
    }

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

export = EventsRouter;
