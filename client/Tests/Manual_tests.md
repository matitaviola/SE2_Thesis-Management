# Manual Tests for the Frontend GUI
Please note that each of the following test is written to be executed on a fresh DB instance, without the changes done by previous test

## Story #1 - Insert Proposals:

- Should create a proposal successfully
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 4 proposals for this teacher (Pioneering Groundbreaking Medical Research Projects, Linguistic Studies: Unraveling Language and Communication, Innovations in Software Engineering and Architecture, Impactful Contributions to Medical Research Exploration)
- Click on "Add New Proposal" button
- Enter all the fields as specified in the form (co-supervisor, notes, and required knowledge are optional):
    - Title must not be duplicate
    - Expiration date must be after today
    - Add external supervisor name, surname and email and/or select existing internal co-supervisor
    - Select all the CdS
- Click on the "Submit" button
- The application should return to the proposals table where should be visible the new proposal added to the previous ones
```
- Should not create proposal
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 4 proposals for this teacher (Pioneering Groundbreaking Medical Research Projects, Linguistic Studies: Unraveling Language and Communication, Innovations in Software Engineering and Architecture, Impactful Contributions to Medical Research Exploration)
- Click on "Add New Proposal" button
- Enter all the fields:
    - Leave one of the required fields empty
- Click on the "Submit" button
- The application should highlight the missing mandatory field, preventing you from creating the proposal
```

## Story #2 - Search Proposals:

- Should see 2 proposals and their data
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Should see 2 proposals for this student (Pioneering Groundbreaking Medical Research Projects, Impactful Contributions to Medical Research Exploration)
```
- Should display the data of a proposal:
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Go to the first row (the one  with "Pioneering Groundbreaking Medical Research Projects") and click on the "View" button
- Should be visible the proposal data:
    Pioneering Groundbreaking Medical Research Projects
    expires on: 2024-03-04
    Supervisor: David Martinez
    Co-supervisor: Emily Brown, Furio Uori
    CdS: BIO303 - Biology
    Level: BSc
    Type: Research
    Groups: GroupC, GroupB
    Keywords: medicine, health, research
    Description: Join a groundbreaking project in medical research, where your contributions can make a critical impact on the fields of medicine, health, and research.
    Requested knowledge: Knowledge about medical research
    Notes: Critical information
- Should be visible an "APPLY" button
```
- Should filter by fields

```
- Login as usr:john@studenti.polito.com psw:s200000
- Click on "Add filter" and select "Title" (on the top right corner of the table)
- Type "security" on the text box just opened
- Only proposals with the word "security" in the title should be visible
- Click on "Add filter" and select "Supervisor"
- Type "michael" on the text box just opened
- Only the proposal titled "Safeguarding the Digital Future: Cybersecurity Focus" should be displayed
```

- Should order by field

```
- Login as usr:john@studenti.polito.com psw:s200000
- Click on the double arrow next to any field
- The list should appear in crescent order by that field
- Click again in the button now turned in an arrow down
- The list should appear in decrescent order by that field
- Click again in the button now turned in an arrow up
- The list should appear like before this test
```


## Story #3 - Apply for Proposal
- Should create 1 application
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Should be visible the proposals table
- Click on the "View" button in the row of [Pioneering Groundbreaking Medical Research Projects]
- Should be visible a page showing the data of the selected proposal
- Click on the "APPLY" button
- Should be visible a modal to upload a cv and confirm or cancel the submission of the application for [Pioneering Groundbreaking Medical Research Projects]
- Click on the "Send Application" button
- The modal should be closed
- Should see the proposals table
- Clicking again on the "View" button in the row of [Pioneering Groundbreaking Medical Research Projects], should be visible the disabled "APPLY" button
```
- Should not create 1 application
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Should be visible the proposal table
- Click on the "View" button in the row of [Impactful Contributions to Medical Research Exploration]
- Should be visible a page showing the data of the selected proposal
- Click on the "APPLY" button
- Should be visible a modal to confirm or cancel the submission of the application for [Impactful Contributions to Medical Research Exploration]
- Click on the "Close" button or on the X at top right of the modal/outside the modal
- The modal should be closed without applying any changes
```


