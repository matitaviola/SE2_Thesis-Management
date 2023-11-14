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


  const reqheaderT = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'TEACHER'
  };

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

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get proposals for a teacher', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);

    const result = await API.getProposals(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1`, {"headers":reqheaderT});
    expect(result).toEqual(teacherProposals);
  });

  it('should return empty array for teacher when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getProposals(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1`, {"headers":reqheaderT});
    expect(result).toEqual([]);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getProposals(teacherUser)).rejects.toThrow(
      'Error on getting the proposals: Error occurred'
    );
  });

  it('should throw an error for unknown role', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);

    await expect(API.getProposals(otherUser)).rejects.toThrow(
      'Error on getting the proposals: Invalid role'
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

describe('API Login functions', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  const credentials = {
    username: 'testuser@example.com',
    password: 'testpassword',
  };

  // Mock fetch response for successful login
  const successfulLoginResponse = {
    ok: true,
    json: async () => ({ id: 's000001', role: 'STUDENT' }),
  };

  // Mock fetch response for unsuccessful login
  const unsuccessfulLoginResponse = {
    ok: false,
    status: 401,
  };

  // Mock fetch response for successful session request
  const successfulSessionResponse = {
    ok: true,
    json: async () => ({ id: 's000001', role: 'STUDENT' }),
  };

  // Mock fetch to user not yet logged in
  const emptySessionResponse = {
    ok: true,
    json: async () => ({}),
  };

  // Mock fetch response for unsuccessful session request
  const unsuccessfulSessionResponse = {
    ok: false,
    status: 401,
  };

  // Mock fetch response for successful logout
  const successfulLogoutResponse = {
    ok: true,
  };

  // Mock fetch response for unsuccessful logout
  const unsuccessfulLogoutResponse = {
    ok: false,
    status: 500,
  };

  it('should successfully log in', async () => {
    fetch.mockResolvedValueOnce(successfulLoginResponse);

    const result = await API.login(credentials);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ROLE': 'LOGIN',
      },
      body: JSON.stringify({ credentials }),
    });
    expect(result).toEqual({ id: 's000001', role: 'STUDENT' });
  });

  it('should throw an error on unsuccessful login', async () => {
    fetch.mockResolvedValueOnce(unsuccessfulLoginResponse);

    await expect(API.login(credentials)).rejects.toThrow(
      'Login error! status: 401'
    );
  });

  it('should successfully get user info', async () => {
    fetch.mockResolvedValueOnce(successfulSessionResponse);

    const result = await API.getUserInfo();
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/login`, {
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ROLE': 'SESSION',
      },
    });
    expect(result).toEqual({ id: 's000001', role: 'STUDENT' });
  });

  it('should return false if teh user has yet to log in', async () => {
    fetch.mockResolvedValueOnce(emptySessionResponse);

    const result = await API.getUserInfo();
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/login`, {
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ROLE': 'SESSION',
      },
    });
    expect(result).toEqual(false);
  });

  it('should throw an error on unsuccessful session request', async () => {
    fetch.mockResolvedValueOnce(unsuccessfulSessionResponse);

    await expect(API.getUserInfo()).rejects.toThrow(
      'Login error! status: 401'
    );
  });

  it('should successfully log out', async () => {
    fetch.mockResolvedValueOnce(successfulLogoutResponse);

    const result = await API.logout();
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/login`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ROLE': 'LOGOUT',
      },
    });
    expect(result).toEqual({ success: true });
  });

  it('should throw an error on unsuccessful logout', async () => {
    fetch.mockResolvedValueOnce(unsuccessfulLogoutResponse);

    await expect(API.logout()).rejects.toThrow(
      'Logout error! status: 500'
    );
  });
});




describe('searchProposal API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  const reqheaderS = {
    'Content-Type':'application/json',
    'X-USER-ROLE': 'STUDENT'
  };

  const studentId = 's200000';
  const proposals = [{
    title: "Proposal 3",
    supervisorId: "d100003",
    supervisorName: "John",
    supervisorSurname: "Doe",
    coSupervisor: "Co-Supervisor B",
    keywords: "design, architecture, development",
    type: "Type C",
    groups: "Group Z",
    description: "Description for Proposal 3",
    reqKnowledge: "Knowledge about software engineering",
    notes: "Additional info",
    expiration: "2022-11-19T23:00:00.000Z",
    level: "BSc",
    cdsId: "CS102",
    cdsName: "Computer Science"
  },
  {
    title: "Proposal 4",
    supervisorId: "d100001",
    supervisorName: "John",
    supervisorSurname: "Doe",
    coSupervisor: "Co-Supervisor D",
    keywords: "networks, security, protocols",
    type: "Type D",
    groups: "Group W",
    description: "Description for Proposal 4",
    reqKnowledge: "Knowledge about cybersecurity",
    notes: "Important notes",
    expiration: "2023-06-29T22:00:00.000Z",
    level: "MSc",
    cdsId: "CS101",
    cdsName: "Computer Science"
    }];
  


  // Mock fetch response for teacher
  const proposalResponse = {
    ok: true,
    json: async () => proposals,
  };
  const proposalResponseFiltered = {
    ok: true,
    json: async () => [proposals[0]],
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get proposals with no filters', async () => {
    fetch.mockResolvedValueOnce(proposalResponse);
    const noFilter = {};

    const result = await API.getStudentProposals(studentId, noFilter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}`, {"headers":reqheaderS});
    expect(result).toEqual(proposals);
  });

  it('should get proposals filtered by title', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {title: "3"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?title=3`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by supervisor', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {supervisor: "John"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?supervisor=John`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by co-supervisor', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {coSupervisor: "B"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?coSupervisor=B`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by keywords', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {keywords: "design"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?keywords=design`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by type', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {type: "C"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?type=C`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by groups', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {groups: "Z"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?groups=Z`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by description', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {description: "3"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?description=3`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by reqKnowledge', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {reqKnowledge: "engineering"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?reqKnowledge=engineering`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by notes', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {notes: "info"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?notes=info`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by expiration', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {expiration: "2022"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?expiration=2022`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by level', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {level: "BSc"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?level=BSc`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by degree', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {degree: "CS102"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?degree=CS102`, {"headers":reqheaderS});
    expect(result).toEqual([proposals[0]]);
  });

  it('should return empty array when no proposal are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    const fakeId = 1;

    const result = await API.getStudentProposals(fakeId, {});
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${fakeId}`, {"headers":reqheaderS});
    expect(result).toEqual([]);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getStudentProposals(1, {})).rejects.toThrow(
      'Error on getting the proposals: Error occurred'
    );
  });
});

describe('createProposal API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  const teacherUser = { id: 1, role: 'TEACHER' };

  const proposalData = { studentId: 1, proposal: 'Test Proposal', status: 'Pending' };

  const successResponse = {
    ok: true,
    json: async () => null,
  };

  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should create a proposal successfully', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.createProposal(proposalData, teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-USER-ROLE': 'TEACHER' },
      body: JSON.stringify(proposalData),
    });
    expect(result).toBeNull();
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.createProposal(proposalData, teacherUser)).rejects.toEqual(
      'Error occurred'
    );
  });
});