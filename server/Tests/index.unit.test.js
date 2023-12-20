//#region imports and mocks
// supervisorDao
const supervisorDao = require('../DB/supervisors-dao');
jest.mock('../DB/supervisors-dao',()=>({
    getSupervisorById: jest.fn(),
}))
// applicationDao
const appDao = require('../DB/applications-dao');
jest.mock('../DB/applications-dao',()=>({
    getApplicationById: jest.fn(),
}))
// degreeDao
const degreeDao = require('../DB/degrees-dao');
jest.mock('../DB/degrees-dao',()=>({
    getAll: jest.fn(),
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
//#endregion
//app imports
const dayjs = require('dayjs');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const {app, server} = require('../index.js'); // Replace with the actual path to your server file

//const consoleLogSpy = jest.spyOn(console, 'log');

afterAll((done) => {
    // Close the server to release the handle
    server.close(done);
  });
  
//#region login/out/session
/*
describe('Logout route', () => {
    beforeEach(function() {
        //Mock Passport's authenticate to bypass actual SAML authentication
        sinon.stub(passport, 'authenticate').callsFake((strategy, options, callback) => {
          return function(req, res, next) {
            req.user = {};
            req.isAuthenticated = () => true; // Mock isAuthenticated to return true
            callback(null, req.user, null);
          };
        });
      });
    
      afterEach(function() {
        // Restore the original authenticate function after each test
        passport.authenticate.restore();
      });
    it('should respond with status 200 and message if user is authenticated', async () => {
        const response = await request(app).get('/logout').set('credentials', 'include');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successfully logged out');
    });
  
    it('should respond with status 401 if user is not authenticated', async () => {
      const response = await request(app).get('/logout');
  
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  
    it('should respond with status 500 if an error occurs during logout', async () => {
        const response = await request(app).get('/logout');
    
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal Server Error');
    });
});
*/
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
        reqDao.getAllRequestsForClerk.mockResolvedValueOnce({data:"aaa"})
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