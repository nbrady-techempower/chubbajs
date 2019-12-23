const chalk = require("chalk");
import processModels from "./processModels";
import _annotations from "./annotations";

const { tableHash } = _annotations;

export default function(config, pool) {
  processModels(config);

  function createColSqlStr(tableName, colName) {
    const col = tableHash[tableName].columns[colName];
    let sqlStr = `"${colName}" ${col.colType}`;
    if (col.notNull || col.primaryKey) {
      sqlStr += ` NOT NULL`;
    }
    if (col.defaultValue !== null) {
      sqlStr += ` DEFAULT ${col.defaultValue}`;
    }
    return sqlStr;
  }

  function createTable(tableName) {
    console.log(`Creating "${tableName}" table.`);
    let sqlStr = `CREATE TABLE "${tableName}" ( `;

    const colNames = Object.keys(tableHash[tableName].columns);
    colNames.forEach((colName, i) => {
      sqlStr += createColSqlStr(tableName, colName);
      if (i < colNames.length - 1) {
        sqlStr += ", ";
      }
    });
    sqlStr += " );";
    pool.query(sqlStr);
  }

  async function alterTable(tableName) {
    const res = await pool.query(`
    SELECT * FROM information_schema.columns
    WHERE table_schema = 'public' and table_name = '${tableName}';
  `);

    const colHash = {};
    res.rows.forEach(col => {
      colHash[col.column_name] = col;
    });
    const currColumns = Object.keys(colHash);

    const colNames = Object.keys(tableHash[tableName].columns);
    for (let colName of colNames) {
      if (currColumns.includes(colName)) {
        // console.log(`Column "${colName}" already exists in Table "${tableName}"`);
        const modelCol = tableHash[tableName].columns[colName];
        const dbCol = colHash[colName];
        // Check for type change
        if (modelCol.udtName !== dbCol.udt_name) {
          console.log(`"${tableName}"."${colName}" type has changed.`);
          let sqlStr = `ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" `;
          sqlStr += `TYPE ${modelCol.colType}`;
          await pool.query(sqlStr);
        }
        // Check for nullable change
        if (modelCol.isNullable !== dbCol.is_nullable) {
          console.log(`"${tableName}"."${colName}" nullable has changed.`);
          let sqlStr = `ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" `;
          sqlStr += modelCol.notNull ? "SET NOT NULL" : "DROP NOT NULL";
          await pool.query(sqlStr);
        }
        // Check for default value change
        if (
          !modelCol.primaryKey &&
          modelCol.defaultValue !== dbCol.column_default
        ) {
          console.log(`"${tableName}"."${colName}" default value changed.`);
          let sqlStr = `ALTER TABLE "${tableName}" ALTER COLUMN "${colName}" `;
          sqlStr += `SET DEFAULT ${modelCol.defaultValue}`;
          await pool.query(sqlStr);
        }
      } else {
        let sqlStr = `ALTER TABLE "${tableName}" ADD ${createColSqlStr(
          tableName,
          colName
        )}`;
        await pool.query(sqlStr);
      }
    }
  }

  async function runMigrations() {
    // Get all the tables in the database
    const res = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public';
  `);

    const currTables = res.rows.map(table => table.table_name);

    for (let tableName in tableHash) {
      if (currTables.includes(tableName)) {
        console.log(`Table "${tableName}" already exists. Checking columns.`);
        await alterTable(tableName);
      } else {
        createTable(tableName);
      }
    }
    console.log(chalk.blue("===> Done."));
  }

  if (config.database.migrations) {
    console.log(chalk.blue("===> Starting migrations..."));
    runMigrations();
  } else {
    console.log(chalk.blue("===> Skipping migrations... Done."));
  }
}
