"use strict";
const { db } = require("./db");

exports.getSupervisorById = (supervisorId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM TEACHER WHERE ID=?";
    db.get(sql, [supervisorId], (err, row) => {
      if (err) reject(err);
      else if(row) {
        resolve(row);
      }else{
        reject(new Error(`No such teacher with id:${supervisorId}`)); 
      }
    });
  });
};

exports.getCoSupervisorsList = (professorId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT ID, SURNAME, NAME FROM TEACHER WHERE ID != ?";
    db.all(sql, [professorId], (err, rows) => {
      if (err) reject(err);
      else if (rows === undefined || rows.length === 0) {
        reject('No cosupervisors available');
      } else {
        //I use map instead of directly getting them like that from the query because group is a reserved keyword for sqlite
        const coSup = rows.map(r => {return {id:r.ID, name:r.NAME, surname:r.SURNAME}});
        resolve(coSup);
      }
    });
  });
}
/* still misisng a getExternalCosupList*/

