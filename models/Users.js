const { varChar, timestamp, boolean, primaryKey, defaultValue, notNull, int } = require("../database/annotations");
const Model = require("../database/Model");

class User extends Model {

  constructor(id) {
    super(id);
  }

  @primaryKey
  id;

  @varChar(50)
  @notNull
  username = "default";

  @varChar(200)
  @notNull
  password;

  @varChar(200)
  @notNull
  email = "me@my.com";

  @boolean
  @defaultValue(false)
  @notNull
  emailValidated;

  @varChar(200)
  emailToken;

  @timestamp
  @defaultValue("NOW()")
  emailTokenExpiration;

  @timestamp
  @defaultValue("NOW()")
  lastLogin;

  @int
  @defaultValue(0)
  @notNull
  role;

}

module.exports = User;
