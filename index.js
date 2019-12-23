const projectRoot = "";

const path = require("path");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const chalk = require("chalk");
const express = require("express");

console.log(chalk.magenta("Thank you for choosing ChubbaJS"));

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

console.log(chalk.blue("===> Establishing database connection..."));
// Create the database pool
let pool;

module.exports = async function(config) {
  try {
    pool = new Pool({
      connectionString: `postgres://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}`
    });
  } catch (e) {
    console.log(chalk.red("Database connection failed."));
    console.log(chalk.red(e));
  }
  console.log(chalk.blue("===> Done."));

  /** Load all of our Models / Run migrations **/
  require("./database/migrations")(config, pool);

  const context = { app, pool, config };
  return context;
};
