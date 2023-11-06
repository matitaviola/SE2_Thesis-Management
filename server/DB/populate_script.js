//import database
const { db } = require('./db');

db.serialize(() => {

    //#region Cleanup
    // Empty the STUDENT table
    db.run('DELETE FROM STUDENT');

    // Empty the TEACHER table
    db.run('DELETE FROM TEACHER');

    // Empty the CAREER table
    db.run('DELETE FROM CAREER');

    // Empty the DEGREE table
    db.run('DELETE FROM DEGREE');

    // Empty the PROPOSAL table
    db.run('DELETE FROM PROPOSAL');

     // Empty the APPLICATION table
     db.run('DELETE FROM APPLICATION');

    //#endregion

    //#region Students

    db.run(`CREATE TABLE IF NOT EXISTS STUDENT (
        ID TEXT PRIMARY KEY,
        SURNAME TEXT NOT NULL,
        NAME TEXT NOT NULL,
        GENDER TEXT NOT NULL,
        NATIONALITY TEXT NOT NULL,
        EMAIL TEXT UNIQUE NOT NULL,
        CODE_DEGREE TEXT NOT NULL,
        ENROLLMENT_YEAR INTEGER NOT NULL
    )`);

    // Sample data to be inserted into the table
    const studentsData = [
        ['s200000', 'Doe', 'John', 'Male', 'American', 'john@example.com', 'CS101', 2021],
        ['s200001', 'Smith', 'Alice', 'Female', 'British', 'alice@example.com', 'ENG202', 2022],
        ['s200002', 'Garcia', 'Carlos', 'Male', 'Spanish', 'carlos@example.com', 'BIO303', 2020]
        // Add more data as needed
    ];

    // Insert the sample data into the table
    const stmt = db.prepare('INSERT INTO STUDENT (ID, SURNAME, NAME, GENDER, NATIONALITY, EMAIL, CODE_DEGREE, ENROLLMENT_YEAR) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    studentsData.forEach(student => {
        const returned = stmt.run(student);
    });
    stmt.finalize();

    //#endregion

    //#region Teachers

    db.run(`CREATE TABLE IF NOT EXISTS TEACHER (
        ID INTEGER PRIMARY KEY,
        SURNAME TEXT NOT NULL,
        NAME TEXT NOT NULL,
        EMAIL TEXT UNIQUE NOT NULL,
        COD_GROUP TEXT NOT NULL,
        COD_DEPARTMENT TEXT NOT NULL
    )`);

    // Sample data to be inserted into the TEACHER table
    const teachersData = [
        [1, 'Johnson', 'Michael', 'michael@example.com', 'GroupA', 'DEP101'],
        [2, 'Brown', 'Emily', 'emily@example.com', 'GroupB', 'DEP202'],
        [3, 'Martinez', 'David', 'david@example.com', 'GroupC', 'DEP303']
        // Add more data as needed
    ];

    // Insert the sample data into the TEACHER table
    const teacherStmt = db.prepare('INSERT INTO TEACHER (ID, SURNAME, NAME, EMAIL, COD_GROUP, COD_DEPARTMENT) VALUES (?, ?, ?, ?, ?, ?)');
    teachersData.forEach(teacher => {
        const returned = teacherStmt.run(teacher);
    });
    teacherStmt.finalize();

    //#endregion    

    //#region Career

    db.run(`CREATE TABLE IF NOT EXISTS CAREER (
        ID INTEGER PRIMARY KEY,
        COD_COURSE TEXT NOT NULL,
        TITLE_COURSE TEXT UNOT NULL,
        CFU INTEGER NOT NULL,
        GRADE TEXT NOT NULL,
        DATE TEXT NOT NULL,
        STUDENT_ID TEXT NOT NULL,
        FOREIGN KEY(STUDENT_ID) REFERENCES STUDENT(ID)
    )`);

    // Sample data to be inserted into the CAREER table
    const careerData = [
        [1, 'COURSE101', 'Introduction to Programming', 5, 'A', '2022-05-15'],
        [2, 'COURSE202', 'Data Structures', 6, 'B', '2023-01-20'],
        [3, 'COURSE303', 'Advanced Biology', 7, 'A-', '2021-11-30']
        // Add more data as needed
    ];

    // Insert the sample data into the CAREER table
    const careerStmt = db.prepare('INSERT INTO CAREER (ID, COD_COURSE, TITLE_COURSE, CFU, GRADE, DATE) VALUES (?, ?, ?, ?, ?, ?)');
    careerData.forEach(career => {
        const returned = careerStmt.run(career);
    });
    careerStmt.finalize();

    //#endregion

    //#region Degree

    db.run(`CREATE TABLE IF NOT EXISTS DEGREE (
        COD_DEGREE TEXT PRIMARY KEY,
        TITLE_DEGREE TEXT NOT NULL
    )`);

    // Sample data to be inserted into the DEGREE table
    const degreeData = [
        ['CS101', 'Computer Science'],
        ['ENG202', 'English Literature'],
        ['BIO303', 'Biology']
        // Add more data as needed, at least one shared with the CODE_DEGREE in the STUDENT script
    ];

    // Insert the sample data into the DEGREE table
    const degreeStmt = db.prepare('INSERT INTO DEGREE (COD_DEGREE, TITLE_DEGREE) VALUES (?, ?)');
    degreeData.forEach(degree => {
        const returned = degreeStmt.run(degree);
    });
    degreeStmt.finalize();

    //#endregion

    //#region Proposal

    db.run(`CREATE TABLE IF NOT EXISTS PROPOSAL (
        Title TEXT UNIQUE NOT NULL,
        Supervisor TEXT NOT NULL,
        Co_supervisor TEXT,
        Keywords TEXT,
        Type TEXT NOT NULL,
        Groups TEXT NOT NULL,
        Description TEXT NOT NULL,
        Req_knowledge TEXT,
        Notes TEXT,
        Expiration TEXT NOT NULL,
        Level TEXT NOT NULL,
        CdS TEXT,
        FOREIGN KEY(Supervisor) REFERENCES TEACHER(ID)
    )`);

    // Sample data to be inserted into the PROPOSAL table
    const proposalData = [
        ['Proposal 1', 1, 'Co-Supervisor A', 'programming, algorithms, null', 'Type A', 'Group X', 'Description for Proposal 1', 'Knowledge about programming', 'Some notes', '2023-12-31', 'Advanced', 'CdS/Program 1'],
        ['Proposal 2', 2, 'Co-Supervisor C', null, 'Type B', 'Group Y', 'Description for Proposal 2', 'Knowledge about data analysis', 'Additional notes', '2024-01-15', 'Intermediate', 'CdS/Program 2']
        // Add more data as needed
    ];

    // Insert the sample data into the PROPOSAL table
    const proposalStmt = db.prepare('INSERT INTO PROPOSAL (Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    proposalData.forEach(proposal => {
        const returned = proposalStmt.run(proposal);
    });
    proposalStmt.finalize();

    //#endregion

    //#region Application

    db.run(`CREATE TABLE IF NOT EXISTS APPLICATION (
        Student_ID,
        Proposal_ID,
        Status TEXT NOT NULL,
        PRIMARY KEY (Student_ID, Proposal_ID),
        FOREIGN KEY(Student_ID) REFERENCES STUDENT(ID),
        FOREIGN KEY(Proposal_ID) REFERENCES PROPOSAL(Title)
    )`);

    // Sample data to be inserted into the APPLICATION table
    const applicationData = [
        ['s200000', 1, 'Pending'],
        ['s200000', 2, 'Accepted'],
        ['s200001', 1, 'Pending'],
        ['s200002', 2, 'Rejected'],
        // Add more data as needed
    ];

    // Insert the sample data into the APPLICATION table
    const applicationStmt = db.prepare('INSERT INTO APPLICATION (Student_ID, Proposal_ID, Status) VALUES (?, ?, ?)');
    applicationData.forEach(application => {
        const returned = applicationStmt.run(application);
    });
    applicationStmt.finalize();

    //#endregion

    // Close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Database populated successfully!');
    });

});