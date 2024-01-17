//Mocking the dependencies
const { getCoSupervisorNames,getActiveProposalsByProfessor, archiveProposal, archiveProposalWithoutApplication, getAvailableProposals, addProposal, updateProposal, deleteProposal, getProposalById, getArchivedProposalById, getAndAddExternalCoSupervisor, getCoSupervisorByProposal, deArchiveProposal, getArchivedProposalsByProfessor } = require('../DB/proposals-dao');
const { db } = require('../DB/db');
const dayjs = require('dayjs');
const { Proposal } = require('../models/proposal');

jest.mock('../DB/db', () => {
  const mockedDB = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn((query, params, callback) => {
      if (callback) {
        callback(null); //You can customize this to simulate success or failure
      }
    }),
    close: jest.fn(),
    serialize: jest.fn()
  };
  return { db: mockedDB };
});

describe('getCoSupervisorNames Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty string when coSupervisor is empty', async () => {
    const result = await getCoSupervisorNames('');
    expect(result).toBe('');
    expect(db.get).not.toHaveBeenCalled();
  });

  it('should return empty string when coSupervisor has no matching IDs', async () => {
    db.get.mockImplementation((sql, params, callback) => {
      callback(null,null)
    });

    const result = await getCoSupervisorNames('abc def');
    expect(result).toBe('');
    expect(db.get).not.toHaveBeenCalled();
  });

  it('should return concatenated names when coSupervisor has matching IDs', async () => {
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null,{ NAME: 'John', SURNAME: 'Doe' })
    });
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, { NAME: 'Pina', SURNAME: 'Marina' })
    });
    const result = await getCoSupervisorNames('d123456 d654321');
    expect(result).toBe('John Doe, Pina Marina');
    expect(db.get).toHaveBeenCalledTimes(2);
  });

  it('should handle errors during database queries', async () => {
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback('Database error', null)
    });
    await expect(getCoSupervisorNames('d123456')).rejects.toEqual('Database error');
    expect(db.get).toHaveBeenCalledTimes(1);
  });

  it('should handle empty coSupervisor input', async () => {
    const result = await getCoSupervisorNames('');
    expect(result).toBe('');
    expect(db.get).not.toHaveBeenCalled();
  });
  
  it('should handle coSupervisor with only email addresses', async () => {
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, { Surname: 'Smith', Name: 'Alice' });
    });
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, { Surname: 'Johnson', Name: 'Bob' });
    });
  
    const result = await getCoSupervisorNames('alice@example.com bob@example.com');
    expect(result).toBe('Alice Smith, Bob Johnson');
    expect(db.get).toHaveBeenCalledTimes(2);
  });
  
  it('should handle errors during external coSupervisor database queries', async () => {
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback('External database error', null);
    });
  
    await expect(getCoSupervisorNames('alice@example.com')).rejects.toEqual('External database error');
    expect(db.get).toHaveBeenCalledTimes(1);
  });
});

describe('getAndAddExternalCoSupervisor Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with existing external co-supervisor email', async () => {
    //Mock the database response for an existing external co-supervisor
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, { Email: 'existing@example.com' });
    });

    const result = await getAndAddExternalCoSupervisor('John', 'Doe', 'existing@example.com');

    expect(result).toBe('existing@example.com');
    expect(db.get).toHaveBeenCalledTimes(1);
    //Ensure that the insert query is not called
    expect(db.run).not.toHaveBeenCalled();
  });

  it('should resolve with added external co-supervisor email', async () => {
    //Mock the database response for a non-existing external co-supervisor
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, null);
    });

    const result = await getAndAddExternalCoSupervisor('Alice', 'Smith', 'new@example.com');

    expect(result).toBe('new@example.com');
    expect(db.get).toHaveBeenCalledTimes(1);
    //Ensure that the insert query is called with the correct parameters
    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO EXTERNAL_COSUPERVISOR (Email, Name, Surname) VALUES (?, ?, ?)',
      ['new@example.com', 'Alice', 'Smith'],
      expect.any(Function)
    );
  });

  it('should reject with database error during select query', async () => {
    //Mock a database error during the select query
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback('Database error', null);
    });

    await expect(getAndAddExternalCoSupervisor('John', 'Doe', 'error@example.com')).rejects.toEqual('Database error');

    expect(db.get).toHaveBeenCalledTimes(1);
    expect(db.run).not.toHaveBeenCalled();
  });

  it('should reject with database error during insert query', async () => {
    //Mock the database response for a non-existing external co-supervisor
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, null);
    });

    //Mock a database error during the insert query
    db.run.mockImplementationOnce((query, params, callback) => {
      callback('Insert error');
    });

    await expect(getAndAddExternalCoSupervisor('Bob', 'Johnson', 'new@example.com')).rejects.toEqual('Insert error');

    expect(db.get).toHaveBeenCalledTimes(1);
    expect(db.run).toHaveBeenCalledTimes(1);
  });
});

