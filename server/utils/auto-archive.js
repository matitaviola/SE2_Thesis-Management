//Used to run automatic archiviation
//It is either called periodically (every 24h)
//or by the timetravel button
const propDao = require('../DB/proposals-dao');
const { db } = require('../DB/db');

exports.timelyArchive = async (date) => {
    try{
        sqlFindByDate = "SELECT Id FROM PROPOSAL WHERE Expiration < ?"
        const ids = await new Promise((resolve, reject) => {
            db.all(sqlFindByDate,[date.format('YYYY-MM-DD')], async (err,rows) =>{
                if(err){
                    console.log("Time Travel forward error: ", err);
                    reject(err);
                }
                resolve(rows?.length>0? rows :  []);
            });
        });
        
        if(ids?.length > 0){
            //using fo instead of promise.all becuse the archiveProposal uses db.serialize, that won't work if there's another serialize promise running
            for (const id of ids){
                try{
                    const success = await propDao.archiveProposalWithoutApplication(id.Id, "Expired");
                    console.log(success,id);
                }catch(err){
                    console.log(err," When tying to read proposa with id", id.Id);
                }
            }
        }
        return {travelled:true};
    }catch(err){
        console.log(err);
    }
};