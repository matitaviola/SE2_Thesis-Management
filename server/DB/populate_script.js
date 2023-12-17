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
                FOREIGN KEY(Supervisor) REFERENCES TEACHER(ID)
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

            //EXTERNAL-COSUPERVISOR
            db.run(`CREATE TABLE IF NOT EXISTS EXTERNAL_COSUPERVISOR (
                Email TEXT UNIQUE NOT NULL,
                Name TEXT NOT NULL,
                Surname TEXT NOT NULL,
                PRIMARY KEY (Email)
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

                // Empty the EXTERNAL-COSUPERVISOR table
                db.run('DELETE FROM EXTERNAL_COSUPERVISOR');

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
                    ['s200000', 'Doe', 'John', 'Male', 'American', 'john@studenti.polito.com', 'CS101', 2021],
                    ['s200001', 'Smith', 'Alice', 'Female', 'British', 'alice@studenti.polito.com', 'ENG202', 2022],
                    ['s200002', 'Garcia', 'Carlos', 'Male', 'Spanish', 'carlos@studenti.polito.com', 'BIO303', 2020],
                    ['s200003', 'Wang', 'Ling', 'Female', 'Chinese', 'ling@studenti.polito.com', 'CS101', 2021],
                    ['s200004', 'Gupta', 'Raj', 'Male', 'Indian', 'raj@studenti.polito.com', 'DEGREE505', 2023],
                    ['s200005', 'Kowalski', 'Anna', 'Female', 'Polish', 'anna@studenti.polito.com', 'DEGREE404', 2020],
                    ['s200006', 'Kim', 'Min-Jun', 'Male', 'Korean', 'minjun@studenti.polito.com', 'CS101', 2022],
                    ['s200007', 'Silva', 'Luiz', 'Male', 'Brazilian', 'luiz@studenti.polito.com', 'DEGREE606', 2021],
                    ['s200008', 'Andersson', 'Elsa', 'Female', 'Swedish', 'elsa@studenti.polito.com', 'BIO303', 2023],
                    ['s200009', 'Lopez', 'Maria', 'Female', 'Mexican', 'maria@studenti.polito.com', 'CS101', 2020],
                    ['s200010', 'Johnson', 'Sam', 'Male', 'American', 'sam@studenti.polito.com', 'CS101', 2022],
                    ['s200011', 'Miller', 'Sophie', 'Female', 'Canadian', 'sophie@studenti.polito.com', 'ENG202', 2021],
                    ['s200012', 'Li', 'Chen', 'Male', 'Chinese', 'chen@studenti.polito.com', 'BIO303', 2023],
                    ['s200013', 'Gonzalez', 'Isabella', 'Female', 'Spanish', 'isabella@studenti.polito.com', 'CS101', 2020],
                    ['s200014', 'Patel', 'Amit', 'Male', 'Indian', 'amit@studenti.polito.com', 'DEGREE505', 2021],
                    ['s200015', 'Nowak', 'Marta', 'Female', 'Polish', 'marta@studenti.polito.com', 'DEGREE404', 2022],
                    ['s200016', 'Kang', 'Ji-Hoon', 'Male', 'Korean', 'jihoon@studenti.polito.com', 'CS101', 2023],
                    ['s200017', 'Santos', 'Ana', 'Female', 'Brazilian', 'ana@studenti.polito.com', 'DEGREE606', 2020],
                    ['s200018', 'Olsson', 'Gustav', 'Male', 'Swedish', 'gustav@studenti.polito.com', 'BIO303', 2022],
                    ['s200019', 'Chavez', 'Diego', 'Male', 'Mexican', 'diego@studenti.polito.com', 'CS101', 2021],
                    //used for the email
                    ['s000001', 'Accetta', 'Marco Antonio', 'Male', 'Coazzese', 'mta_studenti.polito@libero.it', 'CS101', 2021],
                    ['s000002', 'Rigetta', 'Mario Alberto', 'Male', 'Coazzese', 'mtr_studenti.polito@libero.it', 'CS101', 2021]
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
                    ['d100001', 'Johnson', 'Michael', 'michael@docenti.polito.com', 'GroupA', 'DEP101'],
                    ['d200002', 'Brown', 'Emily', 'emily@docenti.polito.com', 'GroupB', 'DEP202'],
                    ['d100003', 'Martinez', 'David', 'david@docenti.polito.com', 'GroupC', 'DEP303'],
                    ['d200004', 'Garcia', 'Luis', 'luis@docenti.polito.com', 'GroupD', 'DEP101'],
                    ['d100005', 'Chen', 'Wei', 'wei@docenti.polito.com', 'GroupE', 'DEP202'],
                    ['d200006', 'Ali', 'Fatima', 'fatima@docenti.polito.com', 'GroupF', 'DEP303'],
                    ['d100007', 'Smith', 'Jack', 'jack@docenti.polito.com', 'GroupG', 'DEP101'],
                    ['d200008', 'Park', 'Ji-Hoon', 'jihoon@docenti.polito.com', 'GroupH', 'DEP202'],
                    ['d100009', 'Gomes', 'Ana', 'ana@docenti.polito.com', 'GroupI', 'DEP303'],
                    ['d200010', 'Abe', 'Kenji', 'kenji@docenti.polito.com', 'GroupJ', 'DEP101'],
                    ['d100011', 'Smith', 'Emma', 'emma@docenti.polito.com', 'GroupA', 'DEP101'],
                    ['d200012', 'Jones', 'Daniel', 'daniel@docenti.polito.com', 'GroupB', 'DEP202'],
                    ['d100013', 'Wang', 'Sophia', 'sophia@docenti.polito.com', 'GroupC', 'DEP303'],
                    ['d200014', 'Gomez', 'Carlos', 'carlos@docenti.polito.com', 'GroupD', 'DEP101'],
                    ['d100015', 'Kim', 'Hye-Jin', 'hyejin@docenti.polito.com', 'GroupE', 'DEP202'],
                    ['d200016', 'Mikhail', 'Yusuf', 'yusuf@docenti.polito.com', 'GroupF', 'DEP303'],
                    ['d100017', 'Brown', 'Olivia', 'olivia@docenti.polito.com', 'GroupG', 'DEP101'],
                    ['d200018', 'Choi', 'Min-Jae', 'minjae@docenti.polito.com', 'GroupH', 'DEP202'],
                    ['d100019', 'Fernandez', 'Isabel', 'isabel@docenti.polito.com', 'GroupI', 'DEP303'],
                    ['d200020', 'Yamamoto', 'Haruto', 'haruto@docenti.polito.com', 'GroupJ', 'DEP101'],
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
                    [1, 'Exploring Advanced Programming Paradigms', 'd100001', null, 'programming, algorithms, null', 'Company', 'GroupA', 'Embark on an exciting journey into programming and algorithms, contributing to cutting-edge advancements in knowledge and technology.', 'Knowledge about programming', 'Some notes', '2024-12-31', 'BSc', 'ENG202 BIO303 CS101'],
                    [2, 'Unveiling New Horizons in Data Analysis', 'd200002', 'd100001 esterna@notpoli.com', 'mathematics, data silos', 'Research', 'GroupB GroupA', 'Engage in an innovative project focused on data analysis, exploring new horizons and contributing to the evolving world of data science.', 'Knowledge about data analysis', 'Additional notes', '2024-01-15', 'BSc', 'DEGREE404'],
                    [3, 'Architectural Innovation in Software Development', 'd100003', null, 'design, architecture, development', 'Development', 'GroupC', 'Explore the intricate realms of software engineering, emphasizing design and architecture, contributing to the evolution of technology and development.', 'Knowledge about software engineering', 'Additional info', '2024-11-20', 'MSc', 'CS101 ENG202 BIO303'],
                    [4, 'Safeguarding the Digital Future: Cybersecurity Focus', 'd100001', 'd200002 esterna@notpoli.com', 'networks, security, protocols', 'Abroad', 'GroupA GroupB', 'Contribute to the ever-growing field of cybersecurity, focusing on networks and protocols, and play a vital role in securing the digital future.', 'Knowledge about cybersecurity', 'Important notes', '2024-06-30', 'MSc', 'CS101'],
                    [6, 'Pioneering Groundbreaking Medical Research Projects', 'd100003', 'd200002 fuori@dalluni.it', 'medicine, health, research', 'Research', 'GroupC GroupB', 'Join a groundbreaking project in medical research, where your contributions can make a critical impact on the fields of medicine, health, and research.', 'Knowledge about medical research', 'Critical information', '2024-03-05', 'BSc', 'BIO303'],
                    [8, 'Navigating Financial Economics Frontiers with Insight', 'd200002', null, 'economics, finance, markets', 'Development', 'GroupB', 'Embark on a journey into the dynamic field of financial economics, contributing to cutting-edge research and gaining insights into the world of economics and finance.', 'Knowledge about financial economics', 'Important data', '2024-04-18', 'MSc', 'DEGREE909'],
                    [9, 'Linguistic Studies: Unraveling Language and Communication', 'd100003', 'd100011', 'linguistics, language, communication', 'Company', 'GroupC GroupA', 'Delve into linguistic studies with a focus on language and communication, contributing to the understanding and evolution of linguistic phenomena.', 'Knowledge about linguistic studies', 'Latest info', '2024-07-22', 'BSc', 'ENG202'],
                    [11, 'Innovating Web Technologies and Digital Experiences', 'd100011', null, 'web development, programming, design', 'Company', 'GroupA', 'Embark on an exciting project in web development, programming, and design, contributing to the future of web technologies and digital experiences.', 'Knowledge about web technologies', 'Important notes', '2024-12-31', 'BSc', 'CS101'],
                    [12, 'Genomic Data Exploration: Advancements in Genetics', 'd200012', null, 'bioinformatics, data analysis', 'Research', 'GroupB', 'Explore the vast world of genomic data in this cutting-edge bioinformatics and data analysis project, contributing to advancements in the field of genetics.', 'Knowledge about genomic data', 'Additional notes', '2024-01-15', 'BSc', 'DEGREE404'],
                    [13, 'Innovations in Software Engineering and Architecture', 'd100003', '1', 'software development, architecture', 'Development', 'GroupC', 'Immerse yourself in software engineering, with a focus on development and architecture, contributing to the innovation and evolution of software technologies.', 'Knowledge about software engineering', 'Additional info', '2024-11-20', 'MSc', 'CS101'],
                    [14, 'Defending Digital Landscapes: Network Security Focus', 'd100011', 'd100001', 'networks, cybersecurity, protocols', 'Abroad', 'GroupA', 'Explore the critical world of network security and cybersecurity, contributing to the development of robust security protocols and safeguarding digital landscapes.', 'Knowledge about network security', 'Important notes', '2024-06-30', 'MSc', 'CS101'],
                    [16, 'Impactful Contributions to Medical Research Exploration', 'd100003', 'd100001', 'medicine, health, research', 'Research', 'GroupC GroupA', 'Contribute to critical medical research, where your efforts can save lives and provide invaluable insights into the realms of medicine, health, and research.', 'Knowledge about medical research', 'Critical information', '2024-03-05', 'BSc', 'BIO303'],
                    [18, 'Unveiling Financial Frontiers: Insights in Economics', 'd200012', 'd200002', 'economics, finance, markets', 'Development', 'GroupB', 'Embark on a journey into the dynamic field of financial economics, contributing to cutting-edge research and gaining insights into the world of economics and finance.', 'Knowledge about financial economics', 'Important data', '2024-04-18', 'MSc', 'DEGREE909'],
                    [19, 'Linguistic Phenomena: Evolution through Language and Communication', 'd200016', 'd200002', 'linguistics, language, communication', 'Company', 'GroupF GroupA', 'Delve into linguistic studies with a focus on language and communication, contributing to the understanding and evolution of linguistic phenomena.', 'Knowledge about linguistic studies', 'Latest info', '2024-07-22', 'BSc', 'ENG202'],
                    //archived, will be deleted, used because the ID is self-increasing and might cause issues otherwise
                    [5, 'Linguistic Phenomena: Evolution through Language-Advancing Data-Driven Decision-Making through Statistical Analysis and Communication', 'd200002', 'd100001', 'statistics, analysis, modeling', 'Company', 'GroupB GroupA', 'Engage in statistical analysis and modeling, contributing to advancements in data-driven decision-making and statistical methodologies.', 'Knowledge about statistical analysis', 'New notes', '2022-09-10', 'BSc', 'DEGREE404'],
                    [7, 'Pushing Boundaries in AI, Machine Learning, and Robotics', 'd100001', null, 'AI, machine learning, robotics', 'Development', 'GroupA', 'Explore the realms of AI, machine learning, and robotics, contributing to cutting-edge technologies and pushing the boundaries of artificial intelligence.', 'Knowledge about artificial intelligence', 'Urgent notes', '2022-12-01', 'MSc', 'CS101'],
                    [10, 'Advancing Environmental Sustainability and Climate Studies', 'd100001', 'd100003 esterna@notpoli.com', 'environment, sustainability, climate', 'Company', 'GroupA GroupC', 'Contribute to environmental sustainability and climate studies, making a positive impact on the planet through advanced knowledge and research.', 'Knowledge about environmental science', 'Updated notes', '2022-07-15', 'MSc', 'BIO303'],
                    [15, 'Elevating Data-Driven Decision-Making through Statistical Analysis', 'd200012', 'd100003', 'statistics, machine learning, modeling', 'Company', 'GroupB GroupC', 'Engage in statistical analysis and modeling, contributing to advancements in data-driven decision-making and statistical methodologies.', 'Knowledge about statistical analysis', 'New notes', '2022-09-10', 'BSc', 'ENG202 BIO303 DEGREE404'],
                    [17, 'Breaking Ground in AI, Machine Learning, and Robotics', 'd100011', 'd200016', 'AI, machine learning, robotics', 'Development', 'GroupA GroupF', 'Explore the realms of AI, machine learning, and robotics, contributing to cutting-edge technologies and pushing the boundaries of artificial intelligence.', 'Knowledge about artificial intelligence', 'Urgent notes', '2022-12-01', 'MSc', 'CS101'],
                    [20, 'Revolutionizing Environmental Sustainability and Climate Studies', 'd100011', null, 'environment, sustainability, climate', 'Research', 'GroupA', 'Contribute to environmental sustainability and climate studies, making a positive impact on the planet through advanced knowledge and research.', 'Knowledge about environmental science', 'Updated notes', '2022-07-15', 'MSc', 'BIO303'],
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
                    [5, 'Linguistic Phenomena: Evolution through Language-Advancing Data-Driven Decision-Making through Statistical Analysis and Communication', 'd200002', 'd100001', 'statistics, analysis, modeling', 'Company', 'GroupB GroupA', 'Engage in statistical analysis and modeling, contributing to advancements in data-driven decision-making and statistical methodologies.', 'Knowledge about statistical analysis', 'New notes', '2022-09-10', 'BSc', 'DEGREE404', "Expired", null],
                    [7, 'Pushing Boundaries in AI, Machine Learning, and Robotics', 'd100001', null, 'AI, machine learning, robotics', 'Development', 'GroupA', 'Explore the realms of AI, machine learning, and robotics, contributing to cutting-edge technologies and pushing the boundaries of artificial intelligence.', 'Knowledge about artificial intelligence', 'Urgent notes', '2022-12-01', 'MSc', 'CS101', "Archived", "s200009"],
                    [10, 'Advancing Environmental Sustainability and Climate Studies', 'd100001', 'd100003 esterna@notpoli.com', 'environment, sustainability, climate', 'Company', 'GroupA GroupC', 'Contribute to environmental sustainability and climate studies, making a positive impact on the planet through advanced knowledge and research.', 'Knowledge about environmental science', 'Updated notes', '2022-07-15', 'MSc', 'BIO303', "Archived","s200008"],
                    [15, 'Elevating Data-Driven Decision-Making through Statistical Analysis', 'd200012', 'd100003', 'statistics, machine learning, modeling', 'Company', 'GroupB GroupC', 'Engage in statistical analysis and modeling, contributing to advancements in data-driven decision-making and statistical methodologies.', 'Knowledge about statistical analysis', 'New notes', '2022-09-10', 'BSc', 'ENG202 BIO303 DEGREE404', "Expired", null],
                    [17, 'Breaking Ground in AI, Machine Learning, and Robotics', 'd100011', 'd200016', 'AI, machine learning, robotics', 'Development', 'GroupA GroupF', 'Explore the realms of AI, machine learning, and robotics, contributing to cutting-edge technologies and pushing the boundaries of artificial intelligence.', 'Knowledge about artificial intelligence', 'Urgent notes', '2022-12-01', 'MSc', 'CS101', "Expired", null],
                    [20, 'Revolutionizing Environmental Sustainability and Climate Studies', 'd100011', null, 'environment, sustainability, climate', 'Research', 'GroupA', 'Contribute to environmental sustainability and climate studies, making a positive impact on the planet through advanced knowledge and research.', 'Knowledge about environmental science', 'Updated notes', '2022-07-15', 'MSc', 'BIO303', "Expired", null],
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

                const removinStmt = db.prepare('DELETE FROM PROPOSAL WHERE Id = ?');
                archProposalData.forEach(proposal => {
                    removinStmt.run([proposal[0]], (err) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                removinStmt.finalize();
                
            };

            const insertApplicationData = () => {
                const applicationData = [
                    ['s200000', 1, null, 'Exploring Advanced Programming Paradigms', 'Pending'],
                    ['s200000', 2, null, 'Unveiling New Horizons in Data Analysis', 'Rejected'],
                    ['s200000', null, 7, 'Pushing Boundaries in AI, Machine Learning, and Robotics', 'Cancelled'],
                    ['s200001', 3, null, 'Architectural Innovation in Software Development', 'Pending'],
                    ['s200002', 2, null, 'Unveiling New Horizons in Data Analysis', 'Rejected'],
                    ['s200003', 3, null, 'Architectural Innovation in Software Development', 'Pending'],
                    ['s200004', 4, null, 'Safeguarding the Digital Future: Cybersecurity Focus', 'Rejected'],
                    ['s200005', 5, null, 'Linguistic Phenomena: Evolution through Language-Advancing Data-Driven Decision-Making through Statistical Analysis and Communication', 'Pending'],
                    ['s200006', 6, null, 'Pioneering Groundbreaking Medical Research Projects', 'Rejected'],
                    ['s200007', null, 7,  'Pushing Boundaries in AI, Machine Learning, and Robotics', 'Cancelled'],
                    ['s200010', 11, null, 'Innovating Web Technologies and Digital Experiences', 'Pending'],
                    ['s200010', 8, null, 'Navigating Financial Economics Frontiers with Insight', 'Rejected'],
                    ['s200011', 13, null, 'Innovations in Software Engineering and Architecture', 'Pending'],
                    ['s200012', 12, null, 'Genomic Data Exploration: Advancements in Genetics', 'Rejected'],
                    ['s200013', 13, null, 'Innovations in Software Engineering and Architecture', 'Pending'],
                    ['s200014', 14, null, 'Defending Digital Landscapes: Network Security Focus', 'Pending'],
                    ['s200015', 15, null, 'Elevating Data-Driven Decision-Making through Statistical Analysis', 'Pending'],
                    ['s200016', 4, null, 'Safeguarding the Digital Future: Cybersecurity Focus', 'Rejected'],
                    ['s200017', 17, null, 'Breaking Ground in AI, Machine Learning, and Robotics', 'Pending'],
                    ['s200018', 18, null, 'Unveiling Financial Frontiers: Insights in Economics', 'Pending'],
                    ['s200009', null, 7, 'Pushing Boundaries in AI, Machine Learning, and Robotics', 'Accepted'],
                    ['s200008', null, 10, 'Advancing Environmental Sustainability and Climate Studies', 'Accepted'],
                    ['s000001', 1, null, 'Exploring Advanced Programming Paradigms', 'Pending'],
                    ['s000002', 3, null, 'Architectural Innovation in Software Development', 'Pending'],
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

            const insertExternalCosupervisorData = () => {
                const extCoSupData = [
                    ['esterna@notpoli.com','Ester', 'Na'],  
                    ['fuori@dalluni.it','Furio', 'Uori']
                    // Add more entries as needed
                ];

                const stmt = db.prepare('INSERT INTO EXTERNAL_COSUPERVISOR (Email, Name, Surname) VALUES (?, ?, ?)');
                extCoSupData.forEach(extD => {
                    stmt.run(extD, (err) => {
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
            insertExternalCosupervisorData();
            
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