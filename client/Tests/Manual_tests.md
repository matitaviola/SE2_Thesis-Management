# Manual Tests for the Frontend GUI
Please note that each of the following test is written to be executed on a fresh DB instance, without the changes done by previous test

## Story #2 - Search Proposals:

- Should see 4 proposals and their data
```
- Login as usr:carlos@example.com psw:s200002
- Click on the "Proposals" tab
- Should see 5 proposals for this teacher:
    - [Proposal 6 | David Martinez | Co-Supervisor F | medicine, health, research | Type F | Group U | Knowledge about medical research | 2024-03-04 | BSc | Biology ]
    - [Proposal 10 | Michael Johnson | Co-Supervisor E | environment, sustainability, climate | Type F | Group U | Knowledge about environmental research | 2022-07-14 | MSc | Biology ]
    - [Proposal 16 | David Martinez | Co-Supervisor F | medicine, health, research | Type F | Group U | Knowledge about medical research | 2024-03-04 | BSc | Biology ]    
    - [Proposal 20 | Emma Smith | Co-Supervisor E | medicine, health, research | Type F | Group U | Knowledge about environmental research | 2024-07-14 | MSc | Biology ]

```
- Should display the data of a proposal:
```
- Login as usr:john@example.com psw:s200000
- Click on the "Proposals" tab
- Go to the first row (the one  with "Proposal 3" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Proposal 3
    Expiration date: 2022-11-20
    CdS: CS101
    Level: MSc
    Type C
    Group Z
    Co-supervisor: Not assigned
    Description: Description for Proposal 3
    Requested knowledge: Knowledge about software engineering
    Notes: Additional info
    Keywords: design, architecture, development
```

## Story #3 - Apply for Proposal
- Should create 1 application
```
- Login as usr:carlos@example.com psw:s200002
- Go to "Proposals" tab
- Click on the "Apply" button referring to [Proposal 6], a.k.a. the first row
- Should be visible a modal to confirm or cancel the submission of the application for [Proposal 6]
- Click on the "Send Application" button
- The modal should be closed
- Should see the proposals table with "Application sent" written instead of the "Apply" button on the row of [Proposal 6]
```
- Should not create 1 application
```
- Login as usr:carlos@example.com psw:s200002
- Go to "Proposals" tab
- Click on the "Apply" button referring to [Proposal 16], a.k.a. the second row
- Should be visible a modal to confirm or cancel the submission of the application for [Proposal 16]
- Click on the "Close" button/on the X at top right of the modal/outside the modal
- The modal should be closed
- Should see the proposals table without any changes
```


## Story #4 - Browse Applications
- Should show 4 applications
```
- Login as usr:david@example.com psw:d100003
- Go to "Applications" tab
- Should see 4 applications, which are the "Pending" applications for the active proposal of the teacher: 
    - ["Proposal 3" application by student s200001]
    - ["Proposal 3" application by student s200002]
    - ["Proposal 13" application by student s200011]
    - ["Proposal 13" application by student s200013]
```
- Should show 0 applications
```
- Login as usr:jihoon@example.com psw:d200008
- Go to "Applications" tab
- Should see 0 applications
```

## Story #5 - Accept Application
- Should update 1 applications by rejecting
```
- Login as usr:david@example.com psw:d100003
- Go to "Applications" tab
- Click on ["Proposal 3" application by student s200001], a.k.a. the second row
- Should be visible the student's data [Alice Smith s200001] and the career, with 1 exams
- Click on the "Reject" button
- Should be automatically returned to the applications list page
- Should not see the rejected application anymore
```
- Should update 2 applications by accepting
```
- Login as usr:david@example.com psw:d100003
- Go to "Applications" tab
- Click on ["Proposal 3" application by student s200003], a.k.a. the second row
- Should be visible the student's data [Ling Wang s200003] and the career, with 3 exams
- Click on the "Accept" button
- Should be automatically returned to the applications list page
- Should see only the 2 applications for "Proposal 13"
```

## Story #6 - Browse Applications Decisions
- Should show 2 applications with different status (a.k.a. the decision)
```
- Login as usr:john@example.com psw:s200000
- Go to "Applications" tab
- Should see two applications:
    - ["Proposal 1" Status: Pending], with the status info written in black
    - ["Proposal 2" Status: Rejected], with the status info written in red
```
- Should show 1 application with rejected status
```
- Login as usr:raj@example.com psw:s200004
- Go to "Applications" tab
- Should see one application:
    - ["Proposal 4" Status: Rejected], with the status written in green
```
- Should show 0 applications 
```
- Login as usr:maria@example.com psw:s200009
- Go to "Applications" tab
- Should see no applications
```

## Story #7 - Browse Proposals:
- Should see 5 proposals and their data
```
- Login as usr:david@example.com psw:d100003
- Click on the "Proposals" tab
- Should see 5 proposals for this teacher:
    - [Proposal 3 | Not assigned | design, architecture, development | Knowledge about software engineering | 2022-11-20 | MSc | CS101 | Not assigned]
    - [Proposal 6 | Not assigned | medicine, health, research | Knowledge about medical research | 2024-03-05 | BSc | BIO303 | Not assigned]
    - [Proposal 9 | Not assigned | linguistics, language, communication | Knowledge about linguistic studies | 2024-07-22 | BSc | ENG202 | Not assigned]	
    - [Proposal 13 | Not assigned | software development, architecture | Knowledge about software engineering | 2022-11-20 | MSc | CS101 | Not assigned]
    - [Proposal 16 | Not assigned | medicine, health, research | Knowledge about medical research | 2024-03-05 | BSc | BIO303 | Not assigned]

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

## Story #8 - Delete Proposals:
- Should delete a proposal and its data:
```
- Login as usr:michael@example.com psw:d100001
- Click on the "Proposals" tab
- Should see 2 proposals for this teacher:
    - [Proposal 1 | Not assigned | programming, algorithms, null | Knowledge about programming | 2023-12-31 | BSc | CS101 | Not assigned]
    - [Proposal 4 | Not assigned | networks, security, protocols | Knowledge cybersecurity | 2023-06-30 | MSc | CS101 | Not assigned]
- Go to the first row (the one  with "Proposal 1" in the Title column) and click on the last column ("View")
- Should be visible the Proposal's data:
    Proposal 1
    Expiration date: 2023-12-31
    CdS: CS101
    Level: BSc
    Type A
    Group X
    Thesist: Not assigned
    Co-supervisor: Not assigned
    Description: Description for Proposal 1
    Requested knowledge: Knowledge about programming
    Notes: Some notes
    Keywords: programming, algorithms, null
- Should be visible an orange button called "Delete Proposal"
- Click on "Delete Proposal" button
- The application should return to the proposals list and show the previous list without Proposal 1
```