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
