const { getAllRequests, getAllRequestsForClerk, getRequestById, getActiveRequestBySupervisor, getActiveRequestByStudent, addRequest } = require('../DB/request-dao');
const { db } = require('../DB/db');
const supervDao = require('../DB/supervisors-dao');
const studDao = require('../DB/students-dao');
const propDao = require('../DB/proposals-dao');
jest.mock('../DB/db', () => {
    const mockedDB = {
      all: jest.fn(),
      run: jest.fn(),
      get: jest.fn()
    };
    return { db: mockedDB };
});
// Mock supervisor DAO
jest.mock('../DB/supervisors-dao', () => ({
    getSupervisorById: jest.fn()
}));

// Mock student DAO
jest.mock('../DB/students-dao', () => ({
    getStudentData: jest.fn()
}));

// Mock proposal DAO
jest.mock('../DB/proposals-dao', () => ({
    getCoSupervisorNames: jest.fn()
}));

describe('getAllRequestsForClerk', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should resolve with an empty array if there are no requests in the database', async () => {
      const expectedSql = 'SELECT * FROM REQUEST WHERE Status="Created"';
      const mockedRows = [];
      db.all.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([]);
        callback(null, mockedRows);
      });
  
      const result = await getAllRequestsForClerk();
      expect(result).toEqual([]);
    });
  
    it('should resolve with an array of requests with supervisor and student data when requests are found in the database', async () => {
      const expectedSql = 'SELECT * FROM REQUEST WHERE Status="Created"';
      const mockedRows = [
        {
          Id: 1,
          Title: 'Request 1',
          Student_Id: 1,
          Supervisor_Id: 2,
          Co_Supervisor: 3,
          Description: 'Description 1',
          Application_Id: 4,
          Approval_Date: '2023-01-01'
        },
        {
            Id: 2,
            Title: 'Request 2',
            Student_Id: 2,
            Supervisor_Id: 2,
            Description: 'Description 2',
            Approval_Date: '2023-01-01'
        }
        // Add more sample request data as needed
      ];
  
      const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
      const studentData = { name: 'Student', surname: 'StudentSurname' };
      const coSupervisorNames = 'CoSupervisor1, CoSupervisor2';
  
      supervDao.getSupervisorById.mockResolvedValue(supervisorData);
      studDao.getStudentData.mockResolvedValue(studentData);
      propDao.getCoSupervisorNames.mockResolvedValue(coSupervisorNames);
  
      const expectedRequests = mockedRows.map(async (r) => ({
        id: r.Id,
        title: r.Title,
        studentId: r.Student_Id,
        studentName: studentData.name,
        studentSurname: studentData.surname,
        supervisorId: r.Supervisor_Id,
        supervisorName: supervisorData.NAME,
        supervisorSurname: supervisorData.SURNAME,
        coSupervisorId: r.Co_Supervisor,
        coSupervisorNames: r.Co_Supervisor ? await propDao.getCoSupervisorNames(r.Co_Supervisor) : "",
        description: r.Description,
        applicationId: r.Application_Id ? r.Application_Id : null,
        approvalDate: r.Approval_Date
      }));
  
      db.all.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([]);
        callback(null, mockedRows);
      });
  
      const result = await getAllRequestsForClerk();
      expect(result).toEqual(await Promise.all(expectedRequests));
    });
  
    it('should reject with an error if an error occurs during database retrieval', async () => {
      const expectedSql = 'SELECT * FROM REQUEST WHERE Status="Created"';
      const expectedError = 'Database error occurred';
      db.all.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([]);
        callback(expectedError, null);
      });
  
      await expect(getAllRequestsForClerk()).rejects.toEqual(expectedError);
    });
});

