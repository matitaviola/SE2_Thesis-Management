'use strict';
const { db } = require('./db');

exports.effectLogin = (credentials) => {
    return new Promise((resolve, reject) => {
        let user = {id:"", role:"" };
        if(credentials.password[0]=="s"){
            db.get('SELECT * FROM STUDENT WHERE EMAIL = ?', [credentials.username], (err, row) => {
                if(err){
                    reject(err);
                }else if ( typeof row !== 'undefined'){
                    user.id = row.ID;
                    user.role = "STUDENT";
                    resolve(user);
                }
                reject("Student not found");

            })
        } else if (credentials.password[0]=="d"){
            db.get('SELECT * FROM TEACHER WHERE EMAIL = ?', [credentials.username], (err, row) => {
                if(err){
                    reject(err);
                }else if ( typeof row !== 'undefined'){
                    user.id = row.ID;
                    user.role = "TEACHER";
                    resolve(user);
                }
                reject("Teacher not found");
            })
        } else {
            reject("Unexpected user role");
        }
    });
}