// Initialize Libraries
const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  app = express();

app.use(bodyParser.json());

let movies = [
  {
    Title: "Hitman 47",
    Director: "Aleksander Bach",
    Genre: {
      Name: "Action",
      Description:
        "Agent 47 (Rupert Friend), known only by the bar code tattoo on his neck, is an elite international assassin. Engineered to be an unstoppable killing machine, 47 is contracted by a covert organization to assassinate high-profile targets on a global scale.",
    },
  },
  {
    Title: "Shrek",
    Director: "Andrew Adamson",
    Genre: {
      Name: "Adventure",
      Description:
        "Though surly, dangerous, cynical, misanthropic, and venomously cranky, Shrek is peaceful and does not care to hurt anyone, but just wants to live in solitude and be left alone. Shrek is accompanied by Donkey, an excitable and hyperactive talking donkey.",
    },
  },
];

let users = [
  {
    id: 1,
    name: "Kim",
    favoriteMovies: [],
  },
  {
    id: 2,
    name: "Joe",
    favoriteMovies: ["Hitman 47"],
  },
];

// CREATE
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

// UPDATE
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("No user has been found");
  }
});

// CREATE
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res
      .status(200)
      .send(`${movieTitle} has been added to the user ${id}'s array`);
  } else {
    res.status(400).send("No user has been found");
  }
});

// DELETE
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from from user ${id}'s array`);
  } else {
    res.status(400).send("No user has been found");
  }
});

// DELETE
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    users = users.filter((user) => user.id != id);
    res.status(200).send(`user ${id} has been removed`);
  } else {
    res.status(400).send("No user has been found");
  }
});

// READ
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

// READ
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("No movie has been found");
  }
});

// READ
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find((movie) => movie.Genre.Name === genreName)?.Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("No genre has been found");
  }
});

// READ
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(
    (movie) => movie.Director === directorName
  )?.Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("No director has been found");
  }
});

app.listen(8080, () => console.log("Listening on port 8080"));
