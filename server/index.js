// Sever's main file
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const studDao = require('./DB/students-dao');
const express = require('express');
const bodyParser = require ('body-parser')
const cors = require('cors');
const app = express();
const PORT = 3001;
const authorizationMiddleware = require('./Middlewares/authorization-middleware');

app.use(cors()); // Enable CORS for all routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//middleman to every call
app.use(bodyParser.json()); //to read from req.body
app.use(authorizationMiddleware.checkUserRole);

//GET /api/proposals/teacher/:professorId
app.get('/api/proposals/teacher/:professorId', 
  async (req, res) => {
    try {
        //gets all the professor's active proposals
        const proposals = await propDao.getActiveProposalsByProfessor(req.params.professorId);
        res.json(proposals);
        console.log(proposals);
    } catch (err){
      console.log(err);
      res.status(500).end();
  }
});


//GET /api/applications/teacher/:professorId
app.get('/api/applications/teacher/:professorId', 
  async (req, res) => {
    try {
        //gets all the professor's proposals
        let applications = [{}];
        const proposals = await propDao.getActiveProposalsByProfessor(req.params.professorId);
        //gets all the applications for the proposals if we found any
        if(proposals.length>0){
          applications = await Promise.all(
            proposals.map(p => appDao.getActiveApplicationsByProposal(p))
          );
        }
        //return json w/o empty results of all the proposals
        res.json(applications.filter(value => Object.keys(value).length !== 0).flat());
    } catch (err){
      console.log(err);
      res.status(500).json({ error: 'An error occurred while retrieving the applications data' });
  }
});

//GET /api/application/:proposalsId/:studentId
app.get('/api/application/:proposalsId/:studentId',
  async (req, res) => {
    try {
      const studentData = await studDao.getStudentData(req.params.studentId);
      if(studentData === undefined)
        throw(new Error("Student not found"));
      studentData.career  = await studDao.getCarreerByStudent(req.params.studentId);
      //we remove private/useless data:
      delete studentData.gender;
      delete studentData.nationality;
      delete studentData.enrollment;
      
      res.json(studentData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while retrieving student data' });
  }
});

//GET /api/applications/student/:studentId
app.get('/api/applications/student/:studentId', 
  async (req, res) => {
    try {
        //gets all the student's proposals
        const applications = await appDao.getApplicationsByStudent(req.params.studentId);
        res.json(applications);
    } catch (err){
      console.log(err);
      res.status(500).end();
  }
});

//PATCH /api/application/:proposalsId/:studentId
app.patch('/api/application/:proposalsId/:studentId',
   async (req, res) => {
    try {
        // Update the application status
        const result = await appDao.setApplicationStatus(req.params.proposalsId, req.params.studentId, req.body.status);
        if (!result.success) {
            throw new Error('Application not found');
        }
        
        if(req.body.status === "Accepted"){
          // Archive the proposal
          const archiveResult = await propDao.archiveProposal(req.params.proposalsId, req.params.studentId);

          if (!archiveResult.success) {
            throw new Error('An error occurred while archiving the proposal');
          }

          const autoReject = await appDao.autoRejectApplication(req.params.proposalsId, req.params.studentId);
          
          if (!autoReject.success) {
            throw new Error('An error occurred while auto rejecting the proposal');
          }

      }

        res.status(200).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating application status' });
    }
});