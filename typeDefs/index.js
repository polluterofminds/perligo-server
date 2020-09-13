const { gql } = require("apollo-server");

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
    resendVerification(token: String!): UserResponse
    checkSession: UserResponse, 
    createGroup(name: String!, admin:String!): GroupResponse
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

  type GroupResponse {
    message: String, 
    body: String
  }
`;

module.exports = typeDefs;