// Assume getApplications is defined in a file named 'api.js'
import API from '../src/API';
const SERVER_URL = 'http://localhost:3001';
/*
//#region Applications
const professor = {role:'TEACHER', st}
describe('getApplications function', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  it('fetches applications successfully and returns the mapped data - found somenthing', async () => {
    const professorId = 123;
    const applicationsData = [
      { studentId: 's200000', proposal: 'Proposal 1', status: 'Pending' },
      { studentId: 's300000', proposal: 'Proposal 2', status: 'Approved' },
    ];

    // Mocking a successful response from fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => applicationsData,
    });

    const result = await API.getApplications(professorId);

    expect(global.fetch).toHaveBeenCalledWith(SERVER_URL+'/api/applications/teacher/123');
    expect(result).toEqual([
      { studentId: 's200000', proposal: 'Proposal 1', status: 'Pending' },
      { studentId: 's300000', proposal: 'Proposal 2', status: 'Approved' },
    ]);
  });

  it('fetches applications successfully and returns the mapped data - found nothing', async () => {
    const professorId = 123;
    const applicationsData = [];

    // Mocking a successful response from fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => applicationsData,
    });

    const result = await API.getApplications(professorId);

    expect(global.fetch).toHaveBeenCalledWith(SERVER_URL+'/api/applications/teacher/123');
    expect(result).toEqual([
    ]);
  });

  it('handles errors from fetch', async () => {
    const professorId = 123;

    // Mocking an error response from fetch
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => 'Some error message',
    });

    await expect(API.getApplications(professorId)).rejects.toThrow(
      'Error on getting the applications: Some error message'
    );
  });
});

//#endregion
*/

describe('getApplications API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

  // Mock user data
  const teacherUser = { id: 1, role: 'TEACHER' };
  const studentUser = { id: 2, role: 'STUDENT' };
  const otherUser = { id: 3, role: 'SOMETHING_ELSE' };

  // Mock response data
  const teacherApplications = [{ studentId: 1, proposal: 'Test Proposal', status: 'Pending' }];
  const studentApplications = [{ studentId: 2, proposal: 'Another Proposal', status: 'Approved' }];

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
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/teacher/1`);
    expect(result).toEqual(teacherApplications);
  });

  it('should return empty array for teacher when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getApplications(teacherUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/teacher/1`);
    expect(result).toEqual([]);
  });

  it('should get applications for a student', async () => {
    fetch.mockResolvedValueOnce(studentResponse);

    const result = await API.getApplications(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/student/2`);
    expect(result).toEqual(studentApplications);
  });

  it('should return empty array for student when no applications are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await API.getApplications(studentUser);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/applications/student/2`);
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


describe('searchProposal API', () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // Mocking fetch globally
  });

  afterEach(() => {
    global.fetch.mockRestore(); // Restore fetch after each test
  });

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

    const result = await API.getProposals(studentId, noFilter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}`);
    expect(result).toEqual(proposals);
  });

  it('should get proposals filtered by title', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {title: "3"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?title=3`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by supervisor', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {supervisor: "John"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?supervisor=John`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by co-supervisor', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {coSupervisor: "B"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?coSupervisor=B`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by keywords', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {keywords: "design"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?keywords=design`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by type', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {type: "C"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?type=C`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by groups', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {groups: "Z"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?groups=Z`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by description', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {description: "3"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?description=3`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by reqKnowledge', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {reqKnowledge: "engineering"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?reqKnowledge=engineering`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by notes', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {notes: "info"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?notes=info`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by expiration', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {expiration: "2022"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?expiration=2022`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by level', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {level: "BSc"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?level=BSc`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should get proposals filtered by degree', async () => {
    fetch.mockResolvedValueOnce(proposalResponseFiltered);
    const filter = {degree: "CS102"};

    const result = await API.getProposals(studentId, filter);
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${studentId}?degree=CS102`);
    expect(result).toEqual([proposals[0]]);
  });

  it('should return empty array when no proposal are found', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    const fakeId = 1;

    const result = await API.getProposals(fakeId, {});
    expect(fetch).toHaveBeenCalledWith(`${SERVER_URL}/api/proposals/students/${fakeId}`);
    expect(result).toEqual([]);
  });

  it('should throw an error on failed request', async () => {
    fetch.mockResolvedValueOnce(errorResponse);

    await expect(API.getProposals(1, {})).rejects.toThrow(
      'Error on getting the proposals: Error occurred'
    );
  });
});