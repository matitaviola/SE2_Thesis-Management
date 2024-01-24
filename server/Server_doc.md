# Server Documentation

## Routes
### Auth
- __'/login'__ [GET]: redirects to the SAML provider.
- __'/login/callback'__ [POST]: when coming back to the SAML auth, performs some additional checks.
- __'/logout'__ [GET]: performs logout, clearing the session info.
- __'/api/session'__ [GET]: retireves the current session info.

### Student
- __'/api/application/:proposalId/:studentId'__ [GET]: gets data of the student of the application.
- __'/api/students'__ [GET]: returns the list of students used in the application table of a professor.

### Teacher&Cosupervisors
- __'/api/cosupervisors/:professorId'__ [GET]: gets all the cosupervisors, for a professor.
- __'/api/cosupervisors'__ [GET]: gets all the professors, for a student.

### Proposals
- __'/api/proposals/:proposalId'__ [GET]: returns a proposal information.
- __'/api/proposals/:proposalId/cosupervisors'__ [GET]: gets a proposal's list of cosupervisors (name, surmane, id/mail for academic/external).
- __'/api/proposals/teacher/:professorId'__ [GET]: gets all the active proposals for a professor.
- __'/api/proposals/teacher/:professorId/archived'__ [GET]: gets all thearchived proposals for a professor.
- __'/api/proposals/students/:studentId'__ [GET]: gets all proposals available for a student.
- __'/api/proposals'__ [POST]: creates a new proposal.
- __'/api/proposals/:proposalId'__ [PATCH]: updates an existing proposal
- __'/api/proposals/:proposalId'__ [DELETE]: deletes an existing proposal.
- __'/api/proposals/:proposalId/archive'__ [PATCH]: archives an existing proposal.

### Applications
- __'/api/applications/teacher/:professorId'__ [GET]: gets all applications of a professor.
- __'/api/applications/student/:studentId'__ [GET]: gets all applications submitted by a student.
- __'/api/applications'__ [POST]: submits a new application.
- __'/api/application/:proposalId/:studentId'__ [PATCH]: updates an application (accept or reject).
- __'/api/files/resumees/:applicationId'__ [GET]: gets the file uploaded for an application.

### Degrees
- __'/api/degrees'__ [GET]: returns the list of existing degrees/CdS.

### Time Travel
- __'/api/timetravel'__ [PATCH]: allows to time travel.

### Request
- __'/api/requests'__ [GET]: gets all existing requests, for clerks.
- __'/api/requests/:reqId'__ [GET]: gets a specific request.
- __'/api/requests/teacher/:professorId'__ [GET]: gets all the active requests of a specific supervisor.
- __'/api/requests/student/:studentId'__ [GET]: gets the only active request of a student.
- __'/api/requests'__ [POST]: creates a new request, it comes from a student.
- __'/api/requests/:reqId'__ [PATCH]: patches a request, it comes from anyone.

## Utils
- __mail-server__: uses nodemailer to send email notifications for the related stories. The account used is 'groupsofteng6@gmail.com'.
- __saml-config__: defines parameters and functions used for the SAML2.0-compliant authentication. The certificates used can be found in the 'certificate' folder.
- __timely_functions__: exports functions to archive, dearchive and notify (using the mail-server) proposals and applications using the Virtual Clock implemented on the client.

## Database DAOs
- __db__: is the key piece, the one that the other DAO use to acces sthe DB.
- __login-dao__
- __application-dao__
- __degrees-dao__
- __proposals-dao__
- __request-dao__
- __students-dao__
- __supervisors-dao__

## Middlewares
- __authorization-middleware__: exports the middlewares used on the index routes for checking if a user is logged-in and if it has the correct role to access the route.