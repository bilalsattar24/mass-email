/*
INSTRUCTIONS:
 
1. Make sure the email configuration information is correct
2. Update the email content information to have the email contain your content
3. Confirm the mailinglist.csv has all of the email addresses you'd like to send
4. Once the above steps are complete, it's time to run the script.
5. Open terminal. Navigate to the send-bulk-email folder (this will be wherever you downloaded this code to)
6. For example if the folder is on your desktop, type "cd desktop/send-bulk-email" and hit enter (without the quotes)
7. Once you are in the send-bulk-email folder, type "npm install" and hit enter (without the quotes) (this step isn't necessarily required every single time but it doesn't hurt to just do it again)
8. Once the install is complete, type "npm run sendemail" and hit enter (without the quotes)
9. Your emails should start sending. 
10. There is a 1 second delay between each email address so the email server doesn't block you
*/

//EMAIL CONFIGURATION INFORMATION
const nodemailer = require("nodemailer");
const csv = require("csvtojson");
require("dotenv").config();

const fs = require("fs");

// EMAIL CONFIGURATION INFORMATION
const EMAIL_USER = "advertisingcarwash@gmail.com";
const EMAIL_PASS = "eyvv brxn dlvd gded"; //google app password
const EMAIL_HOST = "smtp.gmail.com";
const EMAIL_PORT = 587;

// EMAIL CONTENT INFORMATION
const emailSubject = "Special Offer: Car Wash!";
const htmlPath = "./index.html";

const timeoutMs = 1000; // Timeout used for spreading out load

// SMTP server configuration
const smtpTransport = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendEmail = (toEmailId, html, subject) =>
  new Promise((resolve, reject) => {
    const msg = {
      from: EMAIL_USER, // sender address
      to: toEmailId, // to address,
      subject, // Subject line
      html, // html body
    };

    smtpTransport.sendMail(msg, (err) => {
      if (err) {
        return reject(err);
      }
      setTimeout(resolve, timeoutMs); // a small timeout so that your SMTP server doesn't block you
    });
  });

const getEmailContent = () => {
  try {
    const htmlContent = fs.readFileSync(htmlPath, "utf8");
    return htmlContent;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getMsgParams = () => {
  const subject = emailSubject;
  const htmlBody = getEmailContent();
  return [subject, htmlBody];
};

const sendBulkEmail = async () => {
  const csvFilePath = process.argv[2];
  if (!csvFilePath) {
    console.log("CSV File not specified");
    process.exit(0);
  }

  console.log("CSV File successfully opened", csvFilePath);

  try {
    const jsonObj = await csv().fromFile(csvFilePath);
    for (const it of jsonObj) {
      const { firstName, lastName, email } = it;
      const name = `${firstName} ${lastName}`;
      const [subject, htmlBody] = getMsgParams(name);

      console.log(`Sending to: ${email}`);
      try {
        await sendEmail(email, htmlBody, subject);
        console.log("Sent to: ", email);
      } catch (e) {
        console.error(`Sending to "${name},${email}" failed`);
        console.log("error", e);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// verify connection configuration
smtpTransport.verify((error) => {
  if (error) {
    console.log(error);
    process.exit(0);
  } else {
    console.log("SMTP Server is ready to send messages");
    sendBulkEmail();
  }
});
