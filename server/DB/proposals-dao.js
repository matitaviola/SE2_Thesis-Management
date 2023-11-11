'use strict';
const { db } = require('./db');

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
    // Step 1: Retrieve data from PROPOSAL table
    db.get('SELECT * FROM PROPOSAL WHERE Title = ?', [proposal], (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        if (!row) {
            console.log('Proposal not found.');
            db.close();
            return;
        }

        // Step 2: Check if student has an application for that proposal
        db.get('SELECT * FROM APPLICATION WHERE Proposal = ? AND Student_ID = ?', [proposal, studentId], (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }
    
            if (!row) {
                console.log('Proposal not found.');
                db.close();
                return;
            }
            // Step 3: Insert data into ARCHIVED_PROPOSAL table
            db.run(
                'INSERT INTO ARCHIVED_PROPOSAL VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    row.Title,
                    row.Supervisor,
                    row.Co_supervisor,
                    row.Keywords,
                    row.Type,
                    row.Groups,
                    row.Description,
                    row.Req_knowledge,
                    row.Notes,
                    row.Expiration,
                    row.Level,
                    row.CdS,
                    studentId, // Set Thesist with the provided studentId
                ],
                (err) => {
                    if (err) {
                        console.error(err.message);
                        db.close();
                        return;
                    }

                    // Step 4: Delete the corresponding row from PROPOSAL table
                    db.run('DELETE FROM PROPOSAL WHERE Title = ?', [proposal], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('Proposal successfully archived and deleted.');
                        }

                        // Step 4: Close the database connection
                        db.close();
                    });
                }
            );
        });
    });
}