//import database
const { db } = require('./db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS STUDENT (
        ID INTEGER PRIMARY KEY,
        SURNAME TEXT,
        NAME TEXT,
        GENDER TEXT,
        NATIONALITY TEXT,
        EMAIL TEXT,
        CODE_DEGREE TEXT,
        ENROLLMENT_YEAR INTEGER
    )`);

    // Sample data to be inserted into the table
    const studentsData = [
        [1, 'Doe', 'John', 'Male', 'American', 'john@example.com', 'CS101', 2021],
        [2, 'Smith', 'Alice', 'Female', 'British', 'alice@example.com', 'ENG202', 2022],
        [3, 'Garcia', 'Carlos', 'Male', 'Spanish', 'carlos@example.com', 'BIO303', 2020]
        // Add more data as needed
    ];

    // Insert the sample data into the table
    const stmt = db.prepare('INSERT INTO STUDENT (ID, SURNAME, NAME, GENDER, NATIONALITY, EMAIL, CODE_DEGREE, ENROLLMENT_YEAR) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    studentsData.forEach(student => {
        const returned = stmt.run(student);
    });
    stmt.finalize();

    // Close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Database populated successfully!');
    });
});