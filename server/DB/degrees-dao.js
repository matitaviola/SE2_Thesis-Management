"use strict";
const { db } = require("./db");

exports.getDegreeByCode = (degreeCode) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM DEGREE WHERE COD_DEGREE=?";
    db.all(sql, [degreeCode], (err, row) => {
      if (err) reject(err);
      else if (row === undefined || row.length === 0) {
        resolve();
      } else {
        resolve(row);
      }
    });
  });
};
