import API from '../src/API';
const SERVER_URL = 'http://localhost:3001';
import axios from 'axios';

describe('getProposals API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });


  const reqData = { credentials: 'include'};

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
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1`, reqData);
    expect(result).toEqual(teacherProposals);
  });

  it('should return empty array for teacher when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getProposals(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1`, reqData);
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
  const reqData = { credentials: 'include'};


  // Mock response data
  const teacherApplications = [{ id:1, studentId: "s200001", proposal:1, title: 'Test Proposal', status: 'Pending' }];
  const studentApplications = [{ id:1, studentId: "s200002", proposal:2, title: 'Another Proposal', status: 'Approved' }];

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
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/teacher/d000001`, reqData);
    expect(result).toEqual([{ id:1, studentId: "s200001", proposal_id:1, proposal: 'Test Proposal', status: 'Pending' }]);
  });

  it('should return empty array for teacher when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getApplications(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/teacher/d000001`, reqData);
    expect(result).toEqual([]);
  });

  it('should get applications for a student', async () => {
    fetch.mockResolvedValueOnce(studentResponse);

    const result = await API.getApplications(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/student/s200002`, reqData);
    expect(result).toEqual([{ id:1, studentId: "s200002", proposal_id:2, proposal: 'Another Proposal', status: 'Approved' }]);
  });

  it('should return empty array for student when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getApplications(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/student/s200002`, reqData);
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
  const reqData = { credentials: 'include'}
  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get student data for a valid request with empty career', async () => {
    const proposalId = "Proposal 1";
    fetch.mockResolvedValueOnce(successResponseE);

    const result = await API.getStudentData(proposalId.trim(' '), studentData.studentId);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/application/Proposal 1/s200002`, reqData);
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
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/application/Proposal 1/s200002`, reqData);
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

describe('getAllSupervisorsList API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock user data
  const teacherUser = { id: 1, role: 'STUDENT' };
  const otherUser = { id: 3, role: 'SOMETHING_ELSE' };

  // Mock response data
  const coSupervisors = [
    { id: 101, name: 'CoSupervisor 1', department: 'CS', group: 'Group X' },
    { id: 102, name: 'CoSupervisor 2', department: 'ENG', group: 'Group Y' },
  ];

  // Mock fetch response for co-supervisors
  const coSupervisorsResponse = {
    ok: true,
    json: async () => coSupervisors,
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get co-supervisors for a teacher', async () => {
    fetch.mockResolvedValueOnce(coSupervisorsResponse);

    const result = await API.getAllSupervisorsList(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/cosupervisors`, { credentials: 'include' });
    expect(result).toEqual(coSupervisors);
  });

  it('should return empty array for teacher when no co-supervisors are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getAllSupervisorsList(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/cosupervisors`, { credentials: 'include' });
    expect(result).toEqual([]);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getAllSupervisorsList(teacherUser)).rejects.toThrow(
      'Error on getting the cosupervisors list: Error occurred'
    );
  });

  it('should throw an error for unknown role', async () => {
    fetch.mockResolvedValueOnce(coSupervisorsResponse);

    await expect(API.getAllSupervisorsList(otherUser)).rejects.toThrow(
      'Error on getting the professors list: Invalid role'
    );
  });
});

describe('getCoSupervisorsList API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock user data
  const teacherUser = { id: 1, role: 'TEACHER' };
  const otherUser = { id: 3, role: 'SOMETHING_ELSE' };

  // Mock response data
  const coSupervisors = [
    { id: 101, name: 'CoSupervisor 1', department: 'CS', group: 'Group X' },
    { id: 102, name: 'CoSupervisor 2', department: 'ENG', group: 'Group Y' },
  ];

  // Mock fetch response for co-supervisors
  const coSupervisorsResponse = {
    ok: true,
    json: async () => coSupervisors,
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    json: async () => 'Error occurred',
  };

  it('should get co-supervisors for a teacher', async () => {
    fetch.mockResolvedValueOnce(coSupervisorsResponse);

    const result = await API.getCoSupervisorsList(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/cosupervisors/1`, { credentials: 'include' });
    expect(result).toEqual(coSupervisors);
  });

  it('should return empty array for teacher when no co-supervisors are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getCoSupervisorsList(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/cosupervisors/1`, { credentials: 'include' });
    expect(result).toEqual([]);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getCoSupervisorsList(teacherUser)).rejects.toThrow(
      'Error on getting the cosupervisors list: Error occurred'
    );
  });

  it('should throw an error for unknown role', async () => {
    fetch.mockResolvedValueOnce(coSupervisorsResponse);

    await expect(API.getCoSupervisorsList(otherUser)).rejects.toThrow(
      'Error on getting the cosupervisors list: Invalid role'
    );
  });
});

