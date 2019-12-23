/**
 * Loads all the model files so their annotations can be processed
 */
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = () => {
  console.log(chalk.blue("===> Loading models..."));
  fs.readdirSync(path.join(__dirname, "../models"))
    .map((file) => require(path.join(__dirname, "../models", file)));
};
