// Sever's main file
const loginDao = require('./DB/login-dao');
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const studDao = require('./DB/students-dao');
const supervisorDao = require('./DB/supervisors-dao');
const degreeDao = require('./DB/degrees-dao');
const {isLoggedIn, checkTeacherRole, checkStudentRole} = require('./Middlewares/authorization-middleware');
const mailServer = require('./utils/mail-server');
const express = require('express');
const bodyParser = require ('body-parser')
const cors = require('cors');
const moment = require('moment');
const dayjs = require('dayjs');
const passport = require('./utils/saml-config');
const session = require('express-session');

const PORT = 3001;
const FRONTEND = "http://localhost:5173/"
const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions)); // Enable CORS for all routes

//middleman to every call
app.use(bodyParser.json()); //to read from req.body

//session for login, using the passport defined in utils/saml-config
// Session middleware
app.use(session({
  secret: 'two men can share a secret, if one of them is dead',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000, // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//login
app.get('/login', passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }));

app.post('/login/callback',
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }),
  function(req, res, next) {
    //this is a passport-saml function used to save the session data
    req.logIn(req.user, function(err) {
      if (err) return next(err);
      return res.redirect(FRONTEND+"proposals");
    });
  }
);

//logout
app.get('/logout', (req, res) => {
  req.isAuthenticated() ?
  //this is a passport-saml function used to clean the session data
  req.logOut(function (err) {
     if (err) return res.status(500).json({ message: 'Internal Server Error' });; 
     return res.status(200).json({message: 'Successfully logged out'});
   }) :
   res.status(401).json({ message: 'Unauthorized' });
});

//session
app.get('/api/session', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
})

//#region Student
//gets data of the studnet of the application
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
//#endregion

//#region Proposals

//gets proposals for a professor
//GET /api/proposals/teacher/:professorId
app.get('/api/proposals/teacher/:professorId', 
  async (req, res) => {
    try {
        //gets all the professor's active proposals
        const proposals = await propDao.getActiveProposalsByProfessor(req.params.professorId);
        res.json(proposals);
    } catch (err){
      console.log(err);
      res.status(500).json({error:err});
  }
});

//gets all proposals available for a student
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

//creates a new proposal
//POST /api/proposals
app.post('/api/proposals', 
async (req, res) => {
  try {
    const userRole = req.role;
    if (userRole !== 'TEACHER')
      return res.status(403).json({ error: 'Forbidden' });
    const { body } = req;
    if (!(body.title && body.supervisor && body.cds && body.keywords && 
          body.type && body.description && body.expiration && body.level))
      return res.status(400).json({ error: 'Missing required fields' });

    if (moment(body.expiration).isBefore(moment(), 'days'))
      return res.status(400).json({ error: 'Invalid expiration date' });

    if (body.level !== 'BSc' && body.level !== 'MSc')
      return res.status(400).json({ error: 'Invalid level' });

    const supervisor = await supervisorDao.getSupervisorById(body.supervisor);
    if (!supervisor)
      return res.status(400).json({ error: 'Invalid supervisor' });
    
    body.groups = supervisor.COD_GROUP;
    const degree = await degreeDao.getDegreeByCode(body.cds);
    if (!degree)
      return res.status(400).json({ error: 'Invalid degree' });

    const proposal = await propDao.addProposal(req.body);
    return res.json(proposal);
} catch (error) {
    return res.status(500).json({ error: (error.message? error.message: error) })
}
});

//deletes an existing proposal
//DELETE /api/proposals/:proposalId
app.delete('/api/proposals/:proposalId', 
async (req, res) => {
  try {
      const result = await propDao.deleteProposal(req.params.proposalId);

      if (!result.success) {
          res.status(404).json({ error: 'Proposal not found' });
      } else {
          res.status(200).end();
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the proposal' });
  }
});

//#endregion

//#region Applications

//gets all applications of a professor 
//GET /api/applications/teacher/:professorId
app.get('/api/applications/teacher/:professorId', 
  async (req, res) => {
    try {
        //gets all the professor's proposals
        let applications = [];
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
      res.status(500).json({ error: `An error occurred while retrieving the applications for the professor ${req.params.professorId}`});
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

//POST /api/application/
app.post('/api/applications',
async (req, res) => {
  try {
    const pendingApps = await appDao.getApplicationsByStudent(req.body.studentId).then((rows) => rows.filter(r => r.status=="Pending"||r.status=="Accepted").length);

    if(pendingApps>0){
      console.log("Error length")
      return res.status(500).json({ error: `Student ${req.body.studentId} already has a pending application` });
    }

    const application = await appDao.createApplication(req.body.proposalId, req.body.studentId);

    res.json(application);
  } catch (err){
    console.log(err);
    return res.status(500).json({ error: 'An error occurred while creating the application' });
  }
});

//PATCH /api/application/:proposalsId/:studentId
app.patch('/api/application/:proposalsId/:studentId',
   async (req, res) => {
    try { 
        const proposal = await propDao.getProposalById(req.params.proposalsId);
        if (proposal) {
          if (req.body.status === "Accepted"){
            // Archives the proposal
            const archiveResult = await propDao.archiveProposal(req.params.proposalsId, req.params.studentId);
  
            if (!archiveResult.success) {
              throw new Error('An error occurred while archiving the proposal');
            }
            mailServer.sendMail(req.params.studentId, 'APPLICATION', { status: 'accepted', proposal: proposal.Title });
          } else {
            // Update the application status, will probably be a "rejected"
            const result = await appDao.setApplicationStatus(req.params.proposalsId, req.params.studentId, req.body.status);
            if (!result.success) {
              throw new Error('Application not found');
            }
            mailServer.sendMail(req.params.studentId, 'APPLICATION', { status: 'rejected', proposal: proposal.Title });
          }
  
          res.status(200).end();
        } else {
          res.status(400).json({ error: 'Proposal not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating application status' });
    }
});

app.get('/api/degrees', 
  async (req, res) => {
    try {
        const degrees = await degreeDao.getAll();
        res.json(degrees);
    } catch (err){
      res.status(500).end();
  }
});

//#endregion

