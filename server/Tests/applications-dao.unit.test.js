// Mocking the dependencies
const { getActiveApplicationsByProposal, getApplicationsByStudent, setApplicationStatus, createApplication, getLastId, isApplication } = require('../DB/applications-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn(),
    run: jest.fn(),
    get: jest.fn()
  };
  return { db: mockedDB };
});

describe('getActiveApplicationsByProposal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no applications are found for a proposal', async () => {
    const proposal = { id:1, title: 'Proposal 1' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID=? AND Status="Pending"';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.id]);
      callback(null, mockedRows);
    });

    const result = await getActiveApplicationsByProposal(proposal);
    expect(result).toEqual(mockedRows);
  });

  it('should resolve with an array of applications when they are found for a proposal', async () => {
    const proposal = { id:2, title: 'Proposal 2' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID=? AND Status="Pending"';
    const mockedRows = [
      { Id:1, Student_ID: 1, Proposal_ID:2, Status: 'Pending' },
      { Id:2, Student_ID: 2, Proposal_ID:2, Status: 'Pending' }
      // Add more sample application data as needed
    ];
    const expectedApplications = mockedRows.map(r => ({
      id: r.Id,
      studentId: r.Student_ID,
      proposal: r.Proposal_ID,
      title: proposal.title,
      status: r.Status
      // Add other fields for the application
    }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.id]);
      callback(null, mockedRows);
    });

    const result = await getActiveApplicationsByProposal(proposal);
    expect(result).toEqual(expectedApplications);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const proposal = { id:3, title: 'Proposal 3' };
    const expectedSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID=? AND Status="Pending"';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposal.id]);
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
    expect(result).toEqual(mockedRows);
  });

  it('should resolve with an array of applications when they are found for a student', async () => {
    const studentId = 2; 
    const expectedSql = 'SELECT * FROM APPLICATION WHERE STUDENT_ID=?';
    const mockedRows = [
      { Id:1, Student_ID: studentId, Proposal_ID:1, Archived_Proposal_ID:null, Proposal: 'Proposal 1', Status: 'Pending' },
      { Id:2, Student_ID: studentId, Proposal_ID:null, Archived_Proposal_ID:2, Proposal: 'Proposal 2', Status: 'Accepted' }
      // Add more sample application data as needed
    ];
    const expectedApplications = mockedRows.map(r => ({
      id: r.Id,
      studentId: r.Student_ID,
      proposal: r.Proposal_ID? r.Proposal_ID : r.Archived_Proposal_ID,
      title: r.Proposal,
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
    const expectedSql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal_ID = ? AND Student_ID = ?';
    
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
    const expectedSql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal_ID = ? AND Student_ID = ?';
    
    const mockRun = jest.fn().mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([status, proposal, studentId]);
      callback.call({ changes: 0 }, null); // Manually set the 'this' context
    });
  
    db.run.mockImplementation(mockRun);
  
    const result = await setApplicationStatus(proposal, studentId, status);
    expect(result).toEqual({ error: 'The application does not exist' });
  });

  it('should reject with an error if an error occurs during database update', async () => {
    const proposal = 'Proposal 3';
    const studentId = "s200003"; 
    const status = 'Accepted';
    const expectedSql = 'UPDATE APPLICATION SET Status = ? WHERE Proposal_ID = ? AND Student_ID = ?';
    const expectedError = 'Database error occurred';

    db.run.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([status, proposal, studentId]);
      callback(expectedError, null);
    });

    await expect(setApplicationStatus(proposal, studentId, status)).rejects.toEqual(expectedError);
  });
});

