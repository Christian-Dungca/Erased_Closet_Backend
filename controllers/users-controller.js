const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (error) {
    const err = new HttpError(
      "[FAILED] FETCHING USERS FAILED",
      500
    );
    return next(err);
  }
  res.json({ message: "[SUCCESS] GOT ALL USERS", users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new HttpError(
      "[FAILED] INVALID USER INPUT, COULD NOT SIGN IN",
      422
    );
    return next(err);
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "[FAILED] SIGNING UP FAILED",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "[FAILED] USER ALREADY EXIST",
      422
    );
  }

  const createdUser = new User({
    name,
    email,
    password,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("[SUCCESS] COULD NOT CREATE USER", 500);
    return next(error);
  }

  res.status(201).json({
    message: "[SUCCESS] SIGNED UP USER",
    user: createdUser.toObject({ getters: true }),
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "[FAILED] COULD NOT LOGIN",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    console.log(existingUser);
    console.log(existingUser.password, password);
    const error = new HttpError(
      "[FAILED] INVALID CREDENTIALS, COULD NOT LOGIN USER",
      401
    );
    return next(error);
  }

  res.json({ message: "[SUCCESS] LOGGED IN", user: existingUser });
};



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
