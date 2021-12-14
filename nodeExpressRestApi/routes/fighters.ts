import {Fighter} from '../dto/fighter';

import {Client} from 'pg';
import * as express from 'express';
import {Event} from '../dto/event';
import {Fight} from '../dto/fight';
import {ResultBreakdown} from '../dto/result-breakdown';
import {FightQuery} from '../db/fight-query';

class FightersRouter {

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
        this.fightQuery.getFights(fightsQuery, fightsParams)
          .then(fights => res.send(JSON.stringify(fights)))
          .catch(err => console.log(err));
      } catch (e) {
        console.error('Critical failure occurred: ' + e);
        res.send('{ "error": "Critical failure occurred while performing request" }');
      }
    });

    this.router.get('/:id/results', (req: any, res: any, next: any) => {
      try {
        const fighterTypeForQuery = req.query.isWins === 'true' ? 'fighter_1' : 'fighter_2';
        const fightsQuery = `
          WITH result_pcts AS (
            SELECT CASE
                     WHEN f.result LIKE '%KO%' THEN 'KO'
                     WHEN f.result LIKE '%Submission%' THEN 'Submission'
                     WHEN f.result LIKE '%Decision%' THEN 'Decision'
                     WHEN f.result LIKE '%' THEN 'Other'
                     END                                                                      AS result_type,
                   f.${fighterTypeForQuery},
                   fx.name,
                   ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY f.${fighterTypeForQuery}), 2) AS result_percentage,
                   COUNT(*)                                                                   AS result_count
            FROM fights f
                   INNER JOIN fighters fx ON f.${fighterTypeForQuery} = fx.id
                   INNER JOIN events ev ON f.event = ev.id
            WHERE ev.date < $2::date
            GROUP BY ${fighterTypeForQuery}, fx.name, result_type
          )
          SELECT ${fighterTypeForQuery},
                 name,
                 result_type,
                 result_percentage,
                 result_count
          FROM result_pcts
          WHERE ${fighterTypeForQuery} = $1;`;
        const fightsParams = [req.params.id, req.query.endDate] as any[];
        getResultsForFighter(fightsQuery, fightsParams)
          .then(resultBreakdown => {
            console.log('x', resultBreakdown);
            res.send(JSON.stringify(resultBreakdown));
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
          console.log('resp: ', response.rows[0]);
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

    // function getRecentFightsForFighter(query: string, params: any[]): Promise<DbFight[]> {
    //   const client = createClient();
    //
    //   return new Promise<DbFight[]>((resolve, reject) => {
    //     client.connect();
    //     client.query(query, params, (err: any, response: any) => {
    //       client.end();
    //       if (err) {
    //         console.log(err);
    //         reject('Failed to execute query for recent fights');
    //       } else {
    //         resolve(response.rows.map((row: any) =>
    //           new DbFight(row.id, row.fighter_1, row.fighter_2, row.weight_class, row.result, row.round, row.time, row.event)));
    //       }
    //     });
    //   });
    // }

    function getResultsForFighter(query: string, params: any[]): Promise<ResultBreakdown> {
      const client = createClient();

      return new Promise<ResultBreakdown>((resolve, reject) => {
        client.connect();
        client.query(query, params, (err: any, response: any) => {
          client.end();
          if (err) {
            console.log(err);
            reject('Failed to execute query for results');
          } else {
            let koCount = 0;
            let subCount = 0;
            let decCount = 0;
            let koPercentage = 0;
            let subPercentage = 0;
            let decPercentage = 0;
            for (const row of response.rows) {
              if (row.result_type === 'KO') {
                koCount = row.result_count;
                koPercentage = row.result_percentage;
              } else if (row.result_type === 'Submission') {
                subCount = row.result_count;
                subPercentage = row.result_percentage;
              } else if (row.result_type === 'Decision') {
                decCount = row.result_count;
                decPercentage = row.result_percentage;
              } else {
                console.log('Other row: ', row);
              }
            }
            resolve(
              new ResultBreakdown(koCount, subCount, decCount, koPercentage, subPercentage, decPercentage));
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
