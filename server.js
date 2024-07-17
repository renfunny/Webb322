/*********************************************************************************
 * WEB322 – Assignment 4
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Renato Cordova
 * Student ID: 153325238
 * Date: 07/07/2024
 *  Published URL: https://webb322-6ftz0a4fv-renfunnys-projects.vercel.app/
 *
 ********************************************************************************/
const legoData = require("./modules/legoSets");
const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const HTTP_PORT = process.env.PORT || 8000;

legoData.initialize().then(
  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on: ${HTTP_PORT}`);
  })
);

app.get("/", (req, res) => {
  res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
  res.render("about", { page: "/about" });
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData
      .getSetsByTheme(theme)
      .then((data) => {
        res.render("sets", { sets: data, page: "/lego/sets" });
      })
      .catch((err) => {
        res.status(404).send(err.message);
      });
  } else {
    legoData
      .getAllSets()
      .then((data) => {
        res.render("sets", { sets: data, page: "/lego/sets" });
      })
      .catch((err) => {
        res.status(404).send(err.message);
      });
  }
});

app.get("/lego/sets/:set_num", (req, res) => {
  const set_num = req.params.set_num;
  legoData
    .getSetByNum(set_num)
    .then((data) => {
      res.render("set", { set: data, page: `/lego/sets/${set_num}` });
    })
    .catch((err) => {
      res.status(404).send(err.message);
    });
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});
