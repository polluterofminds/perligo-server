require("dotenv").config();
const { DataSource } = require("apollo-datasource");
const db = require("../utils");
const Group = db.models.group;
const Member = db.models.member;
const { v4: uuidv4 } = require('uuid');
const group = require("../models/group");

class GroupAPI extends DataSource {
  constructor() {
    super();
  }

  createGroup = async ({name, admin}) => {
    try {
      const results = await db.sequelize.transaction(async (t) => {

        const group = await Group.create({
          name, 
          admin
        }, { transaction: t });
    
        await Member.create({
          group_id: group.id,
          member: admin
        }, { transaction: t })
    
        return group;
    
      });       
      if(results) {
        return {
          message: "Successfully created group", 
          body: JSON.stringify(results.dataValues)
        }       
      } else {
        return {
          error: true, 
          message: 'Trouble creating group', 
          code: 500
        }
      }
    } catch (error) {
      return {
        error: true, 
        message: JSON.stringify(error), 
        code: 500
      }
    }
  }
}

module.exports = GroupAPI;