describe('getCoSupervisorByProposal API', () => {
  const proposalId = 123; // Replace with an actual proposal ID

  it('should get co-supervisors for a proposal', async () => {
    // Mock response data
    const coSupervisorData = ['Supervisor 1', 'Supervisor 2'];

    // Mock fetch response for co-supervisors
    const coSupervisorResponse = {
      ok: true,
      json: async () => coSupervisorData,
    };

    // Mock the fetch method to return the co-supervisor response
    fetch.mockResolvedValueOnce(coSupervisorResponse);

    const result = await API.getCoSupervisorByProposal(proposalId);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/${proposalId}/cosupervisors`, { credentials: 'include' });
    expect(result).toEqual(coSupervisorData);
  });

  it('should return an empty array for a proposal with no co-supervisors', async () => {
    // Mock an empty array response for co-supervisors
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getCoSupervisorByProposal(proposalId);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/${proposalId}/cosupervisors`, { credentials: 'include' });
    expect(result).toEqual([]);
  });

  it('should throw an error on failed request for co-supervisors', async () => {
    // Mock fetch error response
    const errorResponse = {
      ok: false,
      json: async () => 'Error occurred',
    };

    // Mock the fetch method to return an error response for co-supervisors
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getCoSupervisorByProposal(proposalId)).rejects.toThrow(
      'Error on getting the proposal: Error occurred'
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
      credentials: 'include',
      headers: {'Content-Type' : "application/json"},
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
      credentials: 'include',
      headers: {'Content-Type' : "application/json"},
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

describe('API Session/Logout functions', () => {
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
    status: 500,
    json: async () => {return {status: "unsuccessfulSessionResponse"}},
  };

  // Mock fetch response for successful logout
  const successfulLogoutResponse = {
    ok: true,
    status: 200,
    json: () => {return {status: 200}},
  };

  // Mock fetch response for unsuccessful logout
  const unsuccessfulLogoutResponse = {
    ok: false,
    status: 500,
    json: async () => {return {status: 500}},
  };

  it('should successfully get user info', async () => {
    fetch.mockResolvedValueOnce(successfulSessionResponse);

    const result = await API.getUserInfo();
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/session`, {
      credentials: 'include',
    });
    expect(result).toEqual({ id: 's000001', role: 'STUDENT' });
  });

  it('should return empty if teh user has yet to log in', async () => {
    fetch.mockResolvedValueOnce(emptySessionResponse);

    const result = await API.getUserInfo();
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/session`, {
      credentials: 'include',
    });
    expect(result).toEqual({});
  });

  it('should throw an error on unsuccessful session request', async () => {
    fetch.mockResolvedValueOnce(unsuccessfulSessionResponse);

    await expect(API.getUserInfo()).rejects.toThrow(
      'Session error! status: 401'
    );
  });

  it('should successfully log out', async () => {
    fetch.mockResolvedValueOnce(successfulLogoutResponse);

    const result = await API.logout();
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/logout`, {
      method: 'GET',
      credentials: 'include',
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

  const reqData = { credentials: 'include'};

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
  const proposalResponseReversed = {
    ok: true,
    json: async () => [...proposals.reverse()],
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
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}`, reqData);
    expect(result).toEqual(proposals);
  });

  it('should get proposals filtered by title', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {title: "3"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?title=3`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by supervisor', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {supervisor: "John"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?supervisor=John`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by co-supervisor', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {coSupervisor: "B"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?coSupervisor=B`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by keywords', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {keywords: "design"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?keywords=design`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by type', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {type: "C"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?type=C`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by groups', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {groups: "Z"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?groups=Z`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by description', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {description: "3"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?description=3`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by reqKnowledge', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {reqKnowledge: "engineering"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?reqKnowledge=engineering`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by notes', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {notes: "info"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?notes=info`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by expiration', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {expiration: "2022"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?expiration=2022`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by level', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {level: "BSc"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?level=BSc`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by degree', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {degree: "CS102"};

    const result = await API.getStudentProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?degree=CS102`, reqData);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals ordered by title', async () => {
    fetch.mockResolvedValueOnce(proposalResponse);
    const order = {field: 'title', direction: true};

    const result = await API.getStudentProposals(studentId, {}, order);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?ordField=title&dir=true`, reqData);
    expect(result[0]).toEqual(proposals[0]);
  });

  it('should get proposals ordered desc by title', async () => {
    fetch.mockResolvedValueOnce(proposalResponseReversed);
    const order = {field: 'title', direction: false};

    const result = await API.getStudentProposals(studentId, {}, order);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?ordField=title&dir=false`, reqData);
    expect(result[0]).toEqual(proposals[0]);
  });

  it('should return empty array when no proposal are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    const fakeId = 1;

    const result = await API.getStudentProposals(fakeId, {});
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${fakeId}`, reqData);
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
    json: async () => {return {error:'Error occurred'}},
  };

  it('should create a proposal successfully', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.createProposal(proposalData, teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type' : "application/json"},
      body: JSON.stringify(proposalData),
    });
    expect(result.ok).toBe(true);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);
  
    await expect(API.createProposal(proposalData, teacherUser)).rejects.toThrow(
      'Error occurred'
    );
  });
});

