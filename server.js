/*********************************************************************************
 * WEB322 – Assignment 6
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Name: Renato Cordova
 * Student ID: 153325238
 * Date: 07/31/2024
 *  Published URL: https://webb322-6ftz0a4fv-renfunnys-projects.vercel.app/
 *
 ********************************************************************************/
const clientSessions = require("client-sessions");
const authData = require("./modules/auth-service");
const legoData = require("./modules/legoSets");
const express = require("express");
const app = express();
const path = require("path");
//
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322_assignment5_anvjcdnwieudjasanc",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const HTTP_PORT = process.env.PORT || 8000;

legoData
  .initialize()
  .then(authData.initialize)
  .then(
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: ${HTTP_PORT}`);
    })
  )
  .catch((err) => {
    console.log(err, "Error initializing services");
  });

app.get("/login", (req, res) => {
  res.render("login", { page: "/login", errorMessage: "" });
});

app.get("/register", (req, res) => {
  res.render("register", {
    page: "/register",
    errorMessage: "",
    successMessage: "",
  });
});

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", {
        successMessage: "User created",
        errorMessage: "",
      });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
        successMessage: "",
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");

  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory", { page: "/userHistory", user: req.session.user });
});

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
        res.render("404", { message: err.message });
      });
  } else {
    legoData
      .getAllSets()
      .then((data) => {
        res.render("sets", { sets: data, page: "/lego/sets" });
      })
      .catch((err) => {
        res.render("404", { message: err.message });
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
      res.render("404", { message: err.message });
    });
});

app.get("/lego/addSet", (req, res) => {
  legoData
    .getAllThemes()
    .then((data) => {
      res.render("addSet", { themes: data, page: "/lego/addSet" });
    })
    .catch((err) => {
      res.render("404", { message: err.message });
    });
});

app.post("/lego/addSet", ensureLogin, (req, res) => {
  legoData
    .addSet(req.body)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", { message: err.message });
    });
});

app.get("/lego/editSet/:num", ensureLogin, (req, res) => {
  const set_num = req.params.num;
  legoData
    .getSetByNum(set_num)
    .then((setData) => {
      legoData
        .getAllThemes()
        .then((themesData) => {
          res.render("editSet", {
            themes: themesData,
            set: setData,
          });
        })
        .catch((err) => {
          res.render("404", { message: err.message });
        });
    })
    .catch((err) => {
      res.render("404", { message: err.message });
    });
});

app.post("/lego/editSet", ensureLogin, (req, res) => {
  const set_num = req.body.set_num;
  const setData = req.body;
  legoData
    .editSet(set_num, setData)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", { message: err.message });
    });
});

app.get("/lego/deleteSet/:num", ensureLogin, (req, res) => {
  const set_num = req.params.num;
  legoData
    .deleteSet(set_num)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", { message: err.message });
    });
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "I'm sorry, we're unable to find what you're looking for",
  });
});
