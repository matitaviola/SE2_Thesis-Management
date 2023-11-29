'use strict';
const { Proposal } = require('../models/proposal');
const { db } = require('./db');

exports.getActiveProposalsByProfessor = (professorId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM PROPOSAL WHERE Supervisor=?';
        db.all(sql, [professorId], (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve([]); //if no applications yet for that 
            }
            else {
                const proposals = rows.map( r => {
                    return {
                        id: r.Id, 
                        title:r.Title,
                        co_supervisor:r.Co_Supervisor,
                        keywords:r.Keywords,
                        type:r.Type,
                        group:r.Groups,
                        description:r.Description,
                        knowledge:r.Req_knowledge,
                        notes:r.Notes,
                        expiration:r.Expiration,
                        level:r.Level,
                        cds:r.CdS
                    //Inserted all the fields
                    }
                });
                resolve(proposals);
            }
        });
    });
}

exports.archiveProposal = (proposalId, studentId) => {
    return new Promise((resolve, reject) => {
        // Step 1: Retrieve data from PROPOSAL table
        db.get('SELECT * FROM PROPOSAL WHERE Id = ?', [proposalId], (err, row) => {
            if (err) {
                reject(err);
            }else if (row){
                const originalProposal = row;
                // Step 2: Check if student has an application for that proposal
                db.get('SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?', [proposalId, studentId], (err, row) => {
                    if (err) {
                        reject(err)
                    }else if (row){
                        // Step 3: Add the Proposal to the archived ones and delete it from the old one, set the application as accepted
                        //There's a trigger to update the remaining proposals
                        const insertSQL = "INSERT INTO ARCHIVED_PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status, Thesist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        const deleteSQL = "DELETE FROM PROPOSAL WHERE Id=?";
                        const updateSQL = "UPDATE APPLICATION SET Archived_Proposal_ID=?, Status='Accepted' WHERE Proposal_ID=? AND Student_ID=?";
                        const updateCancelledSQL = "UPDATE APPLICATION SET Archived_Proposal_ID=?, Status='Cancelled' WHERE Proposal_ID=? AND Status!='Accepted'"
                        // Begin a transaction
                        db.serialize(() => {
                            db.run("BEGIN TRANSACTION");

                            // Execute the first SQL statement
                            db.run(insertSQL, [
                                proposalId,
                                originalProposal.Title,
                                originalProposal.Supervisor,
                                originalProposal.Co_supervisor,
                                originalProposal.Keywords,
                                originalProposal.Type,
                                originalProposal.Groups,
                                originalProposal.Description,
                                originalProposal.Req_knowledge,
                                originalProposal.Notes,
                                originalProposal.Expiration,
                                originalProposal.Level,
                                originalProposal.CdS,
                                "Archived",
                                studentId
                            ], (err) => {
                                if (err) {
                                    // Roll back the transaction if an error occurs
                                    db.run("ROLLBACK");
                                    reject(err);
                                }

                                // Execute the second SQL statement
                                db.run(updateSQL, [proposalId, proposalId, studentId], (err) => {
                                    if (err) {
                                        // Roll back the transaction if an error occurs
                                        db.run("ROLLBACK");
                                        reject(err);
                                    }
                                        // Execute the third SQL statement
                                        db.run(updateCancelledSQL, [proposalId, proposalId], (err) => {
                                            if (err) {
                                                // Roll back the transaction if an error occurs
                                                db.run("ROLLBACK");
                                                reject(err);
                                            }

                                            db.run(deleteSQL, [proposalId], (err) => {
                                                if(err){
                                                    db.run("ROLLBACK");
                                                    reject(err);
                                                }

                                                // Commit the transaction if all statements succeed
                                                db.run("COMMIT");
                                                resolve({ success: true });
                                            })
                                    });
                                });
                            });
                        });
                    }else{
                        reject('Application not found.');
                    }
                });
            }else{
                reject('Proposal not found.');
            }
        });
    });
}

exports.archiveProposalWithoutApplication = (proposalId) => {
    return new Promise((resolve, reject) => {
        // Step 1: Retrieve data from PROPOSAL table
        db.get('SELECT * FROM PROPOSAL WHERE Id = ?', [proposalId], (err, row) => {
            if (err) {
                reject(err);
            }else if (row){
                const originalProposal = row;
                // Step 2: Add the Proposal to the archived ones and delete it from the old one
                //There's a trigger to update the remaining proposals
                const insertSQL = "INSERT INTO ARCHIVED_PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status, Thesist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                const deleteSQL = "DELETE FROM PROPOSAL WHERE Id=?";
                // Begin a transaction
                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");

                    // Execute the first SQL statement
                    db.run(insertSQL, [
                        proposalId,
                        originalProposal.Title,
                        originalProposal.Supervisor,
                        originalProposal.Co_supervisor,
                        originalProposal.Keywords,
                        originalProposal.Type,
                        originalProposal.Groups,
                        originalProposal.Description,
                        originalProposal.Req_knowledge,
                        originalProposal.Notes,
                        originalProposal.Expiration,
                        originalProposal.Level,
                        originalProposal.CdS,
                        "Archived",
                        null
                    ], (err) => {
                        if (err) {
                            // Roll back the transaction if an error occurs
                            db.run("ROLLBACK");
                            reject(err);
                        }
                        db.run(deleteSQL, [proposalId], (err) => {
                            if(err){
                                db.run("ROLLBACK");
                                reject(err);
                            }

                            // Commit the transaction if all statements succeed
                            db.run("COMMIT");
                            resolve({ success: true });
                        });
                    });
                });
            } else{
                reject('Proposal not found.');
            }
        });
    });
}

