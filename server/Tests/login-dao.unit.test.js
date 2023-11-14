const {effectLogin} = require('../DB/login-dao')
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    get: jest.fn()
  };
  return { db: mockedDB };
});

describe('effectLogin', () => {
    it('should resolve with student user when valid student credentials are provided', async () => {
      // Set up mock database response for student
      const mockedStudentRow = { ID: '123', /* other student fields */ };
      db.get.mockImplementationOnce((query, params, callback) => {
        callback(null, mockedStudentRow);
      });
  
      const credentials = { username: 'student@example.com', password: 's000001' };
      const result = await effectLogin(credentials);
  
      expect(result).toEqual({ id: '123', role: 'STUDENT' });
    });
  
    it('should resolve with teacher user when valid teacher credentials are provided', async () => {
      // Set up mock database response for teacher
      const mockedTeacherRow = { ID: '456', /* other teacher fields */ };
      db.get.mockImplementationOnce((query, params, callback) => {
        callback(null, mockedTeacherRow);
      });
  
      const credentials = { username: 'teacher@example.com', password: 'd000001' };
      const result = await effectLogin(credentials);
  
      expect(result).toEqual({ id: '456', role: 'TEACHER' });
    });
    
    it('should reject with an error when there is an SQL error for student', async () => {
        const credentials = { username: 'student@example.com', password: 's000001' };
      
        // Mock the database to simulate an SQL error for the student query
        db.get.mockImplementationOnce((query, params, callback) => {
          callback('Simulated SQL error', 'not null row');
        });
      
        await expect(effectLogin(credentials)).rejects.toEqual('Simulated SQL error');
    });

    it('should reject with an error when student is not found', async () => {
      // Set up mock database response for student not found
      db.get.mockImplementationOnce((query, params, callback) => {
        callback(null, null); // Simulate student not found
      });
  
      const credentials = { username: 'nonexistent@student.com', password: 's000001' };
      await expect(effectLogin(credentials)).rejects.toEqual('Student not found');
    });

    it('should reject with an error when there is an SQL error for teacher', async () => {
        const credentials = { username: 'teacher@example.com', password: 'd000001' };
      
        // Mock the database to simulate an SQL error for the teacher query
        db.get.mockImplementationOnce((query, params, callback) => {
          callback('Simulated SQL error', 'not null row');
        });
      
        await expect(effectLogin(credentials)).rejects.toEqual('Simulated SQL error');
      });

    it('should reject with an error when professor is not found', async () => {
        // Set up mock database response for student not found
        db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, null); // Simulate student not found
        });
    
        const credentials = { username: 'nonexistent@teacher.com', password: 'd000001' };
        await expect(effectLogin(credentials)).rejects.toEqual('Teacher not found');
    });

    it('should reject with an error for unexpected user role', async () => {
        const credentials = { username: 'unexpected@example.com', password: 'unexpectedPassword' };
        await expect(effectLogin(credentials)).rejects.toEqual('Unexpected user role');
    });
    
  
  });