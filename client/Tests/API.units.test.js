// Assume getApplications is defined in a file named 'api.js'
import API from '../src/API';
const SERVER_URL = 'http://localhost:3001';

describe('getProposals API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock user data
  const teacherUser = { id: 1, role: 'TEACHER' };
  //const studentUser = { id: 2, role: 'STUDENT' };
  const otherUser = { id: 3, role: 'SOMETHING_ELSE' };

  // Mock response data
  const teacherProposals = [
    {
      title: 'Proposal 3',
      co_supervisor: undefined,
      keywords: 'design, architecture, development',        
      type: 'Type C',
      group: 'Group Z',
      description: 'Description for Proposal 3',
      knowledge: 'Knowledge about software engineering',    
      notes: 'Additional info',
      expiration: '2022-11-20',
      level: 'MSc',
      cds: 'CS101',
      thesist: null
    },
    {
      title: 'Proposal 6',
      co_supervisor: undefined,
      keywords: 'medicine, health, research',
      type: 'Type F',
      group: 'Group U',
      description: 'Description for Proposal 6',
      knowledge: 'Knowledge about medical research',        
      notes: 'Critical information',
      expiration: '2024-03-05',
      level: 'BSc',
      cds: 'BIO303',
      thesist: null
    },
    {
      title: 'Proposal 9',
      co_supervisor: undefined,
      keywords: 'linguistics, language, communication',     
      type: 'Type I',
      group: 'Group R',
      description: 'Description for Proposal 9',
      knowledge: 'Knowledge about linguistic studies',      
      notes: 'Latest info',
      expiration: '2024-07-22',
      level: 'BSc',
      cds: 'ENG202',
      thesist: null
    }
  ];

   // Mock fetch response for teacher
   const teacherResponse = {
    ok: true,
    json: async () => teacherProposals,
  };

  /* Mock fetch response for student
  const studentResponse = {
    ok: true,
    json: async () => studentProposals,
  };
  */

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get proposals for a teacher', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);

    const result = await API.getProposals(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1`);
    expect(result).toEqual(teacherProposals);
  });

  it('should return empty array for teacher when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getProposals(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1`);
    expect(result).toEqual([]);
  });

  /*
  it('should get applications for a student', async () => {
    fetch.mockResolvedValueOnce(studentResponse);

    const result = await API.getProposals(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/student/2`);
    expect(result).toEqual(studentProposals);
  });

  it('should return empty array for student when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getProposals(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/student/2`);
    expect(result).toEqual([]);
  })
  */

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getProposals(teacherUser)).rejects.toThrow(
      'Error on getting the applications: Error occurred'
    );
  });

  it('should throw an error for unknown role', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);

    await expect(API.getProposals(otherUser)).rejects.toThrow(
      'Error on getting the applications: Invalid role'
    );
  });
});

describe('getApplications API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock user data
  const teacherUser = { id: "d000001", role: 'TEACHER' };
  const studentUser = { id: "s200002", role: 'STUDENT' };
  const otherUser = { id: 3, role: 'SOMETHING_ELSE' };
  const reqheaderT = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  const reqheaderS = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'STUDENT'
  };


  // Mock response data
  const teacherApplications = [{ studentId: "s200001", proposal: 'Test Proposal', status: 'Pending' }];
  const studentApplications = [{ studentId: "s200002", proposal: 'Another Proposal', status: 'Approved' }];

  // Mock fetch response for teacher
  const teacherResponse = {
    ok: true,
    json: async () => teacherApplications,
  };

  // Mock fetch response for student
  const studentResponse = {
    ok: true,
    json: async () => studentApplications,
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get applications for a teacher', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);

    const result = await API.getApplications(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/teacher/d000001`, {"headers":reqheaderT});
    expect(result).toEqual(teacherApplications);
  });

  it('should return empty array for teacher when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getApplications(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/teacher/d000001`, {"headers":reqheaderT});
    expect(result).toEqual([]);
  });

  it('should get applications for a student', async () => {
    fetch.mockResolvedValueOnce(studentResponse);

    const result = await API.getApplications(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/student/s200002`, {"headers":reqheaderS});
    expect(result).toEqual(studentApplications);
  });

  it('should return empty array for student when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getApplications(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/student/s200002`, {"headers":reqheaderS});
    expect(result).toEqual([]);
  })

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getApplications(teacherUser)).rejects.toThrow(
      'Error on getting the applications: Error occurred'
    );
  });

  it('should throw an error for unknown role', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);

    await expect(API.getApplications(otherUser)).rejects.toThrow(
      'Error on getting the applications: Invalid role'
    );
  });
});

