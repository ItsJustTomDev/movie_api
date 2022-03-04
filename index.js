// Express init
const express = require("express");
const app = express();

// Import Morgan middleware lib
const morgan = require("morgan"); 

// Log basic request data in the terminal with Morgan
app.use(morgan("common"));

// Array that holds object of movies
let movies = [
  {
    name: "Movie 1",
    director: "Director 1",
  },
  {
    name: "Movie 2",
    director: "Director 2",
  },
  {
    name: "Movie 3",
    director: "Director 3",
  },
];

// GET movies JSON object for "/movies" request URL
app.get("/movies", (req, res) => {
  res.json(movies);
});

// GET message for "/" request URL
app.get("/", (req, res) => {
  res.send("Hello from MyFlix!");
});

// Static content from 'public' directory
app.use(express.static("public"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Some error has occured");
});

app.listen(3000, () => console.log("App is listening on port 3000"));
