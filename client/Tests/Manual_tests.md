# Manual Tests for the Frontend GUI
Please note that each of the following test is written to be executed on a fresh DB instance, without the changes done by previous test

## Story #1 - Insert Proposals:

- Should create proposal successfully
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 5 proposals for this teacher (Architectural Innovation in Software Development, Pioneering Groundbreaking Medical Research Projects, Linguistic Studies: Unraveling Language and Communication, Innovations in Software Engineering and Architecture, Impactful Contributions to Medical Research Exploration)
- Click on "Add New Proposal" button
- Enter all the fields as specified in the form (co-supervisor, notes, and required knowledge are optional):
    - Title must not be duplicate
    - Expiration date must be after today
    - Add external supervisor name, surname and email or select existing internal co-supervisor
    - Select all the CdS
- Click on save
- After clicking on save you will be redirected to proposals table and now you must see the new proposal added to the previous ones so 6 proposals in general
```
- Should not create proposal
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 5 proposals for this teacher
- Click on "Add New Proposal" button
- Enter all the fields:
    - Leave one of the required fields empty
- Click on save
- After clicking on save you can see an error
- Click on the proposals you still see 5 proposals for this teacher and nothing is added
```

## Story #2 - Search Proposals:

- Should see 2 proposals and their data
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Should see 2 proposals:
    - [Proposal 6 | David Martinez | Co-Supervisor F | medicine, health, research | Type F | Knowledge about medical research | 2024-03-04 | BSc | Biology ]
    - [Proposal 16 | David Martinez | Co-Supervisor F | medicine, health, research | Type F | Knowledge about medical research | 2024-03-04 | BSc | Biology ]    
```
- Should display the data of a proposal:
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Go to the first row (the one  with "Exploring Advanced Programming Paradigms" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Exploring Advanced Programming Paradigms
    expires on: 2023-12-30
    Supervisor: Michael Johnson
    Co-supervisor: None
    CdS: ENG202 BIO303 CS101
    Level: BSc
    Type: Company
    Groups: GroupA
    Keywords: programming, algorithms, null
    Description: Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.
    Requested knowledge: Knowledge about programming
    Notes: Some notes
- Should be visible an "Apply" button
```
- Should filter by fields

```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Click on "Add filter" and select "Supervisor" (on the top right corner of the table)
- Type "michael" on the text box just opened
- Only proposals with "Michael Johnson" as Supervisor should be visible
- Click on "Add filter" and select "Title"
- Type "advanced" on the text box just opened
- Only the proposal titled "Exploring Advanced Programming Paradigms" should be displayed
```

- Should order by field

