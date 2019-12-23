const tableHash = {};

function createTableInHash(tableName) {
  if (!tableHash[tableName]) {
    tableHash[tableName] = {
      columns: {
      }
    }
  }
}

function createColumnInHash(tableName, colName) {
  createTableInHash(tableName);
  if (!tableHash[tableName].columns[colName]) {
    tableHash[tableName].columns[colName] = {
      primaryKey: false,
      notNull: false,
      isNullable: "YES",
      uIndex: false,
      index: false,
      colType: "",
      defaultValue: null
    }
  }
  return tableHash[tableName].columns[colName];
}

function primaryKey(target, key, descriptor) {
  const col = createColumnInHash(target.constructor.name, key);
  col.primaryKey = true;
  col.colType = "SERIAL PRIMARY KEY";
  col.udtName = "int4";
  col.notNull = true;
  col.isNullable = "NO";
  col.driverType = "int";
}

function notNull(target, key, descriptor) {
  const col = createColumnInHash(target.constructor.name, key);
  col.notNull = true;
  col.isNullable = "NO";
}

function int(target, key, descriptor) {
  const col = createColumnInHash(target.constructor.name, key);
  col.colType = "INT";
  col.udtName = "int4";
  col.driverType = "int";
}

function timestamp(target, key, descriptor) {
  const col = createColumnInHash(target.constructor.name, key);
  col.colType = "TIMESTAMP";
  col.udtName = "timestamp";
  col.driverType = "timestamp";
}

function boolean(target, key, descriptor) {
  const col = createColumnInHash(target.constructor.name, key);
  col.colType = "BOOLEAN";
  col.udtName = "bool";
  col.driverType = "boolean";
}

function varChar(value) {
  return function _(target,key, descriptor) {
    const col = createColumnInHash(target.constructor.name, key);
    col.colType = `VARCHAR(${value})`;
    col.udtName = "varchar";
    col.characterMaximumLength = value;
    col.driverType = "text";
  }
}


function defaultValue(value) {
  return function _(target,key, descriptor) {
    const col = createColumnInHash(target.constructor.name, key);
    col.defaultValue = ('' + value).toLowerCase();
  }
}

module.exports = {
  primaryKey,
  notNull,
  varChar,
  int,
  timestamp,
  boolean,
  defaultValue,
  tableHash
};
