'use strict';
const { db } = require('./db');

exports.getApplicationsForProposal = (proposalId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM APPLICATION WHERE PROPOSAL_ID=?';
        db.get(sql, [proposalId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined){
                resolve({}); //if no applications yet for that 
            }
            else {
                const applications = rows.map( r => 
                    new { studentId:r.STUDENT_ID
                    //Insert here the other fields for the application
                    }
                );
                resolve(applications);
            }
        });
    });
}