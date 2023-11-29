// Sever's main file
const loginDao = require('./DB/login-dao');
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const studDao = require('./DB/students-dao');
const supervisorDao = require('./DB/supervisors-dao');
const degreeDao = require('./DB/degrees-dao');
const authorizationMiddleware = require('./Middlewares/authorization-middleware');
const mailServer = require('./utils/mail-server');
const express = require('express');
const bodyParser = require ('body-parser')
const cors = require('cors');
const app = express();
const moment = require('moment');
const PORT = 3001;
const dayjs = require('dayjs');
const multer = require('multer');
const fs = require('fs');


app.use(cors()); // Enable CORS for all routes
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//middleman to every call
app.use(bodyParser.json()); //to read from req.body
app.use(authorizationMiddleware.checkUserRole);
let sessionUser = {};

//#region Login
//GET /api/login
app.get('/api/login', 
  async (req, res) => {
    try {
        //gets all the professor's active proposals
        res.json(sessionUser);
    } catch (err){
      console.log(err);
      res.status(500).end();
  }
});
//POST /api/login
app.post('/api/login', 
  async (req, res) => {
    try {
        //gets user with that credentials
        const user = await loginDao.effectLogin(req.body.credentials);
        sessionUser = user;
        res.json(user);
    } catch (err){
      console.log(err);
      res.status(500).json({error:err});
  }
});
//DELETE /api/login
app.delete('/api/login', 
  async (req, res) => {
    try {
        //empties the session user info
        sessionUser = {};
        res.json(sessionUser);
    } catch (err){
      console.log(err);
      res.status(500).json({error:err});
  }
});
//#endregion

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

      let proposals = await propDao.getAvailableProposals(req.params.studentId, filter);
      //console.log(proposals);
      const applications = await appDao.getApplicationsByStudent(req.params.studentId);
      //console.log(applications);
      proposals = proposals.map(p => {
        if(applications.some(app => app.id === p.id && app.status === "Pending")){
          return {...p, applicationExists: true};
        }
        return {...p, applicationExists: false};
      })

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    cb(null, 'uploads/'); // La cartella dove verranno memorizzati i file
  },
  filename: (req, file, cb) => {
    appDao.getLastId().then((id)=>{
      console.log(id)
      cb(null, `APP_${id}.${file.originalname.split('.').pop()}`);
    });
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10000000}, //10mb
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = ['application/pdf'];
    if(!allowedFileTypes.includes(file.mimetype)){
      req.fileValidationError = 'File type not accepted';
      console.error(req.fileValidationError)
      return cb(null, false, new Error('File type not accepted'));
    }
    cb(null, true);
   }
});


//POST /api/application/
app.post('/api/applications', upload.single('file'),
async (req, res) => {
  const file = req.file;
  try {

    if (!file || !file.originalname) {
      return res.status(400).send('Invalid File');
    }

    const pendingApps = await appDao.getApplicationsByStudent(req.body.studentId).then((rows) => rows.filter(r => r.status=="Pending"||r.status=="Accepted").length);

    if(pendingApps>0){
      if(file){
        console.log(file.path)
        fs.unlinkSync(file.path);
      }
      console.log("Error length")
      return res.status(500).json({ error: `Student ${req.body.studentId} already has a pending application` });
    }

    const application = await appDao.createApplication(req.body.proposalId, req.body.studentId);

    res.json(application);
  } catch (err){
    if(file){
      console.log(file.path)
      fs.unlinkSync(file.path);
    }
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

