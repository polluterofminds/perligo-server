const { ApolloServer, gql, ApolloError } = require("apollo-server");
const UserAPI = require("./datasources/user");

const typeDefs = gql`
  type User {
    firstName: String
    lastName: String
    email: String
    avatar: String
  }

  # Mutations are updates to the DB (put, post, delete)
  type Mutation {
    createUser(
      email: String!
      firstName: String!
      lastName: String!
      password: String!
    ): UserResponse
    logUserIn(email: String!, password: String!): UserResponse
    verifyEmail(token: String!): UserResponse
  }

  # Query is a special type that lists all available queries
  type Query {
    users: [User]
    user(email: String!): User
  }

  type UserResponse {
    message: String
    body: String
  }
`;

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
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    userAPI: new UserAPI(),
  }),
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
