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
