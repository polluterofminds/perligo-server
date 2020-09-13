module.exports = (sequelize, DataTypes) => {
  const group = sequelize.define('group', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      allowNull: false, 
      type: DataTypes.STRING
    }, 
    admin: {
      allowNull: false, 
      type: DataTypes.STRING
    }
  });

  group.associate = function (models) {
    // associations can be defined here
    group.hasOne(models.user, {foreignKey: 'id', sourceKey: 'admin'});
  };

  return group;
}