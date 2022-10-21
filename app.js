var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var morgan = require("morgan");
var User = require("./models/User");
var nuser = require("./models/nuser");
var user2 = require("./models/transfer");
var alert = require("alert");

var app = express();
app.set("port", 4000);
app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    key: "user_sid",
    secret: "somerandonstuffs",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie("user_sid");
  }
  next();
});
var sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};
//for signup
app.get("/", sessionChecker, (req, res) => {
  res.redirect("/login");
});

app
  .route("/signup")
  .get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + "/views/signup.html");
  })
  .post((req, res) => {
    var user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    user.save((err, docs) => {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        console.log(docs);
        req.session.user = docs;
        res.redirect("/dashboard");
      }
    });
  });

//for login

app
  .route("/login")
  .get(sessionChecker, (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
  })
  .post(async (req, res) => {
    var username = req.body.username,
      password = req.body.password;

    try {
      var user = await User.findOne({ username: username }).exec();
      if (!user) {
        res.redirect("/signup");
      }
      user.comparePassword(password, (error, match) => {
        if (!match) {
          res.redirect("/signup");
        }
      });
      req.session.user = user;
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  });

//for dashboard

app.get("/dashboard", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(__dirname + "/views/dashboard.html");
  } else {
    res.redirect("/login");
  }
});

//for createaccount

app
  .route("/createaccount")
  .get((req, res) => {
    res.sendFile(__dirname + "/views/createaccount.html");
  })
  .post((req, res) => {
    var user = new nuser({
      nusername: req.body.nusername,
      nemail: req.body.nemail,
      mobile: req.body.mobile,
      amount: req.body.amount,
    });
    user.save((err, docs) => {
      if (err) {
        console.log(err);
        alert("account created failed");
      } else {
        console.log(docs);
      
       alert("account created success");
      }
    });
  });

//viewuser

app.get("/viewuser", (req, res) => {
  const allData = nuser.find({});
  allData.exec((err, docs) => {
    if (err) {
      throw err;
    } else {
      console.log(docs);
      res.render("viewuser", { title: "View Users", docs: docs });
    }
  });
});

//transact

app
  .route("/transact")
  .get((req, res) => {
    res.sendFile(__dirname + "/views/transact.html");
  })
  .post((req, res) => {
    var user = new user2({
      sender: req.body.sender,
      receiptner: req.body.receiptner,
      amount: req.body.amount,
      date: req.body.date,
    });
    user.save((err, docs) => {
      if (err) {
        console.log(err);
        alert("transact failed");
      } else {
        console.log(docs);
        alert("transact success");
      }
    });
  });

//transhistory
app.get("/transactionhistory", (req, res) => {
  const allData = user2.find({});
  allData.exec((err, docs) => {
    if (err) {
      throw err;
    } else {
      console.log(docs);
      res.render("transactionhistory", { title: "transhistory", docs: docs });
    }
  });
});

//logout
app.get("/logout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");

    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.use(function (err, res, next) {
  res.status(404).send("Sorry can't find that!");
});

app.listen(app.get("port"), () =>
  console.log(`App started on port ${app.get("port")}`)
);
