var nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_PASS = process.env.EMAIL_PASS

var mailSender = function(senderEmail, subject,body)
{
    console.log("Mail Sender")
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'medicateindia@gmail.com',
            pass: EMAIL_PASS
        }
    });
    var mailOptions = {
        from: 'medicateindia@gmail.com',
        to: senderEmail,
        subject: subject,
        text: body 
        
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = mailSender;