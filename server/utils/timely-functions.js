//Used to run automatic archiviation
//It is either called periodically (every 24h)
//or by the timetravel button
const propDao = require('../DB/proposals-dao');
const mailServer = require('./mail-server');
const { db } = require('../DB/db');

exports.timelyArchive = async (date) => {
    try{
        sqlFindByDate = "SELECT Id FROM PROPOSAL WHERE Expiration < ?"
        const ids = await new Promise((resolve, reject) => {
            db.all(sqlFindByDate,[date.format('YYYY-MM-DD')], (err,rows) =>{
                if(err){
                    reject("Time Travel forward error: "+err.toString());
                }
                resolve(rows?.length>0? rows :  []);
            });
        });
        
        if(await ids?.length > 0){
            //using fo instead of promise.all becuse the archiveProposal uses db.serialize, that won't work if there's another serialize promise running
            for (const id of ids){
                try{
                    await propDao.archiveProposalWithoutApplication(id.Id, "Expired");
                }catch(err){
                    throw err.toString()+" when trying to read proposal with id: "+id.Id;
                }
            }
        }
        return {travelled:true};
    }catch(err){
        return {error:err};
    }
};

exports.timelyDeArchive = async (date) => {
    try{
        sqlFindByDate = "SELECT Id FROM ARCHIVED_PROPOSAL WHERE Expiration > ? AND Status='Expired'"
        const ids = await new Promise((resolve, reject) => {
            db.all(sqlFindByDate,[date.format('YYYY-MM-DD')], (err,rows) =>{
                if(err){
                    reject("Time Travel backward error: "+err.toString());
                }
                resolve(rows?.length>0? rows :  []);
            });
        });
        
        if(await ids?.length > 0){
            //using fo instead of promise.all becuse the archiveProposal uses db.serialize, that won't work if there's another serialize promise running
            for (const id of ids){
                try{
                    await propDao.deArchiveProposal(id.Id);
                }catch(err){
                    throw err.toString()+" when trying to read archived proposal with id: "+id.Id;
                }
            }
        }
        return {backtravelled:true};
    }catch(err){
        return {error:err};
    }
};

exports.timelyExpiringEmails = async (date, remainingDays) => {
    try{
        sqlFindByDate = "SELECT Id, Supervisor, Title, Expiration FROM PROPOSAL WHERE Expiration = ?"
        const props = await new Promise((resolve, reject) => {
            db.all(sqlFindByDate,[date.add(remainingDays, 'day').format('YYYY-MM-DD')], (err,rows) =>{
                if(err){
                    reject("Expiring proposals emails error: "+err.toString());
                }
                resolve(rows?.length>0? rows :  []);
            });
        });
        if(await props?.length > 0){
            //using fo instead of promise.all becuse the archiveProposal uses db.serialize, that won't work if there's another serialize promise running
            for (const prop of props){
                try{
                    await mailServer.sendMail(prop.Supervisor,"EXPIRATION", {proposal:prop.Title, expires:prop.Expiration});
                }catch(err){
                    throw err.toString()+" when trying to send expiration emails for proposal with id: "+prop.Id;
                }
            }
        }
        return {sentemails:true};
    }catch(err){
        return {error:err};
    }
};