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
  try {
    fs.readdirSync(pathToControllers).forEach(file =>
      require(path.join(pathToControllers, file))
    );
  } catch(e) {
    console.log(chalk.red(`Problem loading controllers from path: ${pathToControllers}`));
    console.log(e);
    process.exit();
  }

  console.log(chalk.blue("===> Done."));
};
