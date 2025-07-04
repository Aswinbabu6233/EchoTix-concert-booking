const nodemailer = require("nodemailer");

async function sendTicketEmail(userEmail, booking, pdfBuffer) {
  // Looking to send emails in production? Check out our Email API/SMTP product!
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "36c21149419637",
      pass: "a1824ca393f99c",
    },
  });

  const mailOptions = {
    from: '"EchoTix" <no-reply@echotix.com>',
    to: userEmail,
    subject: "Your Concert Ticket",
    html: `
      <p>Hi ${booking.user.username},</p>
      <p>Thanks for booking <strong>${booking.concert.title}</strong>!</p>
      <p>See you at <strong>${
        booking.concert.venue
      }</strong> on <strong>${new Date(
      booking.concert.date
    ).toDateString()}</strong>.</p>
    `,
    attachments: [
      {
        filename: "ticket.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  await transport.sendMail(mailOptions);
}

module.exports = sendTicketEmail;
