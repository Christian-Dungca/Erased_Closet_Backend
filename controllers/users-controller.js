const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Christian Dungca",
    email: "test@test.com",
    password: "testtest",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const emailExist = DUMMY_USERS.find((u) => u.email === email);

  if (emailExist) {
    throw new HttpError("Could not create user. Email Already Exist", 422);
  }

  const createdUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ message: "user was created", user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((user) => user.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("Could not idenitfy user", 401);
  }

  res.json({ message: "Logged in", user: identifiedUser });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
