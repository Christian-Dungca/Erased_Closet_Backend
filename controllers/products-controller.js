const fs = require("fs");

const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
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

  res.json({
    message: "[SUCCESS]",
    product: product.toObject({ getters: true }),
  });
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

  const { name, type, price, details, color, size, images } = req.body;

  const reqFiles = [];
  console.log("req.files: ", req.files);
  for (var i = 0; i < req.files.length; i++) {
    reqFiles.push(req.files[i].path);
    // reqFiles.push(req.files[i].filename);
  }

  const createdProduct = new Product({
    name,
    type,
    price: +price,
    details,
    color,
    size,
    image: "https://picsum.photos/seed/picsum/200/300",
    // image: req.file.path,
    images: reqFiles,
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
    const error = new HttpError(
      "[FAILED] COULD NOT GET PRODUCT WITH PROVIDED ID",
      404
    );
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
    const error = new HttpError("[FAILED] COULD NOT UPDATE PRODUCT", 500);
    return next(error);
  }

  res.status(201).json({
    message: "[SUCCESS] UPDATED PRODUCT",
    product: updatedProduct.toObject({ getters: true }),
  });
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.pid;
  let product;

  try {
    product = await Product.findById(productId);
  } catch (error) {
    const err = new HttpError(
      "[FAILED] COULD NOT FIND PRODUCT WITH PROVIDED ID",
      404
    );
    return next(err);
  }

  const imagesPath = product.images;
  console.log(imagesPath);

  try {
    await product.remove();
  } catch (error) {
    const err = new HttpError("[FAILED] COULD NOT DELETE PRODUCT FROM DB", 404);
    return next(err);
  }

  for (const imageUrl of imagesPath) {
    fs.unlink(imageUrl, (err) => {
      console.log(err);
    });
  }
  // fs.unlink(imagePath, (err) => {
  //   console.log(err);
  // });

  res.status(200).json({ message: "[SUCCESS] DELETED PRODUCT", product });
};

exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
