var express = require("express");
const bcrypt = require('bcrypt');
var app = express();
var PORT = 8080; // default port 8080
var cookieSession = require('cookie-session')
var app = express();
app.use(cookieSession({
  name: 'session',
  secret: 'maddiecodes',
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

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

let users = [];

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
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "maddie" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "maddie2"}
};

function getUrlsByUserId(userId) {
  let urls = {};
  for(key in urlDatabase) {
    let currentUrl = urlDatabase[key];
    if(currentUrl.userID == userId) {
      urls[key] = currentUrl;
    }
  }
  return urls;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/login", (req, res) => {
  let user;
  if (req.session) {
    let user_id = req.session.user_id;
    user = getUserByUserId(user_id);
  }
  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = { user: false, error: undefined };
    res.render("loginPage", templateVars);
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (checkIfUserExists(email)) {
    let loggingInUser = getUserByEmail(email);
    if(bcrypt.compareSync(password, loggingInUser.password)) {
      req.session.user_id = loggingInUser.id;
      res.redirect("/urls");
    } else {
      let templateVars = {
        user: false,
        error: `Password is incorrect`
      };
      res.status(403).render("loginPage", templateVars);
    }
  } else {
    let templateVars = {
      user: false,
      error: `User with email ${email} not found`
    };
    res.status(403).render("loginPage", templateVars);
  }
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
  if (req.session) {
    let user_id = req.session.user_id;
    user = getUserByUserId(user_id);
  }
  let userUrls = {};

  if(user) {
    userUrls = getUrlsByUserId(user.id);
  }

  let templateVars = { urls: userUrls, user: user };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_registration", { user: "" });
});

app.get("/urls/new", (req, res) => {
  let user;
  if (req.session) {
    let user_id = req.session.user_id;
    user = getUserByUserId(user_id);
  }
  if(user) {
    res.render("urls_new", { user: user });
  } else {
    res.redirect('/login');
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let user;
  if (req.session) {
    let user_id = req.session.user_id;
    user = getUserByUserId(user_id);
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let user;
  if (req.session) {
    let user_id = req.session.user_id;
    user = getUserByUserId(user_id);
  }
  let shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = { longURL: req.body.longURL, userID: user.id};
  console.log(req.body); // Log the POST request body to the console
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", (req, res) => {
  let user;
  if (req.session) {
    let user_id = req.session.user_id;
    user = getUserByUserId(user_id);
  }
  if(user) {
    let currentUrl = urlDatabase[req.params.shortURL];
    if(currentUrl.userID == user.id) {
      urlDatabase[req.params.shortURL].longURL = req.body.updateURL;
      res.redirect(`/urls/${req.params.shortURL}`);
    } else {
      res.redirect(`/urls/${req.params.shortURL}`);
    }
  } else {
    res.redirect('/login');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session) {
    let user_id = req.session.user_id;
    user = getUserByUserId(user_id);
  }
  if(user) {
    let currentUrl = urlDatabase[req.params.shortURL];
    if(currentUrl.userID == user.id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.redirect("/urls");
    }
  } else {
    res.redirect('/login');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
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
        password: bcrypt.hashSync(req.body.password, 10)
      };
      users[newUserObject.id] = newUserObject;
      req.session.user_id = newUserObject.id;
      res.redirect("/urls");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