describe('getCoSupervisorByProposal Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty arrays when proposalId does not exist', async () => {
    const nonExistentProposalId = 'nonexistentid';
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    const getArchivedProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getArchivedProposalById');
    getProposalByIdMock.mockResolvedValueOnce(null);
    getArchivedProposalByIdMock.mockResolvedValueOnce(null);
    db.get.mockImplementation((sql, params, callback) => {
      callback(null,null)
    });
    const result = await getCoSupervisorByProposal(nonExistentProposalId);

    expect(result.academic).toEqual([]);
    expect(result.external).toEqual([]);
    expect(db.get).not.toHaveBeenCalled();
  });

  it('should return empty arrays when coSupervisors are not provided in the proposal', async () => {
    // Arrange
    const proposalIdWithoutCoSupervisors = 'proposalWithoutCoSupervisors';
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    getProposalByIdMock.mockResolvedValueOnce({coSupervisor: null});
    // Act
    const result = await getCoSupervisorByProposal(proposalIdWithoutCoSupervisors);

    // Assert
    expect(result.academic).toEqual([]);
    expect(result.external).toEqual([]);
    expect(db.get).toHaveBeenCalledTimes(0);
  });

  it('should return academic and external coSupervisors when provided in the proposal', async () => {
    // Arrange
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    getProposalByIdMock.mockResolvedValueOnce({coSupervisor: "d123456 external@example.com"});
    const proposalIdWithCoSupervisors = 'proposalWithCoSupervisors';

    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, { ID: 'd123456', NAME: 'John', SURNAME: 'Doe' });
    });
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, { Email: 'external@example.com', Name: 'External', Surname: 'CoSupervisor' });
    });

    // Act
    const result = await getCoSupervisorByProposal(proposalIdWithCoSupervisors);

    // Assert
    expect(result.academic).toEqual([{ id: 'd123456', name: 'John', surname: 'Doe' }]);
    expect(result.external).toEqual([{ mail: 'external@example.com', name: 'External', surname: 'CoSupervisor' }]);
    expect(db.get).toHaveBeenCalledTimes(2);
  });

  it('should handle errors during database queries', async () => {
    // Arrange
    const proposalIdWithError = 'proposalWithError';
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    getProposalByIdMock.mockResolvedValueOnce({coSupervisor: "d123456 external@example.com"});
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback('Database error', null);
    });

    // Act & Assert
    await expect(getCoSupervisorByProposal(proposalIdWithError)).rejects.toEqual('Database error');
  });

  it('should handle missing search during database queries', async () => {
    // Arrange
    const proposalIdWithError = 'proposalWithError';
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    getProposalByIdMock.mockResolvedValueOnce({coSupervisor: "d123456"});
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, null);
    });

    // Act & Assert
    await expect(getCoSupervisorByProposal(proposalIdWithError)).rejects.toEqual('No such Teacher');
  });

  it('should handle errors during external coSupervisor database queries', async () => {
    // Arrange
    const proposalIdWithExternalError = 'proposalWithExternalError';
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    getProposalByIdMock.mockResolvedValueOnce({coSupervisor: "d123456 external@example.com"});

    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, {ID:'0', NAME:'o', SURNAME:'o'});
    });
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback('External database error', null);
    });

    // Act & Assert
    await expect(getCoSupervisorByProposal(proposalIdWithExternalError)).rejects.toEqual('External database error');
    expect(db.get).toHaveBeenCalledTimes(2);
  });

  it('should handle missing search during external database queries', async () => {
    // Arrange
    const proposalIdWithError = 'proposalWithError';
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    getProposalByIdMock.mockResolvedValueOnce({coSupervisor: "external@example.com"});
    db.get.mockImplementationOnce((sql, params, callback) => {
      callback(null, null);
    });

    // Act & Assert
    await expect(getCoSupervisorByProposal(proposalIdWithError)).rejects.toEqual('No such External collaborator');
  });

  it('should throw an error for an invalid identifier', async () => {
    // Arrange
    const proposalIdWithError = 'proposalWithError';
    const getProposalByIdMock = jest.spyOn(require('../DB/proposals-dao'), 'getProposalById');
    getProposalByIdMock.mockResolvedValueOnce({coSupervisor: "abba"});
    // Act & Assert
    await expect(getCoSupervisorByProposal(proposalIdWithError)).rejects.toEqual('Invalid cosupervisor identifier');
  });

});


