# Manual Tests for the Frontend GUI
Please note that each of the following test is written to be executed on a fresh DB instance, without the changes done by previous test
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
    - ["Proposal 2" Status: Accepted], with the status info written in green
```
- Should show 1 application with rejected status
```
- Login as usr:minjun@example.com psw:s200006
- Go to "Applications" tab
- Should see one application:
    - ["Proposal 6" Status: Rejected], with the status written in red
```
- Should show 0 applications 
```
- Login as usr:maria@example.com psw:s200009
- Go to "Applications" tab
- Should see no applications
```