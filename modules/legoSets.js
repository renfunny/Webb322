const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    try {
      setData.forEach((element) => {
        sets.push(element);
      });

      sets.forEach((set) => {
        set.theme = themeData.find((theme) => theme.id === set.theme_id).name;
      });

      resolve(console.log("The 'sets' array has been initialized"));
    } catch (error) {
      reject(error);
    }
  });
};

const getAllSets = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(sets);
    } catch (error) {
      reject(error);
    }
  });
};

const getSetByNum = (setNum) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(sets.find((set) => set.set_num === setNum));
    } catch (error) {
      reject(error, "Unable to find set");
    }
  });
};

const getSetsByTheme = (theme) => {
  //must format so each word is lowercase
  return new Promise((resolve, reject) => {
    try {
      const filterredSets = sets.filter((set) =>
        set.theme.toLowerCase().includes(theme.toLowerCase())
      );
      resolve(filterredSets);
    } catch (error) {
      reject(error, "Unable to find sets by theme");
    }
  });
};

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