describe('getActiveProposalsByProfessor Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with empty object when no proposals found for a professor', async () => {
    const professorId = 1;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status="Active"';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    const result = await getActiveProposalsByProfessor(professorId);
    expect(result).toEqual(mockedRows);
  });

  it('should resolve with an array of proposals when they are found for a professor', async () => {
    const professorId = 'd100003';
    const coSup = 'Co Supervisore'
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status="Active"';
    const proposalsResult = [
      {
        id:3,
        title:"P3",
        supervisor:professorId,
        coSupervisor:"d111111",
        coSupervisorNames:coSup,
        keywords:"no keywords",
        type:"mine",
        groups:"GroupA GroupB",
        description:"Lorem ipsum",
        reqKnowledge:"none",
        notes:null,
        expiration:dayjs('2019-10-20'),
        level:'BMs',
        cds:'CS101'
      },
      {
        id:4,
        title:"P4",
        supervisor:professorId,
        coSupervisor: null,
        coSupervisorNames:"",
        keywords:"some keyword",
        type:"yours",
        groups:"GroupC",
        description:"Lorem ipsum",
        reqKnowledge:"none",
        notes:null,
        expiration:dayjs('2022-10-20'),
        level:'CMs',
        cds:'BIO101'
      }
    ];
  
    const mockedRows= [{
      Id:3,
      Title:"P3",
      Co_supervisor:"d111111",
      Keywords:"no keywords",
      Type:"mine",
      Groups:"GroupA GroupB",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2019-10-20'),
      Level:'BMs',
      CdS:'CS101'
    },
    {
      Id:4,
      Title:"P4",
      Co_supervisor:null,
      Keywords:"some keyword",
      Type:"yours",
      Groups:"GroupC",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2022-10-20'),
      Level:'CMs',
      CdS:'BIO101'
    }];

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    //Mock the getCoSupervisorNames function to resolve with coSup
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValue(coSup);

    const result = await getActiveProposalsByProfessor(professorId);
    expect(result).toEqual(proposalsResult);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const professorId = 3;
    const expectedSql = 'SELECT * FROM PROPOSAL WHERE Supervisor=? AND Status="Active"';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(expectedError, null);
    });

    await expect(getActiveProposalsByProfessor(professorId)).rejects.toEqual(expectedError);
  });
});

