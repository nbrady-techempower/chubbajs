/**
 * Copy this to `config.development.js` and edit the values below
 */
module.exports = {
  jwtSecret: "Change this",
  port: 8888,
  database: {
    engine: "postgres",
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "chubbajs",
    port: 5432,
    // Will check models against current scheme and perform migrations
    migrations: true,
  },
  emailVerificationLink: "http://localhost:3000/email-verification",
  passwordResetLink: "http://localhost:3000/password-reset",
  awsConfig: {
    region: "us-west-2",
    credentials: {
      accessKeyId: "change this",
      secretAccessKey: "change this"
    }
  },
  stripe: {
    secretKey: "sk_test_k"
  }
};
