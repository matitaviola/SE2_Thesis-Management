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
                ID TEXT PRIMARY KEY,
                SURNAME TEXT NOT NULL,
                NAME TEXT NOT NULL,
                EMAIL TEXT UNIQUE NOT NULL,
                COD_GROUP TEXT NOT NULL,
                COD_DEPARTMENT TEXT NOT NULL,
                FOREIGN KEY(COD_DEPARTMENT, COD_GROUP) REFERENCES DEPARTMENT(COD_DEPARTMENT, COD_GROUP)
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Career
            db.run(`CREATE TABLE IF NOT EXISTS CAREER (
                ID TEXT,
                COD_COURSE TEXT NOT NULL,
                TITLE_COURSE TEXT UNOT NULL,
                CFU INTEGER NOT NULL,
                GRADE TEXT NOT NULL,
                DATE TEXT NOT NULL, 
                FOREIGN KEY(ID) REFERENCES STUDENT(ID)
                PRIMARY KEY(ID, COD_COURSE)
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
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Supervisor TEXT NOT NULL,
                Co_supervisor TEXT,
                Keywords TEXT NOT NULL,
                Type TEXT NOT NULL,
                Groups TEXT NOT NULL,
                Description TEXT NOT NULL,
                Req_knowledge TEXT,
                Notes TEXT,
                Expiration TEXT NOT NULL,
                Level TEXT NOT NULL,
                CdS TEXT NOT NULL,
                FOREIGN KEY(Supervisor) REFERENCES TEACHER(ID),
                FOREIGN KEY(CdS) REFERENCES DEGREE(COD_DEGREE)
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //ArchivedProposal
            db.run(`CREATE TABLE IF NOT EXISTS ARCHIVED_PROPOSAL (
                Id INTEGER PRIMARY KEY,
                Title TEXT NOT NULL,
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
                Status TEXT,
                Thesist TEXT,
                FOREIGN KEY(Supervisor) REFERENCES TEACHER(ID),
                FOREIGN KEY(CdS) REFERENCES DEGREE(COD_DEGREE),
                FOREIGN KEY(Thesist) REFERENCES STUDENT(ID) ON DELETE SET NULL
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Application
            db.run(`CREATE TABLE IF NOT EXISTS APPLICATION (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Student_ID TEXT,
                Proposal_ID TEXT,
                Archived_Proposal_ID TEXT,
                Proposal TEXT NOT NULL,
                Status TEXT NOT NULL,
                FOREIGN KEY(Student_ID) REFERENCES STUDENT(ID),
                FOREIGN KEY(Proposal_ID) REFERENCES PROPOSAL(Id) ON DELETE SET NULL,
                FOREIGN KEY(Archived_Proposal_ID) REFERENCES ARCHIVED_PROPOSAL(Id) ON DELETE SET NULL
            )`, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });

            //Departments
            db.run(`CREATE TABLE IF NOT EXISTS DEPARTMENT (
                COD_DEPARTMENT TEXT NOT NULL,
                COD_GROUP TEXT NOT NULL,
                PRIMARY KEY (COD_DEPARTMENT, COD_GROUP)
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
            db.serialize(() => {
                // Empty the APPLICATION table
                db.run('DELETE FROM APPLICATION');

                // Empty the ARCHIVED_PROPOSAL table
                db.run('DELETE FROM ARCHIVED_PROPOSAL');

                // Empty the PROPOSAL table
                db.run('DELETE FROM PROPOSAL');

                // Empty the CAREER table
                db.run('DELETE FROM CAREER');

                // Empty the STUDENT table
                db.run('DELETE FROM STUDENT');

                // Empty the TEACHER table
                db.run('DELETE FROM TEACHER');

                // Empty the DEGREE table
                db.run('DELETE FROM DEGREE');

                // Empty the DEPARTMENT table
                db.run('DELETE FROM DEPARTMENT');

                resolve();
            })
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
                    ['s200010', 'Johnson', 'Sam', 'Male', 'American', 'sam@example.com', 'CS101', 2022],
                    ['s200011', 'Miller', 'Sophie', 'Female', 'Canadian', 'sophie@example.com', 'ENG202', 2021],
                    ['s200012', 'Li', 'Chen', 'Male', 'Chinese', 'chen@example.com', 'BIO303', 2023],
                    ['s200013', 'Gonzalez', 'Isabella', 'Female', 'Spanish', 'isabella@example.com', 'CS101', 2020],
                    ['s200014', 'Patel', 'Amit', 'Male', 'Indian', 'amit@example.com', 'DEGREE505', 2021],
                    ['s200015', 'Nowak', 'Marta', 'Female', 'Polish', 'marta@example.com', 'DEGREE404', 2022],
                    ['s200016', 'Kang', 'Ji-Hoon', 'Male', 'Korean', 'jihoon@example.com', 'CS101', 2023],
                    ['s200017', 'Santos', 'Ana', 'Female', 'Brazilian', 'ana@example.com', 'DEGREE606', 2020],
                    ['s200018', 'Olsson', 'Gustav', 'Male', 'Swedish', 'gustav@example.com', 'BIO303', 2022],
                    ['s200019', 'Chavez', 'Diego', 'Male', 'Mexican', 'diego@example.com', 'CS101', 2021]
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
                    ['d100001', 'Johnson', 'Michael', 'michael@example.com', 'GroupA', 'DEP101'],
                    ['d200002', 'Brown', 'Emily', 'emily@example.com', 'GroupB', 'DEP202'],
                    ['d100003', 'Martinez', 'David', 'david@example.com', 'GroupC', 'DEP303'],
                    ['d200004', 'Garcia', 'Luis', 'luis@example.com', 'GroupD', 'DEP101'],
                    ['d100005', 'Chen', 'Wei', 'wei@example.com', 'GroupE', 'DEP202'],
                    ['d200006', 'Ali', 'Fatima', 'fatima@example.com', 'GroupF', 'DEP303'],
                    ['d100007', 'Smith', 'Jack', 'jack@example.com', 'GroupG', 'DEP101'],
                    ['d200008', 'Park', 'Ji-Hoon', 'jihoon@example.com', 'GroupH', 'DEP202'],
                    ['d100009', 'Gomes', 'Ana', 'ana@example.com', 'GroupI', 'DEP303'],
                    ['d200010', 'Abe', 'Kenji', 'kenji@example.com', 'GroupJ', 'DEP101'],
                    ['d100011', 'Smith', 'Emma', 'emma@example.com', 'GroupA', 'DEP101'],
                    ['d200012', 'Jones', 'Daniel', 'daniel@example.com', 'GroupB', 'DEP202'],
                    ['d100013', 'Wang', 'Sophia', 'sophia@example.com', 'GroupC', 'DEP303'],
                    ['d200014', 'Gomez', 'Carlos', 'carlos@example.com', 'GroupD', 'DEP101'],
                    ['d100015', 'Kim', 'Hye-Jin', 'hyejin@example.com', 'GroupE', 'DEP202'],
                    ['d200016', 'Mikhail', 'Yusuf', 'yusuf@example.com', 'GroupF', 'DEP303'],
                    ['d100017', 'Brown', 'Olivia', 'olivia@example.com', 'GroupG', 'DEP101'],
                    ['d200018', 'Choi', 'Min-Jae', 'minjae@example.com', 'GroupH', 'DEP202'],
                    ['d100019', 'Fernandez', 'Isabel', 'isabel@example.com', 'GroupI', 'DEP303'],
                    ['d200020', 'Yamamoto', 'Haruto', 'haruto@example.com', 'GroupJ', 'DEP101'],
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
                    ['s200000', 'COURSE101', 'Introduction to Programming', 5, '30', '2022-05-15'],
                    ['s200002', 'COURSE202', 'Data Structures', 6, '27', '2023-01-20'],
                    ['s200009', 'COURSE303', 'Advanced Biology', 7, '21', '2021-11-30'],
                    ['s200003', 'COURSE404', 'Algorithms', 6, '30L', '2022-08-25'],
                    ['s200007', 'COURSE505', 'Organic Chemistry', 7, '18', '2023-12-10'],
                    ['s200000', 'COURSE606', 'Artificial Intelligence', 6, '23', '2021-06-05'],
                    ['s200002', 'COURSE707', 'Literary Theory', 5, '29', '2023-09-28'],
                    ['s200008', 'COURSE808', 'Genetics', 7, '25', '2022-04-17'],
                    ['s200000', 'COURSE909', 'Database Management', 6, '30', '2021-10-22'],
                    ['s200004', 'COURSE1010', 'Electrical Engineering', 7, '30L', '2023-02-14'],
                    ["s200001", 'COURSE101', 'Introduction to Programming', 5, '30', '2022-05-15'],
                    ["s200003", 'COURSE101', 'Introduction to Programming', 5, '30', '2022-05-15'],
                    ["s200003", 'COURSE202', 'Data Structures', 6, '27', '2023-01-20'],
                    ["s200007", 'COURSE303', 'Advanced Biology', 7, '29', '2021-11-30'],
                    ["s200003", 'COURSE404', 'Algorithms', 6, '28', '2022-08-25'],
                    ["s200006", 'COURSE505', 'Organic Chemistry', 7, '30', '2023-12-10'],
                    ["s200006", 'COURSE606', 'Artificial Intelligence', 6, '27', '2021-06-05'],
                    ["s200007", 'COURSE707', 'Literary Theory', 5, '29', '2023-09-28'],
                    ["s200009", 'COURSE808', 'Genetics', 7, '23', '2022-04-17'],
                    ["s200008", 'COURSE909', 'Database Management', 6, '24', '2021-10-22'],
                    ["s200009", 'COURSE1010', 'Electrical Engineering', 7, '30L', '2023-02-14'],
                    ['s200010', 'COURSE111', 'Web Development', 5, '28', '2022-06-10'],
                    ['s200012', 'COURSE222', 'Bioinformatics', 6, '25', '2023-02-18'],
                    ['s200019', 'COURSE333', 'Ecology', 7, '29', '2021-12-01'],
                    ['s200013', 'COURSE444', 'Machine Learning', 6, '30L', '2022-09-15'],
                    ['s200017', 'COURSE555', 'Organic Chemistry II', 7, '19', '2023-11-25'],
                    ['s200010', 'COURSE666', 'Natural Language Processing', 6, '26', '2021-07-15'],
                    ['s200012', 'COURSE777', 'Literary Analysis', 5, '30', '2023-10-05'],
                    ['s200018', 'COURSE888', 'Genomic Medicine', 7, '24', '2022-05-20'],
                    ['s200010', 'COURSE999', 'Database Systems', 6, '28', '2021-11-02'],
                    ['s200014', 'COURSE1010', 'Electronic Circuits', 7, '30L', '2023-03-20'],
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
                    [1, 'Proposal 1', 'd100001', 'Co-Supervisor A', 'programming, algorithms, null', 'Type A', 'Group X', 'Description for Proposal 1', 'Knowledge about programming', 'Some notes', '2023-12-31', 'BSc', 'CS101'],
                    [2, 'Proposal 2', 'd200002', 'Co-Supervisor C', null, 'Type B', 'Group Y', 'Description for Proposal 2', 'Knowledge about data analysis', 'Additional notes', '2024-01-15', 'BSc', 'DEGREE404'],
                    [3, 'Proposal 3', 'd100003', 'Co-Supervisor B', 'design, architecture, development', 'Type C', 'Group Z', 'Description for Proposal 3', 'Knowledge about software engineering', 'Additional info', '2022-11-20', 'MSc', 'CS101'],
                    [4, 'Proposal 4', 'd100001', 'Co-Supervisor D', 'networks, security, protocols', 'Type D', 'Group W', 'Description for Proposal 4', 'Knowledge about cybersecurity', 'Important notes', '2023-06-30', 'MSc', 'CS101'],
                    [6, 'Proposal 6', 'd100003', 'Co-Supervisor F', 'medicine, health, research', 'Type F', 'Group U', 'Description for Proposal 6', 'Knowledge about medical research', 'Critical information', '2024-03-05', 'BSc', 'BIO303'],
                    [8, 'Proposal 8', 'd200002', 'Co-Supervisor D', 'economics, finance, markets', 'Type H', 'Group S', 'Description for Proposal 8', 'Knowledge about financial economics', 'Important data', '2023-04-18', 'MSc', 'DEGREE909'],
                    [9, 'Proposal 9', 'd100003', 'Co-Supervisor A', 'linguistics, language, communication', 'Type I', 'Group R', 'Description for Proposal 9', 'Knowledge about linguistic studies', 'Latest info', '2024-07-22', 'BSc', 'ENG202'],
                    [11, 'Proposal 11', 'd100011', 'Co-Supervisor A', 'web development, programming, design', 'Type A', 'Group X', 'Description for Proposal 11', 'Knowledge about web technologies', 'Important notes', '2023-12-31', 'BSc', 'CS101'],
                    [12, 'Proposal 12', 'd200012', 'Co-Supervisor C', 'bioinformatics, data analysis', 'Type B', 'Group Y', 'Description for Proposal 12', 'Knowledge about genomic data', 'Additional notes', '2024-01-15', 'BSc', 'DEGREE404'],
                    [13, 'Proposal 13', 'd100003', 'Co-Supervisor B', 'software development, architecture', 'Type C', 'Group Z', 'Description for Proposal 13', 'Knowledge about software engineering', 'Additional info', '2022-11-20', 'MSc', 'CS101'],
                    [14, 'Proposal 14', 'd100011', 'Co-Supervisor D', 'networks, cybersecurity, protocols', 'Type D', 'Group W', 'Description for Proposal 14', 'Knowledge about network security', 'Important notes', '2023-06-30', 'MSc', 'CS101'],
                    [16, 'Proposal 16', 'd100003', 'Co-Supervisor F', 'medicine, health, research', 'Type F', 'Group U', 'Description for Proposal 16', 'Knowledge about medical research', 'Critical information', '2024-03-05', 'BSc', 'BIO303'],
                    [18, 'Proposal 18', 'd200012', 'Co-Supervisor D', 'economics, finance, markets', 'Type H', 'Group S', 'Description for Proposal 18', 'Knowledge about financial economics', 'Important data', '2023-04-18', 'MSc', 'DEGREE909'],
                    [19, 'Proposal 19', 'd100016', 'Co-Supervisor A', 'linguistics, language, communication', 'Type I', 'Group R', 'Description for Proposal 19', 'Knowledge about linguistic studies', 'Latest info', '2024-07-22', 'BSc', 'ENG202']
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                proposalData.forEach(proposal => {
                    stmt.run(proposal, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            const insertArchivedProposalData = () => {
                const archProposalData = [
                    [5, 'Proposal 5', 'd200002', 'Co-Supervisor A', 'statistics, analysis, modeling', 'Type E', 'Group V', 'Description for Proposal 5', 'Knowledge about statistical analysis', 'New notes', '2022-09-10', 'BSc', 'DEGREE404', "Expired", null],
                    [7, 'Proposal 7', 'd100001', 'Co-Supervisor C', 'AI, machine learning, robotics', 'Type G', 'Group T', 'Description for Proposal 7', 'Knowledge about artificial intelligence', 'Urgent notes', '2022-12-01', 'MSc', 'CS101', "Archived", "s200009"],
                    [10, 'Proposal 10', 'd100001', 'Co-Supervisor E', 'environment, sustainability, climate', 'Type J', 'Group Q', 'Description for Proposal 10', 'Knowledge about environmental science', 'Updated notes', '2022-07-15', 'MSc', 'BIO303', "Archived","s200008"],
                    [15, 'Proposal 15', 'd200012', 'Co-Supervisor A', 'statistics, machine learning, modeling', 'Type E', 'Group V', 'Description for Proposal 15', 'Knowledge about statistical analysis', 'New notes', '2022-09-10', 'BSc', 'DEGREE404', "Expired", null],
                    [17, 'Proposal 17', 'd100011', 'Co-Supervisor C', 'AI, machine learning, robotics', 'Type G', 'Group T', 'Description for Proposal 17', 'Knowledge about artificial intelligence', 'Urgent notes', '2022-12-01', 'MSc', 'CS101', "Expired", null],
                    [20, 'Proposal 20', 'd100011', 'Co-Supervisor E', 'environment, sustainability, climate', 'Type J', 'Group Q', 'Description for Proposal 20', 'Knowledge about environmental science', 'Updated notes', '2022-07-15', 'MSc', 'BIO303', "Expired", null],
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO ARCHIVED_PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status, Thesist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                archProposalData.forEach(proposal => {
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
                    ['s200000', 1, null, 'Proposal 1', 'Pending'],
                    ['s200000', 2, null, 'Proposal 2', 'Rejected'],
                    ['s200000', null, 7, 'Proposal 7', 'Cancelled'],
                    ['s200001', 3, null, 'Proposal 3', 'Pending'],
                    ['s200002', 2, null, 'Proposal 2', 'Rejected'],
                    ['s200003', 3, null, 'Proposal 3', 'Pending'],
                    ['s200004', 4, null, 'Proposal 4', 'Pending'],
                    ['s200005', 5, null, 'Proposal 5', 'Pending'],
                    ['s200006', 6, null, 'Proposal 6', 'Rejected'],
                    ['s200007', 7, null, 'Proposal 7', 'Pending'],
                    ['s200010', 11, null, 'Proposal 11', 'Pending'],
                    ['s200010', 8, null, 'Proposal 8', 'Rejected'],
                    ['s200011', 13, null, 'Proposal 13', 'Pending'],
                    ['s200012', 12, null, 'Proposal 12', 'Rejected'],
                    ['s200013', 13, null, 'Proposal 13', 'Pending'],
                    ['s200014', 14, null, 'Proposal 14', 'Pending'],
                    ['s200015', 15, null, 'Proposal 15', 'Pending'],
                    ['s200016', 4, null, 'Proposal 4', 'Rejected'],
                    ['s200017', 17, null, 'Proposal 17', 'Pending'],
                    ['s200018', 18, null, 'Proposal 18', 'Pending'],
                    ['s200009', null, 7, 'Proposal 7', 'Accepted'],
                    ['s200008', null, 10, 'Proposal 10', 'Accepted']
                    // Add more data as needed
                ];

                const stmt = db.prepare('INSERT INTO APPLICATION (Student_ID, Proposal_ID, Archived_Proposal_ID, Proposal, Status) VALUES (?, ?, ?, ?, ?)');
                applicationData.forEach(application => {
                    stmt.run(application, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };


            const insertDepartmentData = () => {
                const departData = [
                    ['DEP101','GroupA'],  
                    ['DEP101','GroupD'],  
                    ['DEP101','GroupG'],  
                    ['DEP101','GroupJ'], 
                    ['DEP202','GroupB'], 
                    ['DEP202','GroupE'],
                    ['DEP202','GroupH'], 
                    ['DEP303','GroupC'], 
                    ['DEP303','GroupF'],
                    ['DEP303','GroupI'], 
                    // Add more entries as needed
                ];

                const stmt = db.prepare('INSERT INTO DEPARTMENT(COD_DEPARTMENT, COD_GROUP) VALUES (?, ?)');
                departData.forEach(stucar => {
                    stmt.run(stucar, (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                
            };

            // Call the function for each table
            insertDegreeData();
            insertDepartmentData();
            insertTeacherData();
            insertStudentData();
            insertCareerData();
            insertProposalData();
            insertArchivedProposalData();
            insertApplicationData();
            
            
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