describe('getStudentData API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock user data

  // Mock response data
  const studentData = {
    studentId: 's200002',
    surname: 'Doe',
    name: 'John',
    email: 'john.doe@example.com',
    code_degree: 'CS101',
    career: [{}]
  };

  // Mock fetch response for successful request
  const successResponseE = {
    ok: true,
    json: async () => studentData,
  };
  // Mock fetch response for successful request
  const successResponse = {
    ok: true,
    json: async () => {
      const sdNE = studentData;
      sdNE.career = [
        {
          code_c: 'COURSE101',
          title_c: 'Introduction to Programming',
          cfu: 5,
          grade: '30',
          date: '2022-05-15'
        },
        {
          code_c: 'COURSE202',
          title_c: 'Data Structures',
          cfu: 6,
          grade: '27',
          date: '2023-01-20'
        },
        {
          code_c: 'COURSE404',
          title_c: 'Algorithms',
          cfu: 6,
          grade: 'B+',
          date: '2022-08-25'
        }
      ];
      return sdNE;
    }
  };
  const reqheaderT = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };
  const reqheaderS = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'STUDENT'
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get student data for a valid request with empty career', async () => {
    const proposalId = "Proposal 1";
    fetch.mockResolvedValueOnce(successResponseE);

    const result = await API.getStudentData(proposalId.trim(' '), studentData.studentId);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/application/Proposal 1/s200002`, {"headers":reqheaderT});
    expect(result).toEqual(studentData);
  });

  it('should get student data for a valid request with a non-empty career', async () => {
    const proposalId = "Proposal 1";
    const mockCareer = [{
        code_c: 'COURSE101',
        title_c: 'Introduction to Programming',
        cfu: 5,
        grade: '30',
        date: '2022-05-15'
      },{
        code_c: 'COURSE202',
        title_c: 'Data Structures',
        cfu: 6,
        grade: '27',
        date: '2023-01-20'
      },{
        code_c: 'COURSE404',
        title_c: 'Algorithms',
        cfu: 6,
        grade: 'B+',
        date: '2022-08-25'
      }
    ]
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.getStudentData(proposalId.trim(' '), studentData.studentId);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/application/Proposal 1/s200002`, {"headers":reqheaderT});
    expect(result.career).toEqual(mockCareer);
  });

  it('should throw an error on failed request', async () => {
    const proposalId = "proposal F";
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getStudentData(proposalId, -1)).rejects.toThrow(
      'Error on getting the studentsData: Error occurred'
    );
  });
});

describe('updateApplicationStatus API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });
  
  // Mock response data
  const successResponse = {
    ok: true,
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    status: 400,
  };

  it('should update application status to Accepted for a teacher', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.updateApplicationStatus("proposal123", "student456", true);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/application/proposal123/student456`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ROLE': 'TEACHER',
      },
      body: JSON.stringify({
        'status': 'Accepted',
      }),
    });
    expect(result).toEqual({ ok: true });
  });

  it('should update application status to Rejected for a teacher', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.updateApplicationStatus("proposal789", "student101", false);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/application/proposal789/student101`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ROLE': 'TEACHER',
      },
      body: JSON.stringify({
        'status': 'Rejected',
      }),
    });
    expect(result).toEqual({ ok: true });
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.updateApplicationStatus("proposal123", "student456", true)).rejects.toThrow(
      'HTTP error! status: 400'
    );
  });
});
