const express = require("express");

const productsController = require('../controllers/products-controller');

const router = express.Router();

router.get("/", productsController.getProducts);

router.get("/:pid", productsController.getProductById);

router.post("/", productsController.createProduct);

router.patch("/:pid", productsController.updateProduct);

router.delete("/:pid", productsController.deleteProduct);

module.exports = router;
