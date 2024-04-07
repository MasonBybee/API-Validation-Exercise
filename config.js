/** Common config for bookstore. */
require("dotenv").config();
const DBLOGIN = process.env.DBLOGIN;

let DB_URI = `postgresql://${DBLOGIN}`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/books-test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
}

module.exports = { DB_URI };
