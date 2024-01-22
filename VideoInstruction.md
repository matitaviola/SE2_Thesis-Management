## Appearing users credentials:
- Prof Juan Stefano Pauli:
    - In app: 
        - mail: doc_docenti.polito@libero.it 
        - psw: d100000
    - Libero:
        - mail: doc_docenti.polito@libero.it 
        - psw: Group_06
- Student Elmo Ross:
    - In app:
        - mail: mta_studenti.polito@libero.it 
        - psw: s100000
    - Libero:
        - mail: mta_studenti.polito@libero.it 
        - psw: Group_06
- Student Bryan Woods:
    - In app:
        - mail: mtr_studenti.polito@libero.it 
        - psw: s100001
    - Libero:
        - mail: mtr_studenti.polito@libero.it 
        - psw: Group_06
- Clerk Pam Beesly:
    - In app:
        - mail: pambeesly@secretary.polito.it 
        - psw: pambeesly
    - Libero: none

## Story:
__Note__: words in brackets [] are actions to show on screen while the narrator speaks those words
### Introduction:
```
Group 06 is proud to present you the Thesis Management System, an innovative approach to seamlessly oversee the entire thesis process, covering every aspect from start to finish.
Simplicity and safety is our focus, but don't let yourself be tricked by the minimalistic and easy-to-use interface: the TMS is packed with useful functions:
- Professors can create new Thesis Proposals, either from scratch or from existing ones,
```
[show in parallel on screen the creation of a thesis from nothing and from an existing one using  'copy proposal']
```
update them, and even add more collaborators, both academics and external!
```
[show updating adding a collaborator]
```
And if a proposal does not convince you anymore, simply delete it 
```
[show delete]
```
or archive it for later,
```
[show using the searchbar in the application Archive]
```
but don't worry, the management of students' applications for deleted or archived proposals is automatically done by the system, just like when a proposal expires. 
- Yes, because the system is also able to manage the archiving of old proposals once their time has come. Fret not, TMS will send you an email notice a week before that happens if you want to extend the proposal.
```
[show email]
```
- Students can navigate the proposals to find the ones best suited for them, and apply with the possibility to upload their personal CV
```
[show serach of a proposal, add application uploading CV]
```
for the professor to see and evaluate.
```
[show professor opening the application, clicking on cv, scroll down and accept]
```
- And once the application has been approved, or the student already has something in mind, they can try making a new Thesis Request.
```
[show making a new thesis request, split screen, one side from scratch, the other from an accepted application]
```
This multi-phases process might require some changes,
```
[show clerk accepting, show teacher writing a change request]
```
but once it gets the final approval, it's time to get to work
```
[zooms in on the status that show 'Thesis started on ...' seen from the student].
```
In the following lines, in the paragraphs you'll see the text the narrator has to read while the actions are shown
```
###  Demo
```
And now, a short demo of a typical use case.
```
1) 
Prof Juan Stefano Pauli from Electronics department proposes a new thesis proposal entitled "Data
Analysis of Rector Elections". The thesis is for students in Computer Engineering Master degree.
```
Here you can see professor Pauli from Electronics department that wants to create a new thesis proposal.
```
2) Prof Giulia Saracco from Applied Science department is added as co-supervisor.
```
And he's now adding a dear collaborator of his as a co-supervisor.
```
3) Student Elmo Moss enrolled in Computer Engineering master browses proposals searching for
keyword "data analysis" and applies for the proposal, __uploading the file Elmo_CV.pdf that you can find on the root folder__.

```
Here instead we have Elmo, a Computer Engineering student, eager to find a thesis suitable for him. 
Seems like he found it, and applies adding his personal curriculum.
```
4) Also Student Bryan Woods enrolled in Computer Engineering master browses proposals searching for
keyword "Elections" and applies for the proposal.
```
Looks like another student, Bryan, will be applying for professor Pauli thesis.
```
 __[Show the professor email that notifies somebody applied]__
```
The professor has been informed of the two applications.
```
5) The supervisor examines the applications and accepts Elmo Moss __[the prof opens the cv and rapidly scrolls it]__.
```
After evaluating the students' career, he has chosen Elmo. Looks like the CV made the difference.
```
6) The two students are notified about the decision __[show the two emails, split the screen so they are shown at the same time]__.
```
And now the students have received the results of their applications. Looks like Bryan will have to look for something else, but...
```
7) Elmo Moss creates a thesis request.
```
...Elmo can now make a thesis request!
```
__[show professor's email that notifies them a new thesis request has been done]__
```
The professor has been informed, but he'll need to wait the administrative office's approval.
```
8) Clerk Pam Beesly looks at pending thesis requests, looks at the details of the one by Elmo and
approves it.
```
Luckily, Pam is at work, and quickly accepts the request.
```
9) The supervisors as soon as notified looks the proposal and approve it.
```
Professor Pauli is now free to accept the request. The Thesis Management System's job finishes here, but for Elmo the real work starts now.
```

## Notes:
- During the demonstation, a widget on the screen (like, a card on the bottom-right corner) should show the current user info, in the format: 
    - __Name Surname__ (in bold)
    - Role(Teacher/Student/Clerk), 'Computer Engineering'(if student) OR 'Electronics Dpt.'(if Juan)
- We could probably add something about the fact that we add confirmations checks on every possible sumbit/button