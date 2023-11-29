// Sever's main file
const loginDao = require('./DB/login-dao');
const appDao = require('./DB/applications-dao');
const propDao = require('./DB/proposals-dao');
const studDao = require('./DB/students-dao');
const supervisorDao = require('./DB/supervisors-dao');
const degreeDao = require('./DB/degrees-dao');
const { isLoggedIn, checkTeacherRole, checkStudentRole } = require('./Middlewares/authorization-middleware');
const mailServer = require('./utils/mail-server');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const moment = require('moment');
const dayjs = require('dayjs');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');

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
//middleman to every call
app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(bodyParser.json()); //to read from req.body
app.use(express.json()); //used for the validator

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

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, path, value, nestedErrors }) => {
  return `${location}[${path}]: ${msg}`;
};
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//login
app.get('/login', passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }));

app.post('/login/callback',
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate('saml', { failureRedirect: '/login', failureFlash: true }),
  function (req, res, next) {
    //this is a passport-saml function used to save the session data
    req.logIn(req.user, function (err) {
      if (err) return next(err);
      return res.redirect(FRONTEND + "proposals");
    });
  }
);

//logout
app.get('/logout', (req, res) => {
  req.isAuthenticated() ?
    //this is a passport-saml function used to clean the session data
    req.logOut(function (err) {
      if (err) return res.status(500).json({ message: 'Internal Server Error' });;
      return res.status(200).json({ message: 'Successfully logged out' });
    }) :
    res.status(401).json({ message: 'Unauthorized' });
});

//session
app.get('/api/session', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Not authenticated' });
})

//#region Student

