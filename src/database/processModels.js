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
  try {
    fs.readdirSync(pathToModels).forEach(file => {
      if (file.match(/\.js$/)) {
        require(path.join(pathToModels, file))
      }
    });
  } catch(e) {
    console.log(chalk.red(`Problem loading models from path: ${pathToModels}`));
    console.log(e);
    process.exit();
  }
  console.log(chalk.blue("===> Done."));
};
