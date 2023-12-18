const nodemailer = require('nodemailer');
const studentDao = require('../DB/students-dao');
const supervisorDao = require('../DB/supervisors-dao');

// Changed the config to make it secure
const emailConfig = {
  service: 'gmail',
  secure: true,
  requireTLS: true,
  port: 465,
  secured: true,
  auth: {
      user: 'groupsofteng6@gmail.com',
      pass: 'afdmaktmymfaupmr',
  },
};

const applicationStudentMailData = async (studentId, options) => {
  const student = await studentDao.getStudentData(studentId);
  const to = student.email;
  const subject = 'Application Status';
  let text = `Dear ${student.name},
  I hope this email finds you well.`;
  text += options.status === 'accepted' ? ` Your application for proposal "${options.proposal}" has been accepted, and we believe your contributions will greatly enhance the proposal ${options.proposal}.`
    : ` We regret to inform you that, after careful consideration, we are unable to accept your application for the proposal "${options.proposal}".`;
  text += ' Thank you for your interest and participation in the application process.';
  return { to, subject, text };
};

const applicationTeacherMailData = async (professorId, options) => {
  const teacher = await supervisorDao.getSupervisorById(professorId);
  const to = teacher.EMAIL;
  const subject = options.submitter? 'New Application submitted':'Application expiring soon';
  let text = options.submitter? `A new application has been submitted for your proposal "${options.proposal}" by the student with id: ${options.submitter}.\nThe proposal will expire on ${options.expires}`
  : `Your proposal "${options.proposal}" will expire in 7 days, on ${options.expires}.`;
  return { to, subject, text };
};

exports.sendMail = async (receiverId, scope, options) => {
  let to, subject, text;
  if (scope === 'APPLICATION' || scope === 'EXPIRATION') {
    if(options.status) //only for students
      ({to, subject, text} = await applicationStudentMailData(receiverId, options));
    else //for teachers getting a new application
      ({to, subject, text} = await applicationTeacherMailData(receiverId, options));
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
      console.log(error)
      return { success: false, message: error };
    }
  }
  else { return { success: false } };
}