describe('getArchivedProposalsByProfessor Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with empty object when no archived proposals found for a professor', async () => {
    const professorId = 1;
    const filter ='';
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL P, TEACHER T WHERE T.ID=P.Supervisor AND T.ID= ?`;
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    const result = await getArchivedProposalsByProfessor(professorId);
    expect(result).toEqual(mockedRows);
  });

  it('should resolve with an array of archived proposals when they are found for a professor', async () => {
    const professorId = 'd100003';
    const filter ='';
    const coSup = 'Co Supervisore'
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL P, TEACHER T WHERE T.ID=P.Supervisor AND T.ID= ?`;
    const proposalsResult = [
      {
        id:3,
        title:"P3",
        supervisorId:professorId,
        supervisorName: "name",
        supervisorSurname: "surname",
        coSupervisor:"d111111",
        coSupervisorNames:coSup,
        keywords:"no keywords",
        type:"mine",
        groups:"GroupA GroupB",
        description:"Lorem ipsum",
        reqKnowledge:"none",
        notes:null,
        expiration:dayjs('2019-10-20'),
        level:'BMs',
        cdsId:'CS101',
        cdsName: undefined
      },
      {
        id:4,
        title:"P4",
        supervisorId:professorId,
        supervisorName: "name",
        supervisorSurname: "surname",
        coSupervisor: null,
        coSupervisorNames:"",
        keywords:"some keyword",
        type:"yours",
        groups:"GroupC",
        description:"Lorem ipsum",
        reqKnowledge:"none",
        notes:null,
        expiration:dayjs('2022-10-20'),
        level:'CMs',
        cdsId:'BIO101',
        cdsName: undefined
      }
    ];
  
    const mockedRows= [{
      pID:3,
      Title:"P3",
      Supervisor: professorId,
      tName: "name",
      tSurname: "surname",
      Co_supervisor:"d111111",
      Keywords:"no keywords",
      Type:"mine",
      Groups:"GroupA GroupB",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2019-10-20'),
      Level:'BMs',
      CdS:'CS101'
    },
    {
      pID:4,
      Title:"P4",
      Supervisor: professorId,
      tName: "name",
      tSurname: "surname",
      Co_supervisor:null,
      Keywords:"some keyword",
      Type:"yours",
      Groups:"GroupC",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2022-10-20'),
      Level:'CMs',
      CdS:'BIO101'
    }];

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    //Mock the getCoSupervisorNames function to resolve with coSup
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValue(coSup);

    const result = await getArchivedProposalsByProfessor(professorId, filter);
    expect(result).toEqual(proposalsResult);
  });

  it('should resolve with an array of archived proposals when they are found for a professor - fightning line 200', async () => {
    const professorId = 'd100003';
    const filter ='Co Supervisore';
    const coSup = 'Co Supervisore'
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL P, TEACHER T WHERE T.ID=P.Supervisor AND T.ID= ?`;
    const proposalsResult = [
      {
        id:3,
        title:"P3",
        supervisorId:professorId,
        supervisorName: "name",
        supervisorSurname: "surname",
        coSupervisor:"d111111",
        coSupervisorNames:coSup,
        keywords:"no keywords",
        type:"mine",
        groups:"GroupA GroupB",
        description:"Lorem ipsum",
        reqKnowledge:"none",
        notes:null,
        expiration:dayjs('2019-10-20'),
        level:'BMs',
        cdsId:'CS101',
        cdsName: undefined
      }
    ];
  
    const mockedRows= [{
      pID:3,
      Title:"P3",
      Supervisor: professorId,
      tName: "name",
      tSurname: "surname",
      Co_supervisor:"d111111",
      Keywords:"no keywords",
      Type:"mine",
      Groups:"GroupA GroupB",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2019-10-20'),
      Level:'BMs',
      CdS:'CS101'
    },
    {
      pID:4,
      Title:"P4",
      Supervisor: professorId,
      tName: "name",
      tSurname: "surname",
      Co_supervisor:null,
      Keywords:"some keyword",
      Type:"yours",
      Groups:"GroupC",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2022-10-20'),
      Level:'CMs',
      CdS:'BIO101'
    }];

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    //Mock the getCoSupervisorNames function to resolve with coSup
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValueOnce(coSup);

    const result = await getArchivedProposalsByProfessor(professorId, filter);
    expect(result).toEqual(proposalsResult);
  });

  it('should resolve with an array of filtered archived proposals when they are found for a professor', async () => {
    const professorId = 'd100003';
    const filter ='CS101';
    const coSup = 'Co Supervisore'
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL P, TEACHER T WHERE T.ID=P.Supervisor AND T.ID= ?`;
    const proposalsResult = [
      {
        id:3,
        title:"P3",
        supervisorId:professorId,
        supervisorName: "name",
        supervisorSurname: "surname",
        coSupervisor:"d111111",
        coSupervisorNames:coSup,
        keywords:"no keywords",
        type:"mine",
        groups:"GroupA GroupB",
        description:"Lorem ipsum",
        reqKnowledge:"none",
        notes:null,
        expiration:dayjs('2019-10-20'),
        level:'BMs',
        cdsId:'CS101',
        cdsName: undefined
      }
    ];
  
    const mockedRows= [{
      pID:3,
      Title:"P3",
      Supervisor: professorId,
      tName: "name",
      tSurname: "surname",
      Co_supervisor:"d111111",
      Keywords:"no keywords",
      Type:"mine",
      Groups:"GroupA GroupB",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2019-10-20'),
      Level:'BMs',
      CdS:'CS101'
    },
    {
      pID:4,
      Title:"P4",
      Supervisor: professorId,
      tName: "name",
      tSurname: "surname",
      Co_supervisor:null,
      Keywords:"some keyword",
      Type:"yours",
      Groups:"GroupC",
      Description:"Lorem ipsum",
      Req_knowledge:"none",
      Notes:null,
      Expiration:dayjs('2022-10-20'),
      Level:'CMs',
      CdS:'BIO101'
    }];

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(null, mockedRows);
    });

    //Mock the getCoSupervisorNames function to resolve with coSup
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValue(coSup);

    const result = await getArchivedProposalsByProfessor(professorId, filter);
    expect(result).toEqual(proposalsResult);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const professorId = 3;
    const filter ='';
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL P, TEACHER T WHERE T.ID=P.Supervisor AND T.ID= ?`;
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([professorId]);
      callback(expectedError, null);
    });

    await expect(getArchivedProposalsByProfessor(professorId, filter)).rejects.toEqual(expectedError);
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

      //Simulate successful execution of all queries
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
      callback(expectedError, null); //Simulate proposal not found
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
      callback(null, null); //Simulate proposal not found
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
      callback(expectedError, null); //Simulate application not found
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
      callback(null, null); //Simulate application not found
    });

    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual('Application not found.');
  });

  it('should reject with an error if an error occurs during database transaction - insert', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = { };
    const mockedApplicationRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
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
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      //Second db.run - Insert with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - update accepted app', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = {  };
    const mockedApplicationRow = {  };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
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
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    //Insert
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      //Second db.run - Update with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - update cancelled apps', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = { };
    const mockedApplicationRow = {  };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
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
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
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
      //Second db.run - Update Cancelled with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(archiveProposal(proposalId, studentId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - delete', async () => {
    const proposalId = 1;
    const studentId = 2;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedApplicationSql = 'SELECT * FROM APPLICATION WHERE Proposal_ID = ? AND Student_ID = ?';
    const mockedProposalRow = { };
    const mockedApplicationRow = {  };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
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
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
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
      //Second db.run - Delete with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
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
  proposalsResult[0].coSupervisorNames ="Co Supervisore";
  proposalsResult[1].coSupervisorNames ="Co Supervisore";
  
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`;
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

  it('should resolve with filtered proposals by keywords', async () => {
    const studentId = 1;
    const filteringString = '3';
    const filter = { keywords: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
    const addedFilterSql = 'AND P.expiration <=  ?'
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active" `
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

  it('should resolve with asc ordered proposals by title', async () => {
    const studentId = 1;
    const order = {field: 'title', direction: true};
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`
    const addedFilterSql = ' ORDER BY P.title';
    const mockedRows = [...proposalRaw];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });
    const result = await getAvailableProposals(studentId, {}, order);
    expect(result[0]).toEqual(proposalsResult[0]);
  });

  it('should resolve with desc ordered proposals by title', async () => {
    const studentId = 1;
    const order = {field: 'title', direction: false};
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`
    const addedFilterSql = ' ORDER BY P.title DESC';
    const mockedRows = [...proposalRaw.reverse()];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql + addedFilterSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });
    const result = await getAvailableProposals(studentId, {}, order);
    expect(result[0]).toEqual(proposalsResult[1]);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const studentId = 1;
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`
    const expectedError = 'Database error occurred';
    
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(getAvailableProposals(studentId, {})).rejects.toEqual(expectedError);
  });

  it('should resolve with filtered proposals by coSupervisor', async () => {
    const studentId = 1;

    const proposalsResultFinal = [Proposal( 
      3,
      "Proposal 3",
      "d100003",
      "Michael",
      "Johnson",
      "d100002",
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
      null,
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
    proposalsResultFinal[0].coSupervisorNames ="Co Supervisore A";
    proposalsResult[1].coSupervisorNames ="Co Supervisore B";
    
    const proposalRawFinal = [{
      pID: 3,
      Title: 'Proposal 3',
      Supervisor: 'd100003',
      Co_supervisor: 'd100002',
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
      Co_supervisor: null,
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


    const filteringString = 'A';
    const filter = { coSupervisor: filteringString };
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D, STUDENT S WHERE T.ID=P.Supervisor AND P.CdS LIKE "%"||D.COD_DEGREE||"%" AND S.CODE_DEGREE=D.COD_DEGREE AND S.ID= ? AND P.Status="Active"`
    const mockedRows = proposalRawFinal;
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    //Mock the getCoSupervisorNames function to resolve with coSup
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValueOnce('Co Supervisore A');
    getCoSupervisorNamesMock.mockResolvedValueOnce('Co Supervisore B');


    const result = await getAvailableProposals(studentId, filter);
    expect(result).toEqual([proposalsResultFinal[0]]);
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

describe('updateProposal Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const body = {
    title: 'Updated Title',
    coSupervisor: 'Updated Co-supervisor',
    keywords: 'Updated Keywords',
    type: 'Updated Type',
    description: 'Updated Description',
    reqKnowledge: 'Updated Req Knowledge',
    notes: 'Updated Notes',
    expiration: 'Updated Expiration',
    level: 'Updated Level',
    cds: 'Updated CdS',
    groups: ' GEO303'
  };
  const proposalId = 1;

  it('should resolve with updated proposal object when there is no problem with inputs', async () => {

    db.get.mockImplementationOnce((sql, values, callback) => callback(null, { Groups:"CS101 BIO202" }));
    db.run.mockImplementationOnce((sql, values, callback) => {
      expect(values).toEqual([body.title, body.coSupervisor, body.keywords, body.type, body.description,
        body.reqKnowledge, body.notes, body.expiration, body.level, body.cds, "CS101 GEO303", proposalId]);
      callback(null);
    });
    db.get.mockImplementationOnce((sql, values, callback) => callback(null, { id: proposalId, ...body, groups:"CS101 GEO303" }));

    const result = await updateProposal(body, proposalId);

    expect(result).toEqual({ id: proposalId, ...body, groups:"CS101 GEO303" });
  });

  it('should reject with an error on the first db.get failure', async () => {

    db.get.mockImplementationOnce((sql, values, callback) => callback({ code: 'ANOTHER_ERROR' }));

    await expect(updateProposal(body, proposalId)).rejects.toEqual({ code: 'ANOTHER_ERROR' });
  });

  it('should reject with an error on db.run failure', async () => {
    db.get.mockImplementationOnce((sql, values, callback) => callback(null, { Groups:"CS101 BIO202" }));
    db.run.mockImplementationOnce((sql, values, callback) => callback({ code: 'ANOTHER_ERROR' }));

    await expect(updateProposal(body, proposalId)).rejects.toEqual({ code: 'ANOTHER_ERROR' });
  });

  it('should reject with an error on db.get failure', async () => {
    const expectedError = new Error('Simulated db.get error');
    db.get.mockImplementationOnce((sql, values, callback) => callback(null, { Groups:"CS101 BIO202" }));
    db.run.mockImplementationOnce((sql, values, callback) => callback(null));

    db.get.mockImplementationOnce((sql, values, callback) => callback(expectedError));

    await expect(updateProposal(body, proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if the first db.get gets no results', async () => {

    db.get.mockImplementationOnce((sql, values, callback) => callback(null, null));

    await expect(updateProposal(body, proposalId)).rejects.toEqual('No such proposal: '+proposalId);
  });
});

describe('deleteProposal Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message after deleting a proposal and associated applications', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'UPDATE PROPOSAL SET Status="Deleted" WHERE Id = ?';
    const expectedCancelAppsSql = 'UPDATE APPLICATION SET Status="Cancelled" WHERE Proposal_ID=? and Archived_Proposal_ID IS NULL';

    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
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
      expect(params).toEqual([proposalId]);
      callback(null);
    })

    const result = await deleteProposal(proposalId);
    expect(result).toEqual({ success: true });
  });

  it('should reject with "Proposal not found" when proposal is not found', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'UPDATE PROPOSAL SET Status="Deleted" WHERE Id = ?';
    const expectedError = { error: 'Proposal not found' };

    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Mock the Begin transaction
    db.run.mockImplementationOnce((query) =>{});

    db.run.mockImplementationOnce((query, params, callback) => {
        expect(query).toEqual(expectedDeletePropSql);
        expect(params).toEqual([proposalId]);
        callback.call({ changes: 0 },null); //Simulate proposal not found
    });

    await expect(deleteProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - remove poposal', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'UPDATE PROPOSAL SET Status="Deleted" WHERE Id = ?';
    const expectedError = 'Database error occurred';

    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Mock the Begin transaction
    db.run.mockImplementationOnce((query) =>{});

    db.run.mockImplementationOnce((query, params, callback) => {
      expect(params).toEqual([proposalId]);
      callback(expectedError); //Simulate proposal found
    });

    await expect(deleteProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - remove all apps', async () => {
    const proposalId = 1;
    const expectedDeletePropSql = 'UPDATE PROPOSAL SET Status="Deleted" WHERE Id = ?';
    const expectedError = 'Database error occurred';

    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Mock the Begin transaction
    db.run.mockImplementationOnce((query) =>{});

    db.run.mockImplementationOnce((query, params, callback) => {
      expect(query).toEqual(expectedDeletePropSql);
      expect(params).toEqual([proposalId]);
      callback.call({ changes: 1 },null); //Simulate proposal found
    });

    db.run.mockImplementationOnce((query, params, callback) => {
        expect(params).toEqual([proposalId]);
        callback(expectedError);
    });

    await expect(deleteProposal(proposalId)).rejects.toEqual(expectedError);
  });
});

