const nodemailer = require('nodemailer');

console.log("Script started");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'shanmukharaoadapaka123@gmail.com',
        pass: 'vmiy fssp epgh aejk'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Alert Function
const sendAlert = async (email, message) => {
    console.log("Attempting to send email...");
    try {
        const emailOptions = {
            from: '"Alert System" <shanmukharaoadapaka123@gmail.com>',
            to: '22341A1201@gmrit.edu.in',
            subject: 'Threshold Reached Alert',
            text: message,
            html: `<h2>Threshold Alert</h2>
                   <p>${message}</p>
                   <p>This is an automated alert from your monitoring system.</p>`
        };

        await transporter.sendMail(emailOptions);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending alert:', error);
    }
};

// Example Trigger with actual threshold check
let currentValue = 110; // Example value above threshold
const threshold = 100;

if (currentValue >= threshold) {
    const message = `Alert: The current value (${currentValue}) has exceeded the threshold (${threshold})!`;
    sendAlert('22341A1201@gmrit.edu.in', message);
} else {
    console.log("No alert needed - threshold not reached");
}