## Story #4 - Browse Applications
- Should show 4 applications
```
- Login as usr:david@docenti.polito.com psw:d100003
- Go to "Applications" tab
- Should see 2 applications, which are the "Pending" applications for the active proposal of the teacher: 
    - [Innovations in Software Engineering and Architecture, Sophia Miller, s200011]
    - [Innovations in Software Engineering and Architecture, Isabella Gonzalez, s200013]
- Should be visible an "Evaluate" button in the row of each application
```
- Should show 0 applications
```
- Login as emily@docenti.polito.com psw:d200002
- Go to "Applications" tab
- Should see 0 applications
```

## Story #5 - Accept Application
- Should update 1 applications by rejecting
```
- Login as usr:david@docenti.polito.com psw:d100003
- Go to "Applications" tab
- Should see a table with Title: "Title" Student Anagraphic: "Name Surname" StudentID: sxxxxxx
- Click on the "Evaluate" button in the row of s200013's application
- Should be visible the student's data [Isabella Gonzalez s200013] and the career, with 1 exam
- Click on the "DECLINE" button
- Should be visible a modal to confirm or cancel the submission of the rejection
- Confirm the choice pressing "Yes, decline it!"
- Should be visibile a modal confirming that the operation was successful
- Should be automatically returned to the applications list page
- Should not see the rejected application anymore
- Should see 1 application
- An email is sent to the student to notify him/her about the rejection
```
- Should update 2 applications by accepting
```
- Login as usr:david@docenti.polito.com psw:d100003
- Go to "Applications" tab
- Should see a table with Title: "Title" Student Anagraphic: "Name Surname" StudentID: sxxxxxx
- Click on the "Evaluate" button in the row of s200001's application
- Should be visible the student's data [Alice Smith s200001] and the career, with 1 exam
- Should be visible a modal to confirm or cancel the submission of the acceptance
- Click on the "ACCEPT" button
- Confirm the choice pressing "Yes, accept it!"
- Should be visibile a modal confirming that the operation was successful
- Should be automatically returned to the applications list page
- Should not see applications, also the other application for the same proposal should not be visible
- An email is sent to the student to notify him/her about the acceptance
```

## Story #6 - Browse Applications Decisions
- Should show 1 accepted application
```
- Login as usr:maria@studenti.polito.com psw:s200000
- Go to "Applications" tab
- Should see 1 application:
    - [Title:"Pushing Boundaries in AI, Machine Learning, and Robotics", Status: Accepted] colored as green
```
- Should show 1 cancelled application
```
- Login as usr:john@studenti.polito.com psw:s200000
- Go to "Applications" tab
- Should see 1 application:
    - [Title:"Pushing Boundaries in AI, Machine Learning, and Robotics", Status: Cancelled] colored as white
```
- Should show 1 application with rejected status
```
- Login as usr:raj@studenti.polito.com psw:s200004
- Go to "Applications" tab
- Should see one application:
    - ["Safeguarding the Digital Future: Cybersecurity Focus" Status: Rejected] colored as red
```
- Should show 0 applications 
```
- Login as carlos@studenti.polito.com psw:s200002
- Go to "Applications" tab
- Should see no applications
```

## Story #7 - Browse Proposals:
- Should see 4 proposals and their data
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 4 proposals for this teacher (Pioneering Groundbreaking Medical Research Projects, Linguistic Studies: Unraveling Language and Communication, Innovations in Software Engineering and Architecture, Impactful Contributions to Medical Research Exploration)
- Clicking on the "View" button of each row should display a page showing the data of the respective proposal
```

## Story #8 - Update Proposal:
- Should update the data of a proposal
```
- Login as usr:david@docenti.polito.com psw:d100003
- Go to the first row of the proposals table (the one with "Pioneering Groundbreaking Medical Research Projects") and click on the "View" button
- Should be visible the proposal data:
    Pioneering Groundbreaking Medical Research Projects
    expires on: 2024-03-04
    Supervisor: David Martinez
    Co-supervisor: Emily Brown, Furio Uori
    CdS: BIO303 - Biology
    Level: BSc
    Type: Research
    Groups: GroupC, GroupB
    Keywords: medicine, health, research
    Description: Join a groundbreaking project in medical research, where your contributions can make a critical impact on the fields of medicine, health, and research.
    Requested knowledge: Knowledge about medical research
    Notes: Critical information