describe('getAllRequests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty array if there are no requests in the database', async () => {
    const expectedSql = 'SELECT * FROM REQUEST';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([]);
      callback(null, mockedRows);
    });

    const result = await getAllRequests();
    expect(result).toEqual([]);
  });

  it('should resolve with an array of requests with supervisor and student data when requests are found in the database', async () => {
    const expectedSql = 'SELECT * FROM REQUEST';
    const mockedRows = [
      {
        Id: 1,
        Title: 'Request 1',
        Student_Id: 1,
        Supervisor_Id: 2,
        Co_Supervisor: 3,
        Description: 'Description 1',
        Application_Id: 4,
        Approval_Date: '2023-01-01'
      },
      {
          Id: 2,
          Title: 'Request 2',
          Student_Id: 2,
          Supervisor_Id: 2,
          Description: 'Description 2',
          Approval_Date: '2023-01-01'
      }
      // Add more sample request data as needed
    ];

    const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
    const studentData = { name: 'Student', surname: 'StudentSurname' };
    const coSupervisorNames = 'CoSupervisor1, CoSupervisor2';

    supervDao.getSupervisorById.mockResolvedValue(supervisorData);
    studDao.getStudentData.mockResolvedValue(studentData);
    propDao.getCoSupervisorNames.mockResolvedValue(coSupervisorNames);

    const expectedRequests = mockedRows.map(async (r) => ({
      id: r.Id,
      title: r.Title,
      studentId: r.Student_Id,
      studentName: studentData.name,
      studentSurname: studentData.surname,
      supervisorId: r.Supervisor_Id,
      supervisorName: supervisorData.NAME,
      supervisorSurname: supervisorData.SURNAME,
      coSupervisorId: r.Co_Supervisor,
      coSupervisorNames: r.Co_Supervisor ? await propDao.getCoSupervisorNames(r.Co_Supervisor) : "",
      description: r.Description,
      applicationId: r.Application_Id ? r.Application_Id : null,
      approvalDate: r.Approval_Date
    }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([]);
      callback(null, mockedRows);
    });

    const result = await getAllRequests();
    expect(result).toEqual(await Promise.all(expectedRequests));
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const expectedSql = 'SELECT * FROM REQUEST';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([]);
      callback(expectedError, null);
    });

    await expect(getAllRequests()).rejects.toEqual(expectedError);
  });
});

