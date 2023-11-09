'use strict';
const { db } = require('./db');

exports.getStudentDataByProposal = (studentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM STUDENT WHERE ID=?';
        db.get(sql, [studentId], (err, row) => {
            if (err)
                reject(err);
            else if (row === undefined) {
                resolve({}); 
            }
            else {
                const studentData = {
                        studentId:row.ID,
                        surname: row.SURNAME,
                        name:row.NAME,
                        gender:row.GENDER,
                        nationality: row.NATIONALITY,
                        email: row.EMAIL,
                        code_degree: row.CODE_DEGREE,
                        enrollment: row.ENROLLMENT_YEAR
                };
                resolve(studentData);
            }
        });
    });
}