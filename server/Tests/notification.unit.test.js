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
      auth: {
        pass: "afdmaktmymfaupmr",
        user: "groupsofteng6@gmail.com",
      },
      port: 465,
      requireTLS: true,
      secure: true,
      secured: true,
      service: "gmail",
    });

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: 'groupsofteng6@gmail.com',
      to: 'john.doe@example.com',
      subject: 'Application Status',
      text: expect.stringContaining('Your application for proposal "Proposal 123" has been accepted'),
    });
  });

  it('should send application reject email', async () => {
    const studentId = 123;
    const options = {
      status: 'rejected',
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
      auth: {
        pass: "afdmaktmymfaupmr",
        user: "groupsofteng6@gmail.com",
      },
      port: 465,
      requireTLS: true,
      secure: true,
      secured: true,
      service: "gmail",
    });

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: 'groupsofteng6@gmail.com',
      to: 'john.doe@example.com',
      subject: 'Application Status',
      text: expect.stringContaining('we are unable to accept your application for the proposal "Proposal 123".'),
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
      auth: {
        pass: "afdmaktmymfaupmr",
        user: "groupsofteng6@gmail.com",
      },
      port: 465,
      requireTLS: true,
      secure: true,
      secured: true,
      service: "gmail",
    });

    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);
  });

  it('should not send email for scope other than APPLICATION', async () => {
    const receiverId = 'testStudentId';
    const scope = 'OTHER_SCOPE';
    const options = {};

    const result = await mailServer.sendMail(receiverId, scope, options);

    expect(result.success).toBe(false);

    expect(nodemailer.createTransport().sendMail).not.toHaveBeenCalled();

    expect(require('../DB/students-dao').getStudentData).not.toHaveBeenCalled();
  });
});
