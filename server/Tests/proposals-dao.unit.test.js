// Mocking the dependencies
const { getProposalsByProfessor } = require('../DB/proposals-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn()
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
      { ID: 1, Title: 'Proposal 1' },
      { ID: 2, Title: 'Proposal 2' }
      // Add more sample proposal data as needed
    ];
    const expectedProposals = mockedRows.map(r => ({ id: r.ID, title: r.Title }));

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
