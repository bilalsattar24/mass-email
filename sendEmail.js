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
const EMAIL_USER = "enter your gmail address";
const EMAIL_PASS = "enter the app password you created";
const EMAIL_HOST = "smtp.gmail.com";
const EMAIL_PORT = 587;

//EMAIL CONTENT INFORMATION
const emailContentText = "This is the email content";
const emailImageUrl = "https://picsum.photos/id/1/200/300";
const emailSubject = "Email subject";

// IGNORE BELOW THIS LINE
//___________________________________________________________________________________________________________________________
const nodemailer = require("nodemailer");
const csv = require("csvtojson");
require("dotenv").config();
const params = process.argv;
const csvFile = params[2];
const fromEmail = process.env.EMAIL_FROM;
const currentPath = process.cwd();
const timeoutMs = 1000; // Timeout used for spreading out load
if (csvFile) {
  console.log("CSV File successfully opened", csvFile);
} else {
  console.log("CSV File not specified");
  process.exit(0);
}

// SMTP server configuration
var smtpTransport = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const sendEmail = (toEmailId, html, subject, close) =>
  new Promise((resolve, reject) => {
    const msg = {
      from: fromEmail, // sender address
      to: toEmailId, // to address,
      subject, // Subject line
      html, // html body
    };

    smtpTransport.sendMail(msg, (err) => {
      if (err) {
        return reject(err);
      }
      if (close) {
        msg.transport.close();
      }
      setTimeout(resolve, timeoutMs); // a small timeout so that your SMTP server doesn't block you
    });
  });

const csvFilePath = currentPath + "/" + csvFile;

console.log("csvFilePath", csvFilePath);

function getEmailContent() {
  try {
    const htmlContent = fs.readFileSync("./emailContent.html", "utf8");
    return htmlContent;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//customise the email content
const getMsgParams = (name) => {
  const subject = emailSubject;
  const htmlBody = `<h1>Hello ${name}</h2> ${
    emailImageUrl
      ? `<p>${emailContentText}</p>
      <img src="${emailImageUrl}" />`
      : `<p>${emailContentText}</p>`
  }`;
  return [subject, htmlBody];
};

function sendBulkEmail() {
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      jsonObj.map(async (it) => {
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
      });
    });
}

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