describe('getProposalById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const proposalResult = Proposal( 
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
  );
  proposalResult.coSupervisorNames= "Co Supervisore B";
  const proposalRaw = {
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
  }

  it('should resolve with a proposal when the proposal is found', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D WHERE P.ID=? AND P.Supervisor=T.ID`
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, proposalRaw);
    });
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValueOnce(null);

    const result = await getProposalById(proposalId);
    expect(result).toEqual(proposalResult);
  });

  it('should resolve with a proposal when the proposal is found - no cosup', async () => {
    const proposalId = 8;
    const noCosupProp = proposalRaw;
    noCosupProp.Co_supervisor = "";

    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D WHERE P.ID=? AND P.Supervisor=T.ID`
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, noCosupProp);
    });

    proposalResult.coSupervisor = "";
    proposalResult.coSupervisorNames = null;

    const result = await getProposalById(proposalId);
    expect(result).toEqual(proposalResult);
  });

  it('should resolve with no proposal when no proposal is found', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D WHERE P.ID=? AND P.Supervisor=T.ID`;
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, []);
    });
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValueOnce(null);

    const result = await getProposalById(proposalId);
    expect(result).toEqual(undefined);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT *, P.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM PROPOSAL P, TEACHER T, DEGREE D WHERE P.ID=? AND P.Supervisor=T.ID`;
    const expectedError = 'Database error occurred';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(expectedError, null);
    });

    await expect(getProposalById(proposalId)).rejects.toEqual(expectedError);
  });
});

