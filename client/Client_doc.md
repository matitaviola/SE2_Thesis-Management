# Client Documentation

## Client Routes division and used components
- __"/"__: home page, just a title and a logo.
    - Components: __HomeComponent__
- __"login"__: allows users to access to the application. It uses SAML2.0 external authentication, using Auth0 as a provider.
    - Components: __LoginComponent__
- __"proposals"__: shows the list of proposals, for Professors and Students.
    - Components: __ProposalsTableComponent__, __ArchivedProposalsTableComponent__
- __"proposals/:proposalsId"__: shows the informations of a single proposal with the given id. A professor can update/delete/archive the proposal. A student can apply to it.
    - Components: __ProposalComponent__, __CancelledProposalComponent__
- __"proposals/new"__: for a professor to create a new proposal.
    - Components: __ProposalFormComponent__
- __"proposals/update"__: for a professor to update a proposal.
    - Components: __ProposalFormComponent__
- __"applications"__: shows the list of applications for Professors and Students. Students can see the status of the applications, color-coded (green for accepted, red for rejected, yellow-orange for pending, nothing for cancelled).
    - Components: __ApplicationsTableComponent__
- __"application/:proposalId/:studentId"__: for a Professor, to see the application submitted by a student for a given application with the possibility to accept or decline it. If present, the professor can see the CV (a pdf file) uploaded by the student. In any case, the student's grades are shown. A link to the proposal details is shown. 
    - Components: __ApplicationDetailComponent__, __FileUploadComponent__
- __"application/:proposalId"__: for a Student, to see the application submitted for a given application with the possibility to accept or decline it, and to start a thesis request from the application if it has been accepted. If present, the student can see the CV (a pdf file) uploaded. In any case, the student's grades are shown. A link to the proposal details is shown. 
    - Components: __ApplicationDetailComponent__
- __"requests"__: for a Student, shows the form to create a request OR the currently active request, if any. For a Professor, shows a list of the active requests with him as a Supervisor. For a Clerk, a list of requests with a tab for those that need to be evaluated by the clerk and a tab for those already accepted.
    - Components: __RequestsComponent__
- __"requests/:requestId"__: for a Clerk, the information of a given request with the possibility of accept or reject it. The same for the Professor, except for the possibility of asking for changes.
    - Components: __RequestInfoComponent__
- __"*"__: catch-all used for error pages and unexpected routes.
    - Components: __NotFoundComponent__

## Other Components
- __NavBarComponent__: navigation bar.
- __LoadingComponent__: used in pages requiring server-side data for slow connection.
- __ErrorToastComponent__: widget to show errors.
- __TimeTravel__: used for testing the auto-archiviation of proposals (and corresponding applications). It is Doctor Who inspired.