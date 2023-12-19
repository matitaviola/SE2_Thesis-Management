//#region imports and mocks
// reqdao
const reqDao = require('../DB/request-dao');
jest.mock('../DB/request-dao',()=>({
    getAllRequests: jest.fn(),
    getRequestById: jest.fn(),
    getRequestBySupervisor: jest.fn(),
    addRequest: jest.fn(),
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

//#region Request
describe('Request routes', () => {
    // /api/requests
    it('should respond with status 200 for GET /api/requests', async () => {
        reqDao.getAllRequests.mockResolvedValueOnce({data:"aaa"})
        const response = await request(app).get('/api/requests');
        expect(response.status).toBe(200);
    });
    it('should respond with status 500 for GET /api/requests with some error', async () => {
        reqDao.getAllRequests.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).get('/api/requests');
        expect(response.status).toBe(500);
    });

    // api/requests/:reqId
    it('should respond with status 200 for GET /api/requests', async () => {
        reqDao.getRequestById.mockResolvedValueOnce({data:"aaa"})
        const response = await request(app).get('/api/requests/1');
        expect(response.status).toBe(200);
    });
    it('should respond with status 422 for GET /api/requests with some error', async () => {
        const response = await request(app).get('/api/requests/nan');
        expect(response.status).toBe(422);
    });
    it('should respond with status 500 for GET /api/requests with some error', async () => {
        reqDao.getRequestById.mockImplementationOnce(()=> {throw new Error('error')});
        const response = await request(app).get('/api/requests/1');
        expect(response.status).toBe(500);
    });
});
//#endregion