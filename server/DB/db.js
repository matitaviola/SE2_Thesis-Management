'use strict';

const sqlite = require('sqlite3');

// open the database
exports.db = new sqlite.Database('./DB/theman.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the database');

    // Enable foreign key constraints
    this.db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('Error enabling foreign key constraints', pragmaErr.message);
      } else {
        console.log('Foreign key constraints enabled');
      }
    });
  }
});