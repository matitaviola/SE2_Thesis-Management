// Sever's main file
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser') ;
const app = express();
const PORT = 3001;
const dayjs = require('dayjs');


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


//GET /api/proposals
app.get('/api/proposals/students/:studentId', 
  async (req, res) => {
    try {
        //implementing basic flitering by keyword

        //validation 

        let filter = {};
        if(req.query.title && typeof req.query.title === 'string'){
            filter['title'] = req.query.title;
        }
        if(req.query.supervisor && typeof req.query.supervisor === 'string'){
            filter['supervisor'] = req.query.supervisor;
        }

        /*        
        if(req.query.supervisorName && typeof req.query.supervisorName === 'string'){
          filter['supervisorName'] = req.query.supervisorName;
        }
        if(req.query.supervisorSurname && typeof req.query.supervisorSurname === 'string'){
          filter['supervisorSurname'] = req.query.supervisorSurname;
        }
        */
        if(req.query.coSupervisor && typeof req.query.coSupervisor === 'string'){
            filter['coSupervisor'] = req.query.coSupervisor;
        }
        if(req.query.keywords && typeof req.query.keywords === 'string'){
          filter['keywords'] = req.query.keywords;
        }
        if(req.query.groups && typeof req.query.groups === 'string'){
          filter['groups'] = req.query.groups;
        }
        if(req.query.type && typeof req.query.type === 'string'){
          filter['type'] = req.query.type;
        }
        if(req.query.description && typeof req.query.description === 'string'){
          filter['description'] = req.query.description;
        }
        if(req.query.reqKnowledge && typeof req.query.reqKnowledge === 'string'){
          filter['reqKnowledge'] = req.query.reqKnowledge;
        }
        if(req.query.notes && typeof req.query.notes === 'string'){
          filter['notes'] = req.query.notes;
        }
        if(req.query.expiration && typeof req.query.expiration === 'string' && dayjs(req.query.expiration).isValid()){
          filter['expiration'] = req.query.expiration;
        }
        if(req.query.level && typeof req.query.level === 'string'){
          filter['level'] = req.query.level;
        }
        if(req.query.degree && typeof req.query.degree === 'string'){
          filter['degree'] = req.query.degree;
        }

        const proposals = await propDao.getAvailableProposals(req.params.studentId, filter);
        res.json(proposals);
    } catch (err){
      console.log(err);
      res.status(500).end();
  }
});
