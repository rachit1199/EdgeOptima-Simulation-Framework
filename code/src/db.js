const mysql = require("mysql2");
const config = require("./config");

const db = mysql.createConnection(config.db);

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});

module.exports = db;
