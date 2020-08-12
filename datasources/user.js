const { DataSource } = require('apollo-datasource');
const axios = require('axios');
const db = require('../utils');
const User = db.models.user;

const userImages = async () => {
  const images = await axios.get('https://randomuser.me/api/')
  const { data } = images;
  const { results } = data;

  return results[0].picture.thumbnail;
}

const getUserData = async () => {

  const users = [
    {
      firstName: "Brian", 
      lastName: "Smith",
      email: "briansmith@email.com", 
      avatar: ''
    },
    {
      firstName: "Dusty", 
      lastName: "Smith",
      email: "dusty@email.com", 
      avatar: ''
    },
    {
      firstName: "Sandra",
      lastName: "Smith", 
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

class UserAPI extends DataSource {
  constructor() {
    super();
  }

  createUser = async ({email, firstName, lastName}) => {
    try {
      const user = await User.create({
        email, 
        firstName, 
        lastName
      })
      return user;
    } catch (error) {
      console.log(error);
      return this.res.status(500).send('Server error');
    }
  }

  getUser = async (email) => {
    try {
      const users = await getUserData();
      const user = users.find(u => u.email === email);
      return user;
    } catch (error) {
      return this.res.status(400).send('Trouble finding user');
    }    
  }

  getUsers = async () => {
    try {
      const users = await getUserData();
      return user;
    } catch (error) {
      return this.res.status(400).send('Trouble finding users');
    }   
  }
}

module.exports = UserAPI;