'use strict';
const supervDao = require('./supervisors-dao');
const propDao = require('./proposals-dao');
const studDao = require('./students-dao');
const { db } = require('./db');
const { request } = require('express');

exports.getAllRequests = async () => {
    try{
        const sql = 'SELECT * FROM REQUEST';
        const rows = await new Promise((dbResolve, dbReject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    dbReject(err);
                } else{
                    dbResolve(rows);
                }
            });
        });
        if (rows === undefined || rows.length === 0) {
            return []; // if no applications yet for that 
        } else {
            const requests = await Promise.all(rows.map(async r => {
                const supervisorData = await supervDao.getSupervisorById(r.Supervisor_Id);
                const studentData = await studDao.getStudentData(r.Student_Id);
                return {
                    id:r.Id,
                    title: r.Title,
                    studentId: r.Student_Id,
                    studentName: studentData.name,
                    studentSurname: studentData.surname,
                    supervisorId: r.Supervisor_Id, 
                    supervisorName: supervisorData.NAME,
                    supervisorSurname: supervisorData.SURNAME,
                    coSupervisorId: r.Co_Supervisor,
                    coSupervisorNames: r.Co_Supervisor ? await propDao.getCoSupervisorNames(r.Co_Supervisor) : "",
                    description: r.Description,
                    applicationId: r.Application_Id? r.Application_Id : null,
                    approvalDate: r.Approval_Date
                }
            }));
            return requests;
        }
    }catch(err){
        throw err;
    }
}

exports.getRequestById = async (reqId) => {
    try{
        const sql = 'SELECT * FROM REQUEST WHERE Id = ?';
        const row = await new Promise((dbResolve, dbReject) => {
            db.get(sql, [reqId], (err, row) => {
                if (err) {
                    dbReject(err);
                } else if(row){
                    dbResolve(row);
                }
                dbReject(new Error(`Request with id ${reqId} not found`));
            });
        });
        const supervisorData = await supervDao.getSupervisorById(row.Supervisor_Id);
        const studentData = await studDao.getStudentData(row.Student_Id);
        return {
            id:row.Id,
            title: row.Title,
            studentId: row.Student_Id,
            studentName: studentData.name,
            studentSurname: studentData.surname,
            supervisorId: row.Supervisor_Id, 
            supervisorName: supervisorData.NAME,
            supervisorSurname: supervisorData.SURNAME,
            coSupervisorId: row.Co_Supervisor,
            coSupervisorNames: row.Co_Supervisor ? await propDao.getCoSupervisorNames(row.Co_Supervisor) : "",
            description: row.Description,
            applicationId: row.Application_Id? row.Application_Id : null,
            approvalDate: row.Approval_Date
        }
    }catch(err){
        throw err;
    }
}

exports.getRequestBySupervisor = async (supervisorId) => {
    try{
        const sql = 'SELECT * FROM REQUEST WHERE Supervisor_Id = ?';
        const rows = await new Promise((dbResolve, dbReject) => {
            db.all(sql, [supervisorId], (err, rows) => {
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
            const requests = await Promise.all(rows.map(async r => {
                const supervisorData = await supervDao.getSupervisorById(r.Supervisor_Id);
                const studentData = await studDao.getStudentData(r.Student_Id);
                return {
                    id:r.Id,
                    title: r.Title,
                    studentId: r.Student_Id,
                    studentName: studentData.name,
                    studentSurname: studentData.surname,
                    supervisorId: r.Supervisor_Id, 
                    supervisorName: supervisorData.NAME,
                    supervisorSurname: supervisorData.SURNAME,
                    coSupervisorId: r.Co_Supervisor,
                    coSupervisorNames: r.Co_Supervisor ? await propDao.getCoSupervisorNames(r.Co_Supervisor) : "",
                    description: r.Description,
                    applicationId: r.Application_Id? r.Application_Id : null,
                    approvalDate: r.Approval_Date
                }
            }));
            return requests;
        }
    }catch(err){
        throw err;
    }
}

exports.addRequest = async (requestData) => {
    try{
        const studentData = await studDao.getStudentData(requestData.studentId);
        const supervisorData = await supervDao.getSupervisorById(requestData.supervisorId);
        if(studentData && supervisorData){
            return await new Promise((resolve,reject)=>{
                const sql = 'INSERT INTO REQUEST (Title,Student_Id,Supervisor_Id,Co_Supervisor,Description,Application_Id, Approval_Date) VALUES(?,?,?,?,?,?, ?)';
                db.run(sql,[
                    requestData.title,
                    requestData.studentId,
                    requestData.supervisorId,
                    requestData.coSupervisorId? requestData.coSupervisorId : null,
                    requestData.description,
                    requestData.applicationId? requestData.applicationId : null,
                    null,
                ],(err)=>{
                    if(err){
                        reject(err);
                    }
                    resolve({success:true});
                })
            })
        }else{
            throw new Error('Either request student or supervisor are not in the database');
        }
    }catch(err){
        throw err;
    }
}