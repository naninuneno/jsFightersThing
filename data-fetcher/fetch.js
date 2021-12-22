const axios = require('axios').default;
const htmlParser = require('node-html-parser');
const Pool = require('pg').Pool;

class Event {
  constructor(name, event_url, date) {
    this.name = name;
    this.event_url = event_url;
    this.date = date;
  }
}

class Fight {
  constructor(eventId, fighter1, fighter2, weightClass, result, round, time) {
    this.eventId = eventId;
    this.fighter1 = fighter1;
    this.fighter2 = fighter2;
    this.weightClass = weightClass;
    this.result = result;
    this.round = round;
    this.time = time;
  }
}

class Fighter {
  constructor(name, wiki_url, hasWikiPage) {
    this.name = name;
    this.wiki_url = wiki_url;
    this.hasWikiPage = hasWikiPage;
  }
}

class WikiFighter {
  constructor(fighter_id, wiki_url) {
    this.fighter_id = fighter_id;
    this.wiki_url = wiki_url;
  }
}

axios.get('https://en.wikipedia.org/wiki/List_of_UFC_events')
  .then(async function (response) {
    const root = htmlParser.parse(response.data);
    const past_event_rows = root.querySelectorAll('table#Past_events tbody tr');
    // for some reason, 'tr' selector pulls back what should be a 'th' (according to browser) - so drop first row
    past_event_rows.shift();

    const pool = createPool();
    const existingEventUrls = await getExistingEventUrls(pool);
    pool.end();

    let i = 0;
    for (const past_event_row of past_event_rows) {
      if (i++ > 200) {
        break;
      }
      const event_id = past_event_row.getElementsByTagName('td')[0].innerText.trim();
      if (event_id !== '—') {
        const eventCell = past_event_row.getElementsByTagName('a')[0];
        const eventUrl = eventCell.getAttribute('href');
        if (existingEventUrls.includes(eventUrl)) {
          console.log('Skipping ' + eventUrl + ' - already saved');
        } else {
          const eventName = eventCell.innerText;
          let eventDate;
          try {
            eventDate = getEventDate(past_event_row);
          } catch (RangeError) {
            console.log('Date parse failure for ' + eventUrl + ' - skipping');
            continue;
          }
          console.log('Saving "' + eventName + '" - URL: ' + eventUrl + " - Date: " + eventDate);
          const pool = createPool();
          const eventId = await createEventAndGetId(pool, eventName, eventUrl, eventDate);
          pool.end();
          await saveEventFights(eventUrl, eventId);
          // give them a little break :-)
          await sleep(500);
        }
      }
    }


  })
  .catch(function (error) {
    console.log(error);
  });

function getEventDate(eventRow) {
  const eventDateCell = eventRow.getElementsByTagName('span')[0];
  let eventDate = new Date(eventDateCell.innerText);
  if (!eventDate.getMonth()) {
    const eventDateCellBackup = eventRow.getElementsByTagName('td')[2];
    eventDate = new Date(eventDateCellBackup.innerText);
  }

  // 10 to parse sql-format date e.g. '2021-11-06'
  return eventDate.toISOString().slice(0, 10);
}

// TODO so many async/awaits - surely don't need all of them - learning exercise to find out which are needed
async function saveEventFights(eventUrl, eventId) {
  await axios.get('https://en.wikipedia.org' + eventUrl)
    .then(async function (response) {
      const root = htmlParser.parse(response.data);
      const tables = root.getElementsByTagName('table');
      const resultsTable = findResultsTable(tables);
      if (resultsTable === undefined) {
        console.log('Couldn\'t find results table');
      }

      await saveFighters(resultsTable, eventId);
    })
    .catch(function (error) {
      console.log(error);
    });
}

function findResultsTable(tables) {
  for (const table of tables) {
    const tableRows = table.getElementsByTagName('tr');
    // just check first 3 rows, should be enough to tell whether this is the correct table
    let numberOfRowsToCheck = tableRows.length;
    if (numberOfRowsToCheck > 3) {
      numberOfRowsToCheck = 3;
    }
    for (let i = 0; i < numberOfRowsToCheck; i++) {
      const firstCell = tableRows[i].getElementsByTagName('th')[0];
      if (firstCell && firstCell.innerText.includes('Weight class')) {
        return table;
      }
    }
  }
}

