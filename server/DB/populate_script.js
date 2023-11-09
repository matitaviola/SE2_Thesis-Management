// Import database
const { db } = require('./db');

// Function to create tables
const createTables = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            //Student
            db.run(`CREATE TABLE IF NOT EXISTS STUDENT (
                ID TEXT PRIMARY KEY,
                SURNAME TEXT NOT NULL,
                NAME TEXT NOT NULL,
                GENDER TEXT NOT NULL,
                NATIONALITY TEXT NOT NULL,
                EMAIL TEXT UNIQUE NOT NULL,
                CODE_DEGREE TEXT NOT NULL,
                ENROLLMENT_YEAR INTEGER NOT NULL,
                FOREIGN KEY(CODE_DEGREE) REFERENCES DEGREE(COD_DEGREE)
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Teacher
            db.run(`CREATE TABLE IF NOT EXISTS TEACHER (
                ID INTEGER PRIMARY KEY,
                SURNAME TEXT NOT NULL,
                NAME TEXT NOT NULL,
                EMAIL TEXT UNIQUE NOT NULL,
                COD_GROUP TEXT NOT NULL,
                COD_DEPARTMENT TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Career
            db.run(`CREATE TABLE IF NOT EXISTS CAREER (
                ID INTEGER PRIMARY KEY,
                COD_COURSE TEXT NOT NULL,
                TITLE_COURSE TEXT UNOT NULL,
                CFU INTEGER NOT NULL,
                GRADE TEXT NOT NULL,
                DATE TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Degree
            db.run(`CREATE TABLE IF NOT EXISTS DEGREE (
                COD_DEGREE TEXT PRIMARY KEY,
                TITLE_DEGREE TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Proposal
            db.run(`CREATE TABLE IF NOT EXISTS PROPOSAL (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
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
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Application
            db.run(`CREATE TABLE IF NOT EXISTS APPLICATION (
                Student_ID,
                Proposal,
                Status TEXT NOT NULL,
                PRIMARY KEY (Student_ID, Proposal_ID),
                FOREIGN KEY(Student_ID) REFERENCES STUDENT(ID),
                FOREIGN KEY(Proposal_ID) REFERENCES PROPOSAL(Title)
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //StudentCareer
            db.run(`CREATE TABLE IF NOT EXISTS StudentCareer (
                Student_ID,
                Career_ID,
                PRIMARY KEY (Student_ID,Career_ID),
                FOREIGN KEY(Student_ID) REFERENCES STUDENT(ID),
                FOREIGN KEY(Career_ID) REFERENCES CAREER(ID)
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

        });
    });
};

// Function to empty the tables
const emptyTables = () => {
    return new Promise((resolve, reject) => {
        try{
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

            // Empty the StudentCareer table
            db.run('DELETE FROM StudentCareer');
            resolve();
        }
        catch(error){
            reject(error);
        }
    });
}

// Function to insert data
const insertData = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Insert data for each table
            const insertStudentData = () => {
                // Sample data to be inserted into the table
                const studentsData = [
                    ['s200000', 'Doe', 'John', 'Male', 'American', 'john@example.com', 'CS101', 2021],
                    ['s200001', 'Smith', 'Alice', 'Female', 'British', 'alice@example.com', 'ENG202', 2022],
                    ['s200002', 'Garcia', 'Carlos', 'Male', 'Spanish', 'carlos@example.com', 'BIO303', 2020],
                    ['s200003', 'Wang', 'Ling', 'Female', 'Chinese', 'ling@example.com', 'CS101', 2021],
                    ['s200004', 'Gupta', 'Raj', 'Male', 'Indian', 'raj@example.com', 'DEGREE505', 2023],
                    ['s200005', 'Kowalski', 'Anna', 'Female', 'Polish', 'anna@example.com', 'DEGREE404', 2020],
                    ['s200006', 'Kim', 'Min-Jun', 'Male', 'Korean', 'minjun@example.com', 'CS101', 2022],
                    ['s200007', 'Silva', 'Luiz', 'Male', 'Brazilian', 'luiz@example.com', 'DEGREE606', 2021],
                    ['s200008', 'Andersson', 'Elsa', 'Female', 'Swedish', 'elsa@example.com', 'BIO303', 2023],
                    ['s200009', 'Lopez', 'Maria', 'Female', 'Mexican', 'maria@example.com', 'CS101', 2020],
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO STUDENT (ID, SURNAME, NAME, GENDER, NATIONALITY, EMAIL, CODE_DEGREE, ENROLLMENT_YEAR) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                studentsData.forEach(student => {
                    stmt.run(student, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            const insertTeacherData = () => {
                // Sample data to be inserted into the TEACHER table
                const teachersData = [
                    [1, 'Johnson', 'Michael', 'michael@example.com', 'GroupA', 'DEP101'],
                    [2, 'Brown', 'Emily', 'emily@example.com', 'GroupB', 'DEP202'],
                    [3, 'Martinez', 'David', 'david@example.com', 'GroupC', 'DEP303'],
                    [4, 'Garcia', 'Luis', 'luis@example.com', 'GroupD', 'DEP101'],
                    [5, 'Chen', 'Wei', 'wei@example.com', 'GroupE', 'DEP202'],
                    [6, 'Ali', 'Fatima', 'fatima@example.com', 'GroupF', 'DEP303'],
                    [7, 'Smith', 'Jack', 'jack@example.com', 'GroupG', 'DEP101'],
                    [8, 'Park', 'Ji-Hoon', 'jihoon@example.com', 'GroupH', 'DEP202'],
                    [9, 'Gomes', 'Ana', 'ana@example.com', 'GroupI', 'DEP303'],
                    [10, 'Abe', 'Kenji', 'kenji@example.com', 'GroupJ', 'DEP101'],
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO TEACHER (ID, SURNAME, NAME, EMAIL, COD_GROUP, COD_DEPARTMENT) VALUES (?, ?, ?, ?, ?, ?)');
                teachersData.forEach(teacher => {
                    stmt.run(teacher, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
            };

            const insertCareerData = () => {
                const careerData = [
                    [1, 'COURSE101', 'Introduction to Programming', 5, 'A', '2022-05-15'],
                    [2, 'COURSE202', 'Data Structures', 6, 'B', '2023-01-20'],
                    [3, 'COURSE303', 'Advanced Biology', 7, 'A-', '2021-11-30'],
                    [4, 'COURSE404', 'Algorithms', 6, 'B+', '2022-08-25'],
                    [5, 'COURSE505', 'Organic Chemistry', 7, 'A', '2023-12-10'],
                    [6, 'COURSE606', 'Artificial Intelligence', 6, 'B', '2021-06-05'],
                    [7, 'COURSE707', 'Literary Theory', 5, 'A-', '2023-09-28'],
                    [8, 'COURSE808', 'Genetics', 7, 'B', '2022-04-17'],
                    [9, 'COURSE909', 'Database Management', 6, 'A', '2021-10-22'],
                    [10, 'COURSE1010', 'Electrical Engineering', 7, 'A+', '2023-02-14'],
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO CAREER (ID, COD_COURSE, TITLE_COURSE, CFU, GRADE, DATE) VALUES (?, ?, ?, ?, ?, ?)');
                careerData.forEach(career => {
                    stmt.run(career, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            const insertDegreeData = () => {
                const degreeData = [
                    ['CS101', 'Computer Science'],
                    ['ENG202', 'English Literature'],
                    ['BIO303', 'Biology'],
                    ['DEGREE404', 'Mathematics'],
                    ['DEGREE505', 'Chemistry'],
                    ['DEGREE606', 'Physics'],
                    ['DEGREE707', 'History'],
                    ['DEGREE808', 'Psychology'],
                    ['DEGREE909', 'Economics'],
                    ['DEGREE1010', 'Sociology'],
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO DEGREE (COD_DEGREE, TITLE_DEGREE) VALUES (?, ?)');
                degreeData.forEach(degree => {
                    stmt.run(degree, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            const insertProposalData = () => {
                const proposalData = [
                    ['Proposal 1', 1, 'Co-Supervisor A', 'programming, algorithms, null', 'Type A', 'Group X', 'Description for Proposal 1', 'Knowledge about programming', 'Some notes', '2023-12-31', 'Advanced', 'CdS/Program 1'],
                    ['Proposal 2', 2, 'Co-Supervisor C', null, 'Type B', 'Group Y', 'Description for Proposal 2', 'Knowledge about data analysis', 'Additional notes', '2024-01-15', 'Intermediate', 'CdS/Program 2'],
                    ['Proposal 3', 3, 'Co-Supervisor B', 'design, architecture, development', 'Type C', 'Group Z', 'Description for Proposal 3', 'Knowledge about software engineering', 'Additional info', '2022-11-20', 'Intermediate', 'CdS/Program 3'],
                    ['Proposal 4', 1, 'Co-Supervisor D', 'networks, security, protocols', 'Type D', 'Group W', 'Description for Proposal 4', 'Knowledge about cybersecurity', 'Important notes', '2023-06-30', 'Advanced', 'CdS/Program 4'],
                    ['Proposal 5', 2, 'Co-Supervisor A', 'statistics, analysis, modeling', 'Type E', 'Group V', 'Description for Proposal 5', 'Knowledge about statistical analysis', 'New notes', '2022-09-10', 'Beginner', 'CdS/Program 5'],
                    ['Proposal 6', 3, 'Co-Supervisor F', 'medicine, health, research', 'Type F', 'Group U', 'Description for Proposal 6', 'Knowledge about medical research', 'Critical information', '2024-03-05', 'Advanced', 'CdS/Program 6'],
                    ['Proposal 7', 1, 'Co-Supervisor C', 'AI, machine learning, robotics', 'Type G', 'Group T', 'Description for Proposal 7', 'Knowledge about artificial intelligence', 'Urgent notes', '2022-12-01', 'Intermediate', 'CdS/Program 7'],
                    ['Proposal 8', 2, 'Co-Supervisor D', 'economics, finance, markets', 'Type H', 'Group S', 'Description for Proposal 8', 'Knowledge about financial economics', 'Important data', '2023-04-18', 'Beginner', 'CdS/Program 8'],
                    ['Proposal 9', 3, 'Co-Supervisor A', 'linguistics, language, communication', 'Type I', 'Group R', 'Description for Proposal 9', 'Knowledge about linguistic studies', 'Latest info', '2024-07-22', 'Intermediate', 'CdS/Program 9'],
                    ['Proposal 10', 1, 'Co-Supervisor E', 'environment, sustainability, climate', 'Type J', 'Group Q', 'Description for Proposal 10', 'Knowledge about environmental science', 'Updated notes', '2022-07-15', 'Advanced', 'CdS/Program 10'],
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO PROPOSAL (Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                proposalData.forEach(proposal => {
                    stmt.run(proposal, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            const insertApplicationData = () => {
                const applicationData = [
                    ['s200000', 'Proposal 1', 'Pending'],
                    ['s200000', 'Proposal 2', 'Accepted'],
                    ['s200001', 'Proposal 3', 'Pending'],
                    ['s200002', 'Proposal 2', 'Rejected'],
                    ['s200003', 'Proposal 3', 'Pending'],
                    ['s200004', 'Proposal 4', 'Accepted'],
                    ['s200005', 'Proposal 5', 'Pending'],
                    ['s200006', 'Proposal 6', 'Rejected'],
                    ['s200007', 'Proposal 7', 'Pending'],
                    ['s200008', 'Proposal 8', 'Accepted'],
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO APPLICATION (Student_ID, Proposal_ID, Status) VALUES (?, ?, ?)');
                applicationData.forEach(application => {
                    stmt.run(application, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            const insertStudentCareerData = () => {
                const stucarData = [
                    ['s200000', 1],  // Student ID: s200000 - Career ID: 1
                    ['s200000', 2],  // Student ID: s200000 - Career ID: 2
                    ['s200000', 3],  // Student ID: s200000 - Career ID: 3
                    ['s200001', 4],  // Student ID: s200001 - Career ID: 4
                    ['s200001', 5],  // Student ID: s200001 - Career ID: 5
                    ['s200001', 6],  // Student ID: s200001 - Career ID: 6
                    ['s200002', 7],  // Student ID: s200002 - Career ID: 7
                    ['s200002', 8],  // Student ID: s200002 - Career ID: 8
                    ['s200002', 9],  // Student ID: s200002 - Career ID: 9
                    ['s200003', 10], // Student ID: s200003 - Career ID: 10
                    // Add more entries as needed
                ];

                const stmt = db.prepare('INSERT INTO StudentCareer(Student_ID, Career_ID) VALUES (?, ?)');
                stucarData.forEach(stucar => {
                    stmt.run(stucar, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            // Call the function for each table
            insertStudentData();
            
            insertTeacherData();

            insertCareerData();
            insertDegreeData();
            insertProposalData();
            insertApplicationData();
            insertStudentCareerData();
            resolve();
        });
    });
};

// Function to populate the database
const populateDatabase = async () => {
    try {
        await createTables(); // Create tables first
        console.log("Tables created if they were not present");
        await emptyTables(); // Cleans the tables
        console.log("Cleaned tables");
        await insertData(); // Insert data once tables are created
        console.log("Entries inserted");

        // Close the database connection
        db.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Database populated successfully!');
            }
        });
    } catch (error) {
        console.error('Error populating database:', error);
    }
};

// Start populating the database
populateDatabase();
