'use strict';

const sqlite = require('sqlite3');

// open the database
exports.db = new sqlite.Database('./theman.sqlite', (err) => {
  if (err) throw err;
});