exports.getAvailableProposals = (studentId, filter, order) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?';
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
            sql = sql.concat(' AND P.expiration <=  ?');
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
        if(order && order.field){
            const traslationMap = {
                title : ' ORDER BY P.title',
                supervisor: ' ORDER BY T.SURNAME',
                coSupervisor: ' ORDER BY P.co_supervisor',
                keywords: ' ORDER BY P.keywords', 
                type: ' ORDER BY P.type',
                groups: ' ORDER BY P.groups',
                description: ' ORDER BY P.description',
                reqKnowledge: ' ORDER BY P.req_knowledge',
                notes: ' ORDER BY P.notes',
                expiration: ' ORDER BY P.expiration', 
                level: ' ORDER BY P.level', 
                degree: ' ORDER BY D.TITLE_DEGREE'
            }
            sql = sql.concat(traslationMap[order.field]);
            if(order.direction === false){
                sql = sql.concat(' DESC');
            }
        }
        db.all(sql, dep, (err, rows) => {
            if (err)
                reject(err);
            else if (rows === undefined || rows.length === 0) {
                resolve([]); //if no proposals yet for that 
            }
            else {
                const proposals = rows.map(r => {
                    return new Proposal(r.pID, r.Title, r.Supervisor, r.tName, r.tSurname, r.Co_supervisor, r.Keywords, r.Type, r.Groups, r.Description, r.Req_knowledge, r.Notes, r.Expiration, r.Level, r.CdS, r.TITLE_DEGREE)
                });
                resolve(proposals);
            }
        });
    });
}

exports.addProposal = (body) => {
  const {
    title,
    supervisor,
    co_supervisor,
    keywords,
    type,
    groups,
    description,
    req_knowledge,
    notes,
    expiration,
    level,
    cds,
  } = body;
  return new Promise((resolve, reject) => {
    const sql =
      "insert into proposal (Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS ) values (?,?,?,?,?,?,?,?,?,?,?,?)";
    db.run(
      sql,
      [
        title,
        supervisor,
        co_supervisor,
        keywords,
        type,
        groups,
        description,
        req_knowledge,
        notes,
        expiration,
        level,
        cds
      ],
      (err) => {
        if (err) {
            reject(err);
        } else {
            db.get('SELECT * FROM proposal WHERE Id = ?', [this.lastID], function (err, row) {
                if (err) reject(err);
                else resolve({success:true});
            });
        }
      }
    );
  });
};

exports.deleteProposal = (proposalId) => {
    return new Promise((resolve, reject) => {
        const sqlDeleteProp = 'DELETE FROM PROPOSAL WHERE Id = ?';
        const sqlCancelApps = 'UPDATE APPLICATION SET Status="Cancelled" WHERE Proposal_ID IS NULL and Archived_Proposal_ID IS NULL';
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            db.run(sqlDeleteProp, [proposalId], function (err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject({ error: 'Proposal not found' });
                } else {
                    //we remove the applications for this proposal
                    db.run(sqlCancelApps, [], function(err) {
                        if (err) {
                            reject(err);
                        }
                        db.run("COMMIT");
                        resolve({ success: true });
                    });
                }
            });

        })
    });
}

exports.getProposalById = (proposalId) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D WHERE P.ID=?";
      db.get(sql, [proposalId], (err, row) => {
        if (err) reject(err);
        else if (row === undefined || row.length === 0) {
          resolve();
        } else {
          resolve(new Proposal(row.pID, row.Title, row.Supervisor, row.tName, row.tSurname, row.Co_supervisor, row.Keywords, row.Type, row.Groups, row.Description, row.Req_knowledge, row.Notes, row.Expiration, row.Level, row.CdS, row.TITLE_DEGREE)
          );
        }
      });
    });
};

exports.getArchivedProposalById = (proposalId) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT *, AP.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL AP, TEACHER T, DEGREE D WHERE AP.ID=?";
      db.get(sql, [proposalId], (err, row) => {
        if (err) reject(err);
        else if (row === undefined || row.length === 0) {
          resolve();
        } else {
          resolve(new Proposal(row.pID, row.Title, row.Supervisor, row.tName, row.tSurname, row.Co_supervisor, row.Keywords, row.Type, row.Groups, row.Description, row.Req_knowledge, row.Notes, row.Expiration, row.Level, row.CdS, row.TITLE_DEGREE)
          );
        }
      });
    });
};
