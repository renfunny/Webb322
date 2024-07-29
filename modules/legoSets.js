require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Theme = sequelize.define("Theme", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
});

const Set = sequelize.define("Set", {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  year: {
    type: Sequelize.INTEGER,
  },
  num_parts: {
    type: Sequelize.INTEGER,
  },
  theme_id: {
    type: Sequelize.INTEGER,
  },
  img_url: {
    type: Sequelize.STRING,
  },
});

Set.belongsTo(Theme, { foreignKey: "theme_id" });

const initialize = () => {
  return sequelize
    .sync()
    .then(() => {
      return Promise.resolve();
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

const getAllSets = () => {
  return Set.findAll({
    include: Theme,
  })
    .then((sets) => {
      return Promise.resolve(sets);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

const getSetByNum = (setNum) => {
  return Set.findAll({
    include: Theme,
    where: {
      set_num: setNum,
    },
  })
    .then((sets) => {
      if (sets.length == 0) {
        return Promise.reject("Unable to find requested set");
      }
      return Promise.resolve(sets[0]);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

const getSetsByTheme = (theme) => {
  return Set.findAll({
    include: Theme,
    where: {
      "$Theme.name$": {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  })
    .then((sets) => {
      if (sets.length == 0) {
        return Promise.reject("Unable to find requested sets");
      }
      return Promise.resolve(sets);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

const addSet = (setData) => {
  return Set.create(setData)
    .then(() => {
      return Promise.resolve();
    })
    .catch((error) => {
      return Promise.reject(err.errors[0].message);
    });
};

const getAllThemes = () => {
  return Theme.findAll()
    .then((themes) => {
      return Promise.resolve(themes);
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

const editSet = (set_num, setData) => {
  return Set.update(
    {
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      img_url: setData.img_url,
      theme_id: setData.theme_id,
    },
    {
      where: {
        set_num: set_num,
      },
    }
  )
    .then(() => {
      return Promise.resolve();
    })
    .catch((err) => {
      return Promise.reject(err.errors[0].message);
    });
};

const deleteSet = (set_num) => {
  return Set.destroy({
    where: {
      set_num: set_num,
    },
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch((err) => {
      return Promise.reject(err.errors[0].message);
    });
};

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
};
