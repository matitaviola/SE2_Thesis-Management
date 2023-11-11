// Sever's main file
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser') ;
const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS for all routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//middleman to every call
app.use(bodyParser.json()); //to read from req.body



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
            proposals.map(p => appDao.getApplicationsByProposal(p))
          );
        }
        //return json w/o empty results of all the proposals
        res.json(applications.filter(value => Object.keys(value).length !== 0).flat());
    } catch (err){
      console.log(err);
      res.status(500).end();
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
