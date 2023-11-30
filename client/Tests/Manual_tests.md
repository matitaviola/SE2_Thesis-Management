# Manual Tests for the Frontend GUI
Please note that each of the following test is written to be executed on a fresh DB instance, without the changes done by previous test

## Story #1 - Insert Proposals:

- Should create proposal successfully
```
- Login as usr:david@docenti.polito.com psw:d100003
- Should see 5 proposals for this teacher (proposals 3, 6, 9, 13, 16)
- Click on "Add New Proposal" button
- Enter all the fields as specified in the form (co-supervisor, notes, and required knowledge are optional):
    - Title must not be duplicate
    - Expiration date must be after today
    - CdS must be a valid degree
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

- Should see 4 proposals and their data
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Should see 2 proposals for this teacher:
    - [Proposal 6 | David Martinez | Co-Supervisor F | medicine, health, research | Type F | Knowledge about medical research | 2024-03-04 | BSc | Biology ]
    - [Proposal 16 | David Martinez | Co-Supervisor F | medicine, health, research | Type F | Knowledge about medical research | 2024-03-04 | BSc | Biology ]    
```
- Should display the data of a proposal:
```
- Login as usr:john@studenti.polito.com psw:s200000
- Go to the first row (the one  with "Proposal 1" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Proposal 1
    expires on: 2023-12-30
    Supervisor: Michael Johnson
    Co-supervisor: None
    CdS: CS101 - Computer Science
    Level: BSc
    Type: Type A
    Groups: Group X
    Keywords: programming, algorithms, null
    Description: Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.
    Requested knowledge: None
    Notes: Some notes
- Should be visible an "Apply" button
```

## Story #3 - Apply for Proposal
- Should create 1 application
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Click on "View" in the row of [Proposal 6]
- Click on the "Apply" button
- Should be visible a modal to upload a cv and confirm or cancel the submission of the application for [Proposal 6]
- Click on the "Send Application" button
- The modal should be closed
- Should see the proposals table
- Clicking again on "View" in the row of [Proposal 6], should be visible the disabled "Apply" button
```
- Should not create 1 application
```
- Login as usr:carlos@studenti.polito.com psw:s200002
- Click on "View" in the row of [Proposal 16]
- Click on the "Apply" button
- Should be visible a modal to confirm or cancel the submission of the application for [Proposal 16]
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
    - [Proposal 3, Alice Smith, s200001]
    - [Proposal 3, Ling Wang, s200003]
    - [Proposal 3, Mattia Oliva, s308786]
    - [Proposal 13, Sophia Miller, s200011]
    - [Proposal 13, Isabella Gonzalez, s200013]
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
- Should see a table with Title: Proposal "N" Student Anagraphic: "Name Surname" StudentID: sxxxxxx
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
- Should see a table with Title: Proposal "N" Student Anagraphic: "Name Surname" StudentID: sxxxxxx
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
    - [Title: "Proposal 1", Status: Pending]
    - [Title:"Proposal 7", Status: Cancelled]
```
- Should show 1 application with rejected status
```
- Login as usr:raj@studenti.polito.com psw:s200004
- Go to "Applications" tab
- Should see one application:
    - ["Proposal 4" Status: Rejected]
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
    - [Proposal 3 | Not assigned | design, architecture, development | Knowledge about software engineering | 2022-11-20 | MSc | CS101]
    - [Proposal 6 | Not assigned | medicine, health, research | Knowledge about medical research | 2024-03-05 | BSc | BIO303]
    - [Proposal 9 | Not assigned | linguistics, language, communication | Knowledge about linguistic studies | 2024-07-22 | BSc | ENG202]	
    - [Proposal 13 | Not assigned | software development, architecture | Knowledge about software engineering | 2022-11-20 | MSc | CS101]
    - [Proposal 16 | Not assigned | medicine, health, research | Knowledge about medical research | 2024-03-05 | BSc | BIO303]

```

## Story #8 - Update Proposals:
- should see proposals and edit their datas
```
- Login as usr:david@docenti.polito.com psw:d100003
- Click on the "Proposals" tab
- Go to first row and click edit on [proposal 3]
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
- [proposal 3] title should change to ["Renamed Proposal"] after submitting
```

- Should display the data of a proposal:
```
- Login as usr:david@example.com psw:d100003
- Click on the "Proposals" tab
- Go to the first row (the one  with "Proposal 3" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Proposal 3
    Expiration date: 2022-11-20
    CdS: CS101
    Level: MSc
    Type C
    Group Z
    Thesist: Not assigned
    Co-supervisor: Not assigned
    Description: Description for Proposal 3
    Requested knowledge: Knowledge about software engineering
    Notes: Additional info
    Keywords: design, architecture, development
```

## Story #10 - Delete Proposals:
- Should delete a proposal and its data:
```
- Login as usr:michael@docenti.polito.com psw:d100001
- Should see 2 proposals for this teacher:
    - [Proposal 1 | Not assigned | programming, algorithms, null | Knowledge about programming | 2023-12-31 | BSc | CS101]
    - [Proposal 4 | Not assigned | networks, security, protocols | Knowledge cybersecurity | 2023-06-30 | MSc | CS101]
- Go to the first row (the one  with "Proposal 1" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Proposal 1
    expires on: 2023-12-30
    Supervisor: Michael Johnson
    Co-supervisor: None
    CdS: CS101 - Computer Science
    Level: BSc
    Type: Type A
    Groups: Group X
    Keywords: programming, algorithms, null
    Description: Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.
    Requested knowledge: None
    Notes: Some notes
- Should be visible a red button called "Delete"
- Click on "Delete" button
- Should be visible a modal to confirm or cancel the submission of the archiving for [Proposal 1]
- Click on "Yes, delete it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals list and show the previous list without Proposal 1
```

## Story #12 - Archive Proposal:
- Should delete a proposal and its data:
```
- Login as usr:michael@docenti.polito.com psw:d100001
- Should see 2 proposals for this teacher:
    - [Proposal 1 | Not assigned | programming, algorithms, null | Knowledge about programming | 2023-12-31 | BSc | CS101]
    - [Proposal 4 | Not assigned | networks, security, protocols | Knowledge cybersecurity | 2023-06-30 | MSc | CS101]
- Go to the first row (the one  with "Proposal 1" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Proposal 1
    expires on: 2023-12-30
    Supervisor: Michael Johnson
    Co-supervisor: None
    CdS: CS101 - Computer Science
    Level: BSc
    Type: Type A
    Groups: Group X
    Keywords: programming, algorithms, null
    Description: Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.
    Requested knowledge: None
    Notes: Some notes
- Should be visible a yellow button called "Archive"
- Click on "Archive" button
- Should be visible a modal to confirm or cancel the submission of the archiving for [Proposal 1]
- Click on "Yes, archive it!" button
- Should be visibile a modal confirming that the operation was successful
- The application should return to the proposals list and show the previous list without Proposal 1
```