```
- Login as usr:carlos@studenti.polito.com psw:s200002
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
- Click on "View" in the row of [Pioneering Groundbreaking Medical Research Projects]
- Click on the "Apply" button
- Should be visible a modal to upload a cv and confirm or cancel the submission of the application for [Pioneering Groundbreaking Medical Research Projects]
- Click on the "Send Application" button
- The modal should be closed
- Should see the proposals table
- Clicking again on "View" in the row of [Pioneering Groundbreaking Medical Research Projects], should be visible the disabled "Apply" button
```
- Should not create 1 application
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Click on "View" in the row of [Impactful Contributions to Medical Research Exploration]
- Click on the "Apply" button
- Should be visible a modal to confirm or cancel the submission of the application for [Impactful Contributions to Medical Research Exploration]
- Click on the "Close" button or on the X at top right of the modal/outside the modal
- The modal should be closed
- Should see the proposals table without any changes
```


## Story #4 - Browse Applications
- Should show 4 applications
```
- Login as usr:david@docenti.polito.com psw:d100003
- Go to "Applications" tab
- Should see 5 applications, which are the "Pending" applications for the active proposal of the teacher: 
    - [Architectural Innovation in Software Development, Alice Smith, s200001]
    - [Architectural Innovation in Software Development, Ling Wang, s200003]
    - [Architectural Innovation in Software Development, Mario Alberto Rigetta, s000002]
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
- Click on the "Decline" button
- Confirm the choice pressing "Yes, decline it!"
- Should be visibile a modal confirming that the operation was successful
- Should be automatically returned to the applications list page
- Should not see the rejected application anymore
- Should see 4 applications
- An email is sent to the student to notify him/her about the rejection
```
- Should update 2 applications by accepting
```
- Login as usr:david@docenti.polito.com psw:d100003
- Go to "Applications" tab
- Should see a table with Title: "Title" Student Anagraphic: "Name Surname" StudentID: sxxxxxx
- Click on the "Evaluate" button in the row of s200001's application
- Should be visible the student's data [Alice Smith s200001] and the career, with 1 exam
- Click on the "Accept" button
- Confirm the choice pressing "Yes, accept it!"
- Should be visibile a modal confirming that the operation was successful
- Should be automatically returned to the applications list page
- Should see 1 application, also the other application for the same proposal should not be visible
- An email is sent to the student to notify him/her about the acceptance
```

## Story #6 - Browse Applications Decisions
- Should show 2 applications with different status (a.k.a. the decision)
```
- Login as usr:john@studenti.polito.com psw:s200000
- Go to "Applications" tab
- Should see two applications:
    - [Title: "Exploring Advanced Programming Paradigms", Status: Pending] colored as orange
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
- Should see 5 proposals and their data
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 5 proposals for this teacher:
    - [Architectural Innovation in Software Development | Not assigned | design, architecture, development | Knowledge about software engineering | 2022-11-20 | MSc | CS101 ENG202 BIO303]
    - [Pioneering Groundbreaking Medical Research Projects | Emily Brown, Furio Uori | medicine, health, research | Knowledge about medical research | 2024-03-05 | BSc | BIO303]
    - [Linguistic Studies: Unraveling Language and Communication | Emma Smith | linguistics, language, communication | Knowledge about linguistic studies | 2024-07-22 | BSc | ENG202]	
    - [Innovations in Software Engineering and Architecture | | software development, architecture | Knowledge about software engineering | 2022-11-20 | MSc | CS101]
    - [Impactful Contributions to Medical Research Exploration | Michael Johnson | medicine, health, research | Knowledge about medical research | 2024-03-05 | BSc | BIO303]

