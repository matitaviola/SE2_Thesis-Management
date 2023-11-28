const {effectLogin} = require('../DB/login-dao')
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    get: jest.fn()
  };
  return { db: mockedDB };
});

test('should resolve with student user when credentials include "studenti.polito"', async () => {
  const credentials = 'stud@studenti.polito.com';
  const mockRow = {
    ID: 'studentId',
    ROLE: 'STUDENT',
    EMAIL: 'stud@studenti.polito.com',
    SURNAME: 'StudentSurname',
    NAME: 'StudentName',
  };
  db.get.mockImplementationOnce((query, params, callback) => {
    callback(null, mockRow);
  });

  const result = await effectLogin(credentials);

  expect(result).toEqual({
    id: mockRow.ID,
    role: 'STUDENT',
    email: mockRow.EMAIL,
    surname: mockRow.SURNAME,
    name: mockRow.NAME,
  });
});

test('should resolve with teacher user when credentials include "docenti.polito"', async () => {
  const credentials = 'doc@docenti.polito.com';
  const mockRow = {
    ID: 'teacherId',
    ROLE: 'TEACHER',
    EMAIL: 'doc@docenti.polito.com',
    SURNAME: 'TeacherSurname',
    NAME: 'TeacherName',
  };
  db.get.mockImplementationOnce((query, params, callback) => {
    callback(null, mockRow);
  });

  const result = await effectLogin(credentials);

  expect(result).toEqual({
    id: mockRow.ID,
    role: 'TEACHER',
    email: mockRow.EMAIL,
    surname: mockRow.SURNAME,
    name: mockRow.NAME,
  });
});

test('should reject with "Student not found" when student not found', async () => {
  const credentials = 'stud@studenti.polito.com';
  db.get.mockImplementationOnce((query, params, callback) => {
    callback(null, undefined); // Simulate no matching student
  });

  await expect(effectLogin(credentials)).rejects.toEqual('Student not found');
});

test('should reject with "Teacher not found" when teacher not found', async () => {
  const credentials = 'doc@docenti.polito.com';
  db.get.mockImplementationOnce((query, params, callback) => {
    callback(null, undefined); // Simulate no matching teacher
  });

  await expect(effectLogin(credentials)).rejects.toEqual('Teacher not found');
});

test('should reject with "Unexpected user role" for other credentials', async () => {
  const credentials = 'other@example.com';

  await expect(effectLogin(credentials)).rejects.toEqual('Unexpected user role');
});

test('should reject with error when database query fails', async () => {
  const credentials = 'stud@studenti.polito.com';
  const errorMessage = 'Database error';
  db.get.mockImplementationOnce((query, params, callback) => {
    callback(new Error(errorMessage));
  });

  await expect(effectLogin(credentials)).rejects.toEqual(new Error(errorMessage));
});

test('should reject with database error for teacher query', async () => {
  const credentials = 'doc@docenti.polito.com';
  const errorMessage = 'Database error';
  db.get.mockImplementationOnce((query, params, callback) => {
    callback(new Error(errorMessage));
  });

  await expect(effectLogin(credentials)).rejects.toEqual(new Error(errorMessage));
});
