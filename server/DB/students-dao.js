'use strict';
const { db } = require('./db');

exports.getStudentData = (studentId) => {
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

exports.getCarreerByStudent = (studentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM CAREER WHERE ID=?';
        db.all(sql, [studentId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve({}); //if no applications yet for that 
            }
            else {
                const applications = rows.map( r => {
                    return { 
                        code_c:r.COD_COURSE,
                        title_c: proposal.TITLE_COURSE,
                        cfu:r.CFU,
                        grade:r.GRADE,
                        date:r.DATE
                    };
                });
                resolve(applications);
            }
        });
    });
}