async function saveFighters(table, eventId) {
  const tableRows = table.getElementsByTagName('tr');
  let i = 0;
  const fights = [];
  for (const tableRow of tableRows) {
    i++;
    const tableCells = tableRow.getElementsByTagName('td');
    if (tableCells.length === 8) {
      const weight_class = getText(tableCells[0]);
      const fighter1 = getFighter(weight_class, tableCells[1]);
      const fighter2 = getFighter(weight_class, tableCells[3]);
      const result = getText(tableCells[4]);
      let round = getText(tableCells[5]);
      // v. early fights which didn't have rounds
      if (!round) {
        round = 0;
      }
      const time = getText(tableCells[6]);
      if (fighter1 && fighter2) {
        fights.push(new Fight(eventId, fighter1, fighter2, weight_class, result, round, time));
      } else {
        console.log('Fighter 1 or 2 not present');
      }
    }
  }
  const pool = createPool();
  const existingWikiFighters = await getExistingWikiFighters(pool);

  for (const fight of fights) {
    const fighter1Id = await createFighterIfNotExistsAndGetId(pool, existingWikiFighters, fight.fighter1);
    const fighter2Id = await createFighterIfNotExistsAndGetId(pool, existingWikiFighters, fight.fighter2);
    await createFight(pool, fight, fighter1Id, fighter2Id);
  }

  pool.end();
}

async function createFighterIfNotExistsAndGetId(pool, existingWikiFighters, fighter) {
  const existingWikiFighter = existingWikiFighters.filter(f => f.wiki_url === fighter.wiki_url)[0];
  if (!existingWikiFighter) {
    const wikiFighter = await createFighterAndGetWikiFighter(pool, fighter);
    await createWikiFighter(pool, wikiFighter);
    return wikiFighter.fighter_id;
  } else {
    return existingWikiFighter.fighter_id;
  }
}

function getFighter(weight_class, tableCell) {
  const fighterUrlTag = tableCell.getElementsByTagName('a')[0];
  const fighterName = tableCell.innerText.replace('(c)', '').trim();
  let fighterUrl;
  if (!fighterUrlTag) {
    // best attempt to mark fighters as unique if they don't have a wiki URL
    // if 2 fighters both didn't have wiki page AND same name AND same weight class... then fuck that scenario, this is a hobby
    fighterUrl = fighterName + '_' + weight_class;
    console.log('No wiki url found for fighter: creating as ', fighterUrl);
  } else {
    fighterUrl = fighterUrlTag.getAttribute('href');
  }
  return new Fighter(fighterName, fighterUrl);
}

function getText(tableCell) {
  return tableCell.innerText.trim();
}

async function getExistingEventUrls(pool) {
  const query = 'SELECT event_url FROM events';
  const params = [];
  const eventUrlResults = await executePoolQuery(pool, query, params);
  return eventUrlResults.map(function (result) {
    return result.event_url;
  });
}

async function createEventAndGetId(pool, name, event_url, date) {
  const query = 'INSERT INTO events(name, event_url, date) VALUES ($1, $2, $3) returning id;';
  const params = [name, event_url, date];
  const eventResults = await executePoolQuery(pool, query, params);
  return eventResults[0].id;
}

async function getExistingWikiFighters(pool) {
  const query = 'SELECT fighter, wiki_url FROM wiki_fighter';
  const params = [];
  const wikiUrlResults = await executePoolQuery(pool, query, params);
  return wikiUrlResults.map(function (result) {
    return new WikiFighter(result.fighter, result.wiki_url);
  });
}

async function createFighterAndGetWikiFighter(pool, fighter) {
  const query = 'INSERT INTO fighters(name) VALUES ($1) RETURNING id';
  const params = [fighter.name];
  const created_fighter_results = await executePoolQuery(pool, query, params);
  const created_fighter_id = created_fighter_results[0].id;
  return new WikiFighter(created_fighter_id, fighter.wiki_url);
}

async function createWikiFighter(pool, wiki_fighter) {
  let query = 'INSERT INTO wiki_fighter(fighter, wiki_url) VALUES ($1, $2) RETURNING *';
  const params = [wiki_fighter.fighter_id, wiki_fighter.wiki_url];
  await executePoolQuery(pool, query, params);
}

async function createFight(pool, fight, fighter_1_id, fighter_2_id) {
  const query = 'INSERT INTO fights(fighter_1, fighter_2, weight_class, result, round, time, event) ' +
    'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id';
  const params = [fighter_1_id, fighter_2_id, fight.weightClass, fight.result, fight.round, fight.time, fight.eventId];
  await executePoolQuery(pool, query, params);
}

async function executePoolQuery(pool, query, params) {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        throw err;
      }
      client.query(query, params, async (err, result) => {
        release();
        if (err) {
          console.log()
          throw err;
        }
        resolve(result.rows);
      });
    });
  });
}

function createPool() {
  return new Pool({
    user: 'neilb',
    host: 'localhost',
    database: 'fighters_app',
    password: '',
    port: 5432,
    max: 20,
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
