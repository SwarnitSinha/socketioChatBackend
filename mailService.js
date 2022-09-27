const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const createError = require("http-errors")

// require(`dotenv`).config();

// const { randomValueHex } = require("../utils/generateValue");

//these we get from google auth console
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;  // it changes with some time period

//google api installation

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });


module.exports=sendEmail = async (receiverEmail,body,subject) => {
    try {
      console.log(REFRESH_TOKEN+" "+CLIENT_ID+" "+CLIENT_SECRET);
      const accessToken = await oAuth2Client.getAccessToken();
      
      const transport =await nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: `initiatetenet@gmail.com`,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
        tls: { rejectUnauthorized: false },
      });

      const mailOptions = {
        from: "Let's Talk ✉ <initiatetenet@gmail.com>",
        to: receiverEmail,
        subject: subject,
        text: body,
      };

        const result = await transport.sendMail(mailOptions);
        console.log("Email has been successfully sent to " + receiverEmail);

        return {
          status:401,
          message:"Email sent Successfull"
        }

    } catch (error) {
        console.log("Mailer ", error);
        return {
          status:501,
          message:"Internal Error"
        }
    }
}
 




