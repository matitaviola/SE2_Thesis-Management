'use strict'

const dayjs = require('dayjs');

function Proposal(id, title, supervisorId, supervisorName, supervisorSurname, coSupervisor, keywords, type, groups, description, reqKnowledge, notes, expiration, level, cdsId, cdsName) {
    //Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS
    // this.id = id;
    this.id = id;
    this.title = title;
    this.supervisorId = supervisorId;
    this.supervisorName = supervisorName;
    this.supervisorSurname = supervisorSurname;
    this.coSupervisor = coSupervisor;
    this.keywords = keywords;
    this.type = type;
    this.groups = groups;
    this.description = description;
    this.reqKnowledge = reqKnowledge;
    this.notes = notes;
    this.expiration = dayjs(expiration);
    this.level = level;
    this.cdsId = cdsId;
    this.cdsName = cdsName;
}

module.exports = { Proposal };
