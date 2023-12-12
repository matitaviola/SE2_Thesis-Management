const {getSupervisorById, getCoSupervisorsList} = require('../DB/supervisors-dao')
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn()
  };
  return { db: mockedDB };
});

describe('getSupervisorById', () => {
    // Test case for successful retrieval of supervisor
    it('should return the supervisor with the given ID', async () => {
      // Mock data for the database response
      const mockRow = {
        ID: 1,
        NAME: 'John',
        SURNAME: 'Doe',
        COD_DEPARTMENT: 'CS',
        COD_GROUP: 'A',
      };
  
      // Mock the database query to return the mock data
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, [mockRow]);
      });
  
      // Call the function with a mock supervisorId
      const supervisorId = 1;
      const result = await getSupervisorById(supervisorId);
  
      // Expectations
      expect(result).toEqual(mockRow);
    });
  
    // Test case for supervisor not found
    it('should resolve with undefined when no supervisor is found with the given ID', async () => {
      // Mock the database query to return an empty array
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });
  
      // Call the function with a mock supervisorId
      const supervisorId = 456;
  
      // Expectations
      const result = await getSupervisorById(supervisorId);
      expect(result).toBeUndefined();
    });
  
    // Test case for database error
    it('should reject with an error when there is a database error', async () => {
      // Mock the database query to return an error
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('Database error'));
      });
  
      // Call the function with a mock supervisorId
      const supervisorId = 789;
  
      // Expectations
      await expect(getSupervisorById(supervisorId)).rejects.toThrow('Database error');
    });
});

describe('getCoSupervisorsList', () => {
    // Test case for successful retrieval of co-supervisors
    it('should return a list of co-supervisors', async () => {
      // Mock data for the database response
      const mockRows = [
        { ID: 1, NAME: 'John', SURNAME: 'Doe'},
        { ID: 2, NAME: 'Jane', SURNAME: 'Smith'},
      ];
  
      // Mock the database query to return the mock data
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, mockRows);
      });
  
      // Call the function with a mock professorId
      const professorId = 123;
      const result = await getCoSupervisorsList(professorId);
  
      // Expectations
      expect(result).toEqual([
        { id: 1, name: 'John', surname: 'Doe'},
        { id: 2, name: 'Jane', surname: 'Smith'},
      ]);
    });
  
    // Test case for no co-supervisors available
    it('should reject with an error message when no co-supervisors are available', async () => {
      // Mock the database query to return an empty array
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });
  
      // Call the function with a mock professorId
      const professorId = 456;
      
      // Expectations
      await expect(getCoSupervisorsList(professorId)).rejects.toEqual('No cosupervisors available');
    });
  
    // Test case for database error
    it('should reject with an error when there is a database error', async () => {
      // Mock the database query to return an error
      db.all.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('Database error'));
      });
  
      // Call the function with a mock professorId
      const professorId = 789;
  
      // Expectations
      await expect(getCoSupervisorsList(professorId)).rejects.toThrow('Database error');
    });
  });