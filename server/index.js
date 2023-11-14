// Sever's main file
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const supervisorDao = require('./DB/supervisors-dao');
const degreeDao = require('./DB/degrees-dao');
const authorizationMiddleware = require('./Middlewares/authorization-middleware');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const moment = require('moment');
const PORT = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(authorizationMiddleware.checkUserRole);
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

app.post('/api/proposals', 
  async (req, res) => {
    try {
      const userRole = req.role;
      if (userRole !== 'TEACHER')
        return res.status(403).json({ error: 'Forbidden' });

      const { body } = req;
      if (!(body.title && body.supervisor && body.co_supervisor && body.cds &&
            body.keywords && body.type && body.groups && body.description && 
            body.req_knowledge && body.notes && body.expiration && body.level))
          throw new Error('Missing parameters');

      if (moment(body.expiration).isBefore(moment()))
        throw new Error('Invalid expiration date');
      if (body.level !== 'BSc' && body.level !== 'MSc')
        throw new Error('Invalid level');

      const supervisor = await supervisorDao.getSupervisorById(body.supervisor);
      if (!supervisor)
        throw new Error('Invalid supervisor');

      const degree = await degreeDao.getDegreeByCode(body.cds);
      if (!degree)
        throw new Error('Invalid degree');

      const proposal = await propDao.addProposal(req.body);
      res.json(proposal);
  } catch (error) {
      if (error === 'Duplicate title')
        return res.status(400).json({ error: 'Duplicate title'});
      if (error instanceof Error || error.code === 'SQLITE_ERROR')
          return res.status(400).json({ error: error.message });
      return res.status(500).json({ error: error.message || error })
  }
});