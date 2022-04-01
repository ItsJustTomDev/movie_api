/* This is creating an instance of the express framework and assigning it to the variable `app`. */
const express = require("express"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  { check, validationResult } = require("express-validator");
app = express();

/* This is telling the server to use the bodyParser middleware. This middleware will parse the body of
the request and place the data on the request object as req.body. */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* This is setting up the CORS policy for the server. */
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "https://624715e9eb349f00081d36c7--harmonious-gecko-34803e.netlify.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

/* This is creating a variable called `Models` that is an object that contains the `Movie` and `User`
models. */
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

/* This is connecting to the database. */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* This is creating an instance of the passport framework and assigning it to the variable `passport`. */
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

/* This is creating a route that will send a welcome message when the user goes to the root of the
server. */
app.get("/", (req, res) => {
  res.send("Welcome to myFlix!");
});

/* Creating a new user. */
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send(" Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(" Error: " + error);
      });
  }
);

/* This is returning all users in the database. */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/* This is returning a user by their username. If the user is found, we return a status code of 200
with the user, if a error occured we return 500 with the error. */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/* This is updating a user's information. */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) throw err;
        res.json(updatedUser);
      }
    );
  }
);

/* This is adding a movie to a user's list of favorites. */
app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) throw err;
        res.json(updatedUser);
      }
    );
  }
);

/* This is returning a movie by its title. If the movie is found, we return a status code of 200 with
the movie, if a error occured we return 500 with the error. */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.status(200).json(movie);
      })
      .catch((err) => {
        res.status(500).send("Error: " + err);
      });
  }
);

/* This is returning a director by their name. If the director is found, we return a status code of 200
with the director, if a error occured we return 500 with the error. */
app.get(
  "/director/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/* This is returning a genre by its name. If the genre is found, we return a status code of 200 with
the genre, if a error occured we return 500 with the error. */
app.get(
  "/genre/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then((movie) => {
        res.status(200).json(movie.Genre.Description);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/* This is returning all movies in the database. */
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

/* This is deleting a user by their username. If the user is found, we delete the user and return a
status code of 200. If the user is not found, we return a status code of 400. If an error occurs, we
return a status code of 500. */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/* We are using the `listen` method to start the server. We are passing in the port
number and a callback function. */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