describe('archiveProposalWithoutApplication Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message after archiving a proposal', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const mockedProposalRow = {};

    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });

    const expectedInsertSql = 'INSERT INTO ARCHIVED_PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS, Status, Thesist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const expectedDeleteSql = 'DELETE FROM PROPOSAL WHERE Id=?';

    db.serialize.mockImplementationOnce((callback) => {
      callback();

      expect(db.run.mock.calls[0][0]).toBe('BEGIN TRANSACTION');
      expect(db.run.mock.calls[1][0]).toBe(expectedInsertSql);
      expect(db.run.mock.calls[2][0]).toBe(expectedDeleteSql);

      //Simulate successful execution of all queries
      db.run.mock.calls[1][1](null);
      db.run.mock.calls[2][1](null);

      expect(db.run.mock.calls[3][0]).toBe('COMMIT');
    });

    const result = await archiveProposalWithoutApplication(proposalId, "Archived");
    expect(result).toEqual({ success: true });
  });

  it('should reject with an error while searching proposal', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const expectedError = "Database Error";
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(expectedError, null); //Simulate proposal not found
    });

    await expect(archiveProposalWithoutApplication(proposalId,"Archived")).rejects.toEqual(expectedError);
  });

  it('should reject with "Proposal not found" when proposal is not found', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, null); //Simulate proposal not found
    });

    await expect(archiveProposalWithoutApplication(proposalId, "Archived")).rejects.toEqual('Proposal not found.');
  });

  it('should reject with an error if an error occurs during database transaction - insert', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const mockedProposalRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      //Second db.run - Insert with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(archiveProposalWithoutApplication(proposalId,"Archived")).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - update', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const mockedProposalRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    //Insert
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      //Second db.run - update
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(archiveProposalWithoutApplication(proposalId,"Archived")).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - delete', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM PROPOSAL WHERE Id = ?';
    const mockedProposalRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
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
      //Third db.run - Delete with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(archiveProposalWithoutApplication(proposalId,"Archived")).rejects.toEqual(expectedError);
  });
  
});