//gets data of the studnet of the application
//GET /api/application/:proposalId/:studentId
app.get('/api/application/:proposalId/:studentId',
  isLoggedIn,
  [
    check('proposalId').isInt(),
    check('studentId').not().isEmpty().matches(/s[0-9]{6}/)
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      const studentData = await studDao.getStudentData(req.params.studentId);
      if (studentData === undefined)
        throw (new Error("Student not found"));
      studentData.career = await studDao.getCarreerByStudent(req.params.studentId);
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

// Added for ApplicationTableComponent
app.get('/api/students', 
  isLoggedIn,
  async (req, res) => {
  try {
    const students = await studDao.getStudents();
    if (students === undefined)
      throw (new Error("No students found"));
    //we remove private/useless data:
    students.forEach(student => {
      delete student.gender;
      delete student.nationality;
      delete student.enrollment;
    });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while retrieving students data' });
  }
});
//#endregion

//#region Proposals
//gets a single proposal
app.get('/api/proposals/:proposalId')
//GET /api/proposals/:proposalId
app.get('/api/proposals/:proposalId',
  isLoggedIn,
  [
    check('proposalId').not().isEmpty().isInt()
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      //gets all the professor's active proposals
      const proposal = await propDao.getProposalById(req.params.proposalId);
      if(proposal){
        return res.status(200).json(proposal);
      }
      const archivedProposal = await propDao.getArchivedProposalById(req.params.proposalId);
      if(archivedProposal){
        return res.status(200).json(archivedProposal);
      }
      throw new Error('Missing Proposal');
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
});

//gets all active proposals for a professor
//GET /api/proposals/teacher/:professorId
app.get('/api/proposals/teacher/:professorId',
  isLoggedIn,
  checkTeacherRole,
  [
    check('professorId').not().isEmpty().matches(/d[0-9]{6}/)
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      //gets all the professor's active proposals
      const proposals = await propDao.getActiveProposalsByProfessor(req.params.professorId);
      res.json(proposals);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
});

//gets all proposals available for a student
//GET /api/proposals
app.get('/api/proposals/students/:studentId',
  isLoggedIn,
  checkStudentRole,
  [
    check('studentId').not().isEmpty().matches(/s[0-9]{6}/)
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }
    try {
      //implementing basic flitering by keyword

      //validation 

      let filter = {};
      if (req.query.title && typeof req.query.title === 'string') {
        filter['title'] = req.query.title;
      }
      if (req.query.supervisor && typeof req.query.supervisor === 'string') {
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
      if (req.query.coSupervisor && typeof req.query.coSupervisor === 'string') {
        filter['coSupervisor'] = req.query.coSupervisor;
      }
      if (req.query.keywords && typeof req.query.keywords === 'string') {
        filter['keywords'] = req.query.keywords;
      }
      if (req.query.groups && typeof req.query.groups === 'string') {
        filter['groups'] = req.query.groups;
      }
      if (req.query.type && typeof req.query.type === 'string') {
        filter['type'] = req.query.type;
      }
      if (req.query.description && typeof req.query.description === 'string') {
        filter['description'] = req.query.description;
      }
      if (req.query.reqKnowledge && typeof req.query.reqKnowledge === 'string') {
        filter['reqKnowledge'] = req.query.reqKnowledge;
      }
      if (req.query.notes && typeof req.query.notes === 'string') {
        filter['notes'] = req.query.notes;
      }
      if (req.query.expiration && typeof req.query.expiration === 'string' && dayjs(req.query.expiration).isValid()) {
        filter['expiration'] = req.query.expiration;
      }
      if (req.query.level && typeof req.query.level === 'string') {
        filter['level'] = req.query.level;
      }
      if (req.query.degree && typeof req.query.degree === 'string') {
        filter['degree'] = req.query.degree;
      }

      let order = {};
      if(req.query.ordField && typeof req.query.ordField === 'string'){
        order.field = req.query.ordField;
        order.direction = true;
      }
      if(req.query.dir && typeof req.query.dir === 'string'){
        order.direction = req.query.dir=='true';
      }

      let proposals = await propDao.getAvailableProposals(req.params.studentId, filter, order);
      const applications = await appDao.getApplicationsByStudent(req.params.studentId);

      proposals = proposals.map(p => {
        if (applications.some(app => (app.status === "Pending" || app.status === "Accepted"))){
          return { ...p, applicationExists: true };
        }
        return { ...p, applicationExists: false };
      })

      res.json(proposals);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  });

//creates a new proposal
//POST /api/proposals
app.post('/api/proposals',
  isLoggedIn,
  checkTeacherRole,
  [
    check('title').not().isEmpty(),
    check('keywords').not().isEmpty(),
    check('type').not().isEmpty(),
    check('description').not().isEmpty(),
    check('expiration').custom((value) => {
      if (moment(value, 'YYYY-MM-DD').startOf('day').isBefore(moment().startOf('day'))) {
        throw new Error('Invalid expiration date');
      }
      return true;
    }),
    check('level').isIn(['BSc', 'MSc']).withMessage('Invalid level'),
    check('supervisor').custom(async (value) => {
      const supervisor = await supervisorDao.getSupervisorById(value);
      if (!supervisor) {
        throw new Error('Invalid supervisor');
      }
      return true;
    }),
    check('cds').custom(async (value) => {
      const degree = await degreeDao.getDegreeByCode(value);
      if (!degree) {
        throw new Error('Invalid degree');
      }
      return true;
    }),
  ],
  async (req, res) => {
    //validation rejected
    console.log(req.body)
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      const proposal = await propDao.addProposal(req.body);
      res.json(proposal);
    } catch (error) {
      return res.status(500).json({ error: (error.message ? error.message : error) })
    }
  }
);

//deletes an existing proposal
//DELETE /api/proposals/:proposalId
app.delete('/api/proposals/:proposalId',
  isLoggedIn,
  checkTeacherRole,
  [
    check('proposalId').isInt()
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

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
  }
);

// archive an existing proposal
//PATCH /api/proposals/:proposalId
app.patch('/api/proposals/:proposalId',
  isLoggedIn,
  checkTeacherRole,
  [
    check('proposalId').isInt(),
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      const proposal = await propDao.getProposalById(req.params.proposalId);
      if (proposal) {
          // Archives the proposal
          const archiveResult = await propDao.archiveProposalWithoutApplication(req.params.proposalId);

          if (!archiveResult.success) {
            throw new Error('An error occurred while archiving the proposal');
          }
        res.status(200).end();
      } else {
        res.status(400).json({ error: 'Proposal not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'An error occurred while archiving the proposal' });
    }
  });

//#endregion

//#region Applications

//gets all applications of a professor 
//GET /api/applications/teacher/:professorId
app.get('/api/applications/teacher/:professorId',
  isLoggedIn,
  checkTeacherRole,
  [
    check('professorId').not().isEmpty().matches(/d[0-9]{6}/)
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      //gets all the professor's proposals
      let applications = [];
      const proposals = await propDao.getActiveProposalsByProfessor(req.params.professorId);
      //gets all the applications for the proposals if we found any
      if (proposals.length > 0) {
        applications = await Promise.all(
          proposals.map(p => appDao.getActiveApplicationsByProposal(p))
        );
      }
      //return json w/o empty results of all the proposals
      res.json(applications.filter(value => Object.keys(value).length !== 0).flat());
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: `An error occurred while retrieving the applications for the professor ${req.params.professorId}` });
    }
  });

//GET /api/applications/student/:studentId
app.get('/api/applications/student/:studentId',
  isLoggedIn,
  checkStudentRole,
  [
    check('studentId').not().isEmpty().matches(/s[0-9]{6}/)
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      //gets all the student's proposals
      const applications = await appDao.getApplicationsByStudent(req.params.studentId);
      res.json(applications);
    } catch (err) {
      console.log(err);
      res.status(500).end();
    }
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, 'uploads/'); // La cartella dove verranno memorizzati i file
  },
  filename: (req, file, cb) => {
    appDao.getLastId().then((id) => {
      cb(null, `APP_${id + 1}.${file.originalname.split('.').pop()}`);
    });
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, //10mb
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = ['application/pdf'];
    if (!allowedFileTypes.includes(file.mimetype)) {
      req.fileValidationError = 'File type not accepted';
      console.error(req.fileValidationError)
      return cb(null, false, new Error('File type not accepted'));
    }
    cb(null, true);
  }
});


