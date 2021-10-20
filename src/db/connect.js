// imports
const mongoose = require("mongoose");
const { config } = require("../config");

// db connection
function connect() {
  return mongoose.connect(config.db.url);
}

module.exports = connect;