describe('deleteProposal function', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  const errorResponse = {
    ok: false,
    json: async () => 'Error deleting the proposal',
  };
  const successResponse = {
    ok: true,
    json: async () => null,
  };

  it('should delete a proposal and return successfully', async () => {
    // Arrange
    const proposalId = '123';
    const expectedUrl = SERVER_URL+`/api/proposals/${proposalId}`;

    // Mock the fetch function
    fetch.mockResolvedValueOnce(successResponse);

    // Act
    await API.deleteProposal(proposalId);

    // Assert
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'DELETE',
      credentials: 'include',
    });
  });

  it('should throw an error when the delete request fails', async () => {
    // Arrange
    const proposalId = '123';
    const expectedUrl = SERVER_URL+`/api/proposals/${proposalId}`;
    const errorMessage = 'Error deleting the proposal';

    // Mock the fetch function to simulate a failure
    fetch.mockResolvedValueOnce(errorResponse);

    // Act & Assert
    await expect(API.deleteProposal(proposalId)).rejects.toThrowError(
      `Error on deleting the proposal: ${errorMessage}`
    );

    // Assert
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'DELETE',
      credentials: 'include',
    });
  });
});

describe('updateProposal API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  const teacherUser = { id: 1, role: 'TEACHER' };

  const proposalData = { id: 1, studentId: 1, proposal: 'Test Proposal', status: 'Pending' };

  const successResponse = {
    ok: true,
    json: async () => null,
  };

  const errorResponse = {
    ok: false,
    json: async () => {return {error:'Error occurred'}},
  };

  it('should create a proposal successfully', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.updateProposal(proposalData, teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/${proposalData.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {'Content-Type' : "application/json"},
      body: JSON.stringify(proposalData),
    });
    expect(result.ok).toBe(true);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);
  
    await expect(API.updateProposal(proposalData, teacherUser)).rejects.toThrow(
      'Error occurred'
    );
  });
});

describe('addApplication API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock response data
  const successResponse = {
    data: {success: true},
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    status: 400,
  };

  it('should add an application successfully', async () => {
    const proposalId = 'proposal123';
    const studentId = 'student456';
    const file = null;
    const appendMock = jest.fn();
    global.FormData = jest.fn(() => ({
      append: appendMock,
    }));
    const reqheader = {
      'Content-Type':'multipart/form-data',
    };

    axios.post = jest.fn().mockResolvedValueOnce(successResponse);

    const result = await API.addApplication(file, proposalId, studentId);

    expect(axios.post).toHaveBeenCalledWith(
      `${SERVER_URL}/api/applications`, 
      expect.objectContaining({
        append: appendMock,
      }), 
      {
        headers: reqheader,
        withCredentials: true
      });

    expect(result).toEqual({ ok: true});
  });

  it('should throw an error on failed request', async () => {
    const proposalId = 'proposal789';
    const studentId = 'student101';
    const file = {};
    const formData = new FormData();

    formData.append("proposalId", proposalId);
    formData.append("studentId", studentId);
    formData.append("file", file);

    axios.post = jest.fn().mockResolvedValueOnce(errorResponse);

    await expect(API.addApplication(file, proposalId, studentId)).rejects.toThrow(
      'HTTP error! status: 400'
    );
  });
});

