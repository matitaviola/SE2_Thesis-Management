'use strict';
const { Proposal } = require('../models/proposal');
const { db } = require('./db');

//utility
exports.getCoSupervisorNames = async (coSupervisor) => {
    const coSuper = coSupervisor.split(" ");
    let coSuperNames = "";

    await Promise.all(coSuper.map(async (cs) => {
        if (/d[0-9]{6}/.test(cs)) {
            const coSupSql = 'SELECT SURNAME, NAME FROM TEACHER  WHERE ID=?';
            try {
                const row = await new Promise((resolve, reject) => {
                    db.get(coSupSql, [cs], (err, row) => {
                        if (err || !row) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });

                coSuperNames = coSuperNames + " " + row.NAME + " " + row.SURNAME + ",";
            } catch (error) {
                throw error;
            }
        }else if(/^[^\s@][^\s@]*@[^\s@][^\s@]*\.[^\s@][^\s@]*$/.test(cs)){
            /*If it is an email, check in the external cosup Table*/
            const coSupSql = 'SELECT Surname, Name FROM EXTERNAL_COSUPERVISOR  WHERE Email=?';
            try {
                const row = await new Promise((resolve, reject) => {
                    db.get(coSupSql, [cs], (err, row) => {
                        if (err || !row) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
                coSuperNames = coSuperNames + " " + row.Name + " " + row.Surname + ",";
            } catch (error) {
                throw error;
            }
        }
    }));

    if (coSuperNames.length > 1) {
        coSuperNames = coSuperNames.substring(0, coSuperNames.length - 1);
    }

    return coSuperNames.trim();
};

exports.getAndAddExternalCoSupervisor = async (name, surname, email) => {
    //returns an existing external supervisor or add a new one. Is used during a proposal creation/update
    return new Promise((resolve, reject) => {
        const coSupSql = 'SELECT * FROM EXTERNAL_COSUPERVISOR  WHERE Email=?';
        db.get(coSupSql, [email], (err, row) => {
            if (err) {
                reject(err);
            } else if(row) {
                resolve(row.Email);
            }else{
                const insertSql = 'INSERT INTO EXTERNAL_COSUPERVISOR (Email, Name, Surname) VALUES (?, ?, ?)'
                db.run(insertSql, [email, name.replace('_',' '), surname.replace('_',' ')], (err) => {
                    if (err) {
                        reject(err);
                    } else
                        resolve(email);
                })
            }
        });
  });
};

exports.getCoSupervisorByProposal = async (proposalId) => {
    try{
        let proposal = await this.getProposalById(proposalId);
        if(proposal == null || !proposal || proposal == undefined)
            proposal = await this.getArchivedProposalById(proposalId);
        const coSupervisors = proposal? proposal.coSupervisor : null;
        let externalCoSupervisors = [];
        let academicCoSupervisors = [];
        if(coSupervisors){
            const externalCoSupList = coSupervisors.split(" "); //Take only the emails, that are the externals' id
            await Promise.all(externalCoSupList.map(async (cs) => {
                /*If it is an email, check in the external cosup Table*/
                if(/d[0-9]{6}/.test(cs)){
                    const coSupSql = 'SELECT ID, SURNAME, NAME FROM TEACHER  WHERE ID=?';
                        const row = await new Promise((resolve, reject) => {
                            db.get(coSupSql, [cs], (err, row) => {
                                if (err || !row) {
                                    reject(err? err : "No such Teacher");
                                } else {
                                    resolve(row);
                                }
                            });
                        });
                        academicCoSupervisors.push({id:row.ID, name:row.NAME, surname:row.SURNAME});
                }else if(/^[^\s@][^\s@]*@[^\s@][^\s@]*\.[^\s@][^\s@]*$/.test(cs)){
                    const coSupSql = 'SELECT * FROM EXTERNAL_COSUPERVISOR  WHERE Email=?';
                        const row = await new Promise((resolve, reject) => {
                            db.get(coSupSql, [cs], (err, row) => {
                                if (err || !row) {
                                    reject(err? err : "No such External collaborator");
                                } else {
                                    resolve(row);
                                }
                            });
                        });
                        //Add the new value to the list
                        externalCoSupervisors.push({mail:row.Email, name:row.Name, surname:row.Surname});
                }else{
                    throw 'Invalid cosupervisor identifier';
                }
            }));
        }
        return  {academic:academicCoSupervisors, external:externalCoSupervisors};
    }catch(err){
        throw err;
    }

}

//exports
exports.getActiveProposalsByProfessor = async (professorId) => {
    try {
        const sql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status="Active"';
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

exports.getArchivedProposalsByProfessor = async (professorId, filter) => {
    try{
        let sql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL P, TEACHER T WHERE T.ID=P.Supervisor AND T.ID= ?`;
        
        const dep = [professorId];

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
        if(filter!== ''){
            filter = filter.toUpperCase();
            proposals = proposals.filter(pr => 
                (pr.coSupervisorNames?.toUpperCase().includes(filter)) ||
                (pr.title && pr.title.toUpperCase().includes(filter)) ||
                (pr.keywords && pr.keywords.toUpperCase().includes(filter)) ||
                (pr.types && pr.types.toUpperCase().includes(filter)) ||
                (pr.groups && pr.groups.toUpperCase().includes(filter)) ||
                (pr.description && pr.description.toUpperCase().includes(filter)) ||
                (pr.reqKnowledge && pr.title.toUpperCase().includes(filter)) ||
                (pr.notes && pr.notes.toUpperCase().includes(filter)) ||
                (pr.level && pr.level.toUpperCase().includes(filter)) ||
                (pr.expiration && pr.expiration.toString().includes(filter)) ||
                (pr.cdsId && pr.cdsId.toUpperCase().includes(filter)) 
                );
            }

        return proposals;
    }catch(err){
        throw err;
    };
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

exports.archiveProposalWithoutApplication = (proposalId, cause) => {
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
                const updateCancelledSQL = "UPDATE APPLICATION SET Archived_Proposal_ID=?, Status='Cancelled' WHERE Proposal_ID=? AND Status!='Accepted'";
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
                        cause,
                        null
                    ], (err) => {
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
                            });
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
        let sql = 'SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"';
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
      "insert into proposal (Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status ) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
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
        cds,
        'Active'
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

exports.updateProposal = (body, proposalId) => {
    let {
      title,
      coSupervisor,
      keywords,
      type,
      description,
      reqKnowledge,
      notes,
      expiration,
      level,
      cds,
      groups,
    } = body;
    return new Promise((resolve, reject) => {
        const sqlGetGroups = "SELECT Groups FROM PROPOSAL WHERE Id=?";
        db.get(sqlGetGroups, [proposalId], (err, row) =>{
            if (err) {
                reject(err);
            } else if(row) {
                groups = row.Groups.split(' ')[0]+groups; //we keep the first of the old ones, the supervisor's group
                const sqlUpdate = "UPDATE proposal set Title = ?, Co_supervisor = ?, Keywords = ?, Type = ?, Description = ?, Req_knowledge = ?, Notes = ?, Expiration = ?, Level = ?, CdS = ?, Groups = ? where id = ?";
                db.run(
                    sqlUpdate,
                    [title, coSupervisor, keywords, type, description, reqKnowledge, notes, expiration, level, cds, groups, proposalId],
                    (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        db.get('SELECT * FROM proposal WHERE Id = ?', [proposalId], function (err, row) {
                            if (err) reject(err);
                            else resolve(row);
                        });
                    }
                    }
                );
            }else{
                reject("No such proposal: "+proposalId);
            }
        });
    });
};

exports.deleteProposal = (proposalId) => {
    return new Promise((resolve, reject) => {
        const sqlDeleteProp = 'UPDATE PROPOSAL SET Status="Deleted" WHERE Id = ?';
        const sqlCancelApps = 'UPDATE APPLICATION SET Status="Cancelled" WHERE Proposal_ID=? and Archived_Proposal_ID IS NULL';
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            db.run(sqlDeleteProp, [proposalId], function (err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    reject({ error: 'Proposal not found' });
                } else {
                    //we remove the applications for this proposal
                    db.run(sqlCancelApps, [proposalId], function(err) {
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
      const sql = "SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D WHERE P.ID=? AND P.Supervisor=T.ID";
      db.get(sql, [proposalId], async (err, row) => {
        if (err) reject(err);
        else if (row === undefined || row.length === 0) {
          resolve();
        } else {
            const proposal = new Proposal(row.pID, row.Title, row.Supervisor, row.tName, row.tSurname, row.Co_supervisor, row.Keywords, row.Type, row.Groups, row.Description, row.Req_knowledge, row.Notes, row.Expiration, row.Level, row.CdS, row.TITLE_DEGREE);
            const cosup = await this.getCoSupervisorNames(proposal.coSupervisor? proposal.coSupervisor : '');
            proposal.coSupervisorNames = cosup;
            resolve(proposal);
        }
      });
    });
};

exports.getArchivedProposalById = (proposalId) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT *, AP.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL AP, TEACHER T, DEGREE D WHERE AP.ID=? AND AP.Supervisor=T.ID";
      db.get(sql, [proposalId], async (err, row) => {
        if (err) reject(err);
        else if (row === undefined || row.length === 0) {
          resolve();
        } else {
          const proposal = new Proposal(row.pID, row.Title, row.Supervisor, row.tName, row.tSurname, row.Co_supervisor, row.Keywords, row.Type, row.Groups, row.Description, row.Req_knowledge, row.Notes, row.Expiration, row.Level, row.CdS, row.TITLE_DEGREE)
          const cosup = await this.getCoSupervisorNames(proposal.coSupervisor? proposal.coSupervisor : '');
            proposal.coSupervisorNames = cosup;
            resolve(proposal);
        }
      });
    });
};

exports.deArchiveProposal = (proposalId) => {
    return new Promise((resolve, reject) => {
        // Step 1: Retrieve data from PROPOSAL table
        db.get('SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?', [proposalId], (err, row) => {
            if (err) {
                reject(err);
            }else if (row){
                const originalProposal = row;
                // Step 2: Add the Proposal to the archived ones and delete it from the old one
                //There's a trigger to update the remaining proposals
                const insertSQL = "INSERT INTO PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                const deleteSQL = "DELETE FROM ARCHIVED_PROPOSAL WHERE Id=?";
                const updateCancelledSQL = "UPDATE APPLICATION SET Proposal_ID=?, Archived_Proposal_ID=?, Status='Pending' WHERE Archived_Proposal_ID=? AND Status='Pending'";
                const updateRejectedSQL = "UPDATE APPLICATION SET Proposal_ID=?, Archived_Proposal_ID=?, Status='Pending' WHERE Archived_Proposal_ID=? AND Status!='Pending'";
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
                        'Active'
                    ], (err) => {
                        if (err) {
                            // Roll back the transaction if an error occurs
                            db.run("ROLLBACK");
                            reject(err);
                        }
                        // Execute the third SQL statement
                        db.run(updateCancelledSQL, [proposalId, null, proposalId], (err) => {
                            if (err) {
                                // Roll back the transaction if an error occurs
                                db.run("ROLLBACK");
                                reject(err);
                            }
                            // Execute the fourth SQL statement
                            db.run(updateRejectedSQL, [proposalId, null, proposalId], (err) => {
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
                    });
                });
            } else{
                reject('Archived proposal not found.');
            }
        });
    });
}