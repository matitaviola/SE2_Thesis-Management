const { getStudentData, getCarreerByStudent } = require('../DB/students-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
  const mockedDB = {
    get: jest.fn(),
    all: jest.fn()
  };
  return { db: mockedDB };
});

describe('getStudentData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no student data is found', async () => {
    const studentId = 's200000'; 
    const expectedSql = 'SELECT * FROM STUDENT WHERE ID=?';
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, undefined);
    });

    const result = await getStudentData(studentId);
    expect(result).toEqual({});
  });

  it('should resolve with student data when it is found', async () => {
    const studentId = "s200001";
    const expectedSql = 'SELECT * FROM STUDENT WHERE ID=?';
    const mockedRow = {
      ID: studentId,
      SURNAME: 'Doe',
      NAME: 'John',
      GENDER: 'Male',
      NATIONALITY: 'US',
      EMAIL: 'john.doe@example.com',
      CODE_DEGREE: 'CS101',
      ENROLLMENT_YEAR: 2022
    };
    const expectedStudentData = {
      studentId: mockedRow.ID,
      surname: mockedRow.SURNAME,
      name: mockedRow.NAME,
      gender: mockedRow.GENDER,
      nationality: mockedRow.NATIONALITY,
      email: mockedRow.EMAIL,
      code_degree: mockedRow.CODE_DEGREE,
      enrollment: mockedRow.ENROLLMENT_YEAR
    };

    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRow);
    });

    const result = await getStudentData(studentId);
    expect(result).toEqual(expectedStudentData);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const studentId = "s200003";
    const expectedSql = 'SELECT * FROM STUDENT WHERE ID=?';
    const expectedError = 'Database error occurred';
    db.get.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(getStudentData(studentId)).rejects.toEqual(expectedError);
  });
});

describe('getCarreerByStudent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with an empty object when no career data is found for a student', async () => {
    const studentId = "s200001";
    const expectedSql = 'SELECT * FROM CAREER WHERE ID=?';
    const mockedRows = [];
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    const result = await getCarreerByStudent(studentId);
    expect(result).toEqual({});
  });

  it('should resolve with an array of career data when it is found for a student', async () => {
    const studentId = "200002";
    const expectedSql = 'SELECT * FROM CAREER WHERE ID=?';
    const mockedRows = [
      { COD_COURSE: 'C101', TITLE_COURSE: 'Introduction to Computer Science', CFU: 6, GRADE: 'A', DATE: '2023-01-01' },
      { COD_COURSE: 'M201', TITLE_COURSE: 'Mathematics for Computer Science', CFU: 8, GRADE: 'B', DATE: '2023-02-01' }
    ];
    const expectedCareerData = mockedRows.map(r => ({
      code_c: r.COD_COURSE,
      title_c: r.TITLE_COURSE,
      cfu: r.CFU,
      grade: r.GRADE,
      date: r.DATE
    }));

    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(null, mockedRows);
    });

    const result = await getCarreerByStudent(studentId);
    expect(result).toEqual(expectedCareerData);
  });

  it('should reject with an error if an error occurs during database retrieval', async () => {
    const studentId = "2000003"; 
    const expectedSql = 'SELECT * FROM CAREER WHERE ID=?';
    const expectedError = 'Database error occurred';
    db.all.mockImplementation((sql, params, callback) => {
      expect(sql).toBe(expectedSql);
      expect(params).toEqual([studentId]);
      callback(expectedError, null);
    });

    await expect(getCarreerByStudent(studentId)).rejects.toEqual(expectedError);
  });
});
