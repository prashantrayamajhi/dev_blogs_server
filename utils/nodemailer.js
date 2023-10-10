const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

let transporter = nodemailer.createTransport(
  smtpTransport({
    service: "ZeptoMail",
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: "wSsVR60g/kT3C/p9zTT/dLgwyAkDAwj3Fkx12lD1uXL/Sv7H88c+nxWbAlT1GfVMRG9hEToVorIumBkJ1WUPjI8rzQ0EACiF9mqRe1U4J3x17qnvhDzPXGVcmhGJK4MBzw5vkmllGs0k+g==",
    },
  })
);

exports.sendEmail = async (to, subject, html) => {
  try {
    const mail = await transporter.sendMail({
      from: '"Blogify" <noreply@sojojob.com>',
      to: to,
      subject: subject,
      html: html,
    });

    return mail;
  } catch (err) {
    console.log(err);
    return err;
  }
};
