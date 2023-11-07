// Mocking the dependencies
const { getApplicationsByProposal } = require('../DB/applications-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn()
  };
  return { db: mockedDB };
});

describe('getApplicationsByProposal Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no applications are found for a proposal', async () => {
    const proposal = { id: 1, title: 'Proposal 1' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL_ID=?';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.id]);
      callback(null, mockedRows);
    });

    const result = await getApplicationsByProposal(proposal);
    expect(result).toEqual({});
  });

  it('should resolve with an array of applications when they are found for a proposal', async () => {
    const proposal = { id: 2, title: 'Proposal 2' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL_ID=?';
    const mockedRows = [
      { Student_ID: 1, Status: 'Pending' },
      { Student_ID: 2, Status: 'Accepted' }
      // Add more sample application data as needed
    ];
    const expectedApplications = mockedRows.map(r => ({
      studentId: r.Student_ID,
      proposal: proposal.title,
      status: r.Status
      // Add other fields for the application
    }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.id]);
      callback(null, mockedRows);
    });

    const result = await getApplicationsByProposal(proposal);
    expect(result).toEqual(expectedApplications);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const proposal = { id: 3, title: 'Proposal 3' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL_ID=?';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.id]);
      callback(expectedError, null);
    });

    await expect(getApplicationsByProposal(proposal)).rejects.toEqual(expectedError);
  });
});
