"use strict";
const { db } = require("./db");

exports.getDegreeByCode = (degreeCode) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM DEGREE WHERE COD_DEGREE=?";
    db.all(sql, [degreeCode], (err, row) => {
      if (err) reject(err);
      else if (row === undefined || row.length === 0) {
        reject(new Error(`No such degree with code:${degreeCode}`));
      } else {
        resolve(row);
      }
    });
  });
};

exports.getAll = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM DEGREE";
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else if (rows === undefined || rows.length === 0) {
        resolve([]);
      } else {
        resolve(rows);
      }
    });
  });
}
