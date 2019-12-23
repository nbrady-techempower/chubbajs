/**
 * Loads all the model files so their annotations can be processed
 */
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = config => {
  console.log(chalk.blue("===> Loading models..."));
  const pathToModels = config.projectRoot
    ? path.join(config.projectRoot, "models")
    : path.join(__dirname, "../../../models");
  fs.readdirSync(pathToModels).map(file =>
    require(path.join(pathToModels, file))
  );
  console.log(chalk.blue("===> Done."));
};