describe('getRequestById', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should resolve with the request details when a request is found by Id', async () => {
      const reqId = 1;
      const expectedSql = 'SELECT * FROM REQUEST WHERE Id = ?';
      const mockedRow = {
        Id: reqId,
        Title: 'Request 1',
        Student_Id: 1,
        Supervisor_Id: 2,
        Co_Supervisor: 3,
        Description: 'Description 1',
        Application_Id: 4,
        Approval_Date: '2023-01-01'
      };
  
      const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
      const studentData = { name: 'Student', surname: 'StudentSurname' };
      const coSupervisorNames = 'CoSupervisor1, CoSupervisor2';
  
      db.get.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([reqId]);
        callback(null, mockedRow);
      });
  
      supervDao.getSupervisorById.mockResolvedValue(supervisorData);
      studDao.getStudentData.mockResolvedValue(studentData);
      propDao.getCoSupervisorNames.mockResolvedValue(coSupervisorNames);
  
      const expectedRequest = {
        id: mockedRow.Id,
        title: mockedRow.Title,
        studentId: mockedRow.Student_Id,
        studentName: studentData.name,
        studentSurname: studentData.surname,
        supervisorId: mockedRow.Supervisor_Id,
        supervisorName: supervisorData.NAME,
        supervisorSurname: supervisorData.SURNAME,
        coSupervisorId: mockedRow.Co_Supervisor,
        coSupervisorNames: mockedRow.Co_Supervisor ? await propDao.getCoSupervisorNames(mockedRow.Co_Supervisor) : "",
        description: mockedRow.Description,
        applicationId: mockedRow.Application_Id ? mockedRow.Application_Id : null,
        approvalDate: mockedRow.Approval_Date
      };
  
      const result = await getRequestById(reqId);
      expect(result).toEqual(expectedRequest);
    });

    it('should resolve with the request details when a request is found by Id', async () => {
        const reqId = 1;
        const expectedSql = 'SELECT * FROM REQUEST WHERE Id = ?';
        const mockedRow = {
          Id: reqId,
          Title: 'Request 1',
          Student_Id: 1,
          Supervisor_Id: 2,
          Co_Supervisor: null,
          Description: 'Description 1',
          Application_Id: null,
          Approval_Date: '2023-01-01'
        };
    
        const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
        const studentData = { name: 'Student', surname: 'StudentSurname' };
        const coSupervisorNames = 'CoSupervisor1, CoSupervisor2';
    
        db.get.mockImplementation((sql, params, callback) => {
          expect(sql).toBe(expectedSql);
          expect(params).toEqual([reqId]);
          callback(null, mockedRow);
        });
    
        supervDao.getSupervisorById.mockResolvedValue(supervisorData);
        studDao.getStudentData.mockResolvedValue(studentData);
        propDao.getCoSupervisorNames.mockResolvedValue(coSupervisorNames);
    
        const expectedRequest = {
          id: mockedRow.Id,
          title: mockedRow.Title,
          studentId: mockedRow.Student_Id,
          studentName: studentData.name,
          studentSurname: studentData.surname,
          supervisorId: mockedRow.Supervisor_Id,
          supervisorName: supervisorData.NAME,
          supervisorSurname: supervisorData.SURNAME,
          coSupervisorId: mockedRow.Co_Supervisor,
          coSupervisorNames: mockedRow.Co_Supervisor ? await propDao.getCoSupervisorNames(mockedRow.Co_Supervisor) : "",
          description: mockedRow.Description,
          applicationId: mockedRow.Application_Id ? mockedRow.Application_Id : null,
          approvalDate: mockedRow.Approval_Date
        };
    
        const result = await getRequestById(reqId);
        expect(result).toEqual(expectedRequest);
      });
  
    it('should reject with an error if no request is found by Id', async () => {
      const reqId = 2;
      const expectedSql = 'SELECT * FROM REQUEST WHERE Id = ?';
      const expectedError = new Error(`Request with id ${reqId} not found`);
  
      db.get.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([reqId]);
        callback(null, null);
      });
  
      await expect(getRequestById(reqId)).rejects.toEqual(expectedError);
    });
  
    it('should reject with an error if an error occurs during database retrieval', async () => {
      const reqId = 3;
      const expectedSql = 'SELECT * FROM REQUEST WHERE Id = ?';
      const expectedError = 'Database error occurred';
  
      db.get.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([reqId]);
        callback(expectedError, null);
      });
  
      await expect(getRequestById(reqId)).rejects.toEqual(expectedError);
    });
});

