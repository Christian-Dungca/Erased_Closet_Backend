const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

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

const getProductById = (req, res, next) => {
  const productId = req.params.pid;

  const product = DUMMY_PRODUCTS.find((prod) => {
    return prod.id === +productId;
  });

  if (!product) {
    const error = new HttpError(
      "Could not find a product for the provided id.",
      404
    );
    throw error;
  }

  res.json({ product: product });
};

const createProduct = (req, res, next) => {
  const { name, type, color, size, details } = req.body;

  const createdProduct = {
    id: uuidv4(),
    name,
    type,
    color,
    size,
    details,
  };

  DUMMY_PRODUCTS.push(createdProduct);
  res.status(201).json({ product: createdProduct });
};

const updateProduct = (req, res, next) => {
  const { name, type, color, size, details } = req.body;
  const productId = req.params.pid;

  const updatedProduct = {
    ...DUMMY_PRODUCTS.find((product) => {
      return product.id === +productId;
    }),
    name: name, 
    type: type,
    color: color,
    size: size,
    details: details
  };

  console.log(updatedProduct)

  const productIndex = DUMMY_PRODUCTS.findIndex(
    (product) => product.id === +productId
  );

  DUMMY_PRODUCTS[productIndex] = updatedProduct;
  res.status(201).json({ product: updatedProduct });
};

const deleteProduct = (req, res, next) => {
  const productId = req.params.pid;

  DUMMY_PRODUCTS = DUMMY_PRODUCTS.filter(product => {
    return product.id !== +productId
  })

  res.status(200).json({message: 'deleted product'})
};

exports.getProducts = getProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
