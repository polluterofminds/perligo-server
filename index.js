const { ApolloServer, gql, ApolloError } = require("apollo-server");
const typeDefs = require('./typeDefs/index');
const resolvers = require('./resolvers/index');
const UserAPI = require("./datasources/user");
const GroupAPI = require('./datasources/group');

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (req) => { 
    return req;
  },
  dataSources: () => ({
    userAPI: new UserAPI(),
    groupAPI: new GroupAPI()
  }),
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
