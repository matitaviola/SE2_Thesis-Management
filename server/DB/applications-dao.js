'use strict';
const { db } = require('./db');

//return applications that have yet to be avaluated (accepted/rejected)
exports.getActiveApplicationsByProposal = (proposal) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM APPLICATION WHERE Proposal_ID=? AND Status="Pending"';
        db.all(sql, [proposal.id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve([]); //if no applications yet for that 
            }
            else {
                const applications = rows.map( r => {
                    return { 
                        id: r.id,
                        studentId:r.Student_ID,
                        proposal: r.Proposal_ID,
                        title: proposal.title,
                        status:r.Status
                        //Insert here the other fields for the application
                    };
                });
                resolve(applications);
            }
        });
    });
}

//return alll the applications of a given student, with any status
exports.getApplicationsByStudent = (studentId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM APPLICATION WHERE STUDENT_ID=?';
        db.all(sql, [studentId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve([]);
            }
            else {
                const applications = rows.map( r => {
                    return { 
                        id: r.id,
                        studentId:r.Student_ID,
                        proposal: (r.Status === 'Accepted' || r.Status === 'Cancelled')? r.Archived_Proposal_ID : r.Proposal_ID,
                        title: r.Proposal,
                        status:r.Status
                        //Insert here the other fields for the application
                    };
                });
                resolve(applications);
            }
        });
    });
}

//changes an application status 
exports.setApplicationStatus = (proposal, studentId, status) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal_ID = ? AND Student_ID = ?';
        db.run(sql, [String(status), proposal, studentId], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve({ error: 'The application does not exist' });
            } else {
                resolve({ success: true });
            }
        });
    });
}

//creates a new application for a proposal for the given student
exports.createApplication = (proposalId, studentId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM PROPOSAL WHERE Id=?";
        const sqlInsert = 'INSERT INTO APPLICATION (STUDENT_ID, PROPOSAL_ID, PROPOSAL, ARCHIVED_PROPOSAL_ID, STATUS) VALUES (?, ?, ?, ?, "Pending")';
        db.get(sql, [proposalId], function (err, row) {
            if (err) {
                reject(err);
            } else if (row){
                db.run(sqlInsert, [studentId, proposalId, row.Title, null], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({success:true}); 
                    }
                });
            }else{
                reject(`Error in creating an application: no such proposal ${proposalId}`);
            }
        });
    });
}

//creates a new application for a proposal for the given student
exports.getLastId = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT seq from sqlite_sequence where name="APPLICATION"';
        db.get(sql, [], function (err, row) {
            if (err) {
                reject(err);
            } else {
                resolve(row.seq)
            }
        });
    });
}
