require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  passwordMatch: async (user, password) => {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    return isMatch
  }, 
  verifyToken: async (token) => {
    //  Check if no token
    if(!token) {
      return null;
    }

    //  Verify token
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      return {
        validToken: true, 
        user: decoded.user
      }
    } catch(err) {
      console.log(err)
      return {
        validToken: false, 
        message: err.message
      };
    }
  }
}