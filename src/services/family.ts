function generateInvitationCode() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let invitationCodeGen = '';
  for (let i = 0; i < 25; i++) {
    invitationCodeGen += characters[Math.floor(Math.random() * characters.length)];
  }
  return invitationCodeGen;
}

function generateFamilyId() {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let idCodeGen = '';
  for (let i = 0; i < 25; i++) {
    idCodeGen += characters[Math.floor(Math.random() * characters.length)];
  }
  return idCodeGen;
}

module.exports = {
  generateFamilyId,
  generateInvitationCode,
};
