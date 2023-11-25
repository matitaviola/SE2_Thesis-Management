const nodemailer = require('nodemailer');
const studentDao = require('../DB/students-dao');
const mailServer = require('../utils/mail-server');

jest.mock('nodemailer');

jest.mock('../DB/db', () => {
  const mockedDB = {
    get: jest.fn()
  };
  return { db: mockedDB };
});

describe('Mail Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send application acceptance email', async () => {
    const studentId = 123;
    const options = {
      status: 'accepted',
      proposal: 'Proposal 123',
    };

    studentDao.getStudentData = jest.fn().mockResolvedValue({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({}),
    });

    const result = await mailServer.sendMail(studentId, 'APPLICATION', options);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('Email sent successfully.');

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'groupsofteng6@gmail.com',
        pass: 'kedgiyhpeeafxswc',
      },
    });

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: 'groupsofteng6@gmail.com',
      to: 'john.doe@example.com',
      subject: 'Application Status',
      text: expect.stringContaining('Dear John Doe,'),
    });
  });

  it('should handle email sending error', async () => {
    const studentId = 123;
    const options = {
      status: 'accepted',
      proposal: 'Proposal 123',
    };

    studentDao.getStudentData = jest.fn().mockResolvedValue({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockRejectedValue(new Error('Email sending error.')),
    });

    const result = await mailServer.sendMail(studentId, 'APPLICATION', options);
    expect(result.success).toBe(false);
    expect(result.message.toString()).toEqual('Error: Email sending error.');

    expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'groupsofteng6@gmail.com',
        pass: 'kedgiyhpeeafxswc',
      },
    });

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);
  });
});
