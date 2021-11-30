import {Fighter} from '../dto/fighter';

import {Client} from 'pg';
import * as express from 'express';
import {Event} from '../dto/event';
import {Fight} from '../dto/fight';
import {DbFight} from '../dto/fight_db';

class FightersRouter {

  router: any;

  constructor() {
    this.router = express.Router();
    this.initRouter();
  }

  private initRouter() {
    this.router.get('/', (req: any, res: any, next: any) => {
      try {
        getFighters(req, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.get('/count', (req: any, res: any, next: any) => {
      try {
        getFightersCount(req, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.get('/:id/recentFights', (req: any, res: any, next: any) => {
      try {
        // TODO don't think this is needed actually, or is needed as second query to get each fighter
        const fightsQuery = 'SELECT f.id, f.event, ev.date, f.fighter_1, f.fighter_2, f.weight_class, f.result, f.round, f.time\n' +
          'FROM fights f \n' +
          'INNER JOIN fighters f1 ON f.fighter_1 = f1.id \n' +
          'INNER JOIN fighters f2 ON f.fighter_2 = f2.id\n' +
          'INNER JOIN events ev ON f.event = ev.id\n' +
          'WHERE f.fighter_1 = $1 OR f.fighter_2 = $1\n' +
          'ORDER BY ev.date DESC LIMIT $2;';
        const fightsParams = [req.params.id, req.query.count] as any[];
        getRecentFightsForFighter(fightsQuery, fightsParams)
          .then(fights => {
            const fighterIds = new Set();
            const eventIds = new Set();
            fights.forEach(fight => {
              fighterIds.add(fight.fighter1);
              fighterIds.add(fight.fighter2);
              eventIds.add(fight.event);
            });

            const fightersQuery = 'SELECT id, name FROM fighters WHERE id = ANY($1::int[])';
            const fightersParams = [Array.from(fighterIds)];
            const getFightersQuery = executeQueryAndReturnFighters(fightersQuery, fightersParams);
            const eventsQuery = 'SELECT id, name, date FROM events WHERE id = ANY($1::int[])';
            const eventsParams = [Array.from(eventIds)];
            const getEventsQuery = getEvents(eventsQuery, eventsParams);
            Promise.all([getFightersQuery, getEventsQuery])
              .then(responses => {
                const recentFights = [];
                for (const fight of fights) {
                  const fighter1Id = fight.fighter1;
                  const fighter2Id = fight.fighter2;
                  const matchingFighter1 = responses[0].filter(f => f.id === fighter1Id)[0];
                  const matchingFighter2 = responses[0].filter(f => f.id === fighter2Id)[0];
                  const eventId = fight.event;
                  const matchingEvent = responses[1].filter(e => e.id === eventId)[0];
                  recentFights.push(new Fight(fight.id, matchingFighter1, matchingFighter2,
                    fight.weightClass, fight.result, fight.round, fight.time, matchingEvent));
                }
                res.send(JSON.stringify(recentFights));
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
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
        // TODO - doesn't actually necessarily update the fighter matching :id - just the one in the body
        const fighter: Fighter = req.body.fighter;
        updateFighter(fighter, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.post('/:id/delete', (req: any, res: any, next: any) => {
      try {
        // TODO why is this req.body.id rather than req.params.id ?
        const id: number = req.body.id;
        deleteFighter(id, res);
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    function getFighters(req: any, res: any) {
      let query = 'SELECT id, name FROM fighters';
      let params;
      if (req.query.filter) {
        query += ' WHERE name ILIKE $3';
        params = [req.query.count, req.query.start, '%' + req.query.filter + '%'];
      } else {
        params = [req.query.count, req.query.start];
      }
      query += ' ORDER BY name LIMIT $1 OFFSET $2;';

      executeQueryAndSendFightersInResponse(query, params, res);
    }

    function getFightersCount(req: any, res: any) {
      let query = 'SELECT count(*) FROM fighters';
      let params;
      if (req.query.filter) {
        query += ' WHERE name ILIKE $1;';
        params = ['%' + req.query.filter + '%'];
      } else {
        query += ';';
        params = [] as any[];
      }

      executeQueryAndSendFighterCount(query, params, res);
    }

    function createFighter(fighter: Fighter, res: any) {
      const query = 'INSERT INTO fighters(name) VALUES ($1) returning *;';
      const params = [fighter.name];

      executeQueryAndSendFightersInResponse(query, params, res);
    }

    function updateFighter(fighter: Fighter, res: any) {
      const query = 'UPDATE fighters SET name = $1 WHERE id = $2 returning *;';
      const params = [fighter.name, fighter.id];

      executeQueryAndSendFightersInResponse(query, params, res);
    }

    function deleteFighter(id: number, res: any) {
      const query = 'DELETE FROM fighters WHERE id = $1 returning *;';
      const params = [id];

      executeQueryAndSendFightersInResponse(query, params, res);
    }

    function executeQueryAndSendFightersInResponse(query: string, params: any[], res: any) {
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

    function executeQueryAndSendFighterCount(query: string, params: any[], res: any) {
      const client = createClient();

      client.connect();
      client.query(query, params, (err: any, response: any) => {
        client.end();
        if (err) {
          console.log(err);
          res.send('{ "error": "Unexpected failure while performing request" }');
        } else {
          res.send(JSON.stringify(response.rows[0].count));
        }
      });
    }

    function getRecentFightsForFighter(query: string, params: any[]): Promise<DbFight[]> {
      const client = createClient();

      return new Promise<DbFight[]>((resolve, reject) => {
        client.connect();
        client.query(query, params, (err: any, response: any) => {
          client.end();
          if (err) {
            console.log(err);
            reject('Failed to execute query for recent fights');
          } else {
            resolve(response.rows.map((row: any) =>
              new DbFight(row.id, row.fighter_1, row.fighter_2, row.weight_class, row.result, row.round, row.time, row.event)));
          }
        });
      });
    }

    function executeQueryAndReturnFighters(query: string, params: any[]): Promise<Fighter[]> {
      const client = createClient();

      return new Promise<Fighter[]>((resolve, reject) => {
        client.connect();
        client.query(query, params, (err: any, response: any) => {
          client.end();
          if (err) {
            console.log(err);
            reject('Failed to execute query for fighters');
          } else {
            resolve(response.rows.map((row: any) => new Fighter(row.id, row.name)));
          }
        });
      });
    }

    function getEvents(query: string, params: any[]): Promise<Event[]> {
      const client = createClient();

      return new Promise<Event[]>((resolve, reject) => {
        client.connect();
        client.query(query, params, (err: any, response: any) => {
          client.end();
          if (err) {
            console.log(err);
            reject('Failed to execute query for events');
          } else {
            resolve(response.rows.map((row: any) => new Event(row.id, row.date, row.name)));
          }
        });
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
