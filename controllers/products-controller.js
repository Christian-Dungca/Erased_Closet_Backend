const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

let DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "World Wide Syndicate Sweatshirt",
    type: "shirts",
    details:
      "V-neck shirt with lapel collar. Long sleeves with cuffs. Front tie at hem. Front button closure. ",
    color: "green",
    size: "medium",
    imageUrl: "../assets/images/big-model-yellow-hat.jpg",
  },
  {
    id: 2,
    name: "product name",
    type: "shirts",
    details: undefined,
    color: "yellow",
    size: undefined,
    imageUrl: "../assets/images/big-model-yellow-hat.jpg",
  },
  {
    id: 3,
    name: "product name",
    type: "shirts",
    details: undefined,
    color: "yellow",
    size: undefined,
    imageUrl: "../assets/images/big-model-yellow-hat.jpg",
  },
];

const getProducts = async (req, res, next) => {
  let products;
  try {
    products = await Product.find({});
  } catch (err) {
    const error = new HttpError("[INTERNAL ERROR] COULD NOT GET PRODUCTS", 500);
    return next(error);
  }

  if (!products) {
    const error = new HttpError("No products found", 404);
    return next(error);
  }

  res.json({ message: "[SUCCESS] GOT PRODUCTS", products: products });
};

const getProductById = async (req, res, next) => {
  const productId = req.params.pid;
  let product;

  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError("[INTERNAL ERROR] COULD NOT GET PRODUCT", 500);
    return next(error);
  }

  if (!product) {
    const error = new HttpError(
      "[FAILED] COULD NOT FIND PRODUCT WITH GIVEN ID",
      404
    );
    return next(console.error);
  }

  res.json({ message: "[SUCCESS]", product: product.toObject({ getters: true }) });
};

const createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError(
      "[FAILED] INVALID DATA PROVIDED. CANNOT CREATE PRODUCT",
      422
    );
  }

  const { name, type, price, details, color, size, image, images } = req.body;
  const createdProduct = new Product({
    name,
    type,
    price,
    details,
    color,
    size,
    image: "https://picsum.photos/id/237/200/300",
    images: [
      "https://picsum.photos/seed/picsum/200/300",
      "https://picsum.photos/200/300?grayscale",
    ],
  });

  try {
    await createdProduct.save();
  } catch (err) {
    const error = new HttpError("[FAILED] COULDN'T SAVE PRODUCT TO DB", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ message: "[SUCCESS] PRODUCT CREATED", product: createdProduct });
};

const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError(
        "[FAILED] INVALID DATA PROVIDED. CANNOT CREATE PRODUCT",
        422
      )
    );
  }

  const { name, type, price, color, size, details } = req.body;
  const productId = req.params.pid;
  let updatedProduct;

  try {
    updatedProduct = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError("[FAILED] COULD NOT GET PRODUCT WITH PROVIDED ID", 404);
    return next(error);
  }

  updatedProduct.name = name;
  updatedProduct.type = type;
  updatedProduct.price = price;
  updatedProduct.color = color;
  updatedProduct.size = size;
  updatedProduct.details = details;

  try {
    await updatedProduct.save();
  } catch (err) {
    const error = new HttpError(
      "[FAILED] COULD NOT UPDATE PRODUCT",
      500
    );
    return next(error);
  }

  res.status(201).json({
    message: "[SUCCESS] UPDATED PRODUCT",
    product: updatedProduct.toObject({ getters: true }),
  });
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.pid;
  let deletedProduct;

  try {
    deletedProduct = await Product.findById(productId);
  } catch (error) {
    const err = new HttpError("[FAILED] COULD NOT FIND PRODUCT WITH PROVIDED ID", 404);
    return next(err);
  }

  try {
    await deletedProduct.remove();
  } catch (error) {
    const err = new HttpError("[FAILED] COULD NOT DELETE PRODUCT FROM DB", 404);
    return next(err);
  }

  res.status(200).json({ message: "[SUCCESS] DELETED PRODUCT", deletedProduct });
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
  let user;
  let products;
  let order;

  try {
    user = await User.findById("60081d8621af760bd1e051f9");
    await user.populate("cart.items.productId").execPopulate();
    products = user.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });
  } catch (err) {
    const error = new HttpError("Can't get user by that id", 500);
    return next(error);
  }

  if (!user || products.length < 0) {
    const error = new HttpError("No User Found || nothing in cart", 404);
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
    await order.save();
    await user.clearCart();
  } catch (err) {
    const error = new HttpError("Could not create user", 500);
  }

  res.json({ message: "created order", order: order });
};

const getOrders = async (req, res, next) => {
  let user;
  let orders;

  try {
    user = await User.findById("60081d8621af760bd1e051f9");
  } catch (err) {
    const error = new HttpError("Can't get user by that id", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("No User Found || nothing in cart", 404);
    return next(error);
  }

  console.log(user._id);

  try {
    orders = await Order.find({ "user.userId": user._id });
  } catch (err) {
    const error = new HttpError("Can't get orders from that user", 500);
    return next(error);
  }

  res.json({orders: orders})
};

exports.getOrders = getOrders;
exports.postOrder = postOrder;
exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.addToCart = addToCart;
exports.getCart = getCart;
exports.removeFromCart = removeFromCart;
