'use strict';
const { Proposal } = require('../models/proposal');
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
                            db.close();
                            reject(err);
                        }

                        // Step 4: Delete the corresponding row from PROPOSAL table
                        db.run('DELETE FROM PROPOSAL WHERE Title = ?', [proposal], (err) => {
                            if (err) {
                                db.close();
                                reject(err)
                            }

                            // Step 5: Close the database connection
                            db.close();
                            resolve('Succesful archiviation');
                        });
                    }
                );
            });
        });
    });
}
exports.getAvailableProposals = (studentId, filter) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ?';
        const dep = [studentId];
        if(filter.title){
            sql = sql.concat(' AND UPPER(P.title) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.title);
        }
        if(filter.supervisor){
            sql = sql.concat(' AND ( (UPPER(T.ID) LIKE UPPER("%" || ? || "%")) OR (UPPER(T.NAME) LIKE UPPER("%" || ? || "%")) OR (UPPER(T.SURNAME) LIKE UPPER("%" || ? || "%")))');
            
            dep.push(filter.supervisor);
            dep.push(filter.supervisor);
            dep.push(filter.supervisor);

        }
        if(filter.coSupervisor){
            sql = sql.concat(' AND UPPER(P.co_supervisor) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.coSupervisor);
        }
        if(filter.keywords){
            sql = sql.concat(' AND UPPER(P.keywords) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.keywords);
        }
        if(filter.type){
            sql = sql.concat(' AND UPPER(P.type) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.type);
        }
        if(filter.groups){
            sql = sql.concat(' AND UPPER(P.groups) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.groups);
        }
        if(filter.description){
            sql = sql.concat(' AND UPPER(P.description) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.description);
        }
        if(filter.reqKnowledge){
            sql = sql.concat(' AND UPPER(P.req_knowledge) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.reqKnowledge);
        }
        if(filter.notes){
            sql = sql.concat(' AND UPPER(P.notes) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.notes);
        }
        if(filter.expiration){
            sql = sql.concat(' AND UPPER(P.expiration) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.expiration);
        }
        if(filter.level){
            sql = sql.concat(' AND UPPER(P.level) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.level);
        }
        if(filter.degree){
            sql = sql.concat(' AND (UPPER(P.cds) LIKE UPPER("%" || ? || "%") OR UPPER(D.TITLE_DEGREE) LIKE UPPER("%" || ? || "%"))');
            dep.push(filter.degree);
            dep.push(filter.degree);
        }

        db.all(sql, dep, (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve([]); //if no proposals yet for that 
            }
            else {
                const proposals = rows.map(r => new Proposal(r.Title, r.ID, r.NAME, r.SURNAME, r.Co_supervisor, r.Keywords, r.Type, r.Groups, r.Description, r.Req_knowledge, r.Notes, r.Expiration, r.Level, r.CdS, r.TITLE_DEGREE));
                resolve(proposals);
            }
        });
    });
}