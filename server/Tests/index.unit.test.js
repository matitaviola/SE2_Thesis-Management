//#region imports and mocks
//propDao
const propDao = require('../DB/proposals-dao');
jest.mock('../DB/proposals-dao',()=>({
    getProposalById: jest.fn(),
    getArchivedProposalById: jest.fn(),
    getCoSupervisorByProposal: jest.fn(),
    getActiveProposalsByProfessor: jest.fn(),
    getArchivedProposalsByProfessor: jest.fn(),
    getAvailableProposals: jest.fn(),
    addProposal: jest.fn(),
    getAndAddExternalCoSupervisor: jest.fn(),
    updateProposal: jest.fn(),
    deleteProposal: jest.fn(),
    archiveProposalWithoutApplication: jest.fn(),
    archiveProposal: jest.fn()
}))
//studDao
const studDao = require('../DB/students-dao');
jest.mock('../DB/students-dao',()=>({
    getStudentData: jest.fn(),
    getCarreerByStudent: jest.fn(),
    getStudents: jest.fn(),
}))
// supervisorDao
const supervisorDao = require('../DB/supervisors-dao');
jest.mock('../DB/supervisors-dao',()=>({
    getSupervisorById: jest.fn(),
    getCoSupervisorsList: jest.fn(),
}))
// applicationDao
const appDao = require('../DB/applications-dao');
jest.mock('../DB/applications-dao',()=>({
    getApplicationById: jest.fn(),
    getApplicationsByStudent: jest.fn(),
    getActiveProposalsByProfessor: jest.fn(),
    getActiveApplicationsByProposal: jest.fn(),
    createApplication: jest.fn(),
    getLastId: jest.fn(),
    setApplicationStatus: jest.fn(),
    isApplication: jest.fn(),
}))
// degreeDao
const degreeDao = require('../DB/degrees-dao');
jest.mock('../DB/degrees-dao',()=>({
    getAll: jest.fn(),
    getDegreeByCode: jest.fn(),
}))
// reqDao
const reqDao = require('../DB/request-dao');
jest.mock('../DB/request-dao',()=>({
    getAllRequests: jest.fn(),
    getAllRequestsForClerk: jest.fn(),
    getRequestById: jest.fn(),
    getActiveRequestBySupervisor: jest.fn(),
    getActiveRequestByStudent: jest.fn(),
    addRequest: jest.fn(),
    updateRequest: jest.fn(),
}))
// login check middleware
const { isLoggedIn, checkTeacherRole, checkStudentRole} = require('../Middlewares/authorization-middleware');
jest.mock('../Middlewares/authorization-middleware',()=>({
    isLoggedIn: jest.fn((req, res, next) => next()),
    checkTeacherRole: jest.fn(async (req, res, next) => next()),
    checkStudentRole: jest.fn(async (req, res, next) => next()),
}))
// mail middleware
const mailServer = require('../utils/mail-server');
jest.mock('../utils/mail-server');
//timely
const timely = require('../utils/timely-functions');
jest.mock('../utils/timely-functions',()=>({
    timelyExpiringEmails: jest.fn(async ()=>({})),
    timelyArchive: jest.fn(async ()=>({})),
    timelyDeArchive: jest.fn(async ()=>({})),
}))
//setInterval
jest.spyOn(global, 'setInterval').mockImplementation((callback, interval) => {
    const mockInterval = {
      callback,
      unref: jest.fn(),
      interval,
    };
    // Your other logic for interval if needed
    return mockInterval;
});
//
const path = require('path');
const multer = require('multer');
//fs
const fs = require('fs')
const filePathSpy = jest.spyOn(fs, 'existsSync');
const fileUnlink = jest.spyOn(fs, 'unlinkSync');
const fileReadStream = jest.spyOn(fs, 'createReadStream');
//CONSOLE.LOG and error to avoid printing the errors while testing
jest.spyOn(console, 'log').mockImplementation(()=>{});
jest.spyOn(console, 'error').mockImplementation(()=>{});
//#endregion
//app imports
const dayjs = require('dayjs');
const moment = require('moment');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const passport = require('../utils/saml-config');
const {app, server} = require('../index.js'); // Replace with the actual path to your server file
beforeEach(() => {
  jest.clearAllMocks();
});
afterAll((done) => {
    // Close the server to release the handle
    server.close(done);
});
  
