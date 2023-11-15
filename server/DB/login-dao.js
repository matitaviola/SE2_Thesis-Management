'use strict';
const { db } = require('./db');

exports.effectLogin = (credentials) => {
    return new Promise((resolve, reject) => {
        let user = {id:"", role:"" };
        if(credentials.password[0]=="s"){
            db.get('SELECT * FROM STUDENT WHERE EMAIL = ?', [credentials.username], (err, row) => {
                if(err || !row){
                    reject(err? err : "Student not found");
                }
                user.id = row.ID;
                user.role = "STUDENT";
                resolve(user);
            })
        } else if (credentials.password[0]=="d"){
            db.get('SELECT * FROM TEACHER WHERE EMAIL = ?', [credentials.username], (err, row) => {
                if(err || !row){
                    reject(err? err : "Teacher not found");
                }
                user.id = row.ID;
                user.role = "TEACHER";
                resolve(user);
            })
        } else {
            reject("Unexpected user role");
        }
    });
}