describe('getArchivedProposalById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const proposalResult = Proposal( 
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
  );
  proposalResult.coSupervisorNames= null;
  const proposalRaw = {
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
  }

  it('should resolve with a proposal when the proposal is found', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT *, AP.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL AP, TEACHER T, DEGREE D WHERE AP.ID=? AND AP.Supervisor=T.ID`
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, proposalRaw);
    });
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValueOnce(null);

    const result = await getArchivedProposalById(proposalId);
    expect(result).toEqual(proposalResult);
  });

  it('should resolve with a proposal when the proposal is found - no cosup', async () => {
    const proposalId = 8;
    const noCosupProp = proposalRaw;
    noCosupProp.Co_supervisor = "";

    const expectedSql = `SELECT *, AP.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL AP, TEACHER T, DEGREE D WHERE AP.ID=? AND AP.Supervisor=T.ID`
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, proposalRaw);
    });

    proposalResult.coSupervisor = "";
    proposalResult.coSupervisorNames = null;

    const result = await getArchivedProposalById(proposalId);
    expect(result).toEqual(proposalResult);
  });

  it('should resolve with no proposal when no proposal is found', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT *, AP.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL AP, TEACHER T, DEGREE D WHERE AP.ID=? AND AP.Supervisor=T.ID`;
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(null, []);
    });
    const getCoSupervisorNamesMock = jest.spyOn(require('../DB/proposals-dao'), 'getCoSupervisorNames');
    getCoSupervisorNamesMock.mockResolvedValueOnce(null);

    const result = await getArchivedProposalById(proposalId);
    expect(result).toEqual(undefined);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const proposalId = 8;
    const expectedSql = `SELECT *, AP.Id as pID, T.NAME as tName, T.SURNAME as tSurname FROM ARCHIVED_PROPOSAL AP, TEACHER T, DEGREE D WHERE AP.ID=? AND AP.Supervisor=T.ID`;
    const expectedError = 'Database error occurred';
    
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([proposalId]);
      callback(expectedError, null);
    });

    await expect(getArchivedProposalById(proposalId)).rejects.toEqual(expectedError);
  });
});

