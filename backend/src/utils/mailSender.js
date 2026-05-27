import nodemailer from "nodemailer";


const mailSender = async (email , value  ,isOtp) => {

  

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.emailUser,
      pass: process.env.emailPass
    }
  });
  let html = null ;
  let text = null ;
if(isOtp){
 text = `Your OTP is ${value}. It is valid for 5 minutes. If you did not request this, please ignore.`,
   html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="500px" style="background: #ffffff; border-radius: 8px; padding: 20px;">
              
              <tr>
                <td align="center">
                  <h2 style="color: #333;">Warehouse App</h2>
                </td>
              </tr>

              <tr>
                <td>
                  <p>Hello,</p>
                  <p>You requested a password reset. Use the OTP below:</p>

                  <h1 style="text-align: center; color: #007bff; letter-spacing: 5px;">
                    ${value}
                  </h1>

                  <p>This OTP is valid for <b>5 minutes</b>.</p>

                  <p>If you didn’t request this, you can safely ignore this email.</p>
                </td>
              </tr>

              <tr>
                <td style="padding-top: 20px;">
                  <hr />
                  <p style="font-size: 12px; color: #777;">
                    © 2026 Warehouse App. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
    `
}
else
{
   text = `Your verification token is ${value}. It is valid for 24 hours. If you did not request this, please ignore.`,
  html =  `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="500px" style="background: #ffffff; border-radius: 8px; padding: 20px;">

              <tr>
                <td align="center">
                  <h2 style="color: #333;">Warehouse App</h2>
                </td>
              </tr>

              <tr>
                <td>
                  <p>Hello,</p>
                  <p>Welcome to Warehouse App! Thank you for registering. Please use the verification token below to complete your registration:</p>

                  <h1 style="text-align: center; color: #007bff; letter-spacing: 5px;">
                    ${value}
                  </h1>

                  <p>This token is valid for <b>24 hours</b>.</p>

                  <p>If you didn't request this, you can safely ignore this email.</p>
                </td>
              </tr>

              <tr>
                <td style="padding-top: 20px;">
                  <hr />
                  <p style="font-size: 12px; color: #777;">
                    © ${new Date().getFullYear()} Warehouse App. All rights reserved.<br/>
                    Please do not reply to this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
    `
}
  const mailOptions = {
    from: 'warehousetester648@gmail.com',
    to: email,
    subject: "Your verification code for Warehouse App",

    
   text: text,
   
    html: html 

  };

  const info = await transporter.sendMail(mailOptions);

  return info;
 
};

export default mailSender;