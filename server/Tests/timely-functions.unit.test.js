const { timelyArchive, timelyDeArchive, timelyExpiringEmails } = require('../utils/timely-functions');
const { db } = require('../DB/db');
const propDao = require('../DB/proposals-dao'); // Update the path accordingly
const mailServer = require('../utils/mail-server');
const dayjs = require('dayjs');

jest.mock('../DB/db', () => {
    const mockedDB = {
        all: jest.fn(),
    };
    return { db: mockedDB };
});

jest.mock('../DB/proposals-dao', () => ({
    archiveProposalWithoutApplication: jest.fn(),
    deArchiveProposal: jest.fn(),
}));

jest.mock('../utils/mail-server', () => ({
   sendMail: jest.fn(),
}));

describe('timelyArchive', () => {
    beforeEach(() => {
        // Clear mock data before each test
        db.all.mockReset();
        propDao.archiveProposalWithoutApplication.mockReset();
    });

    it('should archive proposals when there are expired ones', async () => {
        // Mock database response
        const mockIds = [{ Id: 1 }, { Id: 2 }];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        // Mock archiveProposalWithoutApplication response
        propDao.archiveProposalWithoutApplication.mockResolvedValueOnce({ success: true });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyArchive(date);

        expect(result).toEqual({ travelled: true });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(propDao.archiveProposalWithoutApplication).toHaveBeenCalledTimes(2);
        expect(propDao.archiveProposalWithoutApplication).toHaveBeenCalledWith(1, 'Expired');
        expect(propDao.archiveProposalWithoutApplication).toHaveBeenCalledWith(2, 'Expired');
    });

    it('should return with success if it founds no proposal', async () => {
        // Mock database response
        const mockIds = [];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyArchive(date);

        expect(result).toEqual({ travelled: true });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(propDao.archiveProposalWithoutApplication).toHaveBeenCalledTimes(0);
    });

    it('should handle errors during archival', async () => {
        // Mock database response
        const mockIds = [{ Id: 1 }, { Id: 2 }];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        // Mock archiveProposalWithoutApplication error response
        const error = new Error('Archive error');
        propDao.archiveProposalWithoutApplication.mockRejectedValueOnce(error);

        const date = dayjs(); // Use the appropriate date

        const result = await timelyArchive(date);

        expect(result).toEqual({ error: error.toString()+' when trying to read proposal with id: '+1 });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(propDao.archiveProposalWithoutApplication).toHaveBeenCalledTimes(1);
        expect(propDao.archiveProposalWithoutApplication).toHaveBeenCalledWith(1, 'Expired');
    });

    it('should handle database query error', async () => {
        // Mock database query error
        const error = new Error('Database error');
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(error);
        });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyArchive(date);

        expect(result).toEqual({ error: 'Time Travel forward error: '+error.toString()});
    });

});

describe('timelyDeArchive', () => {
    beforeEach(() => {
        // Clear mock data before each test
        db.all.mockReset();
        propDao.deArchiveProposal.mockReset();
    });

    it('should de-archive proposals when there are expired ones', async () => {
        // Mock database response
        const mockIds = [{ Id: 1 }, { Id: 2 }];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        // Mock archiveProposalWithoutApplication response
        propDao.deArchiveProposal.mockResolvedValueOnce({ success: true });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyDeArchive(date);

        expect(result).toEqual({ backtravelled: true });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(propDao.deArchiveProposal).toHaveBeenCalledTimes(2);
        expect(propDao.deArchiveProposal).toHaveBeenCalledWith(1);
        expect(propDao.deArchiveProposal).toHaveBeenCalledWith(2);
    });

    it('should return with success if it founds no proposal', async () => {
        // Mock database response
        const mockIds = [];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyDeArchive(date);

        expect(result).toEqual({ backtravelled: true });

        // Ensure the deArchiveProposal was called for each ID
        expect(propDao.deArchiveProposal).toHaveBeenCalledTimes(0);
    });

    it('should handle errors during archival', async () => {
        // Mock database response
        const mockIds = [{ Id: 1 }, { Id: 2 }];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        // Mock deArchiveProposal error response
        const error = new Error('Archive error');
        propDao.deArchiveProposal.mockRejectedValueOnce(error);

        const date = dayjs(); // Use the appropriate date

        const result = await timelyDeArchive(date);

        expect(result).toEqual({ error: error.toString()+' when trying to read archived proposal with id: '+1 });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(propDao.deArchiveProposal).toHaveBeenCalledTimes(1);
        expect(propDao.deArchiveProposal).toHaveBeenCalledWith(1);
    });

    it('should handle database query error', async () => {
        // Mock database query error
        const error = new Error('Database error');
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(error);
        });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyDeArchive(date);

        expect(result).toEqual({ error: 'Time Travel backward error: '+error.toString()});
    });

});

describe('timelyExpiringEmails', () => {
    beforeEach(() => {
        // Clear mock data before each test
        db.all.mockReset();
        mailServer.sendMail.mockReset();
    });

    it('should archive proposals when there are expired ones', async () => {
        // Mock database response
        const mockIds = [{ Id: 1, Supervisor:'d10', Title:'P1', Expiration:'date A' }, { Id: 2, Supervisor:'d02', Title:'P2', Expiration:'date B' }];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        // Mock archiveProposalWithoutApplication response
        mailServer.sendMail.mockResolvedValueOnce({ success: true });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyExpiringEmails(date);

        expect(result).toEqual({ sentemails: true });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(mailServer.sendMail).toHaveBeenCalledTimes(2);
        expect(mailServer.sendMail).toHaveBeenCalledWith(mockIds[0].Supervisor,'EXPIRATION', {expires:mockIds[0].Expiration, proposal:mockIds[0].Title});
        expect(mailServer.sendMail).toHaveBeenCalledWith(mockIds[1].Supervisor,'EXPIRATION', {expires:mockIds[1].Expiration, proposal:mockIds[1].Title});
    });

    it('should return with success if it founds no proposal', async () => {
        // Mock database response
        const mockIds = [];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyExpiringEmails(date,7);

        expect(result).toEqual({ sentemails: true });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(mailServer.sendMail).toHaveBeenCalledTimes(0);
    });

    it('should handle errors during archival', async () => {
        // Mock database response
        const mockIds = [{ Id: 1, Supervisor:'d10', Title:'P1', Expiration:'date A' }, { Id: 2, Supervisor:'d02', Title:'P2', Expiration:'date B' }];
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(null, mockIds);
        });

        // Mock archiveProposalWithoutApplication error response
        const error = new Error('Mail error');
        mailServer.sendMail.mockRejectedValueOnce(error);

        const date = dayjs(); // Use the appropriate date

        const result = await timelyExpiringEmails(date,7);

        expect(result).toEqual({ error: error.toString()+" when trying to send expiration emails for proposal with id: "+1 });

        // Ensure the archiveProposalWithoutApplication was called for each ID
        expect(mailServer.sendMail).toHaveBeenCalledTimes(1);
        expect(mailServer.sendMail).toHaveBeenCalledWith(mockIds[0].Supervisor,'EXPIRATION', {expires:mockIds[0].Expiration, proposal:mockIds[0].Title});
    });

    it('should handle database query error', async () => {
        // Mock database query error
        const error = new Error('Database error');
        db.all.mockImplementationOnce((sql, params, callback) => {
            callback(error);
        });

        const date = dayjs(); // Use the appropriate date

        const result = await timelyExpiringEmails(date,7);

        expect(result).toEqual({ error: "Expiring proposals emails error: "+error.toString()});
    });

});
