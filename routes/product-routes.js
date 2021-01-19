const express = require("express");
const { check } = require("express-validator");

const productsController = require("../controllers/products-controller");

const router = express.Router();

router.get("/", productsController.getProducts);

router.get("/cart", productsController.getCart);

router.delete("/cart/:pid", productsController.removeFromCart);

router.post("/cart/:pid", productsController.addToCart);

router.get("/:pid", productsController.getProductById);

router.post(
  "/",
  [
    check("name").notEmpty(),
    check("type").notEmpty(),
    check("color").notEmpty(),
    check("size").notEmpty(),
    check("details").notEmpty(),
  ],
  productsController.createProduct
);

router.patch(
  "/:pid",
  [
    check("name").notEmpty(),
    check("type").notEmpty(),
    check("color").notEmpty(),
    check("size").notEmpty(),
    check("details").notEmpty(),
  ],
  productsController.updateProduct
);

router.delete("/:pid", productsController.deleteProduct);

module.exports = router;
