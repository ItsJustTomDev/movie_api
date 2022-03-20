const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/* This is creating a new schema. */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

/* This is creating a new schema. */
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

/* This is creating a static method that will hash the password. */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/* This is creating a method that will validate the password. */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

/* This is creating a new model. */
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

/* This is exporting the Movie and User models. */
module.exports.Movie = Movie;
module.exports.User = User;
