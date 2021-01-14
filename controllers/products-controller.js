const HttpError = require("../models/http-error");

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "World Wide Syndicate Sweatshirt",
    type: "shirts",
    description:
      "V-neck shirt with lapel collar. Long sleeves with cuffs. Front tie at hem. Front button closure. ",
    color: "green",
    size: "medium",
    inBag: false,
    images: undefined,
    imageUrl: "../assets/images/big-model-yellow-hat.jpg",
  },
  {
    id: 2,
    name: "product name",
    type: "shirts",
    description: undefined,
    color: "yellow",
    size: undefined,
    inBag: false,
    images: undefined,
    imageUrl: "../assets/images/big-model-yellow-hat.jpg",
  },
  {
    id: 3,
    name: "product name",
    type: "shirts",
    description: undefined,
    color: "yellow",
    size: undefined,
    inBag: false,
    images: undefined,
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

exports.getProducts = getProducts;
exports.getProductById = getProductById;
