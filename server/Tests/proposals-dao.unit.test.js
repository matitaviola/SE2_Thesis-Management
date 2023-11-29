// Mocking the dependencies
const { getActiveProposalsByProfessor, archiveProposal, getAvailableProposals, addProposal, deleteProposal, getProposalById } = require('../DB/proposals-dao');
const { db } = require('../DB/db');
const dayjs = require('dayjs');
const { Proposal } = require('../models/proposal');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn((query, params, callback) => {
      if (callback) {
        callback(null); // You can customize this to simulate success or failure
      }
    }),
    close: jest.fn(),
    serialize: jest.fn()
  };
  return { db: mockedDB };
});

describe('getActiveProposalsByProfessor Function Tests', () => {
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

    const result = await getActiveProposalsByProfessor(professorId);
    expect(result).toEqual({});
  });

  it('should resolve with an array of proposals when they are found for a professor', async () => {
    const professorId = 2;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=?';
    const mockedRows = [
      { title: 'Proposal 1' },
      { title: 'Proposal 2' }
      //Add more sample proposal data as needed
    ];
    const expectedProposals = mockedRows.map(r => ({ title: r.Title }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    const result = await getActiveProposalsByProfessor(professorId);
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

    await expect(getActiveProposalsByProfessor(professorId)).rejects.toEqual(expectedError);
  });
});

describe('archiveProposal Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message after archiving a proposal', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = {};
    const mockedApplicationRow = {};

    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });

    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedApplicationSql);
      expect(params).toEqual([proposalId, studentId]);
      callback(null, mockedApplicationRow);
    });

    const expectedInsertSql = 'INSERT INTO ARCHIVED_PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status, Thesist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const expectedUpdateSql = 'UPDATE APPLICATION SET Archived_Proposal_ID=?, Status=\'Accepted\' WHERE Proposal_ID=? AND Student_ID=?';
    const expectedUpdateCancelledSql = 'UPDATE APPLICATION SET Archived_Proposal_ID=?, Status=\'Cancelled\' WHERE Proposal_ID=? AND Status=\'Pending\'';
    const expectedDeleteSql = 'DELETE FROM PROPOSAL WHERE Id=?';

    db.serialize.mockImplementationOnce((callback) => {
      callback();

      expect(db.run.mock.calls[0][0]).toBe('BEGIN TRANSACTION');
      expect(db.run.mock.calls[1][0]).toBe(expectedInsertSql);
      expect(db.run.mock.calls[2][0]).toBe(expectedUpdateSql);
      expect(db.run.mock.calls[3][0]).toBe(expectedUpdateCancelledSql);
      expect(db.run.mock.calls[4][0]).toBe(expectedDeleteSql);

      // Simulate successful execution of all queries
      db.run.mock.calls[1][1](null);
      db.run.mock.calls[2][1](null);
      db.run.mock.calls[3][1](null);
      db.run.mock.calls[4][1](null);

      expect(db.run.mock.calls[5][0]).toBe('COMMIT');
    });

    const result = await archiveProposal(proposalId, studentId);
    expect(result).toEqual({ success: true });
  });

  it('should reject with an error while searching proposal', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedError = "Database Error";
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(expectedError, null); // Simulate proposal not found
    });

    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with "Proposal not found" when proposal is not found', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, null); // Simulate proposal not found
    });

    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual('Proposal not found.');
  });

  it('hould reject with an error while searching application', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = {};
    const expectedError = "Database Error";
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });

    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedApplicationSql);
      expect(params).toEqual([proposalId, studentId]);
      callback(expectedError, null); // Simulate application not found
    });

    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });
  
  it('should reject with "Application not found" when application is not found', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = {};
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });

    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedApplicationSql);
      expect(params).toEqual([proposalId, studentId]);
      callback(null, null); // Simulate application not found
    });

    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual('Application not found.');
  });

  it('should reject with an error if an error occurs during database transaction - insert', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = { /* mock proposal data */ };
    const mockedApplicationRow = { /* mock application data */ };
    const expectedError = 'Database error occurred';
  
    // Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedApplicationSql);
      expect(params).toEqual([proposalId, studentId]);
      callback(null, mockedApplicationRow);
    });
  
    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });

    // Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      // Second db.run - Insert with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    // Call the actual function
    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - update accepted app', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = { /* mock proposal data */ };
    const mockedApplicationRow = { /* mock application data */ };
    const expectedError = 'Database error occurred';
  
    // Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedApplicationSql);
      expect(params).toEqual([proposalId, studentId]);
      callback(null, mockedApplicationRow);
    });
  
    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });

    // Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    //Insert
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      // Second db.run - Update with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    // Call the actual function
    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - update cancelled apps', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = { /* mock proposal data */ };
    const mockedApplicationRow = { /* mock application data */ };
    const expectedError = 'Database error occurred';
  
    // Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedApplicationSql);
      expect(params).toEqual([proposalId, studentId]);
      callback(null, mockedApplicationRow);
    });
  
    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });

    // Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    //Insert
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    //Update
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      // Second db.run - Update Cancelled with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    // Call the actual function
    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - delete', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = { /* mock proposal data */ };
    const mockedApplicationRow = { /* mock application data */ };
    const expectedError = 'Database error occurred';
  
    // Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedApplicationSql);
      expect(params).toEqual([proposalId, studentId]);
      callback(null, mockedApplicationRow);
    });
  
    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });

    // Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    //Insert
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    //Update
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    //UpdateCancelled
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      // Second db.run - Delete with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    // Call the actual function
    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });
  
});

