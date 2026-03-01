export const verificationEmailTemplate = (username, verificationURL) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Hello ${username} 👋</h2>
      <p>Welcome to <strong>SkillLabz</strong>!</p>
      <p>Please verify your email by clicking below:</p>
      <a href="${verificationURL}" 
         style="background:black;color:white;padding:10px 15px;text-decoration:none;">
         Verify Email
      </a>
      <p>This link expires in 15 minutes.</p>
    </div>
  `;
};