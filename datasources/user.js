require("dotenv").config();
const { DataSource } = require("apollo-datasource");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const db = require("../utils");
const User = db.models.user;

const { passwordMatch, verifyToken } = require("../middleware/auth");

const sgMail = require("@sendgrid/mail");
const { send } = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (token, firstName, email) => {
  //  Send verification email
  const link = `http://localhost:3000/verify?type=registration&token=${token}`;

  const msg = {
    to: email,
    from: "justin.edward.hunter@gmail.com",
    subject: "Perligo - Please Verify Your Email",
    text: `Please verifiy your email address.`,
    html: "<div>Please verify your email address.</div>",
    templateId: "d-7b175677f77c43cbbe7eccffd052be2c",
    dynamic_template_data: {
      verificationUrl: link,
      name: firstName,
    },
  };
  try {
    await sgMail.send(msg);
    return {
      message: "Verification email sent",
      body: null,
    };
  } catch (error) {
    throw new Error(error);
  }
}

class UserAPI extends DataSource {
  constructor() {
    super();
  }

  createUser = async ({ email, firstName, lastName, password }) => {
    try {
      //  Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      //  Get user's gravatar
      const avatar = gravatar.url(email, {
        s: "200", //size of image
        r: "pg", //rating of image - no adult content
        d: "mm", //return default image if no gravatar found
      });
      const user = await User.create({
        email,
        firstName,
        lastName,
        passwordHash,
        avatar,
      });

      //  Create JWT payload
      const payload = {
        user: {
          email: user.email,
          verificationToken: true
        },
      };

      //  Return JWT
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });

      const verification = await sendVerificationEmail(token, firstName, email);
      return verification;
    } catch (error) {
      console.log(error);
      return {
        error: true, 
        message: JSON.stringify(error), 
        code: 500
      }
    }
  };

  verifyEmail = async ({token}) => {
    try {
      const decodedToken = await verifyToken(token);
      
      if(!decodedToken) {
        return {
          error: true, 
          message: 'Invalid token', 
          code: 403
        }
      }

      await User.update(
        {
          emailVerified: true
        },
        {
          where: {
            id: decodedToken.id
          }
        }
      );

      return {
        message: 'Email verified!', 
        body: token
      }
    } catch (error) {
      console.log(error)
      return {
        error: true, 
        message: JSON.stringify(error), 
        code: 500
      }
    }
  }

  resendVerificationEmail = async ({token}) => {
    try {
      const validatedToken = await verifyToken(token);
      const { user } = validatedToken;
      console.log(user)
      const dbUser = await User.findOne({
        where: {
          email: user.email
        }
      })

      //  Create a new token specific to verification
      const payload = {
        user: {
          email: user.email,
          verificationToken: true
        },
      };

      const newToken = await jwt.sign(payload, process.env.JWT_SECRET);

      const verification = await sendVerificationEmail(newToken, dbUser.firstName, dbUser.email);
      return verification;
    } catch (error) {
      console.log(error)
      return {
        error: true, 
        message: JSON.stringify(error), 
        code: 500
      }
    }
  }

  logUserIn = async ({ email, password }) => {
    try {
      const user = await User.findOne({
        where: {
          email,
        }
      });

      if(!user) {
        return {
          error: true,
          message: "Account does not exist",
          code: 404,
        }
      }

      //  Validate password
      const match = await passwordMatch(user, password);

      if (!match) {
        return {
          error: true,
          message: "Invalid email/password combination",
          code: 401,
        };
      }

      const { firstName, lastName, emailVerified,  avatar } = user;

      const payload = {
        user: {
          firstName, 
          lastName, 
          email: user.email,
          emailVerified, 
          avatar
        },
      };

      //  Return JWT
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });
      return {
        message: "Successful authentication!",
        body: token,
      };
    } catch (error) {
      console.log(error);
      return {
        error: true, 
        message: 'Server error', 
        code: 500
      }
    }
  };

  getUser = async (email) => {
    try {
      const users = await getUserData();
      const user = users.find((u) => u.email === email);
      return user;
    } catch (error) {
      return {
        error: true, 
        message: 'Trouble finding user', 
        code: 400
      }
    }
  };

  getUsers = async () => {
    try {
      const users = await getUserData();
      return users;
    } catch (error) {
      return {
        error: true, 
        message: JSON.stringify(error), 
        code: 400
      }
    }
  };

  checkSession = async ({ token }) => {
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      //  @TODO - Verify token expiry
      const { user } = decoded;
    
      const userFound = await User.findOne({
        where: {
          email: user.email
        }
      });

      if(!userFound) {
        return {
          error: true, 
          message: 'User not found', 
          code: 404
        }
      }

      return {
        message: 'User authenticated', 
        body: token
      }
    } catch (error) {
      console.log(error);
      return {
        error: true,
        message: 'Server error', 
        code: 500
      }
    }
  }
}

module.exports = UserAPI;
