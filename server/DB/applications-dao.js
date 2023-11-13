'use strict';
const { db } = require('./db');

exports.getApplicationsByProposal = (proposal) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=?';
        db.all(sql, [proposal.title], (err, rows) => {
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

exports.getApplicationsByStudent = (studentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM APPLICATION WHERE STUDENT_ID=?';
        db.all(sql, [studentId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve({}); //if no applications yet for that 
            }
            else {
                const applications = rows.map( r => {
                    return { 
                        studentId:r.Student_ID,
                        proposal: r.Proposal,
                        status:r.Status
                        //Insert here the other fields for the application
                    };
                });
                resolve(applications);
            }
        });
    });
}

exports.setApplicationStatus = (proposal, studentId, status) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal = ? AND Student_Id = ? AND Status = "Pending"';
        db.run(sql, [String(status), proposal, studentId], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve({ error: 'The application is not in Pending status or does not exist' });
            } else {
                resolve({ success: true });
            }
        });
    });
}

