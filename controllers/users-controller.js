const { validationResult } = require("express-validator");
const mongoose = require('mongoose');


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
      "[FAILED] INVALID USER INPUT, COULD NOT SIGN UP",
      422
    );
    return next(err);
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email }).exec();
  } catch (err) {
    const error = new HttpError(
      "[FAILED] SIGNING UP FAILED",
      500
    );
    return next(error);
  }

  console.log('[EXISTING USER: ', existingUser);

  if (existingUser) {
    const error = new HttpError(
      "[FAILED] USER ALREADY EXIST",
      422
    );
    return next(error)
  }

  const createdUser = new User({
    name,
    email,
    password,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("[FAILURE] COULD NOT SAVE CREATED USER", 500);
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
    existingUser = await User.findOne({email: email}).exec();
    // existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "[FAILED] COULD NOT LOGIN",
      500
    );
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    console.log('[EXISTING USER]', existingUser);
    console.log(existingUser.password, password);
    const error = new HttpError(
      "[FAILED] INVALID CREDENTIALS, COULD NOT LOGIN USER",
      401
    );
    return next(error);
  }

  res.json({ message: "[SUCCESS] LOGGED IN", user: existingUser });
};

// WILL GO INTO USER
const addToCart = async (req, res, next) => {
  const prodId = req.params.pid;
  const user = req.user;
  let product;

  console.log(user);

  try {
    product = await Product.findById(prodId);
    user.addToCart(product);
    user.save();
  } catch (err) {
    const error = new HttpError("[FAILED] ITEM COULD NOT BE ADDED TO CART", 500);
    return next(error);
  }

  if (!product) {
    const error = new HttpError("[FAILED] COULD NOT FIND PRODUCT WITH PROVIDED ID", 404);
    return next(error);
  }

  res.json({ message: "[SUCCESS] ADDED ITEM TO CART", user: user, product: product });
};

const getCart = async (req, res, next) => {
  let user = req.user;
  let cart = [];

  try {
    await user.populate("cart.items.productId").execPopulate();
    cart = user.cart.items;
  } catch (err) {
    const error = new HttpError("[FAILED] COULD NOT FETCH CART DATA", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("[FAILED] USER DOES NOT EXIST", 404);
    return next(error);
  }

  res.json({ message: "[SUCCESS] SUCCESFULLY RETRIEVED USER'S CART", cartItems: cart });
};

const removeFromCart = async (req, res, next) => {
  const prodId = req.params.pid;
  let user = req.user;

  try {
    user.removeFromCart(prodId);
  } catch (err) {
    const error = new HttpError("[FAILED] COULD NOT REMOVE ITEM FROM CART", 500);
    return next(error);
  }

  res.json({ message: "[SUCCESS] REMOVED ITEM FROM CART", user: user });
};

const postOrder = async (req, res, nexdt) => {
  const user = req.user;
  let products;
  let order;

  try {
    await user.populate("cart.items.productId").execPopulate();
    products = user.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });
  } catch (err) {
    const error = new HttpError("[FAILED] CAN'T GET POPULATE USER CART", 500);
    return next(error);
  }

  try {
    order = new Order({
      user: {
        name: user.name,
        userId: user,
      },
      products: products,
    });
    order.save();
    user.clearCart();
  } catch (err) {
    const error = new HttpError("[FAILED] CAN NOT CREATE ORDER", 500);
  }

  res.json({ message: "[SUCCESS] CREATED ORDER", order: order });
};

const getOrders = async (req, res, next) => {
  const user = req.user;
  let orders;

  try {
    orders = await Order.find({ "user.userId": user._id });
  } catch (err) {
    const error = new HttpError("[FAILED] CAN NOT FIND ORDERS", 500);
    return next(error);
  }

  res.json({message: "[SUCCESS] ORDERS FETCHED", orders: orders})
};



exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.addToCart = addToCart;
exports.getCart = getCart;
exports.removeFromCart = removeFromCart;
exports.getOrders = getOrders;
exports.postOrder = postOrder;