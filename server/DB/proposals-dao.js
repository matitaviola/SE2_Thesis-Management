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