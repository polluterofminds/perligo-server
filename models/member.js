module.exports = (sequelize, DataTypes) => {
  const member = sequelize.define('member', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    group_id: {
      allowNull: false, 
      type: DataTypes.STRING
    }, 
    member: {
      allowNull: false, 
      type: DataTypes.STRING
    }
  });

  member.associate = function (models) {
    // associations can be defined here
    member.hasOne(models.user, {foreignKey: 'id', sourceKey: 'member'});
    member.hasOne(models.group, {foreignKey: 'id', sourceKey: 'group_id'});
  };

  return member;
}