describe('getProposals Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const studentId = 's200000';
  const proposalsResult = [Proposal( 
    3,
    "Proposal 3",
    "d100003",
    "Michael",
    "Johnson",
    "Co-Supervisor B",
    "design, architecture, development",
    "Type C",
    "Group Z",
    "Description for Proposal 3",
    "Knowledge about software engineering",
    "Additional info",
    '2022-11-19',
    "BSc",
    "CS102",
    "Computer Science"
  ),
  Proposal(
    4,
    "Proposal 4",
    "d100001",
    "Michael",
    "Johnson",
    "Co-Supervisor D",
    "networks, security, protocols",
    "Type D",
    "Group W",
    "Description for Proposal 4",
    "Knowledge about cybersecurity",
    "Important notes",
    '2023-06-29',
    "MSc",
    "CS101",
    "Computer Science"
  )];

  const proposalRaw = [{
    pID: 3,
    Title: 'Proposal 3',
    Supervisor: 'd100003',
    Co_supervisor: 'Co-Supervisor B',
    Keywords: 'design, architecture, development',
    Type: 'Type C',
    Groups: 'Group Z',
    Description: 'Description for Proposal 3',
    Req_knowledge: 'Knowledge about software engineering',
    Notes: 'Additional info',
    Expiration: '2022-11-19',
    Level: 'BSc',
    CdS: 'CS102',
    Status: 'Active',
    Thesist: null,
    ID: 's200000',
    SURNAME: 'Doe',
    NAME: 'John',
    EMAIL: 'john@example.com',
    COD_GROUP: 'GroupC',
    COD_DEPARTMENT: 'DEP303',
    COD_DEGREE: 'CS101',
    TITLE_DEGREE: 'Computer Science',
    GENDER: 'Male',
    NATIONALITY: 'American',
    CODE_DEGREE: 'CS102',
    ENROLLMENT_YEAR: 2021,
    tName: 'Michael',
    tSurname: 'Johnson'
  },
  {
    pID:4,
    Title: 'Proposal 4',
    Supervisor: 'd100001',
    Co_supervisor: 'Co-Supervisor D',
    Keywords: 'networks, security, protocols',
    Type: 'Type D',
    Groups: 'Group W',
    Description: 'Description for Proposal 4',
    Req_knowledge: 'Knowledge about cybersecurity',
    Notes: 'Important notes',
    Expiration: '2023-06-29',
    Level: 'MSc',
    CdS: 'CS101',
    Status: 'Active',
    Thesist: null,
    ID: 's200000',
    SURNAME: 'Doe',
    NAME: 'John',
    EMAIL: 'john@example.com',
    COD_GROUP: 'GroupA',
    COD_DEPARTMENT: 'DEP101',
    COD_DEGREE: 'CS102',
    TITLE_DEGREE: 'Computer Science',
    GENDER: 'Male',
    NATIONALITY: 'American',
    CODE_DEGREE: 'CS101',
    ENROLLMENT_YEAR: 2021,
    tName: 'Michael',
    tSurname: 'Johnson'
  }];


  it('should resolve with empty object when no proposals found', async () => {
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?`
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, {});
    expect(result).toEqual([]);
  });

  it('should resolve with an array when proposals are found with no filter', async () => {
    const studentId = 1;
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?`
    const mockedRows = [...proposalRaw];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, {});
    expect(result).toEqual(proposalsResult);
  });

  it('should resolve with filtered proposals by title', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { title: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?`
    const addedFilterSql = ' AND UPPER(P.title) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });

  it('should resolve with filtered proposals by supervisor', async () => {
    const studentId = 1;
    const filteringString = 'John';
    const filter = { supervisor: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?`;
    const addedFilterSql = ' AND ( (UPPER(T.ID) LIKE UPPER("%" || ? || "%")) OR (UPPER(T.NAME) LIKE UPPER("%" || ? || "%")) OR (UPPER(T.SURNAME) LIKE UPPER("%" || ? || "%")))';
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString, filteringString, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });

  it('should resolve with filtered proposals by coSupervisor', async () => {
    const studentId = 1;
    const filteringString = 'C';
    const filter = { coSupervisor: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?`
    const addedFilterSql = ' AND UPPER(P.co_supervisor) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });


  it('should resolve with filtered proposals by keywords', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { keywords: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.keywords) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });

  it('should resolve with filtered proposals by type', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { type: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.type) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });

  it('should resolve with filtered proposals by groups', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { groups: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.groups) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });


  it('should resolve with filtered proposals by description', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { description: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.description) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });

  it('should resolve with filtered proposals by req knowledge', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { reqKnowledge: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.req_knowledge) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });

    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });

  it('should resolve with filtered proposals by notes', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { notes: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.notes) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });
    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });

  it('should resolve with filtered proposals by expiration', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { expiration: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.expiration) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });
    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });
  it('should resolve with filtered proposals by level', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { level: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND UPPER(P.level) LIKE UPPER("%" || ? || "%")'
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString]);
      callback(null, mockedRows);
    });
    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });
  it('should resolve with filtered proposals by degree', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { degree: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? `
    const addedFilterSql = 'AND (UPPER(P.cds) LIKE UPPER("%" || ? || "%") OR UPPER(D.TITLE_DEGREE) LIKE UPPER("%" || ? || "%"))';
    const mockedRows = [proposalRaw[0]];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId, filteringString, filteringString]);
      callback(null, mockedRows);
    });
    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResult[0]]);
  });


  it('should reject with an error if an error occurs during database retrieval', async () => {
    const studentId = 1;
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND D.COD_DEGREE=P.CdS AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ?`
    const expectedError = 'Database error occurred';
    
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(getAvailableProposals(studentId, {})).rejects.toEqual(expectedError);
  });
});

describe('insertProposals Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with proposal object when there is no problem with inputs', async () => {
    const proposal = {
      title: 'test prop 1',
      notes: 'test',
      groups: 'test',
      supervisor: 'test',
      co_supervisor: 'test',
      keywords: 'test',
      type: 'test',
      description: 'test',
      req_knowledge: 'test',
      expiration: 'test',
      level: 'test',
      cds: 'test'
    };

    db.run.mockImplementationOnce((sql, values, callback) => callback(null));
    db.get.mockImplementationOnce((sql, values, callback) => callback(null, proposal));

    const result = await addProposal(proposal);

    expect(result).toEqual({success:true});
  });

  it('should handle db error', async () => {
    const proposal = {
      title: 'test prop 2',
      notes: 'test',
      groups: 'test',
      supervisor: 'test',
      co_supervisor: 'test',
      keywords: 'test',
      type: 'test',
      description: 'test',
      req_knowledge: 'test',
      expiration: 'test',
      level: 'test',
      cds: 'test'
    };

    db.run.mockImplementationOnce((sql, values, callback) => callback({ code: 'ANOTHER_ERROR' }));

    await expect(addProposal(proposal)).rejects.toEqual({ code: 'ANOTHER_ERROR' });
  });

  it('should reject with an error on db.get failure', async () => {
    const expectedError = new Error('Simulated db.get error');

    db.run.mockImplementationOnce((sql, values, callback) => callback(null));

    db.get.mockImplementationOnce((sql, values, callback) => callback(expectedError));

    const proposal = {
      title: 'test prop 2',
      notes: 'test',
      groups: 'test',
      supervisor: 'test',
      co_supervisor: 'test',
      keywords: 'test',
      type: 'test',
      description: 'test',
      req_knowledge: 'test',
      expiration: 'test',
      level: 'test',
      cds: 'test'
    };

    await expect(addProposal(proposal)).rejects.toEqual(expectedError);
  });
});

describe('deleteProposal Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message after deleting a proposal and associated applications', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'DELETE FROM PROPOSAL WHERE Id = ?';
    const expectedCancelAppsSql = 'UPDATE APPLICATION SET Status="Cancelled" WHERE Proposal_ID IS NULL and Archived_Proposal_ID IS NULL';

    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });
    
    //Mock the Begin transaction
    db.run.mockImplementationOnce((query) =>{});

    db.run.mockImplementationOnce((query, params, callback) => {
        expect(query).toEqual(expectedDeletePropSql);
        expect(params).toEqual([proposalId]);
        callback.call({ changes: 1 });
    });

    db.run.mockImplementationOnce((query, params, callback) => {
      expect(query).toEqual(expectedCancelAppsSql);
      expect(params).toEqual([]);
      callback(null);
    })

    const result = await deleteProposal(proposalId);
    expect(result).toEqual({ success: true });
  });

  it('should reject with "Proposal not found" when proposal is not found', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'DELETE FROM PROPOSAL WHERE Id = ?';
    const expectedError = { error: 'Proposal not found' };

    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });

    //Mock the Begin transaction
    db.run.mockImplementationOnce((query) =>{});

    db.run.mockImplementationOnce((query, params, callback) => {
        expect(query).toEqual(expectedDeletePropSql);
        expect(params).toEqual([proposalId]);
        callback.call({ changes: 0 },null); // Simulate proposal not found
    });

    await expect(deleteProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - remove poposal', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'DELETE FROM PROPOSAL WHERE Id = ?';
    const expectedError = 'Database error occurred';

    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });

    //Mock the Begin transaction
    db.run.mockImplementationOnce((query) =>{});

    db.run.mockImplementationOnce((query, params, callback) => {
      expect(params).toEqual([proposalId]);
      callback(expectedError); // Simulate proposal found
    });

    await expect(deleteProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - remove all apps', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'DELETE FROM PROPOSAL WHERE Id = ?';
    const expectedError = 'Database error occurred';

    // Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      // Simulate the serialize block
      callback();
    });

    //Mock the Begin transaction
    db.run.mockImplementationOnce((query) =>{});

    db.run.mockImplementationOnce((query, params, callback) => {
      expect(query).toEqual(expectedDeletePropSql);
      expect(params).toEqual([proposalId]);
      callback.call({ changes: 1 },null); // Simulate proposal found
    });

    db.run.mockImplementationOnce((query, params, callback) => {
        expect(params).toEqual([]);
        callback(expectedError);
    });

    await expect(deleteProposal(proposalId)).rejects.toEqual(expectedError);
  });
});

describe('getOneProposal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const proposalResult = Proposal( 
    8,
    "Proposal 8",
    "d100008",
    "Michael",
    "Johnson",
    "Co-Supervisor B",
    "design, architecture, development",
    "Type C",
    "Group Z",
    "Description for Proposal 8",
    "Knowledge about software engineering",
    "Additional info",
    '2022-11-19',
    "BSc",
    "CS102",
    "Computer Science"
  );

  it('should resolve with a proposal when the proposal is found', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT * FROM PROPOSAL WHERE ID=?`
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, [proposalResult]);
    });

    const result = await getProposalById(proposalId);
    expect(result).toEqual(proposalResult);
  });

  it('should resolve with no proposal when no proposal is found', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT * FROM PROPOSAL WHERE ID=?`;
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, []);
    });

    const result = await getProposalById(proposalId);
    expect(result).toEqual(undefined);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT * FROM PROPOSAL WHERE ID=?`;
    const expectedError = 'Database error occurred';
    
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(expectedError, null);
    });

    await expect(getProposalById(proposalId)).rejects.toEqual(expectedError);
  });
});