//#region Student
describe('Student routes', () => {
  // GET /api/application/:proposalId/:studentId
  it('should respond with status 200 for GET /api/application/:proposalId/:studentId', async () => {
    studDao.getStudentData.mockResolvedValueOnce({data:"aaa"})
    studDao.getCarreerByStudent.mockResolvedValueOnce({data:"bbb"})
    const response = await request(app).get('/api/application/1/s100001');
    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for GET /api/requests with student and/or proposal ids not valid', async () => {
    const responseProp = await request(app).get('/api/application/:proposalId/s100001');
    expect(responseProp.status).toBe(422);

    const responseStud = await request(app).get('/api/application/1/:studentId');
    expect(responseStud.status).toBe(422);
  });
  it('should respond with status 500 for GET /api/requests with some error', async () => {
      //fails to get the student's personal data
      studDao.getStudentData.mockImplementationOnce(()=> undefined);
      const responseData1 = await request(app).get('/api/application/1/s100001');
      expect(responseData1.status).toBe(500);

      //error when trying to get the student's personal data
      studDao.getStudentData.mockImplementationOnce(()=> {throw new Error('error')});
      const responseData2 = await request(app).get('/api/application/1/s100001');
      expect(responseData2.status).toBe(500);
      //fails to get the student's career
      studDao.getStudentData.mockImplementationOnce(()=> {throw new Error('error')});
      const responseCareer = await request(app).get('/api/application/1/s100001');
      expect(responseCareer.status).toBe(500);
  });

  // GET /api/students
  it('should respond with status 200 for GET /api/students', async () => {
    studDao.getStudents.mockResolvedValueOnce([{data:"aaa"},{data:"bbb"}]);
    const response = await request(app).get('/api/students');
    expect(response.status).toBe(200);
  });
  it('should respond with status 500 for GET /api/students when fails to find students', async () => {
    studDao.getStudents.mockImplementationOnce(() => undefined);
    const response = await request(app).get('/api/students');
    expect(response.status).toBe(500);
  });
});
// #endregion
//#region Teacher&Cosupervisors
describe('Teacher and Co-Supervisors routes', () => {
  // GET /api/application/:proposalId/:studentId
  it('should respond with status 200 for GET /api/cosupervisors/:professorId', async () => {
    supervisorDao.getCoSupervisorsList.mockResolvedValueOnce([{data:'abba'},{data:'baab'}]);
    const response = await request(app).get('/api/cosupervisors/d100001');
    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for GET /api/cosupervisors/:professorId with professor id not valid', async () => {
    const responseProp = await request(app).get('/api/cosupervisors/s100001');
    expect(responseProp.status).toBe(422);
  });
  it('should respond with status 500 for GET /api/cosupervisors/:professorId with some error', async () => {
      supervisorDao.getCoSupervisorsList.mockImplementationOnce(()=> {throw new Error('error')});
      const responseCareer = await request(app).get('/api/cosupervisors/d100001');
      expect(responseCareer.status).toBe(500);
  });

  // GET /api/cosupervisors
  it('should respond with status 200 for GET /api/cosupervisors', async () => {
    studDao.getStudents.mockResolvedValueOnce([{data:"aaa"},{data:"bbb"}]);
    const response = await request(app).get('/api/cosupervisors');
    expect(response.status).toBe(200);
  });
  it('should respond with status 500 for GET /api/cosupervisors when fails to find students', async () => {
    supervisorDao.getCoSupervisorsList.mockImplementationOnce(()=> {throw new Error('error')});
      const responseCareer = await request(app).get('/api/cosupervisors');
      expect(responseCareer.status).toBe(500);
  });
});
//#endregion
//#region Proposals
describe('Proposal routes', () => {

  //GET /api/proposals/:proposalId
  it('should respond with status 200 for GET /api/proposals/:proposalId', async () => {
    //finding it in the active proposals
    propDao.getProposalById.mockResolvedValueOnce({data:'abba'});
    const response = await request(app).get('/api/proposals/1');
    expect(response.status).toBe(200);
    //finding it in the archived proposals
    propDao.getProposalById.mockResolvedValueOnce(null);
    propDao.getArchivedProposalById.mockResolvedValueOnce({data:'abba'});
    const responseArch = await request(app).get('/api/proposals/1');
    expect(responseArch.status).toBe(200);
  });
  it('should respond with status 422 for GET /api/proposals/:proposalId with proposal id not valid', async () => {
    const responseProp = await request(app).get('/api/proposals/nan');
    expect(responseProp.status).toBe(422);
  });
  it('should respond with status 500 for GET /api/cosupervisors/:professorId with some error', async () => {
      //not finding it anywere
      propDao.getProposalById.mockResolvedValueOnce(null);
      propDao.getArchivedProposalById.mockResolvedValueOnce(null);
      const responseCareer = await request(app).get('/api/proposals/1');
      expect(responseCareer.status).toBe(500);
  });

  //GET /api/proposals/:proposalId/cosupervisors
  it('should respond with status 200 for GET /api/proposals/:proposalId/cosupervisors', async () => {
    //finding it in the active proposals
    propDao.getCoSupervisorByProposal.mockResolvedValueOnce({data:'abba'});
    const response = await request(app).get('/api/proposals/1/cosupervisors');
    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for GET /api/proposals/:proposalId with proposal id not valid', async () => {
    const responseProp = await request(app).get('/api/proposals/nan/cosupervisors');
    expect(responseProp.status).toBe(422);
  });
  it('should respond with status 500 for GET /api/cosupervisors/:professorId with some error', async () => {
      //not finding it anywere
      propDao.getCoSupervisorByProposal.mockResolvedValueOnce(null);
      const responseCareer = await request(app).get('/api/proposals/1/cosupervisors');
      expect(responseCareer.status).toBe(500);
  });

  //GET /api/proposals/teacher/:professorId
  it('should respond with status 200 for GET /api/proposals/teacher/:professorId', async () => {
    //finding it in the active proposals
    propDao.getActiveProposalsByProfessor.mockResolvedValueOnce({data:'abba'});
    const response = await request(app).get('/api/proposals/teacher/d200002');
    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for GET /api/teacher/:professorId with professor id not valid', async () => {
    const responseProp = await request(app).get('/api/proposals/teacher/:professorId');
    expect(responseProp.status).toBe(422);
  });
  it('should respond with status 500 for GET /api/proposals/teacher/:professorId with some error', async () => {
      //not finding it anywere
      propDao.getActiveProposalsByProfessor.mockImplementationOnce(() => {throw new Error('error')});
      const responseCareer = await request(app).get('/api/proposals/teacher/d200002');
      expect(responseCareer.status).toBe(500);
  });

  //GET /api/proposals/teacher/:professorId/archived
  it('should respond with status 200 for GET /api/proposals/teacher/:professorId/archived', async () => {
    //finding it in the active proposals
    propDao.getArchivedProposalsByProfessor.mockResolvedValueOnce({data:'abba'});
    const response = await request(app).get('/api/proposals/teacher/d200002/archived').query({ filter: 'prova' });;
    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for GET /api/teacher/:professorId/archived with professor id not valid', async () => {
    const responseProp = await request(app).get('/api/proposals/teacher/:professorId/archived');
    expect(responseProp.status).toBe(422);
  });
  it('should respond with status 500 for GET /api/proposals/teacher/:professorId/archived with some error', async () => {
      //not finding it anywere
      propDao.getArchivedProposalsByProfessor.mockImplementationOnce(() => {throw new Error('error')});
      const responseCareer = await request(app).get('/api/proposals/teacher/d200002/archived');
      expect(responseCareer.status).toBe(500);
  });

  //GET /api/proposals/students/:studentId
  it('should respond with status 200 and return proposals for a valid student ID with no query parameters', async () => {
    const studentId = 's123456'; // Replace with a valid student ID
    propDao.getAvailableProposals.mockResolvedValueOnce([{data:"aaa"},{data:"bbb"}]);
    appDao.getApplicationsByStudent.mockResolvedValueOnce([{data:"aaa", status:"Pending"},{data:"bbb", status:"Accepted"}]);
    const validQueryParams = {
      title: 'Proposal Title',
      supervisor: 'Supervisor Name',
      coSupervisor: 'Co-Supervisor Name',
      keywords: 'Keyword1, Keyword2',
      groups: 'Group1, Group2',
      type: 'Type',
      description: 'Proposal Description',
      reqKnowledge: 'Required Knowledge',
      notes: 'Proposal Notes',
      expiration: '2023-01-01',
      level: 'Level',
      degree: 'Degree',
      ordField: 'title',
      dir: 'true',
    };

    const response = await request(app)
      .get(`/api/proposals/students/${studentId}`)
      .query(validQueryParams);

    expect(response.status).toBe(200);
    //if no app with those status
    propDao.getAvailableProposals.mockResolvedValueOnce([{data:"aaa"}]);
    appDao.getApplicationsByStudent.mockResolvedValueOnce([{data:"aaa"}]);
    
    const response2 = await request(app)
      .get(`/api/proposals/students/${studentId}`)
      .query(validQueryParams);

    expect(response2.status).toBe(200);
  });
  it('should respond with status 422 for an invalid student ID', async () => {
    const response = await request(app).get('/api/proposals/students/invalidStudentId');
    
    expect(response.status).toBe(422);
    
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    const studentId = 's123456'; // Replace with a valid student ID
    propDao.getAvailableProposals.mockRejectedValueOnce(new Error('Test error'));

    const response = await request(app).get(`/api/proposals/students/${studentId}`);

    expect(response.status).toBe(500);
    
  });

  //POST /api/proposals
  it('should respond with status 200 and create a proposal with valid input', async () => {
    // Mock data and setup for a valid request
    const validRequestData = {
      title: 'Valid Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2223-12-31',
      level: 'BSc',
      supervisor: 'validSupervisorId',
      cds: 'validDegreeCode1 validDegreeCode2',
      coSupervisor: 'd100001,Enzo_Renzo Mica_Male er@mail.com'
    };

    // Mock the supervisorDao.getSupervisorById to resolve with a supervisor
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abba"});
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"baab"});
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abab"});
    propDao.getAndAddExternalCoSupervisor.mockResolvedValueOnce({data:"abba"});

    // Mock the degreeDao.getDegreeByCode to resolve with degrees
    degreeDao.getDegreeByCode.mockResolvedValueOnce({ data:"abba" });
    degreeDao.getDegreeByCode.mockResolvedValueOnce({ data:"baab" });

    propDao.addProposal.mockResolvedValueOnce({data:"abba"})

    // Make the request
    const response = await request(app)
      .post('/api/proposals')
      .send(validRequestData);

    expect(response.status).toBe(200);
    
    //with groups
    const validRequestWithGroups = {
      title: 'Valid Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2223-12-31',
      level: 'BSc',
      supervisor: 'validSupervisorId',
      cds: 'validDegreeCode1 validDegreeCode2',
      coSupervisor: 'd100001,Enzo_Renzo Mica_Male er@mail.com',
      groups:"MN001"
    };
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abba"});
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"baab"});
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abab"});
    propDao.getAndAddExternalCoSupervisor.mockResolvedValueOnce({data:"abba"});

    // Mock the degreeDao.getDegreeByCode to resolve with degrees
    degreeDao.getDegreeByCode.mockResolvedValueOnce({ data:"abba" });
    degreeDao.getDegreeByCode.mockResolvedValueOnce({ data:"baab" });

    propDao.addProposal.mockResolvedValueOnce({data:"abba"})

    // Make the request
    const responseG = await request(app)
      .post('/api/proposals')
      .send(validRequestWithGroups);

    expect(responseG.status).toBe(200);
  });
  it('should respond with status 422 for missing or invalid input', async () => {
    // Mock data and setup for an invalid request
    const invalidRequestData = {
      // Missing required fields like 'title'
    };

    // Make the request
    const response = await request(app)
      .post('/api/proposals')
      .send(invalidRequestData);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 422 for invalid supervisor', async () => {
    // Mock data and setup for a request with an invalid supervisor
    const invalidSupervisorRequestData = {
      title: 'Invalid Supervisor Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2023-12-31',
      level: 'BSc',
      supervisor: 'invalidSupervisorId',
      cds: 'validDegreeCode1 validDegreeCode2',
    };

    // Mock the supervisorDao.getSupervisorById to reject with an error
    supervisorDao.getSupervisorById.mockRejectedValueOnce(new Error('Invalid supervisor'));

    // Make the request
    const response = await request(app)
      .post('/api/proposals')
      .send(invalidSupervisorRequestData);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 422 for invalid date', async () => {
    // Mock data and setup for a request with an invalid supervisor
    const invalidDateRequestData = {
      title: 'Invalid Supervisor Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2022-12-31',
      level: 'BSc',
      supervisor: 'invalidSupervisorId',
      cds: 'nope',
    };

    // Make the request
    const response = await request(app)
      .post('/api/proposals')
      .send(invalidDateRequestData);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Mock data and setup for a request where the server encounters an error
    const errorRequestData = {
      title: 'Valid Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2223-12-31',
      level: 'BSc',
      supervisor: 'validSupervisorId',
      cds: 'validDegreeCode1 validDegreeCode2',
      coSupervisor: 'd100001,Enzo_Renzo Mica_Male er@mail.com'
    };

    // Mock the supervisorDao.getSupervisorById to resolve with a supervisor
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ /* Mocked supervisor data */ });
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"baab"});
    //degrees
    degreeDao.getDegreeByCode.mockResolvedValue({ data:"abba" });
    
    // Mock the propDao.addProposal to reject with an error
    propDao.addProposal.mockRejectedValueOnce(new Error('Test error'));
    
    // Make the request
    const response = await request(app)
      .post('/api/proposals')
      .send(errorRequestData);

    expect(response.status).toBe(500);
    
    //adding cosupervisors
    errorRequestData.coSupervisor = 'd100001,Enzo_Renzo Mica_Male er@mail.com,wrong';
    //not finding first cosup
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abba"});
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"baab"});
    supervisorDao.getSupervisorById.mockResolvedValueOnce(null);
    // Make the request
    const responseFirst = await request(app)
      .post('/api/proposals')
      .send(errorRequestData);

    expect(responseFirst.status).toBe(500);

    //not finding the second cosup
     supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abba"});
     supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"baab"});
     supervisorDao.getSupervisorById.mockResolvedValueOnce({data:"abab"});
     propDao.getAndAddExternalCoSupervisor.mockResolvedValueOnce(null);
     // Make the request
     const responseSecond = await request(app)
       .post('/api/proposals')
       .send(errorRequestData);
 
     expect(responseSecond.status).toBe(500);

     //reading the thrid cosup
     supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abba"});
     supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"baab"});
     supervisorDao.getSupervisorById.mockResolvedValueOnce({data:"abab"});
     propDao.getAndAddExternalCoSupervisor.mockResolvedValueOnce({data:"abba"});
     // Make the request
     const responseThird = await request(app)
       .post('/api/proposals')
       .send(errorRequestData);
 
     expect(responseThird.status).toBe(500);

  });

  //PATCH /api/proposals/:proposalId
  it('should respond with status 200 and patch', async () => {
    // Mock data and setup for a valid request
    const validRequestData = {
      title: 'Valid Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2223-12-31',
      level: 'BSc',
      supervisor: 'validSupervisorId',
      cds: 'validDegreeCode1 validDegreeCode2',
      coSupervisor: 'd100001,Enzo_Renzo Mica_Male er@mail.com'
    };

    // Mock the supervisorDao.getSupervisorById to resolve with a supervisor
    supervisorDao.getSupervisorById.mockResolvedValueOnce({ data:"abba"});
    propDao.getAndAddExternalCoSupervisor.mockResolvedValueOnce({data:"abba"});

    // Mock the degreeDao.getDegreeByCode to resolve with degrees
    degreeDao.getDegreeByCode.mockResolvedValueOnce({ data:"abba" });
    degreeDao.getDegreeByCode.mockResolvedValueOnce({ data:"baab" });

    propDao.updateProposal.mockResolvedValueOnce({data:"abba"})

    // Make the request
    const response = await request(app)
      .patch('/api/proposals/1')
      .send(validRequestData);

    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for missing or invalid input', async () => {
    // Mock data and setup for an invalid request
    const invalidRequestData = {
      // Missing required fields like 'title'
    };

    // Make the request
    const response = await request(app)
      .patch('/api/proposals/:proposalId')
      .send(invalidRequestData);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 422 for invalid degree', async () => {
    // Mock data and setup for a request with an invalid supervisor
    const invalidSupervisorRequestData = {
      title: 'Invalid Supervisor Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2023-12-31',
      level: 'BSc',
      supervisor: 'invalidSupervisorId',
      cds: 'validDegreeCode1 validDegreeCode2',
    };

    // Mock the supervisorDao.getSupervisorById to reject with an error
    degreeDao.getDegreeByCode.mockResolvedValueOnce(null);

    // Make the request
    const response = await request(app)
      .patch('/api/proposals/1')
      .send(invalidSupervisorRequestData);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 422 for invalid date', async () => {
    // Mock data and setup for a request with an invalid supervisor
    const invalidDateRequestData = {
      title: 'Invalid Supervisor Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2022-12-31',
      level: 'BSc',
      supervisor: 'invalidSupervisorId',
      cds: 'nope',
    };

    // Make the request
    const response = await request(app)
      .patch('/api/proposals/1')
      .send(invalidDateRequestData);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Mock data and setup for a request where the server encounters an error
    const errorRequestData = {
      title: 'Valid Proposal',
      keywords: 'Keyword1, Keyword2',
      type: 'Type',
      description: 'Proposal Description',
      expiration: '2223-12-31',
      level: 'BSc',
      supervisor: 'validSupervisorId',
      cds: 'validDegreeCode1 validDegreeCode2',
      coSupervisor: 'd100001,Enzo_Renzo Mica_Male er@mail.com'
    };
    
    // Mock the propDao.addProposal to reject with an error
    propDao.updateProposal.mockRejectedValueOnce(new Error('Test error'));
    
    // Make the request
    const response = await request(app)
      .patch('/api/proposals/1')
      .send(errorRequestData);

    expect(response.status).toBe(500);
    
    //adding cosupervisors
    errorRequestData.coSupervisor = 'd100001';
    //not finding first cosup
    supervisorDao.getSupervisorById.mockResolvedValueOnce(null);
    // Make the request
    const responseFirst = await request(app)
      .patch('/api/proposals/1')
      .send(errorRequestData);

    expect(responseFirst.status).toBe(500);

    //not finding the second cosup
    errorRequestData.coSupervisor = "Enzo_Renzo Mica_Male er@mail.com";
    propDao.getAndAddExternalCoSupervisor.mockResolvedValueOnce(null);
     // Make the request
     const responseSecond = await request(app)
       .patch('/api/proposals/1')
       .send(errorRequestData);
 
     expect(responseSecond.status).toBe(500);

     //reading the third cosup
     errorRequestData.coSupervisor = "wrong"
    // Make the request
     console.log("Starting the third request")
     const responseThird = await request(app)
       .patch('/api/proposals/1')
       .send(errorRequestData);
 
     expect(responseThird.status).toBe(500);

  });

  //DELETE /api/proposals/:proposalId
  it('should respond with status 200 and delete the proposal for a valid proposalId', async () => {
    // Mock data and setup for a valid request
    const validProposalId = 1; // Replace with a valid proposalId
    propDao.deleteProposal.mockResolvedValueOnce({ success: true });

    // Make the request
    const response = await request(app).delete(`/api/proposals/${validProposalId}`);

    expect(response.status).toBe(200);
    
  });
  it('should respond with status 404 for a proposalId that does not exist', async () => {
    // Mock data and setup for a request with a non-existent proposalId
    const nonExistentProposalId = 999; // Replace with a proposalId that does not exist
    propDao.deleteProposal.mockResolvedValueOnce({ success: false });
    // Make the request
    const response = await request(app).delete(`/api/proposals/${nonExistentProposalId}`);

    expect(response.status).toBe(404);
    
  });
  it('should respond with status 422 for an invalid proposalId', async () => {
    // Mock data and setup for a request with an invalid proposalId
    const invalidProposalId = 'invalidId'; // Replace with an invalid proposalId

    // Make the request
    const response = await request(app).delete(`/api/proposals/${invalidProposalId}`);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Mock data and setup for a request where the server encounters an error
    const validProposalId = 1; // Replace with a valid proposalId
    propDao.deleteProposal.mockRejectedValueOnce(new Error('Test error'));

    // Make the request
    const response = await request(app).delete(`/api/proposals/${validProposalId}`);

    expect(response.status).toBe(500);
    
  });

  //PATCH /api/proposals/:proposalId/archive
  it('should respond with status 200 and archive the proposal for a valid proposalId', async () => {
    // Mock data and setup for a valid request
    const validProposalId = 1; // Replace with a valid proposalId
    propDao.getProposalById.mockResolvedValueOnce({ /* Mocked proposal data */ });
    propDao.archiveProposalWithoutApplication.mockResolvedValueOnce({ success: true });

    // Make the request
    const response = await request(app).patch(`/api/proposals/${validProposalId}/archive`);

    expect(response.status).toBe(200);
    
  });
  it('should respond with status 400 for a proposalId that does not exist', async () => {
    // Mock data and setup for a request with a non-existent proposalId
    const nonExistentProposalId = 999; // Replace with a proposalId that does not exist
    propDao.getProposalById.mockResolvedValueOnce(null);

    // Make the request
    const response = await request(app).patch(`/api/proposals/${nonExistentProposalId}/archive`);

    expect(response.status).toBe(400);
    
  });
  it('should respond with status 422 for an invalid proposalId', async () => {
    // Mock data and setup for a request with an invalid proposalId
    const invalidProposalId = 'invalidId'; // Replace with an invalid proposalId

    // Make the request
    const response = await request(app).patch(`/api/proposals/${invalidProposalId}/archive`);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Mock data and setup for a request where the server encounters an error
    const validProposalId = 1; // Replace with a valid proposalId
    propDao.getProposalById.mockResolvedValueOnce({ /* Mocked proposal data */ });
    propDao.archiveProposalWithoutApplication.mockRejectedValueOnce(new Error('Test error'));

    // Make the request
    const response = await request(app).patch(`/api/proposals/${validProposalId}/archive`);

    expect(response.status).toBe(500);

    // archive returning success: false
     // Mock data and setup for a request where the server encounters an error
     const validProposalId2 = 1; // Replace with a valid proposalId
     propDao.getProposalById.mockResolvedValueOnce({ /* Mocked proposal data */ });
     propDao.archiveProposalWithoutApplication.mockResolvedValueOnce({success: false});
 
     // Make the request
     const response2 = await request(app).patch(`/api/proposals/${validProposalId}/archive`);
 
     expect(response2.status).toBe(500);
  });

});
//#endregion
//#region Application
describe('Application routes', () => {
  //GET /api/applications/teacher/:professorId
  it('should respond with status 200 and return applications for a valid professorId', async () => {
    // Mock data and setup for a valid request
    const validProfessorId = 'd123456'; // Replace with a valid professorId
    const mockProposals = [{ /* Mocked proposal data */ }];
    const mockApplications = [{ /* Mocked application data */ }];
    propDao.getActiveProposalsByProfessor.mockResolvedValueOnce(mockProposals);
    appDao.getActiveApplicationsByProposal.mockResolvedValueOnce(mockApplications);

    // Make the request
    const response = await request(app).get(`/api/applications/teacher/${validProfessorId}`);

    expect(response.status).toBe(200);
    
  });
  it('should respond with status 200 and indicate resume existence for applications with valid resume files', async () => {
    // Mock data and setup for a valid request with a resume file
    const validProfessorId = 'd123456'; // Replace with a valid professorId
    const mockProposals = [{ /* Mocked proposal data */ }];
    const mockApplications = [{ id: 1 /* Mocked application data */, resumeeExists: true }];
    propDao.getActiveProposalsByProfessor.mockResolvedValueOnce(mockProposals);
    appDao.getActiveApplicationsByProposal.mockResolvedValueOnce(mockApplications);
    // Mocking the existence of the resume file
    filePathSpy.mockReturnValueOnce(true);
    // Make the request
    const response = await request(app).get(`/api/applications/teacher/${validProfessorId}`);
  
    expect(response.status).toBe(200);
    expect(response.body[0].resumeeExists).toBe(true);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 422 for an invalid professorId', async () => {
    // Mock data and setup for a request with an invalid professorId
    const invalidProfessorId = 'invalidId'; // Replace with an invalid professorId

    // Make the request
    const response = await request(app).get(`/api/applications/teacher/${invalidProfessorId}`);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Mock data and setup for a request where the server encounters an error
    const validProfessorId = 'd123456'; // Replace with a valid professorId
    propDao.getActiveProposalsByProfessor.mockRejectedValueOnce(new Error('Test error'));

    // Make the request
    const response = await request(app).get(`/api/applications/teacher/${validProfessorId}`);

    expect(response.status).toBe(500);
    
  });

  //GET /api/applications/student/:studentId
  it('should respond with status 200 and return applications for a valid studentId', async () => {
    // Mock data and setup for a valid request
    const validStudentId = 's123456'; // Replace with a valid studentId
    const mockApplications = [{ /* Mocked application data */ }];
    appDao.getApplicationsByStudent.mockResolvedValueOnce(mockApplications);
    // Make the request
    const response = await request(app).get(`/api/applications/student/${validStudentId}`);
    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for an invalid studentId', async () => {
    // Mock data and setup for a request with an invalid studentId
    const invalidStudentId = 'invalidId'; // Replace with an invalid studentId

    // Make the request
    const response = await request(app).get(`/api/applications/student/${invalidStudentId}`);

    expect(response.status).toBe(422);
    
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Mock data and setup for a request where the server encounters an error
    const validStudentId = 's123456'; // Replace with a valid studentId
    appDao.getApplicationsByStudent.mockRejectedValueOnce(new Error('Test error'));

    // Make the request
    const response = await request(app).get(`/api/applications/student/${validStudentId}`);

    expect(response.status).toBe(500);
    
  });

  //POST /api/applications'
  // Mock data and setup for a valid request
  const validProposalId = 1; // Replace with a valid proposalId
  const validStudentId = 's123456'; // Replace with a valid studentId
  const mockProposal = { id:-1};
  const mockApplication = { /* Mocked application data */ };
  const mockFile = {
    originalname: 'test.pdf',
    path: '/path/to/test.pdf',
  };
  it('should respond with status 200 and create an application for a valid request', async () => {
    // Set up mocks for a valid request
    appDao.getLastId.mockResolvedValueOnce(-1);
    propDao.getProposalById.mockResolvedValueOnce(mockProposal);
    appDao.getApplicationsByStudent.mockResolvedValueOnce([]);
    appDao.createApplication.mockResolvedValueOnce(mockApplication);
    mailServer.sendMail.mockResolvedValueOnce({});

    // Create a temporary file for the test
    // Create the temporary directory if it doesn't exist
    const tempDirPath = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDirPath)) {
      fs.mkdirSync(tempDirPath);
    }
    const tempFilePath = path.join(__dirname, 'temp', 'test.pdf');
    fs.writeFileSync(tempFilePath, 'Test file content');

    // Make the request with the file
    const response = await request(app)
      .post('/api/applications')
      .field('proposalId', validProposalId)
      .field('studentId', validStudentId)
      .attach('file', tempFilePath, 'test.pdf');

    // Remove the temporary file after the test
    fs.unlinkSync(tempFilePath);

    expect(response.status).toBe(200);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 500 for invalid file format', async () => {
    // Set up mocks for a request with a pending application
    appDao.getLastId.mockResolvedValueOnce(-1);
    appDao.getApplicationsByStudent.mockResolvedValueOnce([{ status: 'Pending' }]);
  
    // Create a temporary file (you can use an empty file or a dummy file)
    const tempFilePath = path.join(__dirname, 'temp', 'dummy.txt');
    fs.writeFileSync(tempFilePath, 'Dummy file content');
  
    // Make the request with the dummy file
    const response = await request(app)
      .post('/api/applications')
      .field('proposalId', validProposalId)
      .field('studentId', validStudentId)
      .attach('file', tempFilePath, 'dummy.txt');
  
    // Remove the temporary file after the test
    fs.unlinkSync(tempFilePath);
  
    expect(response.status).toBe(500);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 500 if the student already has a pending application', async () => {
    // Set up mocks for a request with a pending application
    appDao.getLastId.mockResolvedValueOnce(-1);
    appDao.getApplicationsByStudent.mockResolvedValueOnce([{ status: 'Pending' }]);
    fileUnlink.mockImplementationOnce(() => {}); // Mock the file deletion
  
    // Create a temporary file (you can use an empty file or a dummy file)
    const tempFilePath = path.join(__dirname, 'temp', 'dummy.pdf');
    fs.writeFileSync(tempFilePath, 'Dummy file content');
  
    // Make the request with the dummy file
    const response = await request(app)
      .post('/api/applications')
      .field('proposalId', validProposalId)
      .field('studentId', validStudentId)
      .attach('file', tempFilePath, 'dummy.pdf');
  
    // Remove the temporary file after the test
    fs.unlinkSync(tempFilePath);
  
    expect(response.status).toBe(500);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Set up mocks for a request where the server encounters an error
    appDao.getLastId.mockResolvedValueOnce(-1);
    appDao.getApplicationsByStudent.mockRejectedValueOnce(new Error('Test error'));
    fileUnlink.mockImplementationOnce(() => {}); // Mock the file deletion
  
    // Create a temporary file (you can use an empty file or a dummy file)
    const tempFilePath = path.join(__dirname, 'temp', 'dummy.pdf');
    fs.writeFileSync(tempFilePath, 'Dummy file content');
  
    // Make the request with the dummy file
    const response = await request(app)
      .post('/api/applications')
      .field('proposalId', validProposalId)
      .field('studentId', validStudentId)
      .attach('file', tempFilePath, 'dummy.pdf');
  
    // Remove the temporary file after the test
    fs.unlinkSync(tempFilePath);
    //removes the created file for the tests
    fs.unlinkSync(path.join(__dirname, '../uploads/', 'APP_0.pdf'))
  
    expect(response.status).toBe(500);
    
  });


  //PATCH /api/application/:proposalId/:studentId
  // Mock data
  const mockProposalId = 1;
  const mockStudentId = 's123456';
  const mockStatus = 'Accepted';
  mockProposal.title= 'Mock Proposal'; 
  it('should respond with status 200 and archive the proposal for Accepted status', async () => {
    // Set up mocks for a valid request with Accepted status
    propDao.getProposalById.mockResolvedValueOnce(mockProposal);
    propDao.archiveProposal.mockResolvedValueOnce({ success: true });
    mailServer.sendMail.mockResolvedValueOnce({});
    
    // Make the request
    const response = await request(app)
      .patch(`/api/application/${mockProposalId}/${mockStudentId}`)
      .send({ status: mockStatus });

    expect(response.status).toBe(200);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 200 and update the application status for Rejected status', async () => {
    // Set up mocks for a valid request with Rejected status
    propDao.getProposalById.mockResolvedValueOnce(mockProposal);
    appDao.setApplicationStatus.mockResolvedValueOnce({ success: true });
    mailServer.sendMail.mockResolvedValueOnce({});

    // Make the request
    const response = await request(app)
      .patch(`/api/application/${mockProposalId}/${mockStudentId}`)
      .send({ status: 'Rejected' });

    expect(response.status).toBe(200);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 422 if a parameter is wrong', async () => {
    // Set up mocks for a valid request with Rejected status
    mailServer.sendMail.mockResolvedValueOnce({});

    // Make the request
    const response = await request(app)
      .patch(`/api/application/${mockProposalId}/${mockStudentId}`)
      .send({ status: 'arborea' });

    expect(response.status).toBe(422);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 400 if the proposal is not found', async () => {
    // Set up mocks for a request with a non-existent proposal
    propDao.getProposalById.mockResolvedValueOnce(null);

    // Make the request
    const response = await request(app)
      .patch(`/api/application/${mockProposalId}/${mockStudentId}`)
      .send({ status: mockStatus });

    expect(response.status).toBe(400);
    // Add more assertions based on your expectations for the response body, etc.
  });
  it('should respond with status 500 if there is an error in the server', async () => {
    // Set up mocks for a request where the server encounters an error
    propDao.getProposalById.mockRejectedValueOnce(new Error('Test error'));
    // Make the request
    const response = await request(app)
      .patch(`/api/application/${mockProposalId}/${mockStudentId}`)
      .send({ status: mockStatus });
    expect(response.status).toBe(500);

    //archiversult fail
     // Set up mocks for a request where the server encounters an error
     propDao.getProposalById.mockResolvedValueOnce({prop:"osal"});
     propDao.archiveProposal.mockResolvedValue({success:false});
     // Make the request
     const responseA = await request(app)
       .patch(`/api/application/${mockProposalId}/${mockStudentId}`)
       .send({ status: mockStatus });
     expect(responseA.status).toBe(500);

     //result fail
     // Set up mocks for a request where the server encounters an error
     propDao.getProposalById.mockResolvedValueOnce({prop:"osal"});
     appDao.setApplicationStatus.mockResolvedValue({success:false});
     // Make the request
     const responseR = await request(app)
       .patch(`/api/application/${mockProposalId}/${mockStudentId}`)
       .send({ status: "Rejected" });
     expect(responseR.status).toBe(500);
    
  });

  //GET /api/files/resumees/:applicationId
  const mockUser = { id: 'd123456'}; // Mock teacher user ID
  const mockApplicationId = 1;
  mockApplication.id = mockApplicationId;
  const setUserMiddleware = (req, res, next) => {
    console.warn("I'm in the middle", req);
    req.user = mockUser;
    next();
  };
  beforeEach(function() {
    //Mock Passport's authenticate to bypass actual SAML authentication
    sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
      return function(req, res, next) {
        req.user = mockUser;
        req.isAuthenticated = () => true; // Mock isAuthenticated to return true
        callback(null, req.user, null);
      };
    });
  });

  afterEach(function() {
    // Restore the original authenticate function after each test
    passport.authenticate.restore();
  });
  it('should respond with status 422 for invalid parameters', async () => {
    const response = await request(app)
      .get('/api/files/resumees/invalidId')
      .expect(422);

    expect(response.body).toHaveProperty('error');
  });
  it('should respond with status 500 for generic errors inside', async () => {
    const response = await request(app)
      .get('/api/files/resumees/0')
      .expect(500);
  });

});
//#endregion
//#region Degrees
describe('Degrees routes', () => {
  it('should respond with status 200 for GET /api/degrees', async () => {
    degreeDao.getAll.mockResolvedValueOnce({data:"aaa"})
    const response = await request(app).get('/api/degrees');
    expect(response.status).toBe(200);
  });
  it('should respond with status 500 for GET /api/requests with some error', async () => {
      degreeDao.getAll.mockImplementationOnce(()=> {throw new Error('error')});
      const response = await request(app).get('/api/degrees');
      expect(response.status).toBe(500);
  });
});
//#endregion
//#region TimeTravel
describe('TimeTravel routes', () => {
  const validBody={destination:dayjs()};
  it('should respond with status 200 for PATCH /api/timetravel', async () => {
    timely.timelyDeArchive.mockResolvedValueOnce({success:true});
    timely.timelyExpiringEmails.mockResolvedValueOnce({success:true});
    timely.timelyArchive.mockResolvedValueOnce({success:true});
    const response = (await request(app).patch('/api/timetravel').send(validBody));
    expect(response.status).toBe(200);
  });
  it('should respond with status 422 for PATCH /api/timetravel with invalid date', async () => {
    const response = (await request(app).patch('/api/timetravel').send({}));
    expect(response.status).toBe(422);
  });
  it('should respond with status 500 for PATCH /api/timetravel with error in runAutoArchive', async () => {
    timely.timelyDeArchive.mockResolvedValueOnce({success:true});
    timely.timelyExpiringEmails.mockImplementationOnce(()=> {throw new Error('error')});
    timely.timelyArchive.mockResolvedValueOnce({success:true});
    const response = (await request(app).patch('/api/timetravel').send(validBody));
    expect(response.status).toBe(500);
  });
  it('should respond with status 500 for PATCH /api/timetravel with error in timelyDeArchive', async () => {
    timely.timelyDeArchive.mockImplementationOnce(()=> {throw new Error('error')});
    timely.timelyExpiringEmails.mockResolvedValueOnce({success:true});
    timely.timelyArchive.mockResolvedValueOnce({success:true});
    const response = (await request(app).patch('/api/timetravel').send(validBody));
    expect(response.status).toBe(500);
  });
});
//#endregion
//#region Request
describe('Request routes', () => {
    // /api/requests
    it('should respond with status 200 for GET /api/requests', async () => {
        reqDao.getAllRequestsForClerk.mockResolvedValueOnce([{data:"aaa"}]);
        reqDao.getAllRequests.mockResolvedValueOnce([{data:"aaa"}]);
        const response = await request(app).get('/api/requests');
        expect(response.status).toBe(200);
    });
    it('should respond with status 500 for GET /api/requests with some error', async () => {
        reqDao.getAllRequestsForClerk.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).get('/api/requests');
        expect(response.status).toBe(500);
    });

    // api/requests/:reqId
    it('should respond with status 200 for GET /api/requests', async () => {
        reqDao.getRequestById.mockResolvedValueOnce({data:"aaa"})
        const response = await request(app).get('/api/requests/1');
        expect(response.status).toBe(200);
    });
    it('should respond with status 422 for GET /api/requests with some req fields error', async () => {
        const response = await request(app).get('/api/requests/nan');
        expect(response.status).toBe(422);
    });
    it('should respond with status 500 for GET /api/requests with some error', async () => {
        reqDao.getRequestById.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).get('/api/requests/1');
        expect(response.status).toBe(500);
    });

    // api/requests/teacher/:professorId
    it('should respond with status 200 for GET /api/requests/teacher/:professorId', async () => {
      reqDao.getActiveRequestBySupervisor.mockResolvedValueOnce({data:"aaa"})
      const response = await request(app).get('/api/requests/teacher/d100001');
      expect(response.status).toBe(200);
    });
    it('should respond with status 422 for GET /api/requests/teacher/:professorId with some req fields error', async () => {
        const response = await request(app).get('/api/requests/teacher/s100001');
        expect(response.status).toBe(422);
    });
    it('should respond with status 500 for GET /api/requests/teacher/:professorId with some error', async () => {
        reqDao.getActiveRequestBySupervisor.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).get('/api/requests/teacher/d100001');
        expect(response.status).toBe(500);
    });

    // api/requests/student/:studentId
    it('should respond with status 200 for GET /api/requests/student/:studentId', async () => {
      reqDao.getActiveRequestByStudent.mockResolvedValueOnce({data:"aaa"})
      const response = await request(app).get('/api/requests/student/s100001');
      expect(response.status).toBe(200);
    });
    it('should respond with status 422 for GET /api/requests/student/:studentId with some req fields error', async () => {
        const response = await request(app).get('/api/requests/student/d100001');
        expect(response.status).toBe(422);
    });
    it('should respond with status 500 for GET /api/requests/student/:studentId with some error', async () => {
        reqDao.getActiveRequestByStudent.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).get('/api/requests/student/s100001');
        expect(response.status).toBe(500);
    });

    //POST /api/requests
    const validRequestBody = {
      reqData:{
        title: 'New Request',
        studentId: 's200002',
        supervisorId: 'd100001',
        description: 'New Description',
        applicationId: 4
      }
    };
    const invalidRequestBodyCoSup = {
      reqData:{
        title: 'New Request',
        studentId: 's200002',
        supervisorId: 'd100001',
        coSupervisorId: 'd200002 2',//wrong format
        description: 'New Description',
        applicationId: 4
      }
    };
    it('should respond with status 200 for POST /api/requests', async () => {
      appDao.getApplicationById.mockResolvedValueOnce({});
      reqDao.addRequest.mockResolvedValueOnce({success:true})
      const response = await request(app).post('/api/requests').send(validRequestBody);
      expect(response.status).toBe(200);
    });
    it('should respond with status 422 for POST /api/requests with some req fields error', async () => {
      let invalidRequestBody = {
        reqData:{
          //missing title
          studentId: 1,
          supervisorId: 2,
          coSupervisorId: 3,
          description: '',
          applicationId: 4
        }
      };
      //title
      const responseTitle = await request(app).post('/api/requests').send(invalidRequestBody);
      expect(responseTitle.status).toBe(422);
      //studentId
      invalidRequestBody.reqData.title = "Valid title";
      const responseStudent = await request(app).post('/api/requests').send(invalidRequestBody);
      expect(responseStudent.status).toBe(422);
      //teacherId
      invalidRequestBody.reqData.studentId = "s200002";
      const responseTeacher = await request(app).post('/api/requests').send(invalidRequestBody);
      expect(responseTeacher.status).toBe(422);
      //description
      invalidRequestBody.reqData.supervisorId = "d200002"
      const responseDescription = await request(app).post('/api/requests').send(invalidRequestBody);
      expect(responseDescription.status).toBe(422);
    });
    it('should respond with status 500 for POST /api/requests with some error in the cosup or app', async () => {
      //gets to '2' and it's not a valid format for id
      supervisorDao.getSupervisorById.mockResolvedValueOnce({id:'valid'});
      const response = await request(app).post('/api/requests').send(invalidRequestBodyCoSup);
      expect(response.status).toBe(500);

      //fails to find the first cosupervisor, even though it has a valid format
      supervisorDao.getSupervisorById.mockResolvedValueOnce(null);
      const responseNotFound = await request(app).post('/api/requests').send(invalidRequestBodyCoSup);
      expect(responseNotFound.status).toBe(500);
    });
    it('should respond with status 500 for POST /api/requests with some error', async () => {
        reqDao.addRequest.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).post('/api/requests').send(validRequestBody);
        expect(response.status).toBe(500);
    });

    //PATCH /api/requests/:reqId
    const validRequestBodyPatch = {
      reqData:{
        id:1,
        title: 'New Request',
        studentId: 's200002',
        supervisorId: 'd100001',
        description: 'New Description',
        applicationId: 4,
        status: "Approved"
      }
    };
    const invalidRequestBodyPatchCoSup = {
      reqData:{
        id:1,
        title: 'New Request',
        studentId: 's200002',
        supervisorId: 'd100001',
        coSupervisorId: 'd200002 2',//wrong format
        description: 'New Description',
        applicationId: 4
      }
    };
    it('should respond with status 200 for PATCH /api/requests/:reqId', async () => {
      appDao.getApplicationById.mockResolvedValueOnce({});
      reqDao.updateRequest.mockResolvedValueOnce({success:true})
      const response = await request(app).patch('/api/requests/1').send(validRequestBodyPatch);
      expect(response.status).toBe(200);
    });
    it('should respond with status 422 for PATCH /api/requests/:reqId with some req fields error', async () => {
      let invalidRequestBodyPatch = {
        reqData:{
          //missing id
          title:'',
          studentId: 1,
          supervisorId: 2,
          coSupervisorId: 3,
          description: '',
          applicationId: 4
        }
      };
      //id
      const responseId = await request(app).patch('/api/requests/1').send(invalidRequestBodyPatch);
      expect(responseId.status).toBe(422);
      //title
      invalidRequestBodyPatch.reqData.id = 1;
      const responseTitle = await request(app).patch('/api/requests/1').send(invalidRequestBodyPatch);
      expect(responseTitle.status).toBe(422);
      //studentId
      invalidRequestBodyPatch.reqData.title = "Valid title";
      const responseStudent = await request(app).patch('/api/requests/1').send(invalidRequestBodyPatch);
      expect(responseStudent.status).toBe(422);
      //teacherId
      invalidRequestBodyPatch.reqData.studentId = "s200002";
      const responseTeacher = await request(app).patch('/api/requests/1').send(invalidRequestBodyPatch);
      expect(responseTeacher.status).toBe(422);
      //description
      invalidRequestBodyPatch.reqData.supervisorId = "d200002"
      const responseDescription = await request(app).patch('/api/requests/1').send(invalidRequestBodyPatch);
      expect(responseDescription.status).toBe(422);
    });
    it('should respond with status 500 for PATCH /api/requests/:reqId with some error in the cosup or app', async () => {
      //gets to '2' and it's not a valid format for id
      supervisorDao.getSupervisorById.mockResolvedValueOnce({id:'valid'});
      const response = await request(app).patch('/api/requests/1').send(invalidRequestBodyPatchCoSup);
      expect(response.status).toBe(500);

      //fails to find the first cosupervisor, even though it has a valid format
      supervisorDao.getSupervisorById.mockResolvedValueOnce(null);
      const responseNotFound = await request(app).patch('/api/requests/1').send(invalidRequestBodyPatchCoSup);
      expect(responseNotFound.status).toBe(500);
    });
    it('should respond with status 500 for PATCH /api/requests/:reqId with some error', async () => {
        reqDao.updateRequest.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).patch('/api/requests/1').send(validRequestBodyPatch);
        expect(response.status).toBe(500);
    });
});
//#endregion