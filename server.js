// const config = {
//   database: {
//     host: "",
//     user: "",
//     password: "",
//     database: "",
//     port: 0,
//     // Will check models against current scheme and perform migrations
//     migrations: true
//   }
// };

const { Pool } = require("pg");
const chalk = require("chalk");
const config = require("./config");

const pool = new Pool({
  connectionString: "postgres://postgres:Mosbius6667!@localhost:5432/chubbajs"
});

const context = { pool, config };

module.exports = { context, pool };

console.log(chalk.magenta("Thank you for choosing ChubbaJS"));

/** Load all of our Models / Run migrations **/

require("./database/migrations");
