'use strict';
const { db } = require('./db');

exports.getActiveApplicationsByProposal = (proposal) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=? AND Status=?';
        db.all(sql, [proposal.title, "Pending"], (err, rows) => {
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
                //If he has no pending applications maybe he has an assigned one
                db.get("SELECT * FROM ARCHIVED_PROPOSAL WHERE Thesist=?",[studentId], (err, row) => {
                    if (err)
                        reject(err);
                    else if (row === undefined || row.length === 0) {
                        //if no applications yet for that 
                        resolve([]);
                    } else {
                        resolve([{ 
                            studentId:row.Thesist,
                            proposal: row.Title,
                            status:"Accepted"
                            //Insert here the other fields for the application
                        }])
                    }
                });
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
/*
exports.autoRejectApplication = (proposal, studentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE APPLICATION SET STATUS = "Rejected" WHERE PROPOSAL = ? AND STATUS = "Pending" AND STUDENT_ID != ?';
        db.run(sql, [proposal, studentId], (err) => {
            if (err)
                reject(err);
            else
                resolve({success:true}); 
        });
    });
}
*/
exports.autoDeleteApplication = (studentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM APPLICATION WHERE STUDENT_ID = ? AND STATUS = "Pending"';
        db.run(sql, [studentId], (err) => {
            if (err)
                reject(err);
            else
                resolve({success:true}); 
        });
    });
}

exports.createApplication = (proposalId, studentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO APPLICATION (STUDENT_ID, PROPOSAL, STATUS) VALUES (?, ?, "Pending")';
        db.run(sql, [studentId, proposalId], function (err) {
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') reject('Duplicate title');
                reject(err);
            } else {
                resolve({success:true}); 
            }
        });
    });
}