- Click on the "UPDATE" button
- Should be visible a form with all the current data of the proposal
- Change the title of the proposal to ["Renamed Proposal"]
- Click on the "SUBMIT" button
- The application should return to the proposals table, where [Pioneering Groundbreaking Medical Research Projects] title should be changed to ["Renamed Proposal"]
```

- Should not update the data of a proposal
```
- Login as usr:david@docenti.polito.com psw:d100003
- Go to the first row of the proposals table (the one with "Pioneering Groundbreaking Medical Research Projects") and click on the "View" button
- Should be visible the proposal data:
    Pioneering Groundbreaking Medical Research Projects
    expires on: 2024-03-04
    Supervisor: David Martinez
    Co-supervisor: Emily Brown, Furio Uori
    CdS: BIO303 - Biology
    Level: BSc
    Type: Research
    Groups: GroupC, GroupB
    Keywords: medicine, health, research
    Description: Join a groundbreaking project in medical research, where your contributions can make a critical impact on the fields of medicine, health, and research.
    Requested knowledge: Knowledge about medical research
    Notes: Critical information
- Click on the "UPDATE" button
- Should be visible a form with all the current data of the proposal
- Change the title of the proposal to ["Renamed Proposal"]
- Click on the "CANCEL" button
- The application should return to the page showing the proposal data without applying any changes
```

## Story #10 - Delete Proposal:
- Should delete a proposal and its data:
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 4 proposal for this teacher (Pioneering Groundbreaking Medical Research Projects, Linguistic Studies: Unraveling Language and Communication, Innovations in Software Engineering and Architecture, Impactful Contributions to Medical Research Exploration)
- Go to the first row (the one with "Pioneering Groundbreaking Medical Research Projects" in the Title column) and click on the "View" button
- Should be visible the proposal data:
    Pioneering Groundbreaking Medical Research Projects
    expires on: 2024-03-04
    Supervisor: David Martinez
    Co-supervisor: Emily Brown, Furio Uori
    CdS: BIO303 - Biology
    Level: BSc
    Type: Research
    Groups: GroupC, GroupB
    Keywords: medicine, health, research
    Description: Join a groundbreaking project in medical research, where your contributions can make a critical impact on the fields of medicine, health, and research.
    Requested knowledge: Knowledge about medical research
    Notes: Critical information
- Click on the "DELETE" button
- Should be visible a modal to confirm or cancel the submission of the delete for the current proposal
- Click on "Yes, delete it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals list and show the previous list the proposal ["Pioneering Groundbreaking Medical Research Projects"]
```

## Story #11 - Copy Proposal:
- Should copy a proposal and its data:
```
- Login as usr:michael@docenti.polito.com psw:d100001
- Should see 1 proposal for this teacher (Safeguarding the Digital Future: Cybersecurity Focus)
- Click on the "View" button on the row of this proposal
- Should be visible the proposal data:
    Safeguarding the Digital Future: Cybersecurity Focus
    expires on: 2023-06-30
    Co-supervisor: Emily Brown, Ester Na
    Thesist: Not yet assigned
    CdS: CS101
    Level: MSc
    Type: Abroad
    Groups: GroupA, GroupB
    Keywords: networks, security, protocols
    Description: Contribute to the ever-growing field of cybersecurity, focusing on networks and protocols, and play a vital role in securing the digital future.
    Requested knowledge: Knowledge about cybersecurity
    Notes: important notes
- Click on the "COPY" button
- Should be visible a modal to confirm or cancel the submission of the copy for this proposal
- Click on "Yes, copy it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals table
```