describe('deArchiveProposal Function Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with success message after archiving a proposal', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?';
    const mockedProposalRow = {};

    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });

    const expectedInsertSql = 'INSERT INTO PROPOSAL (Id, Title, Supervisor, Co_supervisor, Keywords, Type, Groups, Description, Req_knowledge, Notes, Expiration, Level, CdS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const expectedDeleteSql = 'DELETE FROM ARCHIVED_PROPOSAL WHERE Id=?';
    const updateCancelledSQL = "UPDATE APPLICATION SET Proposal_ID=?, Archived_Proposal_ID=?, Status='Pending' WHERE Archived_Proposal_ID=? AND Status='Pending'";
    const updateRejectedSQL = "UPDATE APPLICATION SET Proposal_ID=?, Archived_Proposal_ID=?, Status='Pending' WHERE Archived_Proposal_ID=? AND Status!='Pending'";
                

    db.serialize.mockImplementationOnce((callback) => {
      callback();

      expect(db.run.mock.calls[0][0]).toBe('BEGIN TRANSACTION');
      expect(db.run.mock.calls[1][0]).toBe(expectedInsertSql);
      expect(db.run.mock.calls[2][0]).toBe(expectedDeleteSql);

      //Simulate successful execution of all queries
      db.run.mock.calls[1][1](null);
      db.run.mock.calls[2][1](null);

      expect(db.run.mock.calls[4][0]).toBe('COMMIT');
    });

    const result = await deArchiveProposal(proposalId);
    expect(result).toEqual({ success: true });
  });

  it('should reject with an error while searching proposal', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?';
    const expectedError = "Database Error";
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(expectedError, null); //Simulate proposal not found
    });

    await expect(deArchiveProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with "Archived proposal not found" when proposal is not found', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?';
    
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, null); //Simulate proposal not found
    });

    await expect(deArchiveProposal(proposalId)).rejects.toEqual('Archived proposal not found.');
  });

  it('should reject with an error if an error occurs during database transaction - insert', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?';
    const mockedProposalRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      //Second db.run - Insert with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(deArchiveProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - update', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?';
    const mockedProposalRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
    db.run.mockImplementationOnce((query) => {
    });

    //Insert
    db.run.mockImplementationOnce((query, params, innerCallback) => {
      innerCallback();
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      //Second db.run - update
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(deArchiveProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - updating rejected', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?';
    const mockedProposalRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
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
      //update rejected with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(deArchiveProposal(proposalId)).rejects.toEqual(expectedError);
  });

  it('should reject with an error if an error occurs during database transaction - delete', async () => {
    const proposalId = 1;
    const expectedProposalSql = 'SELECT * FROM ARCHIVED_PROPOSAL WHERE Id = ?';
    const mockedProposalRow = { };
    const expectedError = 'Database error occurred';
  
    //Mock the database get calls
    db.get.mockImplementationOnce((sql, params, callback) => {
      expect(sql).toBe(expectedProposalSql);
      expect(params).toEqual([proposalId]);
      callback(null, mockedProposalRow);
    });
  
    //Mock the database serialize and run calls
    db.serialize.mockImplementationOnce((callback) => {
      //Simulate the serialize block
      callback();
    });

    //Simulate the rest of the database calls within serialize
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
      //update reject
      innerCallback();
    });

    db.run.mockImplementationOnce((query, params, innerCallback) => {
      //Third db.run - Delete with an error
      innerCallback(expectedError);
    });

    db.run.mockImplementationOnce((query) =>{});
  
    //Call the actual function
    await expect(deArchiveProposal(proposalId)).rejects.toEqual(expectedError);
  });

});