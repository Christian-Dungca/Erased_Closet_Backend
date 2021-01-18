const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Product = require("../models/product");

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

const getProducts = (req, res, next) => {
  res.json({ products: DUMMY_PRODUCTS });
};

const getProductById = async (req, res, next) => {
  const productId = req.params.pid;
  let product;

  try {
    product = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError("Could not find a product", 500);
    return next(error);
  }

  if (!product) {
    const error = new HttpError(
      "Could not find a product for the provided id.",
      404
    );
    return next(console.error);
  }

  res.json({ product: product.toObject({ getters: true }) });
};

const createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError(
      "Invalid information provided. Aborting creation of product",
      422
    );
  }

  const { name, type, details, color, size, image, images } = req.body;
  const createdProduct = new Product({
    name,
    type,
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
    const error = new HttpError("Creating Product failed.", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ message: "created new product", product: createdProduct });
};

const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError(
        "Invalid information provided. Aborting creation of product",
        422
      )
    );
  }

  const { name, type, color, size, details } = req.body;
  const productId = req.params.pid;
  let updatedProduct;

  try {
    updatedProduct = await Product.findById(productId);
  } catch (err) {
    const error = new HttpError("Could not find a product", 500);
    return next(error);
  }

  updatedProduct.name = name;
  updatedProduct.type = type;
  updatedProduct.color = color;
  updatedProduct.size = size;
  updatedProduct.details = details;

  try {
    await updatedProduct.save();
  } catch (err) {
    const error = new HttpError(
      "Could not find a product for the provided id.",
      500
    );
    return next(error);
  }

  res.status(201).json({
    message: "Upated product",
    product: updatedProduct.toObject({ getters: true }),
  });
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.pid;
  let deletedProduct;

  try {
    deletedProduct = await Product.findById(productId);
  } catch (error) {
    const err = new HttpError("Could not find product to delete", 404);
    return next(err);
  }

  try {
    await deletedProduct.remove();
  } catch (error) {
    const err = new HttpError("Could not delete product", 404);
    return next(err);
  }

  res.status(200).json({ message: "deleted product", deletedProduct });
};

exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
