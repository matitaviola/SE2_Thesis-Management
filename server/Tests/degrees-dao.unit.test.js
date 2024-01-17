const { getAll, getDegreeByCode } = require('../DB/degrees-dao');
const { db } = require('../DB/db');

jest.mock('../DB/db', () => {
    const mockedDB = {
      all: jest.fn(),
      get: jest.fn()
    };
    return { db: mockedDB };
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('getDegreeByCode', () => {
    test('should reject with an error when no matching degree is found', async () => {
        db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
        });
        await expect(getDegreeByCode('XYZ')).rejects.toThrow(new Error(`No such degree with code:XYZ`));
        expect(db.all).toHaveBeenCalledWith('SELECT * FROM DEGREE WHERE COD_DEGREE=?', ['XYZ'], expect.any(Function));
    });

    test('should resolve with the degree when a match is found', async () => {
        const mockDegree = { COD_DEGREE: 'ABC'};
        db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, [mockDegree]);
        });

        const result = await getDegreeByCode('ABC');
        expect(result).toEqual([mockDegree]);
        expect(db.all).toHaveBeenCalledWith('SELECT * FROM DEGREE WHERE COD_DEGREE=?', ['ABC'], expect.any(Function));
    });

    test('should reject with an error if the database query fails', async () => {
        const error = new Error('Database error');
        db.all.mockImplementationOnce((sql, params, callback) => {
        callback(error, null);
        });

        await expect(getDegreeByCode('ABC')).rejects.toThrow(error);
        expect(db.all).toHaveBeenCalledWith('SELECT * FROM DEGREE WHERE COD_DEGREE=?', ['ABC'], expect.any(Function));
    });
});

describe('getAll', () => {
    test('should resolve with empty array when no degrees are found', async () => {
        db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
        });

        const result = await getAll();
        expect(result).toEqual([]);
        expect(db.all).toHaveBeenCalledWith('SELECT * FROM DEGREE', [], expect.any(Function));
    });

    test('should resolve with the degrees when matches are found', async () => {
        const mockDegrees = [{ COD_DEGREE: 'ABC'}];
        db.all.mockImplementationOnce((sql, params, callback) => {
        callback(null, mockDegrees);
        });

        const result = await getAll();
        expect(result).toEqual(mockDegrees);
        expect(db.all).toHaveBeenCalledWith('SELECT * FROM DEGREE', [], expect.any(Function));
    });

    test('should reject with an error if the database query fails', async () => {
        const error = new Error('Database error');
        db.all.mockImplementationOnce((sql, params, callback) => {
        callback(error, null);
        });

        await expect(getAll()).rejects.toThrow(error);
        expect(db.all).toHaveBeenCalledWith('SELECT * FROM DEGREE', [], expect.any(Function));
    });
});