//POST /api/application/
app.post('/api/applications', 
  isLoggedIn,
  checkStudentRole,
  [
    check('proposalId').not().isEmpty().isInt(),
    check('studentId').not().isEmpty().matches(/s[0-9]{6}/),
  ], upload.single('file'),
  async (req, res) => {
    const file = req.file;
    try {

      if (!file || !file.originalname) {
        return res.status(400).send('Invalid File');
      }

      const pendingApps = await appDao.getApplicationsByStudent(req.body.studentId).then((rows) => rows.filter(r => r.status == "Pending" || r.status == "Accepted").length);

      if (pendingApps > 0) {
        if (file) {
          fs.unlinkSync(file.path);
        }
        console.log("Error length")
        return res.status(500).json({ error: `Student ${req.body.studentId} already has a pending application` });
      } const application = await appDao.createApplication(req.body.proposalId, req.body.studentId);

      res.json(application);
    } catch (err) {
      if (file) {
        fs.unlinkSync(file.path);
      }
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while creating the application' });
    }
  });

//PATCH /api/application/:proposalId/:studentId
app.patch('/api/application/:proposalId/:studentId',
  isLoggedIn,
  checkTeacherRole,
  [
    check('proposalId').isInt(),
    check('studentId').not().isEmpty().matches(/s[0-9]{6}/),
    check('status').isIn(['Accepted', 'Rejected', 'Cancelled', 'Pending'])
  ],
  async (req, res) => {
    //validation rejected 
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") });
    }

    try {
      const proposal = await propDao.getProposalById(req.params.proposalId);
      if (proposal) {
        if (req.body.status === "Accepted") {
          // Archives the proposal
          const archiveResult = await propDao.archiveProposal(req.params.proposalId, req.params.studentId);

          if (!archiveResult.success) {
            throw new Error('An error occurred while archiving the proposal');
          }
          mailServer.sendMail(req.params.studentId, 'APPLICATION', { status: 'accepted', proposal: proposal.Title });
        } else {
          // Update the application status, will probably be a "rejected"
          const result = await appDao.setApplicationStatus(req.params.proposalId, req.params.studentId, req.body.status);
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
      res.status(500).json({ error: 'An error occurred while updating application status' });
    }
  });

//#endregion

//#region Degrees
//GET localhost:3001/api/degrees
app.get('/api/degrees',
  isLoggedIn,
  async (req, res) => {
    try {
      const degrees = await degreeDao.getAll();
      res.json(degrees);
    } catch (err) {
      res.status(500).end();
    }
  });
//#endregion

