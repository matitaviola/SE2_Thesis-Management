// Sever's main file
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const studDao = require('./DB/students-dao');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS for all routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



//GET /api/applications/:professorId
app.get('/api/applications/teacher/:professorId', 
  async (req, res) => {
    try {
        //gets all the professor's proposals
        let applications = [{}];
        const proposals = await propDao.getProposalsByProfessor(req.params.professorId);
        //gets all the applications for the proposals if we found any
        if(proposals.length>0){
          applications = await Promise.all(
            proposals.map(p => appDao.getApplicationsByProposal(p))
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
      const studentData = await studDao.getStudentDataByProposal(req.params.studentId);
      res.json(studentData);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while retrieving student data' });
  }
});