describe('getActiveRequestBySupervisor', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should resolve with an empty array if there are no requests for the given supervisor', async () => {
      const supervisorId = 1;
      const expectedSql = 'SELECT * FROM REQUEST WHERE Supervisor_Id = ? AND Status = "SEC_Approved"';
      const mockedRows = [];
      db.all.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([supervisorId]);
        callback(null, mockedRows);
      });
  
      const result = await getActiveRequestBySupervisor(supervisorId);
      expect(result).toEqual([]);
    });
  
    it('should resolve with an array of requests with supervisor and student data when requests are found for the given supervisor', async () => {
      const supervisorId = 2;
      const expectedSql = 'SELECT * FROM REQUEST WHERE Supervisor_Id = ? AND Status = "SEC_Approved"';
      const mockedRows = [
        {
          Id: 1,
          Title: 'Request 1',
          Student_Id: 1,
          Supervisor_Id: 2,
          Co_Supervisor: 3,
          Description: 'Description 1',
          Application_Id: 4,
          Approval_Date: '2023-01-01'
        },
        {
            Id: 2,
            Title: 'Request 2',
            Student_Id: 2,
            Supervisor_Id: 2,
            Description: 'Description 2',
            Approval_Date: '2023-01-01'
        }
        // Add more sample request data as needed
      ];
  
      const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
      const studentData = { name: 'Student', surname: 'StudentSurname' };
      const coSupervisorNames = 'CoSupervisor1, CoSupervisor2';
  
      db.all.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([supervisorId]);
        callback(null, mockedRows);
      });
  
      supervDao.getSupervisorById.mockResolvedValue(supervisorData);
      studDao.getStudentData.mockResolvedValue(studentData);
      propDao.getCoSupervisorNames.mockResolvedValue(coSupervisorNames);
  
      const expectedRequests = mockedRows.map(async (r) => ({
        id: r.Id,
        title: r.Title,
        studentId: r.Student_Id,
        studentName: studentData.name,
        studentSurname: studentData.surname,
        supervisorId: r.Supervisor_Id,
        supervisorName: supervisorData.NAME,
        supervisorSurname: supervisorData.SURNAME,
        coSupervisorId: r.Co_Supervisor,
        coSupervisorNames: r.Co_Supervisor ? await propDao.getCoSupervisorNames(r.Co_Supervisor) : "",
        description: r.Description,
        applicationId: r.Application_Id ? r.Application_Id : null,
        approvalDate: r.Approval_Date
      }));
  
      const result = await getActiveRequestBySupervisor(supervisorId);
      expect(result).toEqual(await Promise.all(expectedRequests));
    });
  
    it('should reject with an error if an error occurs during database retrieval', async () => {
      const supervisorId = 3;
      const expectedSql = 'SELECT * FROM REQUEST WHERE Supervisor_Id = ? AND Status = "SEC_Approved"';
      const expectedError = 'Database error occurred';
  
      db.all.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual([supervisorId]);
        callback(expectedError, null);
      });
  
      await expect(getActiveRequestBySupervisor(supervisorId)).rejects.toEqual(expectedError);
    });
});

describe('getActiveRequestByStudent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty array if there are no requests for the given supervisor', async () => {
    const studentId = 1;
    const expectedSql = 'SELECT * FROM REQUEST WHERE Student_Id = ?';
    const mockedRows = null;
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    const result = await getActiveRequestByStudent(studentId);
    expect(result).toEqual({});
  });

  it('should resolve with an request with supervisor and student data when a requests is found for the given student', async () => {
    const studentId = 2;
    const expectedSql = 'SELECT * FROM REQUEST WHERE Student_Id = ?';
    const mockedRow = 
    {
        Id: 2,
        Title: 'Request 2',
        Student_Id: 2,
        Supervisor_Id: 2,
        Description: 'Description 2',
        Approval_Date: '2023-01-01'
    };

    const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
    const studentData = { name: 'Student', surname: 'StudentSurname' };
    const coSupervisorNames = 'CoSupervisor1, CoSupervisor2';

    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRow);
    });

    supervDao.getSupervisorById.mockResolvedValue(supervisorData);
    studDao.getStudentData.mockResolvedValue(studentData);
    propDao.getCoSupervisorNames.mockResolvedValue(coSupervisorNames);

    const expectedRequests = {
      id: mockedRow.Id,
      title: mockedRow.Title,
      studentId: mockedRow.Student_Id,
      studentName: studentData.name,
      studentSurname: studentData.surname,
      supervisorId: mockedRow.Supervisor_Id,
      supervisorName: supervisorData.NAME,
      supervisorSurname: supervisorData.SURNAME,
      coSupervisorId: mockedRow.Co_Supervisor,
      coSupervisorNames: mockedRow.Co_Supervisor ? await propDao.getCoSupervisorNames(mockedRow.Co_Supervisor) : "",
      description: mockedRow.Description,
      applicationId: mockedRow.Application_Id ? mockedRow.Application_Id : null,
      approvalDate: mockedRow.Approval_Date
    };

    const result = await getActiveRequestByStudent(studentId);
    expect(result).toEqual(expectedRequests);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const studentId = 3;
    const expectedSql = 'SELECT * FROM REQUEST WHERE Student_Id = ?';
    const expectedError = 'Database error occurred';

    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(getActiveRequestByStudent(studentId)).rejects.toEqual(expectedError);
  });

});
  
