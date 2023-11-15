"use strict";
const { db } = require("./db");

exports.getSupervisorById = (supervisorId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM TEACHER WHERE ID=?";
    db.all(sql, [supervisorId], (err, row) => {
      if (err) reject(err);
      else if (row === undefined || row.length === 0) {
        resolve();
      } else {
        resolve(row);
      }
    });
  });
};