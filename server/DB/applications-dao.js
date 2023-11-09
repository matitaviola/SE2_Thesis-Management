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
