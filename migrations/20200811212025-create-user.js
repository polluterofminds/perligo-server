'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      email: {
        allowNull: false,
        unique: true,
        primaryKey: true,
        type: Sequelize.STRING
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      emailVerified: {
        allowNull: false,
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      passwordHash: {
        allowNull: false,
        type: Sequelize.STRING, 
        defaultValue: "hhaydhggg"
      },
      lastName: {
        allowNull: true,
        type: Sequelize.STRING
      },
      avatar: {
        allowNull: true, 
        type: Sequelize.STRING
      }, 
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};