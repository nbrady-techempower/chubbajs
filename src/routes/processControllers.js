/**
 * Loads all the controller files so their annotations can be processed
 */
import fs from "fs";
import path from "path";
const chalk = require("chalk");

export default config => {
  console.log(chalk.blue("===> Loading controllers..."));
  const pathToControllers = config.projectRoot
    ? path.join(config.projectRoot, "controllers")
    : path.join(__dirname, "../../../controllers");
  fs.readdirSync(pathToControllers).map(file =>
    require(path.join(pathToControllers, file))
  );

  console.log(chalk.blue("===> Done."));
};
