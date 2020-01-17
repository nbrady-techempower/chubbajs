/**
 * Optimistic locking for PG
 */

import { pool } from "../index";
import _annotations from "./annotations";

const { tableHash } = _annotations;

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

    /**
     * If an id for this model already exists, we're using an UPDATE statement by
     * mapping over the existing keys and concat'ing a single UPDATE statement. We're still
     * using pg's type checking mechanism to avoid SQL injections.
     */
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
      /**
       * If there's no id for this model instance, we'll first INSERT it and then return the
       * new id and add it to the instance.
       * @type {string}
       */
      const colStr = colKeysToSave.map(k => `"${k}"`).join(",");
      const valStr = colKeysToSave
        .map((k, i) => `$${i + 1}::` + this.model.columns[k].driverType)
        .join(",");
      const insertStr = `INSERT INTO "${this.tableName}" (${colStr}) VALUES (${valStr}) RETURNING id`;
      const result = await pool.query(insertStr, colValsToSave);

      this.id = result.rows[0].id;
    }
  }
}

export default Model;
