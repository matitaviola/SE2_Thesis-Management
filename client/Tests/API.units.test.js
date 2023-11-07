// Assume getApplications is defined in a file named 'api.js'
import API from '../src/API';
const SERVER_URL = 'http://localhost:3001';

//#region Applications
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
      { student: 'Alice', proposal: 'Proposal 1', status: 'Pending' },
      { student: 'Bob', proposal: 'Proposal 2', status: 'Approved' },
    ];

    // Mocking a successful response from fetch
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => applicationsData,
    });

    const result = await API.getApplications(professorId);

    expect(global.fetch).toHaveBeenCalledWith(SERVER_URL+'/api/applications/123');
    expect(result).toEqual([
      { student: 'Alice', proposal: 'Proposal 1', status: 'Pending' },
      { student: 'Bob', proposal: 'Proposal 2', status: 'Approved' },
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

    expect(global.fetch).toHaveBeenCalledWith(SERVER_URL+'/api/applications/123');
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
