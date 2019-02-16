var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");
var app = express();
app.use(cookieParser());

function generateRandomString(len) {
  function randomString(length, chars) {
    var result = "";
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }
  return (rString = randomString(
    len,
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  ));
}

let users = [
  {
    id: "maddie",
    email: "maddie@example.com",
    password: "123"
  },
  {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
];

function checkIfUserExists(email) {
  for (user in users) {
    if (users[user].email == email) {
      return true;
    }
  }
}

function getUserByEmail(email) {
  let currentUser;
  for (user in users) {
    if (users[user].email == email) {
      currentUser = users[user];
    }
  }
  return currentUser;
}

function getUserByUserId(id) {
  let currentUser;
  for (user in users) {
    if (users[user].id == id) {
      currentUser = users[user];
    }
  }
  return currentUser;
}

app.set("view engine", "ejs");

var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/login", (req, res) => {
  let user;
  if (req.cookies) {
    let user_id = req.cookies["user_id"];
    user = getUserByUserId(user_id);
  }
  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = { user: user, error: undefined };
    res.render("loginPage", templateVars);
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  console.log(email);
  console.log(password);
  // res.cookie('username', req.body.username);
  if (checkIfUserExists(email)) {
    let loggingInUser = getUserByEmail(email);
    if (loggingInUser.password === password) {
      //set cookie
      res.cookie("user_id", loggingInUser.id);
      res.redirect("/urls");
      //send the user to /urls
    } else {
      let templateVars = {
        error: `Password is incorrect`
      };
      res.status(403).render("loginPage", templateVars);
    }
  } else {
    let templateVars = {
      error: `User with email ${email} not found`
    };
    res.status(403).render("loginPage", templateVars);
  }

  res.redirect("/urls");
});

app.post("/test", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  console.log("You entered ", email, password);
  res.redirect("http://www.google.com");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let user;
  if (req.cookies) {
    let user_id = req.cookies["user_id"];
    user = getUserByUserId(user_id);
  }

  let templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_registration", { user: "" });
});
app.get("/urls/new", (req, res) => {
  let user;
  if (req.cookies) {
    let user_id = req.cookies["user_id"];
    user = getUserByUserId(user_id);
  }
  res.render("urls_new", { user: user });
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/:shortURL", (req, res) => {
  let user;
  if (req.cookies) {
    let user_id = req.cookies["user_id"];
    user = getUserByUserId(user_id);
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString(6)] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updateURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

function checkEmailDuplicate(email) {
  for (user in users) {
    if (users[user].email == email) {
      return true;
    }
  }
}
app.post("/register", (req, res) => {
  //check whether user email or password is empty
  if (req.body.email == "" || req.body.password == "") {
    //if the username or password is empty
    res.send("Hey!. Please enter email or password. They can't be blank");
  } else {
    //Both password and email were supplied
    //check for the email is existing or not
    if (checkEmailDuplicate(req.body.email)) {
      res.send("Sorry!. Email has already been taken");
    } else {
      //everything is fine.
      let newUserObject = {
        id: generateRandomString(6),
        email: req.body.email,
        password: req.body.password
      };
      users[newUserObject.id] = newUserObject;
      res.cookie("user_id", newUserObject.id);
      res.redirect("/urls");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
