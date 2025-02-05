export const emailVerificationHtml = (code: number) => `
    <div style="text-align: center;">
        <h3>Verify your email</h3>
        <p>Your verification code is <strong>${code}</strong></p>
    </div>
`;
