'use strict';
const { db } = require('./db');

exports.getActiveProposalsByProfessor = (professorId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status=?';
        db.all(sql, [professorId, "Active"], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve({}); //if no applications yet for that 
            }
            else {
                const proposals = rows.map( r => {
                    return { 
                        title:r.Title
                    //Insert here the other fields for the application
                    }
                });
                resolve(proposals);
            }
        });
    });
}

exports.archiveProposal = (proposal, studentId) => {
    return new Promise((resolve, reject) => {
        // Step 1: Retrieve data from PROPOSAL table
        db.get('SELECT * FROM PROPOSAL WHERE Title = ?', [proposal], (err, row) => {
            if (err || !row) {
                reject(err? err : 'Proposal not found.');
            }

            // Step 2: Check if student has an application for that proposal
            db.get('SELECT * FROM APPLICATION WHERE Proposal = ? AND Student_ID = ?', [proposal, studentId], (err, row) => {
                if (err || !row) {
                    reject(err? err : 'Application not found.')
                }
        
                // Step 3: Update Proposal table
                db.run(
                    'UPDATE PROPOSAL SET Status = "Archived", Thesist = ? WHERE Title = ? ',
                    [
                        studentId, // Set Thesist with the provided studentId
                        proposal
                    ],
                    (err) => {
                        if (err) {
                            reject(err);
                        }

                        // Step 4: Close the database connection
                        resolve({success:true});
                });
            });
        });
    });
}

exports.getProposalsByProfessor = (professorId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM PROPOSAL WHERE Supervisor=?';
        db.all(sql, [professorId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve({}); //if no applications yet for that 
            }
            else {
                const proposals = rows.map( r => {
                    return { id:r.ID,
                        title:r.Title
                    //Insert here the other fields for the application
                    }
                });
                resolve(proposals);
            }
        });
    });
}

exports.deleteProposal = (proposal) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM PROPOSAL WHERE ID = ?';
        db.run(sql, [proposal], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                resolve({ error: 'Proposal not found' });
            } else {
                resolve({ success: true });
            }
        });
    });
}