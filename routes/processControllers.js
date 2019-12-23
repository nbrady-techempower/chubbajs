/**
 * Loads all the controller files so their annotations can be processed
 */
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = config => {
  console.log(chalk.blue("===> Loading controllers..."));
  const pathToControllers = config.projectRoot
    ? path.join(config.projectRoot, "controllers")
    : path.join(__dirname, "../../../models");
  fs.readdirSync(pathToControllers).map(file =>
    require(path.join(pathToControllers, file))
  );

  console.log(chalk.blue("===> Done."));
};
