const bcrypt = require("bcryptjs");

module.exports = {
  passwordMatch: async (user, password) => {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    return isMatch
  }
}