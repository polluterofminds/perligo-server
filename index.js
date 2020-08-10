const { ApolloServer, gql } = require('apollo-server');
const axios = require('axios');

const userImages = async () => {
  const images = await axios.get('https://randomuser.me/api/')
  const { data } = images;
  const { results } = data;

  return results[0].picture.thumbnail;
}

const getUserData = async () => {

  const users = [
    {
      name: "Brian Smith", 
      email: "briansmith@email.com", 
      avatar: ''
    },
    {
      name: "Dusty Smith", 
      email: "dusty@email.com", 
      avatar: ''
    },
    {
      name: "Samdra Smith", 
      email: "sandra@email.com", 
      avatar: ''
    }
  ]

  const usersWithAvatars = await Promise.all(users.map((user) => {
    return {
      ...user, 
      avatar: userImages()
    }
  }))

  return usersWithAvatars;
}

const typeDefs = gql`
  type User {
    name: String
    email: String
    avatar: String
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
    users: async (parent, args, context, info) => {
      return await getUserData()
    },
    user: async (parent, args, context, info) => {
      const users = await getUserData()
      return users.find(user => user.email === args.email);
    }
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});