describe('getDegrees API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock response data
  const successResponse = [
    { id: '1', title: 'Degree 1' },
    { id: '2', title: 'Degree 2' },
  ];

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    status: 400,
  };

  it('should fetch degrees successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => successResponse,
    });

    const result = await API.getDegrees();

    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/degrees`, {
      method: 'GET',
      credentials: 'include',
    });

    expect(result).toEqual(successResponse);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getDegrees()).rejects.toThrow('HTTP error! status: 400');
  });
});

describe('getStudents API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock response data
  const successResponse = [
    { id: 's200001', name: 'Alice', surname: 'Johnson' },
    { id: 's200002', name: 'Bob', surname: 'Smith' },
  ];

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    status: 400,
    json: async () => ('Error occurred'),
  };

  it('should fetch students successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => successResponse,
    });

    const result = await API.getStudents();

    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/students`, {
      credentials: 'include',
    });

    expect(result).toEqual(successResponse);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getStudents()).rejects.toThrow('Error on getting the students: Error occurred');
  });
});

describe('getSingleProposal API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  const proposalId = '123';
  const reqData = { credentials: 'include' };

  // Mock response data
  const successResponse = {
    ok: true,
    json: async () => ({
      id: proposalId,
      title: 'Test Proposal',
      description: 'This is a test proposal',
    }),
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    status: 404,
    json: async () => 'Proposal not found',
  };

  it('should get a single proposal successfully', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.getSingleProposal(proposalId);
    
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/${proposalId}`, reqData);
    expect(result).toEqual({
      id: proposalId,
      title: 'Test Proposal',
      description: 'This is a test proposal',
    });
  });

  it('should throw an error when the proposal is not found', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getSingleProposal(proposalId)).rejects.toThrow(
      'Error on getting the proposal: Proposal not found'
    );
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => 'Server error',
    });

    await expect(API.getSingleProposal(proposalId)).rejects.toThrow(
      'Error on getting the proposal: Server error'
    );
  });
});

describe('archiveProposal API', () => {
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

  const proposalId = '123';

  it('should archive a proposal', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.archiveProposal(proposalId);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/123/archive`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {'Content-Type' : "application/json"},
    });
    expect(result).toEqual({ ok: true });
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.archiveProposal(proposalId)).rejects.toThrow(
      'HTTP error! status: 400'
    );
  });
});

describe('get resumee API', () => {

  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
    URL.createObjectURL = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });
  
  // Mock response data
  const successResponse = {
    ok: true,
    blob : async () => { return new Blob(["testing"], { type: "application/pdf" });}
  };

  // Mock fetch error response
  const errorResponse = {
    ok: false,
    status: 500,
  };

  const url = 'example.com'
  const applicationId = '123';

  it('should respond with ok if successful response', async () => {
    fetch.mockResolvedValueOnce(successResponse);
    URL.createObjectURL.mockResolvedValueOnce(url);
    const openSpy =  jest.spyOn(window, "open");
    //used to remove the error appearing as 'window.open not implemented'
    openSpy.mockImplementationOnce(() => {});

    await API.getResumee(applicationId);
    expect(fetch).toHaveBeenCalledWith(SERVER_URL + `/api/files/resumees/${applicationId}`, {
      method: 'GET',
      credentials: 'include',
    });

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(url, "_blank");

  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getResumee(applicationId)).rejects.toThrow(
      'HTTP error! status: 500'
    );
  });
});