describe('createApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message when creating an application successfully', async () => {
    const proposalId = 1;
    const studentId = 's200001';
    const expectedGetSql = "SELECT * FROM PROPOSAL WHERE Id=?";
    const expectedSql = 'INSERT INTO APPLICATION (STUDENT_ID, PROPOSAL_ID, PROPOSAL, ARCHIVED_PROPOSAL_ID, STATUS) VALUES (?, ?, ?, ?, "Pending")';

    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedGetSql);
      expect(params).toEqual([proposalId]);
      callback(null, {Title:"Proposal 1"});
    });

    db.run.mockImplementation(function (sql, params, callback) {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId, proposalId, "Proposal 1", null]);
      callback.call(null);
    });

    const result = await createApplication(proposalId, studentId);
    expect(result).toEqual({ success: true });
  });

  it('should reject with an error when the proposal is not found', async () => {
    const proposalId = 1;
    const studentId = 's200001';
    const expectedGetSql = "SELECT * FROM PROPOSAL WHERE Id=?";
    const expectedError = `Error in creating an application: no such proposal ${proposalId}`;

    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedGetSql);
      expect(params).toEqual([proposalId]);
      callback(null, null);
    });

    await expect(createApplication(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if something went wrong looking for the proposal', async () => {
    const proposalId = 1;
    const studentId = 's200001';
    const expectedGetSql = "SELECT * FROM PROPOSAL WHERE Id=?";
    const expectedError = 'Database error occurred';

    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedGetSql);
      expect(params).toEqual([proposalId]);
      callback(expectedError, null);
    });

    await expect(createApplication(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database insertion', async () => {
    const proposalId = 'Proposal 2';
    const studentId = 's200002';
    const expectedGetSql = "SELECT * FROM PROPOSAL WHERE Id=?";
    const expectedSql = 'INSERT INTO APPLICATION (STUDENT_ID, PROPOSAL_ID, PROPOSAL, ARCHIVED_PROPOSAL_ID, STATUS) VALUES (?, ?, ?, ?, "Pending")';
    const expectedError = 'Database error occurred';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedGetSql);
      expect(params).toEqual([proposalId]);
      callback(null, {Title:"Proposal 1"});
    });
    
    db.run.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId, proposalId, "Proposal 1", null]);
      callback(expectedError, null);
    });

    await expect(createApplication(proposalId, studentId)).rejects.toEqual(expectedError);
  });
});

describe('getLastId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with the last application ID when found', async () => {
    const expectedSql = 'SELECT seq from sqlite_sequence where name="APPLICATION"';
    const lastId = 123;
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([]);
      callback(null, { seq: lastId });
    });

    const result = await getLastId();
    expect(result).toEqual(lastId);
  });

  it('should resolve with null when no application ID is found', async () => {
    const expectedSql = 'SELECT seq from sqlite_sequence where name="APPLICATION"';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([]);
      callback(null, null); //no application ID is found
    });

    const result = await getLastId();
    expect(result).toBeNull();
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const expectedSql = 'SELECT seq from sqlite_sequence where name="APPLICATION"';
    const expectedError = 'Database error occurred';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([]);
      callback(expectedError, null);
    });

    await expect(getLastId()).rejects.toEqual(expectedError);
  });
});

describe('isApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const applicationId = 123;
  const teacherId = 'd000000';

  it("should return the application id if the teacher's application exists", async () => {
    const expectedSql = 'SELECT A.id from APPLICATION A, PROPOSAL P where A.id = ? AND P.id = A.Proposal_ID AND P.Supervisor= ?';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([applicationId, teacherId]);
      callback(null, { Id: applicationId });
    });

    const result = await isApplication(teacherId, applicationId);
    expect(result).toEqual(applicationId);
  });

  it("should resolve with null when no teacher's application exists", async () => {
    const expectedSql = 'SELECT A.id from APPLICATION A, PROPOSAL P where A.id = ? AND P.id = A.Proposal_ID AND P.Supervisor= ?';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([applicationId, teacherId]);
      callback(null, null);
    });

    const result = await isApplication(teacherId, applicationId);
    expect(result).toBeNull();
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const expectedSql = 'SELECT A.id from APPLICATION A, PROPOSAL P where A.id = ? AND P.id = A.Proposal_ID AND P.Supervisor= ?';
    const expectedError = 'Database error occurred';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([applicationId, teacherId]);
      callback(expectedError, null);
    });

    await expect(isApplication(teacherId, applicationId)).rejects.toEqual(expectedError);
  });
});
