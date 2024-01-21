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
Group 06 presents: the new Thesis Management System.
Don't let yourself be tricked by the minimalistic and easy-to-use interface: the TMS is packed with useful functions:
- Professors can create new Thesis Proposals, either from scratch or from existing ones [show in parallel on screen the creation of a thesis from nothing and from an existing one using  'copy proposal'], update them, and even add more collaborators, both academics and external [show updating adding a collaborator]! And if a proposal does not convince you anymore, simply delete it [show delete] or archive it for later [show using the searchbar in the application Archive], but don't worry, the management of students' applications for deleted or archived proposals is automatically done by the system, just like when a proposal expires. 
- Yes, because the system is also able to manage the archiving of old proposals once their time has come. Fret not, TMS will send you an email notice a week before that happens if you want to extend the proposal.
- Students can navigate the proposals to find the ones best suited for them, and apply with the possibility to upload their personal CV [show serach of a proposal, add application uploading CV] for the professor to see [show professor opening the application, clicking on cv, scroll down and accept] and evaluate.
- And once the application has been approved, or the student already has something in mind, they can try making a new Thesis Request [show making a new thesis request, split screen, one side from scratch, the other from an accepted application]. This multi-phases process might require some changes [show clerk accepting, show teacher writing a change request], but once it gets the final approval, it's time to get to work [zooms in on the status that show 'Thesis started on ...' seen from the student].
```
An then the narrator says something like 'Before leaving, here's a short demo of a typical use case' and the demo is shown.
1) Prof Juan Stefano Pauli from Electronics department proposes a new thesis proposal entitled "Data
Analysis of Rector Elections". The thesis is for students in Computer Engineering Master degree.
2) Prof Giulia Saracco from Applied Science department is added as co-supervisor.
3) Student Elmo Moss enrolled in Computer Engineering master browses proposals searching for
keyword "data analysis" and applies for the proposal, __uploading the file Elmo_CV.pdf that you can find on the root folder__.
4) Also Student Bryan Woods enrolled in Computer Engineering master browses proposals searching for
keyword "Elections" and applies for the proposal.
5) The supervisor examines the applications and accepts Elmo Moss.
6) The two students are notified about the decision.
7) Elmo Moss creates a thesis request.
8) Clerk Pam Beesly looks at pending thesis requests, looks at the details of the one by Elmo and
approves it.
9) The supervisors as soon as notified looks the proposal and approve it.

## Notes:
- During the demonstation, a wideget on the screen (like, a card on the bottom-right corner) should show the current user info, in the format: 
    - __Name Surname__ (in bold)
    - Role(Teacher/Student/Clerk), 'Computer Engineering'(if student) OR 'Electronics Dpt.'(if Juan)
- We could probably add something about the fact that we add confirmations checks on every possible sumbit/button