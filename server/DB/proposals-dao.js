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
                resolve({}); //if no applications yet for that 
            }
            else {
                const proposals = rows.map( r => {
                    return { 
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

exports.archiveProposal = (proposal, studentId) => {
    return new Promise((resolve, reject) => {
        // Step 1: Retrieve data from PROPOSAL table
        db.get('SELECT * FROM PROPOSAL WHERE Title = ?', [proposal], (err, row) => {
            if (err || !row) {
                reject(err? err : 'Proposal not found.');
            }
            const originalProposal = row;
            // Step 2: Check if student has an application for that proposal
            db.get('SELECT * FROM APPLICATION WHERE Proposal = ? AND Student_ID = ?', [proposal, studentId], (err, row) => {
                if (err || !row) {
                    reject(err? err : 'Application not found.')
                }
                // Step 3: Update Proposal table
                db.run('DELETE FROM PROPOSAL WHERE Title = ? ', [proposal],(err) => {
                    if (err) {
                        reject(err);
                    }
                    console.log("Trying to insert archived proposal: ", originalProposal, " with student: ", studentId);
                    // Step 4: Add the Proposal to the archived ones
                    const sql ="INSERT INTO ARCHIVED_PROPOSAL (Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status, Thesist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    db.run(sql, [
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
                            reject(err);
                        }
                        console.log("almost solved");
                        resolve({success:true});
                    });
                });
            });
        });
    });
}
exports.getAvailableProposals = (studentId, filter) => {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?';
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
                const proposals = rows.map(r => new Proposal(r.Title, r.Supervisor, r.tName, r.tSurname, r.Co_supervisor, r.Keywords, r.Type, r.Groups, r.Description, r.Req_knowledge, r.Notes, r.Expiration, r.Level, r.CdS, r.TITLE_DEGREE));
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
            if (err.code === 'SQLITE_CONSTRAINT') reject('Duplicate title');
            else reject(err);
        } else {
            db.get('SELECT * FROM proposal WHERE title = ?', [title], function (err, row) {
                if (err) reject(err);
                else resolve(row);
            });
        }
      }
    );
  });
};

exports.deleteProposal = (proposal) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM PROPOSAL WHERE Title = ?';
        db.run(sql, [proposal], function (err) {
            if (err) {
                reject(err);
            } else if (this.changes === 0) {
                reject({ error: 'Proposal not found' });
            } else {
                resolve({ success: true });
            }
        });
    });
}