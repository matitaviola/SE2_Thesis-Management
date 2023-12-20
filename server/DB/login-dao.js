'use strict';
const { db } = require('./db');

const userFormatter = (row, role) => {
    return {
        id: role=="CLERK"? row.Email : row.ID,
        role: role,
        email : role=="CLERK"? row.Email : row.EMAIL,
        surname : role=="CLERK"? row.Surname : row.SURNAME,
        name : role=="CLERK"? row.Name : row.NAME,
    }
}
exports.effectLogin = (credentials) => {
    return new Promise((resolve, reject) => {
        let user = {id:"", role:"", email: "", name:"", surname:"" };
        //TODO: CHANGE THIS LOGIC TO HAVE A SINGLE ACCOUNT TABLE, instead of looking into the student/teacher tables based on password
        if(credentials.includes("studenti.polito")){
            //TODO: GENERATE A 
            db.get('SELECT * FROM STUDENT WHERE EMAIL = ?', [credentials], (err, row) => {
                if(err){
                    reject(err);
                }else if ( typeof row !== 'undefined'){
                    user.id = row.ID;
                    user.role = "STUDENT";
                    user.email = row.EMAIL;
                    user.surname = row.SURNAME;
                    user.name = row.NAME;
                    resolve(userFormatter(row, "STUDENT"));
                }
                reject("Student not found");

            })
        } else if(credentials.includes("docenti.polito")){
            db.get('SELECT * FROM TEACHER WHERE EMAIL = ?', [credentials], (err, row) => {
                if(err){
                    reject(err);
                }else if ( typeof row !== 'undefined'){
                    user.id = row.ID;
                    user.role = "TEACHER";
                    user.email = row.EMAIL;
                    user.surname = row.SURNAME;
                    user.name = row.NAME;
                    resolve(userFormatter(row, "TEACHER"));
                }
                reject("Teacher not found");
            })
        } else if(credentials.includes("secretary.polito")){
            db.get('SELECT * FROM SECRETARY_CLERK WHERE EMAIL = ?', [credentials], (err, row) => {
                if(err){
                    reject(err);
                }else if ( typeof row !== 'undefined'){
                    user.id = row.Email;
                    user.role = "CLERK";
                    user.email = row.Email;
                    user.surname = row.Surname;
                    user.name = row.Name;
                    resolve(userFormatter(row, "CLERK"));
                }
                reject("Secretary clerk not found");
            })
        }else {
            reject("Unexpected user role");
        }
    });
}