'use strict'

const dayjs = require('dayjs');

function Proposal(id, title, supervisorId, supervisorName, supervisorSurname, coSupervisor, keywords, type, groups, description, reqKnowledge, notes, expiration, level, cdsId, cdsName) {
    //Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS
    // id : id,
    return {
    id : id,
    title : title,
    supervisorId : supervisorId,
    supervisorName : supervisorName,
    supervisorSurname : supervisorSurname,
    coSupervisor : coSupervisor,
    keywords : keywords,
    type : type,
    groups : groups,
    description : description,
    reqKnowledge : reqKnowledge,
    notes : notes,
    expiration : dayjs(expiration),
    level : level,
    cdsId : cdsId,
    cdsName : cdsName,
    }
}

module.exports = { Proposal };