## Story #12 - Archive Proposal:
- Should delete a proposal and its data:
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 4 proposal for this teacher (Pioneering Groundbreaking Medical Research Projects, Linguistic Studies: Unraveling Language and Communication, Innovations in Software Engineering and Architecture, Impactful Contributions to Medical Research Exploration)
- Go to the first row of the proposals table (the one with "Pioneering Groundbreaking Medical Research Projects") and click on the "View" button
- Should be visible the proposal data:
    Pioneering Groundbreaking Medical Research Projects
    expires on: 2024-03-04
    Supervisor: David Martinez
    Co-supervisor: Emily Brown, Furio Uori
    CdS: BIO303 - Biology
    Level: BSc
    Type: Research
    Groups: GroupC, GroupB
    Keywords: medicine, health, research
    Description: Join a groundbreaking project in medical research, where your contributions can make a critical impact on the fields of medicine, health, and research.
    Requested knowledge: Knowledge about medical research
    Notes: Critical information
- Click on the "ARCHIVE" button
- Should be visible a modal to confirm or cancel the submission of the archiving for this proposal
- Click on "Yes, archive it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals table and show the previous list without ["Pioneering Groundbreaking Medical Research Projects"]
```

## Story #13 - Access applicant CV:
- Should access applicant CV through the applications table:
```
- Create an application following the story #3 first test
- Login as usr:david@docenti.polito.com psw:d100003
- Click on the "Applications" tab
- Open the Carlos Gracia's application detail with the "Evaluate" button
- Click "Open Resumee"
- The pdf file uploaded should be visible
```
- "Open Resumee" button should not be visible if the applicant has not uploaded any resumee
```
- Login as usr:david@docenti.polito.com psw:d100003
- Click on the "Applications" tab
- Open the Isabella Gonzalez's application detail with the "Evaluate" button
- The "Open Resumee" button should not be visible
```

## Story #14 - Notify Application
- Should notify professor when a new application is sent to be evaluated
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Select the "view" button next to the proposal "Architectural Innovation in Software Development" (you may also select any proposal you wish)
- In the proposal page click on "Apply" button
- In the modal opened, click on "Send Application"
- An email is sent to the supervisor assigned to the selected proposal (David Martinez) to notify him/her about the new application to be evaluated. The email subject is: "New application submitted" and the content of the email will be as following:
"A new application has been submitted for your proposal "Architectural Innovation in Software Development" by the student with id: s200002. The proposal will expire on Tue, 19 Nov 2024 23:00:00 GMT"
```

## Story #16 - Serach Archive:
- Should see 2 proposals and their data
```
- Login as usr:michael@docenti.polito.com psw:d100003
- Click in the tab "Archived"
- Should see 2 proposals for this teacher (Pushing Boundaries in AI, Machine Learning, and Robotics, Advancing Environmental Sustainability and Climate Studies)
- Clicking on the "View" button of each row should display a page showing the data of the respective proposal with no button at the bottom
```

- Should see 1 proposal and its data after filtering
```
- Login as usr:michael@docenti.polito.com psw:d100003
- Click in the tab "Archived"
- Should see 2 proposals for this teacher (Pushing Boundaries in AI, Machine Learning, and Robotics | Advancing Environmental Sustainability and Climate Studies)
- Type "Advanced" in the search bar
- Should see 1 proposal for this teacher (Pushing Boundaries in AI, Machine Learning, and Robotics)
- Clicking on the "View" button of each row should display a page showing the data of the respective proposal with no button at the bottom
```

- Should see no proposals
```
- Login as usr:david@docenti.polito.com psw:d100003
- Click in the tab "Archived"
- Should see no proposals, and the "No archived thesis proposals" message
```