describe('boardTardis API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });
  const destination = Date("19/10/2000");

  const successResponse = {
    ok: true,
    json: async () => ({success:true})
  };
  const errorResponse1 = {
    ok: false,
    json: async () => ({success:false})
  };
  const errorResponse = {
    ok: false,
    json: async () => ({success:false})
  };

  it('should create a proposal successfully', async () => {
    fetch.mockResolvedValueOnce(successResponse);

    const result = await API.boardTardis(destination);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/timetravel`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {'Content-Type' : "application/json"},
      body: JSON.stringify({'destination':destination}),
    });
  });

  it('should throw an error on failed request - generic error', async () => {
    fetch.mockResolvedValueOnce(errorResponse);
  
    await expect(API.boardTardis(destination)).rejects.toThrow(
      'Something went wrong during the TARDIS landing'
    );
  });
});

describe('getRequests API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  const reqData = { credentials: 'include' };

  // Mock user data
  const teacherUser = { id: 1, role: 'TEACHER' };
  const clerkUser = { id: 2, role: 'CLERK' };
  const studentUser = { id: 3, role: 'STUDENT' };

  // Mock response data
  const requestsData = [
    {
      id: 1,
      title: 'Request 1',
      status: 'Pending',
      // other fields...
    },
    {
      id: 2,
      title: 'Request 2',
      status: 'Approved',
      // other fields...
    },
  ];

  const requestsResponse = {
    ok: true,
    json: async () => requestsData,
  };

  it('should get requests for a teacher', async () => {
    fetch.mockResolvedValueOnce(requestsResponse);

    const result = await API.getRequests(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/requests/teacher/1`, reqData);
    expect(result).toEqual(requestsData);
  });

  it('should get requests for a clerk', async () => {
    fetch.mockResolvedValueOnce(requestsResponse);

    const result = await API.getRequests(clerkUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/requests/`, reqData);
    expect(result).toEqual(requestsData);
  });

  it('should throw an error for unknown role', async () => {
    fetch.mockResolvedValueOnce(requestsResponse);

    await expect(API.getRequests(studentUser)).rejects.toThrow(
      'Error on getting the requests: Invalid role'
    );
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => 'Error occurred' });

    await expect(API.getRequests(teacherUser)).rejects.toThrow(
      'Error on getting the requests: Error occurred'
    );
  });
});

describe('getStudentActiveRequest API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  const reqData = { credentials: 'include' };

  // Mock user data
  const studentId = 3;

  // Mock response data
  const studentActiveRequestData = {
    id: 1,
    title: 'Student Active Request',
    status: 'Active',
    // other fields...
  };

  const studentActiveRequestResponse = {
    ok: true,
    json: async () => studentActiveRequestData,
  };

  it('should get the active request for a student', async () => {
    fetch.mockResolvedValueOnce(studentActiveRequestResponse);

    const result = await API.getStudentActiveRequest(studentId);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/requests/student/3`, reqData);
    expect(result).toEqual(studentActiveRequestData);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => 'Error occurred' });

    await expect(API.getStudentActiveRequest(studentId)).rejects.toThrow(
      'Error on getting the requests: Error occurred'
    );
  });
});

describe('createRequest API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  const reqData = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };

  const proposal = {
    // Your proposal data
  };

  const createRequestResponse = {
    ok: true,
    json: async () => ({ ok: true }),
  };

  it('should create a request successfully', async () => {
    fetch.mockResolvedValueOnce(createRequestResponse);

    const result = await API.createRequest(proposal);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/requests`, {
      method: 'POST',
      ...reqData,
      body: JSON.stringify({ reqData: proposal }),
    });
    expect(result).toEqual({ ok: true });
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Error occurred' }) });

    await expect(API.createRequest(proposal)).rejects.toThrow('Error occurred');
  });
});

describe('updateRequest API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  const reqData = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };

  const request = {
    id: 1,
    // Your request data
  };

  const updateRequestResponse = {
    ok: true,
    json: async () => ({ ok: true }),
  };

  it('should update a request successfully', async () => {
    fetch.mockResolvedValueOnce(updateRequestResponse);

    const result = await API.updateRequest(request);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/requests/${request.id}`, {
      method: 'PATCH',
      ...reqData,
      body: JSON.stringify({ reqData: request }),
    });
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Error occurred' }) });

    await expect(API.updateRequest(request)).rejects.toThrow('Something went wrong while updating the request');
  });
});

describe('getArchivedProposals API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });


  const reqData = { credentials: 'include'};

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

  it('should throw an error if the user is not a teacher', async () => {
    // Call the function under test
    await expect(API.getArchivedProposals({ user: 'STUDENT' })).rejects.toThrowError(
      'Error on getting the proposals: Invalid role'
    );
  });

  it('should get proposals for a teacher', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);

    const result = await API.getArchivedProposals(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1/archived`, reqData);
    expect(result).toEqual(teacherProposals);
  });

  it('should get filtered proposals for a teacher', async () => {
    fetch.mockResolvedValueOnce(teacherResponse);
    const filter='value'
    const result = await API.getArchivedProposals(teacherUser, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1/archived?filter=${filter}`, reqData);
    expect(result).toEqual(teacherProposals);
  });

  it('should return empty array for teacher when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getArchivedProposals(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/teacher/1/archived`, reqData);
    expect(result).toEqual([]);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500, // Set an appropriate status code for a failed response
      json: () => Promise.resolve('Error occurred'), // Simulate the response JSON
    });
  
    // Make the function call and expect it to throw an error
    await expect(API.getArchivedProposals(teacherUser)).rejects.toThrow(
      'Error on getting the proposals: Error occurred'
    );
  });

});
