// Mocking the dependencies
const { getProposalsByProfessor, archiveProposal } = require('../DB/proposals-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn(),    
    get: jest.fn(),
    run: jest.fn(),
    close: jest.fn()
  };
  return { db: mockedDB };
});

describe('getProposalsByProfessor Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with empty object when no proposals found for a professor', async () => {
    const professorId = 1;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=?';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    const result = await getProposalsByProfessor(professorId);
    expect(result).toEqual({});
  });

  it('should resolve with an array of proposals when they are found for a professor', async () => {
    const professorId = 2;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=?';
    const mockedRows = [
      { title: 'Proposal 1' },
      { title: 'Proposal 2' }
      // Add more sample proposal data as needed
    ];
    const expectedProposals = mockedRows.map(r => ({ title: r.Title }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    const result = await getProposalsByProfessor(professorId);
    expect(result).toEqual(expectedProposals);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const professorId = 3;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=?';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(expectedError, null);
    });

    await expect(getProposalsByProfessor(professorId)).rejects.toEqual(expectedError);
  });
});

describe('archiveProposal', () => {
  it('should reject with an error when the proposal is not found', async () => {
      // Mock the get method to simulate a scenario where the proposal is not found
      db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, null); // Simulating that the proposal is not found
      });

      // Mock the close method
      db.close.mockImplementationOnce(jest.fn());

      // Mock the reject method
      const rejectMock = jest.fn();

      try {
          // Call the function with a proposal that doesn't exist
          await archiveProposal('Nonexistent Proposal', 'someStudentId');
      } catch (error) {
          expect(error).toBeDefined();
          expect(error.message).toBe('Proposal not found.');
          expect(rejectMock).toHaveBeenCalledWith(error);
      }
  });
});

