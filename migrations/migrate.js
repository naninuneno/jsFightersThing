// import {migrate} from "postgres-migrations"
const migrator = require('postgres-migrations');

// TODO move to env variables or something better
async function runMigrations() {
  const dbConfig = {
    database: "fighters_app",
    user: "neilb",
    password: "",
    host: "localhost",
    port: 5432,

    // Default: false for backwards-compatibility
    // This might change!
    ensureDatabaseExists: true,

    // Default: "postgres"
    // Used when checking/creating "database-name"
    defaultDatabase: "postgres"
  };

  const config = {
    logger: console.log
  }

  await migrator.migrate(dbConfig, "migrations", config);
}

runMigrations();
