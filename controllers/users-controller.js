const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Christian Dungca",
    email: "test@test.com",
    password: "testtest",
  },
];

const getUsers = async (req, res, next) => {
  // const users = User.find({}, 'name email');
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (error) {
    const err = new HttpError(
      "Fetching users failed, please try again later",
      500
    );
    return next(err);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new HttpError(
      "Invalid User input, please check entered data.",
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
      "Signing up failed, please try again later",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exist already, please login instead",
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
    const error = new HttpError("Signed up failed", 500);
    return next(error);
  }

  res.status(201).json({
    message: "Successfully signed up user",
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
      "Logging in failed, please try again later",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    console.log(existingUser);
    console.log(existingUser.password, password);
    const error = new HttpError(
      "Invalid credentials, could not login user",
      401
    );
    return next(error);
  }

  res.json({ message: "Logged in", user: existingUser });
};



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
