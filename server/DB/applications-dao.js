'use strict';
const { db } = require('./db');

exports.getApplicationsByProposal = (proposal) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM APPLICATION WHERE PROPOSAL_ID=?';
        db.all(sql, [proposal.id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve({}); //if no applications yet for that 
            }
            else {
                const applications = rows.map( r => {
                    return { 
                        studentId:r.Student_ID,
                        proposal: proposal.title,
                        status:r.Status
                        //Insert here the other fields for the application
                    };
                });
                resolve(applications);
            }
        });
    });
}

exports.getStudentDataByProposal = (student) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM STUDENT WHERE ID=?';
        db.all(sql, [student.id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve({}); 
            }
            else {
                const studentData = rows.map( r => {
                    return { 
                        //studentId:r.ID,
                        surname: r.surname,
                        name:r.name,
                        gender:r.gender,
                        nationality: r.nationality,
                        email: r.email,
                        code_degree: r.code_degree,
                        enrollment: r.enrollment
                    };
                });
                resolve(studentData);
            }
        });
    });
}