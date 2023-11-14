// Mocking the dependencies
const { getActiveApplicationsByProposal, getApplicationsByStudent, setApplicationStatus, autoRejectApplication, autoDeleteApplication } = require('../DB/applications-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn(),
    run: jest.fn()
  };
  return { db: mockedDB };
});

describe('getActiveApplicationsByProposal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no applications are found for a proposal', async () => {
    const proposal = { title: 'Proposal 1' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=? AND Status=?';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.title, "Pending"]);
      callback(null, mockedRows);
    });

    const result = await getActiveApplicationsByProposal(proposal);
    expect(result).toEqual({});
  });

  it('should resolve with an array of applications when they are found for a proposal', async () => {
    const proposal = { title: 'Proposal 2' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=? AND Status=?';
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
      expect(params).toEqual([proposal.title, "Pending"]);
      callback(null, mockedRows);
    });

    const result = await getActiveApplicationsByProposal(proposal);
    expect(result).toEqual(expectedApplications);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const proposal = { title: 'Proposal 3' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE PROPOSAL=? AND Status=?';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.title, "Pending"]);
      callback(expectedError, null);
    });

    await expect(getActiveApplicationsByProposal(proposal)).rejects.toEqual(expectedError);
  });
});

describe('getApplicationsByStudent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no applications are found for a student', async () => {
    const studentId = 1; 
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
    const studentId = 2; 
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
    const studentId = 3; 
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

describe('setApplicationStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message when updating the application status successfully', async () => {
    const proposal = 'Proposal 1';
    const studentId = 's200001'; 
    const status = 'Accepted';
    const expectedSql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal = ? AND Student_Id = ? AND Status = "Pending"';
    
    const mockRun = jest.fn().mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([status, proposal, studentId]);
      callback.call({ changes: 1 }, null); // Manually set the 'this' context
    });
  
    db.run.mockImplementation(mockRun);
  
    const result = await setApplicationStatus(proposal, studentId, status);
    expect(result).toEqual({ success: true });
  });
  
  it('should resolve with an error message when the application is not in Pending status', async () => {
    const proposal = 'Proposal 2';
    const studentId = 's200002'; 
    const status = 'Accepted';
    const expectedSql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal = ? AND Student_Id = ? AND Status = "Pending"';
    
    const mockRun = jest.fn().mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([status, proposal, studentId]);
      callback.call({ changes: 0 }, null); // Manually set the 'this' context
    });
  
    db.run.mockImplementation(mockRun);
  
    const result = await setApplicationStatus(proposal, studentId, status);
    expect(result).toEqual({ error: 'The application is not in Pending status or does not exist' });
  });

  it('should reject with an error if an error occurs during database update', async () => {
    const proposal = 'Proposal 3';
    const studentId = "s200003"; 
    const status = 'Accepted';
    const expectedSql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal = ? AND Student_Id = ? AND Status = "Pending"';
    const expectedError = 'Database error occurred';

    db.run.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([status, proposal, studentId]);
      callback(expectedError, null);
    });

    await expect(setApplicationStatus(proposal, studentId, status)).rejects.toEqual(expectedError);
  });
});

describe('autoRejectApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message when auto-rejecting application successfully', async () => {
    const proposal = 'Proposal 1';
    const studentId = 's200001'; 
    const expectedSql = 'UPDATE APPLICATION SET STATUS = "Rejected" WHERE PROPOSAL = ? AND STATUS = "Pending" AND STUDENT_ID != ?';
    
    const mockRun = jest.fn().mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal, studentId]);
      callback.call({ changes: 1 }, null); // Manually set the 'this' context
    });

    db.run.mockImplementation(mockRun);

    const result = await autoRejectApplication(proposal, studentId);
    expect(result).toEqual({ success: true });
  });

  it('should resolve with success message when no application is auto-rejected', async () => {
    const proposal = 'Proposal 2';
    const studentId = 's200002'; 
    const expectedSql = 'UPDATE APPLICATION SET STATUS = "Rejected" WHERE PROPOSAL = ? AND STATUS = "Pending" AND STUDENT_ID != ?';
    
    const mockRun = jest.fn().mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal, studentId]);
      callback.call({ changes: 0 }, null); // Manually set the 'this' context
    });

    db.run.mockImplementation(mockRun);

    const result = await autoRejectApplication(proposal, studentId);
    expect(result).toEqual({ success: true });
  });

  it('should reject with an error if an error occurs during database update', async () => {
    const proposal = 'Proposal 3';
    const studentId = 's200003'; 
    const expectedSql = 'UPDATE APPLICATION SET STATUS = "Rejected" WHERE PROPOSAL = ? AND STATUS = "Pending" AND STUDENT_ID != ?';
    const expectedError = 'Database error occurred';

    db.run.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal, studentId]);
      callback(expectedError, null);
    });

    await expect(autoRejectApplication(proposal, studentId)).rejects.toEqual(expectedError);
  });
});

describe('autoDeleteApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message when auto-deleting application successfully', async () => {
    const studentId = 's200001';
    const expectedSql = 'DELETE FROM APPLICATION WHERE STUDENT_ID = ? AND STATUS = "Pending"';

    const mockRun = jest.fn().mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback.call({ changes: 1 }, null); // Manually set the 'this' context
    });

    db.run.mockImplementation(mockRun);

    const result = await autoDeleteApplication(studentId);
    expect(result).toEqual({ success: true });
  });

  it('should resolve with success message when no application is auto-deleted', async () => {
    const studentId = 's200002';
    const expectedSql = 'DELETE FROM APPLICATION WHERE STUDENT_ID = ? AND STATUS = "Pending"';

    const mockRun = jest.fn().mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback.call({ changes: 0 }, null); // Manually set the 'this' context
    });

    db.run.mockImplementation(mockRun);

    const result = await autoDeleteApplication(studentId);
    expect(result).toEqual({ success: true });
  });

  it('should reject with an error if an error occurs during database delete', async () => {
    const studentId = 's200003';
    const expectedSql = 'DELETE FROM APPLICATION WHERE STUDENT_ID = ? AND STATUS = "Pending"';
    const expectedError = 'Database error occurred';

    db.run.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(autoDeleteApplication(studentId)).rejects.toEqual(expectedError);
  });
});
