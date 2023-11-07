'use strict';
const { db } = require('./db');

exports.getProposalByProfessor = (professorId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM PROPOSAL WHERE SUPERVISOR=?';
        db.get(sql, [proposalId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined){
                resolve({}); //if no applications yet for that 
            }
            else {
                const applications = rows.map( r => 
                    new { id:r.id
                    //Insert here the other fields for the application
                    }
                );
                resolve(applications);
            }
        });
    });
}