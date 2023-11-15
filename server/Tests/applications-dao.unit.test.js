// Mocking the dependencies
const { getApplicationsByProposal, getApplicationsByStudent } = require('../DB/applications-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn()
  };
  return { db: mockedDB };
});

describe('getApplicationsByProposal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no applications are found for a proposal', async () => {
    const proposal = { title: 'Proposal 1' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=?';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.title]);
      callback(null, mockedRows);
    });

    const result = await getApplicationsByProposal(proposal);
    expect(result).toEqual({});
  });

  it('should resolve with an array of applications when they are found for a proposal', async () => {
    const proposal = { title: 'Proposal 2' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=?';
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
      expect(params).toEqual([proposal.title]);
      callback(null, mockedRows);
    });

    const result = await getApplicationsByProposal(proposal);
    expect(result).toEqual(expectedApplications);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const proposal = { title: 'Proposal 3' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=?';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.title]);
      callback(expectedError, null);
    });

    await expect(getApplicationsByProposal(proposal)).rejects.toEqual(expectedError);
  });
});

describe('getApplicationsByStudent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no applications are found for a student', async () => {
    const studentId = 1; // Replace with a valid student ID for testing
    const expectedSql = 'SELECT * FROM APPLICATION WHERE STUDENT_ID=?';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    const result = await getApplicationsByStudent(studentId);
    expect(result).toEqual({});
  });

  it('should resolve with an array of applications when they are found for a student', async () => {
    const studentId = 2; // Replace with a valid student ID for testing
    const expectedSql = 'SELECT * FROM APPLICATION WHERE STUDENT_ID=?';
    const mockedRows = [
      { Student_ID: studentId, Proposal: 'Proposal 1', Status: 'Pending' },
      { Student_ID: studentId, Proposal: 'Proposal 2', Status: 'Accepted' }
      // Add more sample application data as needed
    ];
    const expectedApplications = mockedRows.map(r => ({
      studentId: r.Student_ID,
      proposal: r.Proposal,
      status: r.Status
      // Add other fields for the application
    }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    const result = await getApplicationsByStudent(studentId);
    expect(result).toEqual(expectedApplications);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const studentId = 3; // Replace with a valid student ID for testing
    const expectedSql = 'SELECT * FROM APPLICATION WHERE STUDENT_ID=?';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(getApplicationsByStudent(studentId)).rejects.toEqual(expectedError);
  });
});