## Story #17 - Add Academic Co-Supervisor:
- Should add co-supervisors to a thesis proposal:
```
- Login as usr:michael@docenti.polito.com psw:d100001
- Should be visible the Proposals page
- Click on the 'View' button in the first row of the Active Proposal Table, in order to open the proposal ["Exploring Advanced Programming Paradigms"].
- Click on the "UPDATE" button
- Should be visible a form with all the current data of the proposal
- Click on the Academic Co-Supervisor field and select two co-supervisors: Emily Brown and Wei Chen
- Click on the "SUBMIT" button
- Should be visible a modal to confirm or cancel the decision to update the current proposal
- Click on "Yes, update it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals table, where the proposal ["Exploring Advanced Programming Paradigms"] has now two co-supervisors: Emily Brown and Wei Chen
```

## Story #18 - Notify Expiration
- Should notify the professor a week before the proposal expiration date
```
- Login as usr:doc_docenti.polito@libero.it psw:d100000
- Check the expiration date of the first proposal which is "Linguistic Phenomena: Evolution through Language and Communication" and the expiration date is 2024-07-22
- Click on the calendar next to the time travel button and select 2024-07-15 which is one week before proposal expiration date
- Click on the "Time Travel" button so it's applied
- Click on "Yes, allons-y!"
- An email with subject "Application expiring soon" will be sent to the supervisor with the following content:
"Your proposal "Linguistic Phenomena: Evolution through Language and Communication" will expire in 7 days, on 2024-07-22."
```

## Story #26 - Insert Student Request:
- Should create a new thesis start request:
```
- Login as usr:alice@studenti.polito.com psw:s200001
- Click on the "Request" tab
- Enter the mandatory fields in the form: Title, Supervisor, Description. 
(Academic Co-Supervisors field is optional).
- Click on the "SUBMIT" button
- Should be visible a modal to confirm or cancel the submission of the thesis request
- Click on "Yes, create!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the request page and show and show the details of the submitted thesis request and its status (Awaiting acceptance from secretary).
```

## Story #27 - Secretary Approve Student requests:
- Should approve/reject a student request:
```
- Login as sergio@secretary.polito.it psw: secretary
- Click on the "View" button of the chosen request
- Press Accept/Reject to approve or deny a request
- Click on "Yes, Approve!" or "Yes, reject!" to approve or deny
- The request should be sent to the "Evaluated Requests" tab
- The status on the request should be changed to "Awaiting acceptance from supervisor" or "Rejected".
```
## Story #28 - Professor Approve Student requests:
- Should approve/reject a student request (after the secretary accepted):
```
- Login as michael@docenti.polito.com psw: d100001
- Click on the "Request" tab
- Click on the "View" button of the chosen request
- Press Accept/Reject to approve or deny a request
- Click on "Yes, Approve!" or "Yes, reject!" to approve or deny
- The request should not be in the "Request" tab anymore 
- If accepted the status on the request should be changed to "Thesis started on yyyy/mm/dd".
```

## Story #29 - Notify Professor Thesis Request
- Should notify professor when a new thesis request is made by a student with him/her as supervisor
So that he/she can accept or reject it
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Click in the tab "Request"
- Fill the form (title, supervisor, and description are mandatory fields)
- Click on "submit" button
- An email with subject "New Thesis Request: <title>" will be sent to the supervisor you selected for the thesis request. The content of the email will be:
"You received a new thesis request from the student with id: s200002.
Request description:
<description>
You will be able to approve or reject the request if it passes the evaluation from the secretary."
```

## Story #30 - Student Request from Application:
- Should create a new thesis start request starting from an approved application:
```
- Login as usr:david@docenti.polito.com psw:d100003
- Accept Alice Smith's application following the story #5 second test
- Login as usr:alice@studenti.polito.com psw:s200001
- Click on the "Applications" tab
- Should see the accepted application ["Architectural Innovation in Software Development"]
- Click on the "REVIEW APPLICATION" button
- Should see all the details of the application
- Click on the "THESIS REQUEST" button
- Should be visible the thesis request form with the fields pre-filled from the accepted application
- Click on the "SUBMIT" button
- Should be visible a modal to confirm or cancel the submission of the thesis request
- Click on "Yes, create!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the request page and show the details of the submitted thesis request and its status (Awaiting acceptance from secretary)
```

