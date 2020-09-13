const { ApolloError } = require("apollo-server");
const { verifyToken } = require("../middleware/auth");

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
//  Arguments are not required when returning the whole data set, but
//  including them helps remind that they are necessary for returning
//  data tied to a parameter
const resolvers = {
  Query: {
    users: async (parent, args, { dataSources }, info) => {
      return await dataSources.userAPI.getUsers();
    },
    user: async (parent, args, { dataSources }, info) => {
      return await dataSources.userAPI.getUser(args.email);
    },
  },
  Mutation: {
    createUser: async (
      _,
      { email, firstName, lastName, password },
      { dataSources }
    ) => {
      const res = await dataSources.userAPI.createUser({
        email,
        firstName,
        lastName,
        password,
      });
      if (res.error) {       
        throw new ApolloError(res.message, res.code);
      }
      return res;
    },
    logUserIn: async (_, { email, password }, { dataSources }) => {
      const res = await dataSources.userAPI.logUserIn({ email, password });
      if (res.error) {
        throw new ApolloError(res.message, res.code);
      }
      return res;
    },
    verifyEmail: async (_, token, { dataSources }) => {
      const res = await dataSources.userAPI.verifyEmail(token);
      if (res.error) {
        throw new ApolloError(res.message, res.code);
      }
      return res;
    },
    resendVerification: async (_, {token}, { dataSources }) => {
      const res = await dataSources.userAPI.resendVerificationEmail({token});
      if (res.error) {
        throw new ApolloError(res.message, res.code);
      }

      return res;
    },
    checkSession: async (_, __, context) => {
      const { req } = context;
      try {
        const token = req.headers.authorization;
 
        const user = await verifyToken(token)
        if(!user.validToken) {
          throw new ApolloError(user.message, 401);
        }

        return {
          message: "User authenticated", 
          body: token
        };
      } catch (error) {   
        throw new ApolloError(error.message, error.extensions.code);
      }
    }, 
    createGroup: async (_, {name, admin}, context) => {
      const { req, dataSources } = context;
      try {
        const token = req.headers.authorization;
        const user = await verifyToken(token)
        if(!user.validToken) {
          throw new ApolloError(user.message, 401);
        }

        const res = await dataSources.groupAPI.createGroup({name, admin})        
        if (res.error) {
          throw new ApolloError(res.message, res.code);
        }
        return res;
      } catch (error) {
        throw new ApolloError(error.message, error.extensions.code);
      }
    }
  },
};

module.exports = resolvers;