const { ApolloServer, gql } = require('apollo-server');
const UserAPI = require('./datasources/user');

const typeDefs = gql`
  type User {
    firstName: String, 
    lastName: String,
    email: String
    avatar: String
  }

  # Mutations are updates to the DB (put, post, delete)
  type Mutation {
    createUser(email: String!, firstName: String!, lastName: String!): User
  }

  # Query is a special type that lists all available queries
  type Query {
    users: [User],
    user(email:String!): User
  }
`

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
//  Arguments are not required when returning the whole data set, but
//  including them helps remind that they are necessary for returning
//  data tied to a parameter
const resolvers = {
  Query: {
    users: async (parent, args, { dataSources }, info) => {
      return await dataSources.userAPI.getUsers()
    },
    user: async (parent, args, { dataSources }, info) => {
      return await dataSources.userAPI.getUser(args.email)
    }
  },
  Mutation: {
    createUser: async (_, { email, firstName, lastName }, { dataSources }) => {
      return await dataSources.userAPI.createUser({ email, firstName, lastName })
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ 
  typeDefs, 
  resolvers, 
  dataSources: () => ({
    userAPI: new UserAPI()
  }), 
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});