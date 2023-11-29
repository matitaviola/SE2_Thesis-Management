const nodemailer = require('nodemailer');
const studentDao = require('../DB/students-dao');

const emailConfig = {
  service: 'gmail',
  auth: {
      user: 'groupsofteng6@gmail.com',
      pass: 'afdmaktmymfaupmr',
  },
};

const applicationMailData = async (studentId, options) => {
  const student = await studentDao.getStudentData(studentId);
  const to = student.email;
  const subject = 'Application Status';
  let text = `Dear ${student.name},
  I hope this email finds you well.`;
  text += options.status === 'accepted' ? ` Your application for proposal ${options.proposal} has been accepted, and we believe your contributions will greatly enhance the proposal ${options.proposal}.`
    : ` We regret to inform you that, after careful consideration, we are unable to accept your application for the proposal ${options.proposal}.`;
  text += ' Thank you for your interest and participation in the application process.';
  return { to, subject, text };
};

exports.sendMail = async (receiverId, scope, options) => {
  let to, subject, text;
  if (scope === 'APPLICATION') {
    ({to, subject, text} = await applicationMailData(receiverId, options));
    const transporter = nodemailer.createTransport(emailConfig);
    try {
      await transporter.sendMail({
        from: 'groupsofteng6@gmail.com',
        to,
        subject,
        text,
      });
      return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
      return { success: false, message: error };
    }
  } else { return { success: false } };
}