import {DbFight} from '../dto/fight_db';
import {Client} from 'pg';
import {Fight} from '../dto/fight';
import {Event} from '../dto/event';
import {Fighter} from '../dto/fighter';

export class FightQuery {

  private static createClient() {
    return new Client({
      user: 'neilb',
      host: 'localhost',
      database: 'fighters_app',
      password: '',
      port: 5432,
    });
  }

  getFights(query: string, params: any[]): Promise<Fight[]> {
    return new Promise<Fight[]>((resolve, reject) => {
      this.getDbFights(query, params)
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
          const getFightersQuery = this.executeQueryAndReturnFighters(fightersQuery, fightersParams);
          const eventsQuery = 'SELECT id, name, date FROM events WHERE id = ANY($1::int[])';
          const eventsParams = [Array.from(eventIds)];
          const getEventsQuery = this.getEvents(eventsQuery, eventsParams);
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
              resolve(recentFights);
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    });
  }

  getDbFights(query: string, params: any[]): Promise<DbFight[]> {
    const client = FightQuery.createClient();

    return new Promise<DbFight[]>((resolve, reject) => {
      client.connect();
      client.query(query, params, (err: any, response: any) => {
        client.end();
        if (err) {
          console.log(err);
          reject('Failed to execute query for fights');
        } else {
          resolve(response.rows.map((row: any) =>
            new DbFight(row.id, row.fighter_1, row.fighter_2, row.weight_class, row.result, row.round, row.time, row.event)));
        }
      });
    });
  }

  executeQueryAndReturnFighters(query: string, params: any[]): Promise<Fighter[]> {
    const client = FightQuery.createClient();

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

  getEvents(query: string, params: any[]): Promise<Event[]> {
    const client = FightQuery.createClient();

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
}
