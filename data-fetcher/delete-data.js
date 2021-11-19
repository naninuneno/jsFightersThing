const {Pool} = require("pg");

module.exports.deleteData = async function () {
  const pool = createPool();

  let results = await executePoolQuery(pool, 'DELETE FROM fights RETURNING *');
  console.log('Deleted ' + results.length + ' fights');

  results = await executePoolQuery(pool, 'DELETE FROM wiki_fighter RETURNING *');
  console.log('Deleted ' + results.length + ' wiki fighters');

  results = await executePoolQuery(pool, 'DELETE FROM fighters RETURNING *');
  console.log('Deleted ' + results.length + ' fighters');

  results = await executePoolQuery(pool, 'DELETE FROM events RETURNING *');
  console.log('Deleted ' + results.length + ' events');

  pool.end();
}

async function executePoolQuery(pool, query) {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, release) => {
      if (err) {
        throw err;
      }
      client.query(query, [], async (err, result) => {
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