```

## Story #8 - Update Proposals:
- should see proposals and edit their datas
```
- Login as usr:david@docenti.polito.com psw:d100003
- Click on the "Proposals" tab
- Go to first row and click edit on [Architectural Innovation in Software Development]
- should be seen proposal details as below:
Title
Supervisor
Co_supervisor
Keywords
Type
Groups
Description
Required Knowledge
Notes
Expiration
Level
CdS/Programmes
- change the title of the proposal to ["Renamed Proposal"]
- go to the bottom and click submit botton
- [Architectural Innovation in Software Development] title should change to ["Renamed Proposal"] after submitting
```

- Should display the data of a proposal:
```
- Login as usr:david@example.com psw:d100003
- Click on the "Proposals" tab
- Go to the first row (the one  with "Architectural Innovation in Software Development" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Architectural Innovation in Software Development
    Expiration date: 2022-11-20
    CdS: CS101 ENG202 BIO303
    Level: MSc
    Type: Development
    Group: GroupC
    Thesist: Not assigned
    Co-supervisor: None
    Description: Explore the intricate realms of software engineering, emphasizing design and architecture, contributing to the evolution of technology and development.
    Requested knowledge: Knowledge about software engineering
    Notes: Additional info
    Keywords: design, architecture, development
```

## Story #10 - Delete Proposal:
- Should delete a proposal and its data:
```
- Login as usr:michael@docenti.polito.com psw:d100001
- Should see 2 proposals for this teacher:
    - [Exploring Advanced Programming Paradigms | Not assigned | programming, algorithms, null | Knowledge about programming | 2023-12-31 | BSc | ENG202 BIO303 CS101]
    - [Safeguarding the Digital Future: Cybersecurity Focus | Emily Brown, E. S. Terno | networks, security, protocols | Knowledge cybersecurity | 2023-06-30 | MSc | CS101]
- Go to the first row (the one  with "Exploring Advanced Programming Paradigms" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Exploring Advanced Programming Paradigms
    expires on: 2023-12-30
    Supervisor: Michael Johnson
    Co-supervisor: None
    CdS: ENG202 BIO303 CS101
    Level: BSc
    Type: Company
    Groups: GroupA
    Keywords: programming, algorithms, null
    Description: Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.
    Requested knowledge: Knowledge about programming
    Notes: Some notes
- Should be visible a red button called "Delete"
- Click on "Delete" button
- Should be visible a modal to confirm or cancel the submission of the delete for the current proposal
- Click on "Yes, delete it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals list and show the previous list without Proposal 1
```

## Story #11 - Copy Proposal:
- Should copy a proposal and its data:
```
- Login as usr:michael@docenti.polito.com psw:d100001
- Should see 2 proposals for this teacher:
    - [Exploring Advanced Programming Paradigms | Not assigned | programming, algorithms, null | Knowledge about programming | 2023-12-31 | BSc | CS101]
    - [Safeguarding the Digital Future: Cybersecurity Focus | Not assigned | networks, security, protocols | Knowledge about cybersecurity | 2023-06-30 | MSc | CS101]
- Go to the first row (the one  with "Exploring Advanced Programming Paradigms" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Exploring Advanced Programming Paradigms
    expires on: 2023-12-31
    Co-supervisor: None
    CdS: ENG202 BIO303 CS101
    Level: BSc
    Type: Company
    Groups: GroupA
    Keywords: programming, algorithms, null
    Description: Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.
    Requested knowledge: Knowledge about programming
    Notes: Some notes
- Should be visible a green button called "COPY"
- Click on "COPY" button
- Should be visible a modal to confirm or cancel the submission of the copy for [Embark on an exciting journey into programming and algorithms]
- Click on "Yes, copy it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals list and show the previous list with an additional [Embark on an exciting journey into programming and algorithms]
```

## Story #12 - Archive Proposal:
- Should delete a proposal and its data:
```
- Login as usr:michael@docenti.polito.com psw:d100001
- Should see 2 proposals for this teacher:
    - [Exploring Advanced Programming Paradigms | Not assigned | programming, algorithms, null | Knowledge about programming | 2023-12-31 | BSc | ENG202 BIO303 CS101]
    - [Safeguarding the Digital Future: Cybersecurity Focus | Emily Brown, E. S. Terno | networks, security, protocols | Knowledge cybersecurity | 2023-06-30 | MSc | CS101]
- Go to the first row (the one  with "Exploring Advanced Programming Paradigms" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Exploring Advanced Programming Paradigms
    expires on: 2023-12-30
    Supervisor: Michael Johnson
    Co-supervisor: None
    CdS: ENG202 BIO303 CS101
    Level: BSc
    Type: Company
    Groups: GroupX
    Keywords: programming, algorithms, null
    Description: Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.
    Requested knowledge: Knowledge about programming
    Notes: Some notes
- Should be visible a yellow button called "Archive"
- Click on "Archive" button
- Should be visible a modal to confirm or cancel the submission of the archiving for [Proposal 1]
- Click on "Yes, archive it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals list and show the previous list without Proposal 1
```
## Story #13 - Access applicant CV:
- Should access applicant CV through the applications table:

```
- Create an application following the story #3 first test
- Login as usr:david@docenti.polito.com psw:d100003
- Click on the "Applications" tab
- Open the Carlos Gracia's application detail to Proposal 6 with the "Evaluate" button
- Click "Open Resumee"
- The pdf file uploaded should be visible
```
- "Open Resumee" button should not be visible if the applicant has not uploaded any resumee

```
- Login as usr:michael@docenti.polito.com psw:d100001
- Click on the "Applications" tab
- Open the John Doe's application detail to Proposal 1 with the "Evaluate" button
- The "Open Resumee" button should not be visible
```