describe('addRequest', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should resolve with success when adding a request with valid data', async () => {
      const requestData = {
        title: 'New Request',
        studentId: 1,
        supervisorId: 2,
        coSupervisorId: 3,
        description: 'New Description',
        applicationId: 4
      };
  
      const studentData = { name: 'Student', surname: 'StudentSurname' };
      const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
  
      studDao.getStudentData.mockResolvedValue(studentData);
      supervDao.getSupervisorById.mockResolvedValue(supervisorData);
  
      const expectedSql = 'INSERT INTO REQUEST (Title,Student_Id,Supervisor_Id,Co_Supervisor,Description,Application_Id, Approval_Date, Status) VALUES(?,?,?,?,?,?,?,?)';
      const expectedParams = [
        requestData.title,
        requestData.studentId,
        requestData.supervisorId,
        requestData.coSupervisorId,
        requestData.description,
        requestData.applicationId,
        null,
        "Created"
      ];
  
      db.run.mockImplementation((sql, params, callback) => {
        expect(sql).toBe(expectedSql);
        expect(params).toEqual(expectedParams);
        callback(null);
      });
  
      const result = await addRequest(requestData);
      expect(result).toEqual({ success: true });
    });

    it('should resolve with success when adding a request with valid data but some empty fields', async () => {
        const requestData = {
          title: 'New Request',
          studentId: 1,
          supervisorId: 2,
          description: 'New Description'
        };
    
        const studentData = { name: 'Student', surname: 'StudentSurname' };
        const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
    
        studDao.getStudentData.mockResolvedValue(studentData);
        supervDao.getSupervisorById.mockResolvedValue(supervisorData);
    
        const expectedSql = 'INSERT INTO REQUEST (Title,Student_Id,Supervisor_Id,Co_Supervisor,Description,Application_Id, Approval_Date, Status) VALUES(?,?,?,?,?,?,?,?)';
        const expectedParams = [
          requestData.title,
          requestData.studentId,
          requestData.supervisorId,
          null,
          requestData.description,
          null,
          null,
          "Created"
        ];
    
        db.run.mockImplementation((sql, params, callback) => {
          expect(sql).toBe(expectedSql);
          expect(params).toEqual(expectedParams);
          callback(null);
        });
    
        const result = await addRequest(requestData);
        expect(result).toEqual({ success: true });
      });
  
    it('should reject with an error if the student or supervisor is not in the database', async () => {
      const requestData = {
        title: 'New Request',
        studentId: 1,
        supervisorId: 2,
        coSupervisorId: 3,
        description: 'New Description',
        applicationId: 4
      };
  
      const expectedError = new Error('Either request student or supervisor are not in the database');
  
      studDao.getStudentData.mockResolvedValue(null);
      supervDao.getSupervisorById.mockResolvedValue(null);
  
      await expect(addRequest(requestData)).rejects.toEqual(expectedError);
    });
  
    it('should reject with an error if an error occurs during database insertion', async () => {
      const requestData = {
        title: 'New Request',
        studentId: 1,
        supervisorId: 2,
        coSupervisorId: 3,
        description: 'New Description',
        applicationId: 4
      };
  
      const studentData = { name: 'Student', surname: 'StudentSurname' };
      const supervisorData = { NAME: 'Supervisor', SURNAME: 'SupervisorSurname' };
  
      studDao.getStudentData.mockResolvedValue(studentData);
      supervDao.getSupervisorById.mockResolvedValue(supervisorData);
  
      const expectedError = 'Database error occurred';
  
      db.run.mockImplementation((sql, params, callback) => {
        callback(expectedError);
      });
  
      await expect(addRequest(requestData)).rejects.toEqual(expectedError);
    });
});