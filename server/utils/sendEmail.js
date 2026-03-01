import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  await resend.emails.send({
    from: 'SkillLabz <onboarding@resend.dev>', 
    to,
    subject,
    html
  });
};

export default sendEmail;