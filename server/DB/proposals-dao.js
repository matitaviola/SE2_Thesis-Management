'use strict';
const { Proposal } = require('../models/proposal');
const { db } = require('./db');

//utility
exports.getCoSupervisorNames = async (coSupervisor) => {
    const coSuper = coSupervisor.split(" ");
    let coSuperNames = "";
    // Wait for all promises to resolve
    await Promise.all(coSuper.map(cs => {
        return new Promise(async (resolve, reject) => {
            if (/d[0-9]{6}/.test(cs)) {
                const coSupSql = 'SELECT SURNAME, NAME FROM TEACHER  WHERE ID=?';
                db.get(coSupSql, [cs], (err, row) => {
                    if (err) {
                        reject();
                    }
                    if(row){
                        coSuperNames = coSuperNames + " " + row.NAME + " " + row.SURNAME + ",";
                        resolve();
                    }
                    reject()
                });
            } else {
                resolve();
            }
        });
    }));
    if (coSuperNames.length > 1) {
        coSuperNames = coSuperNames.substring(0, coSuperNames.length - 1);
    }

    return coSuperNames.trim();
};

//exports
exports.getActiveProposalsByProfessor = async (professorId) => {
    try {
        const sql = 'SELECT * FROM PROPOSAL WHERE Supervisor=?';
        const rows = await new Promise((dbResolve, dbReject) => {
            db.all(sql, [professorId], (err, rows) => {
                if (err) {
                    dbReject(err);
                } else {
                    dbResolve(rows);
                }
            });
        });

        if (rows === undefined || rows.length === 0) {
            return []; // if no applications yet for that 
        } else {
            const proposals = await Promise.all(rows.map(async r => {
                return {
                    id: r.Id,
                    title: r.Title,
                    supervisor: professorId,
                    coSupervisor: r.Co_supervisor,
                    //now we get the names
                    coSupervisorNames: r.Co_supervisor ? await this.getCoSupervisorNames(r.Co_supervisor) : "",
                    keywords: r.Keywords,
                    type: r.Type,
                    groups: r.Groups,
                    description: r.Description,
                    reqKnowledge: r.Req_knowledge,
                    notes: r.Notes,
                    expiration: r.Expiration,
                    level: r.Level,
                    cds: r.CdS
                    // Inserted all the fields
                };
            }));

            return proposals;
        }
    } catch (error) {
        throw error;
    }
};

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

exports.getAvailableProposals = async (studentId, filter, order) => {
    try{
        let sql = 'SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?';
        const dep = [studentId];
        //#region Filters
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
        /*    
        //supervisor needs rework to use the names, atm it is doen after the query
        if(filter.coSupervisor){
            sql = sql.concat(' AND UPPER(P.co_supervisor) LIKE UPPER("%" || ? || "%")');
            dep.push(filter.coSupervisor);
        }
        */
        //#endregion
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

        const rows = await new Promise((resolve, reject) => {
            db.all(sql, dep, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        if (rows === undefined || rows.length === 0) {
            return [];
        }
        let proposals = await Promise.all(rows.map(async r => {
            const prop = new Proposal(r.pID, r.Title, r.Supervisor, r.tName, r.tSurname, r.Co_supervisor, r.Keywords, r.Type, r.Groups, r.Description, r.Req_knowledge, r.Notes, r.Expiration, r.Level, r.CdS, r.TITLE_DEGREE);
            prop.coSupervisorNames = r.Co_supervisor ? await this.getCoSupervisorNames(r.Co_supervisor) : "";
            prop.coSupervisorNames = prop.coSupervisorNames? prop.coSupervisorNames : "";
            return prop;
        }));
        //supervisor filter is done
        if(filter.coSupervisor){
            proposals = proposals.filter(pr => (pr.coSupervisorNames && pr.coSupervisorNames.toUpperCase().includes(filter.coSupervisor.toUpperCase())));
        }
        return proposals;
    }catch(err){
        throw err;
    };
}

exports.addProposal = (body) => {
  const {
    title,
    supervisor,
    coSupervisor,
    keywords,
    type,
    groups,
    description,
    reqKnowledge,
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
        coSupervisor,
        keywords,
        type,
        groups,
        description,
        reqKnowledge,
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
