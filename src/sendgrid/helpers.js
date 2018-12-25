const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const supportEmail = process.env.supportEmail;
const host = process.env.host;

const sendGridHelpers = {
  sendConfirmationEmail(user) {
    const msg = {
      to: user.email,
      from: supportEmail,
      subject: 'Blocipedia Confirmation Email',
      text: 'You are receiving this because you (or someone else) have signed up for account with Blocipedia.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the confirm your email:\n\n' +
        host + '/users/confirm/' + user.confirmationCode + '\n\n' +
        'If you did not sign up, please ignore this email.\n'
    };
    try {
      sgMail.send(msg);
    } catch (err) {
      next(err);
    }
  }
}
module.exports = sendGridHelpers;
