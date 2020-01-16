import path from "path";
import bodyParser from "body-parser";
const { Pool } = require("pg");
const chalk = require("chalk");
const express = require("express");
import database from "./database";
import routes from "./routes";
import loadModels from "./database/migrations";
import loadControllers from "./routes/processControllers";

console.log(chalk.magenta("Thank you for choosing ChubbaJS"));

const app = express();

const use = app.use;

console.log(chalk.blue("===> Establishing database connection..."));
// Create the database pool
let pool;
const context = {
  app
};

async function configure(config) {
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
  loadModels(config, pool);

  /** Load all of our Controllers **/
  loadControllers(config);

  context.pool = pool;
  context.config = config;
  return context;
}

export { configure, use, database, routes, pool, context };
