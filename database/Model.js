/**
 * Optimistic locking for PG
 */

const { tableHash } = require("./annotations");
const { pool } = require("../index");

class Model {
  constructor(id) {
    this.tableName = this.constructor.name;
    this.model = tableHash[this.tableName];

    if (id) {
      return this.getById(id);
    }
  }

  async getById(id) {
    let res = await pool.query(
      `SELECT * FROM "${this.tableName}" WHERE id = $1::int`,
      [id]
    );
    if (res.rows[0]) {
      Object.keys(this.model.columns).forEach(k => {
        this[k] = res.rows[0][k];
      });
      return this;
    }
  }

  async save() {
    // These are all the keys that need to be saved
    const colKeysToSave = Object.keys(this.model.columns).filter(
      k => k !== "id" && typeof this[k] !== "undefined"
    );
    const colValsToSave = colKeysToSave.map(k => this[k]);

    // If there's an id, we're updating the model in the DB
    if (this.id) {
      let updateStr = `UPDATE "${this.tableName}" SET `;
      updateStr += colKeysToSave
        .map(
          (k, i) => `"${k}" = $${i + 1}::` + this.model.columns[k].driverType
        )
        .join(",");
      updateStr += ` WHERE id = $${colKeysToSave.length + 1}::int`;
      colValsToSave.push(this.id);
      await pool.query(updateStr, colValsToSave);
    } else {
      // If there's no id, we're inserting into the database
      const colStr = colKeysToSave.map(k => `"${k}"`).join(",");
      const valStr = colKeysToSave
        .map((k, i) => `$${i + 1}::` + this.model.columns[k].driverType)
        .join(",");
      let insertStr = `INSERT INTO "${this.tableName}" (${colStr}) VALUES (${valStr})`;
      console.log(insertStr);
      await pool.query(insertStr, colValsToSave);
    }
  }
}

module.exports = Model;
