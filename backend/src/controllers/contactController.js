const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const contact = async (req, res) => {
    const { fullName, email, subject, message } = req.body;

    // Basic validation
    if (!fullName || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const mailOptions = {
        from: `"${fullName}" <${process.env.EMAIL_USER}>`,  // sender shown in inbox
        to: process.env.EMAIL_USER,                          // YOUR inbox
        replyTo: email,                                      // reply goes to the user
        subject: `[Contact Form] ${subject}`,
        html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    };

    const autoReply = {
        from: `"AI Interview Coach" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'We received your message!',
        html: `
    <p>Hi ${fullName},</p>
    <p>Thanks for reaching out! We've received your message and will get back 
    to you within 24 hours.</p>
    <p>— Team AI Interview Coach</p>
  `,
    };


    try {
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(autoReply);
        res.status(200).json({ success: 'Message sent successfully!' });
    } catch (error) {
        console.error('Mail error:', error);
        res.status(500).json({ error: 'Failed to send message. Try again.' });
    }
};

module.exports = { contact };
