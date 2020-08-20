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

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userImages = async () => {
  const images = await axios.get("https://randomuser.me/api/");
  const { data } = images;
  const { results } = data;

  return results[0].picture.thumbnail;
};

const getUserData = async () => {
  const users = [
    {
      firstName: "Brian",
      lastName: "Smith",
      email: "briansmith@email.com",
      avatar: "",
    },
    {
      firstName: "Dusty",
      lastName: "Smith",
      email: "dusty@email.com",
      avatar: "",
    },
    {
      firstName: "Sandra",
      lastName: "Smith",
      email: "sandra@email.com",
      avatar: "",
    },
  ];

  const usersWithAvatars = await Promise.all(
    users.map((user) => {
      return {
        ...user,
        avatar: userImages(),
      };
    })
  );

  return usersWithAvatars;
};

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
          id: user.id,
        },
      };

      //  Return JWT
      const token = await jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });

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
      } catch (error) {
        console.log(JSON.stringify(error));
      }

      return {
        message: "Verification email sent",
        body: null,
      };
    } catch (error) {
      console.log(error);
      return this.res.status(500).send("Server error");
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

  resendVerificationEmail = async ({ email, password }) => {
    //  @TODO - handle this
  }

  logUserIn = async ({ email, password }) => {
    try {
      const user = await User.findOne({
        where: {
          email,
        },
      });

      //  Validate password
      const match = await passwordMatch(user, password);

      if (!match || !user.emailVerified) {
        return {
          error: true,
          message: !match
            ? "Invalid email/password combination"
            : "Email not yet verified",
          code: 401,
        };
      }

      const payload = {
        user: {
          id: user.id,
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
      return this.res.status(500).send("Server error");
    }
  };

  getUser = async (email) => {
    try {
      const users = await getUserData();
      const user = users.find((u) => u.email === email);
      return user;
    } catch (error) {
      return this.res.status(400).send("Trouble finding user");
    }
  };

  getUsers = async () => {
    try {
      const users = await getUserData();
      return user;
    } catch (error) {
      return this.res.status(400).send("Trouble finding users");
    }
  };
}

module.exports = UserAPI;
