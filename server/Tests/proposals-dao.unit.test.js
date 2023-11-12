// Mocking the dependencies
const { getActiveProposalsByProfessor, archiveProposal } = require('../DB/proposals-dao');
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
      // Add more sample proposal data as needed
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
  const mockedProposal = {Title:"Proposal 1"};
  const mockedApplication = {Proposal:"Proposal 1", Student_ID:"s200000", Status:"Accepted"};

  it('should reject with a message when the proposal is not found', async () => {
      // Mock the get method to simulate a scenario where the proposal is not found
      db.get.mockImplementationOnce((query, params, callback) => {
          callback(null, null); // Simulating that the proposal is not found
      });

      // Mock the close method
      db.close.mockImplementationOnce(jest.fn());

      await expect(archiveProposal("Rubbish", "Rubbish")).rejects.toEqual('Proposal not found.');
      
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

  it('should reject with an error when the updating of the proposal goes wrong', async () => {
    mockedInsertError = {message:"Impossible to insert"};
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
    mockedSuccess = {success:true};
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

