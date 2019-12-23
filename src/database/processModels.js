/**
 * Loads all the model files so their annotations can be processed
 */
import fs from "fs";
import path from "path";
const chalk = require("chalk");

export default config => {
  console.log(chalk.blue("===> Loading models..."));
  const pathToModels = config.projectRoot
    ? path.join(config.projectRoot, "models")
    : path.join(__dirname, "../../../models");
  fs.readdirSync(pathToModels).map(file =>
    require(path.join(pathToModels, file))
  );
  console.log(chalk.blue("===> Done."));
};
