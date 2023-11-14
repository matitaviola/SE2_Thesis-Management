// Mocking the dependencies
const { getActiveProposalsByProfessor, archiveProposal, getAvailableProposals } = require('../DB/proposals-dao');
const { db } = require('../DB/db');
const dayjs = require('dayjs');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
    close: jest.fn()
  };
  return { db: mockedDB };
});

describe('getActiveProposalsByProfessor Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with empty object when no proposals found for a professor', async () => {
    const professorId = 1;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status=?';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId, "Active"]);
      callback(null, mockedRows);
    });

    const result = await getActiveProposalsByProfessor(professorId);
    expect(result).toEqual({});
  });

  it('should resolve with an array of proposals when they are found for a professor', async () => {
    const professorId = 2;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status=?';
    const mockedRows = [
      { title: 'Proposal 1' },
      { title: 'Proposal 2' }
      //Add more sample proposal data as needed
    ];
    const expectedProposals = mockedRows.map(r => ({ title: r.Title }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId, "Active"]);
      callback(null, mockedRows);
    });

    const result = await getActiveProposalsByProfessor(professorId);
    expect(result).toEqual(expectedProposals);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const professorId = 3;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status=?';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId, "Active"]);
      callback(expectedError, null);
    });

    await expect(getActiveProposalsByProfessor(professorId)).rejects.toEqual(expectedError);
  });
});

describe('archiveProposal', () => {
  const mockedProposal = { Title: "Proposal 1" };
  const mockedApplication = { Proposal: "Proposal 1", Student_ID: "s200000", Status: "Accepted" };

  it('should reject with a message when the proposal is not found', async () => {
    // Mock the get method to simulate a scenario where the proposal is not found
    db.get.mockImplementationOnce((query, params, callback) => {
      callback(null, null); // Simulating that the proposal is not found
    });

    // Mock the close method
    db.close.mockImplementationOnce(jest.fn());

    await expect(archiveProposal("Rubbish", "Rubbish")).rejects.toEqual('Proposal not found.');

  });

  it('should reject with an error when the proposal is not found due to an error', async () => {
    // Mock the get method to simulate a scenario where the proposal is not found
    db.get.mockImplementationOnce((query, params, callback) => {
        callback({message:"Error"}, null); // Simulating that the proposal is not found
    });

    // Mock the close method
    db.close.mockImplementationOnce(jest.fn());

    await expect(archiveProposal("Rubbish", "Rubbish")).rejects.toStrictEqual({message:"Error"});
    
});
  
  it('should reject with an error when the application for that proposal has not been found', async () => {
    // Mock the get method to simulate a scenario where the proposal is not found
    db.get.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedProposal); // Simulating that the proposal found
    });

    db.get.mockImplementationOnce((query, params, callback) => {
      callback(null, null); // Simulating that the proposal found
    });

    await expect(archiveProposal("Rubbish", "Rubbish")).rejects.toEqual("Application not found.");

  });

  it('should reject with an error when the application for that proposal has not been found due to an error', async () => {
    // Mock the get method to simulate a scenario where the proposal is not found
    db.get.mockImplementationOnce((query, params, callback) => {
        callback(null, mockedProposal); // Simulating that the proposal found
    });

    db.get.mockImplementationOnce((query, params, callback) => {
      callback({message:"Errror"}, null); // Simulating that the proposal found
    });

    await expect(archiveProposal("Rubbish", "Rubbish")).rejects.toStrictEqual({message:"Errror"});
    
  });

  it('should reject with an error when the updating of the proposal goes wrong', async () => {
    mockedInsertError = { message: "Impossible to insert" };
    // Mock the get method to simulate a scenario where the proposal is not found
    db.get.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedProposal); // Simulating that the proposal found
    });

    db.get.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedApplication); // Simulating that the proposal found
    });

    db.run.mockImplementationOnce((query, params, callback) => {
      callback(mockedInsertError); // Simulating that the proposal found
    });


    await expect(archiveProposal(mockedProposal.Title, mockedApplication.Student_ID)).rejects.toEqual(mockedInsertError);

  });

  it('should reject with an error when the deleting of the old proposal goes bad', async () => {
    mockedSuccess = { success: true };
    // Mock the get method to simulate a scenario where the proposal is not found
    db.get.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedProposal); // Simulating that the proposal found
    });

    db.get.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedApplication); // Simulating that the proposal found
    });

    db.run.mockImplementationOnce((query, params, callback) => {
      callback(null); // Simulating that the proposal found
    });

    await expect(archiveProposal(mockedProposal.Title, mockedApplication.Student_ID)).resolves.toEqual(mockedSuccess);

  });

});




describe('getProposals Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const studentId = 's200000';
  const proposalsResult = [{
    title: "Proposal 3",
    supervisorId: "d100003",
    supervisorName: "Michael",
    supervisorSurname: "Johnson",
    coSupervisor: "Co-Supervisor B",
    keywords: "design, architecture, development",
    type: "Type C",
    groups: "Group Z",
    description: "Description for Proposal 3",
    reqKnowledge: "Knowledge about software engineering",
    notes: "Additional info",
    expiration: dayjs("2022-11-19T23:00:00.000Z"),
    level: "BSc",
    cdsId: "CS102",
    cdsName: "Computer Science"
  },
  {
    title: "Proposal 4",
    supervisorId: "d100001",
    supervisorName: "Michael",
    supervisorSurname: "Johnson",
    coSupervisor: "Co-Supervisor D",
    keywords: "networks, security, protocols",
    type: "Type D",
    groups: "Group W",
    description: "Description for Proposal 4",
    reqKnowledge: "Knowledge about cybersecurity",
    notes: "Important notes",
    expiration: dayjs("2023-06-29T22:00:00.000Z"),
    level: "MSc",
    cdsId: "CS101",
    cdsName: "Computer Science"
  }];

  const proposalRaw = [{
    Title: 'Proposal 3',
    Supervisor: 'd100003',
    Co_supervisor: 'Co-Supervisor B',
    Keywords: 'design, architecture, development',
    Type: 'Type C',
    Groups: 'Group Z',
    Description: 'Description for Proposal 3',
    Req_knowledge: 'Knowledge about software engineering',
    Notes: 'Additional info',
    Expiration: '2022-11-20',
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
    Title: 'Proposal 4',
    Supervisor: 'd100001',
    Co_supervisor: 'Co-Supervisor D',
    Keywords: 'networks, security, protocols',
    Type: 'Type D',
    Groups: 'Group W',
    Description: 'Description for Proposal 4',
    Req_knowledge: 'Knowledge about cybersecurity',
    Notes: 'Important notes',
    Expiration: '2023-06-30',
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`;
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.keywords) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.type) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.groups) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.description) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.req_knowledge) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.notes) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.expiration) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND UPPER(P.level) LIKE UPPER("%" || ? || "%")'
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const addedFilterSql = ' AND (UPPER(P.cds) LIKE UPPER("%" || ? || "%") OR UPPER(D.TITLE_DEGREE) LIKE UPPER("%" || ? || "%"))';
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
    const expectedSql = `SELECT *, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.id=P.supervisor AND D.COD_DEGREE=P.cds AND S.CODE_DEGREE=D.COD_DEGREE AND S.id= ? AND Status='Active'`
    const expectedError = 'Database error occurred';
    
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(getAvailableProposals(studentId, {})).rejects.toEqual(expectedError);
  });
});