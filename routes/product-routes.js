const express = require("express");
const { check } = require("express-validator");

const fileUpload = require('../middleware/file-upload');
const productsController = require("../controllers/products-controller");

const router = express.Router();

router.get("/", productsController.getProducts);

router.get("/:pid", productsController.getProductById);

router.post(
  "/",
  // fileUpload.single('image'),
  fileUpload.array('images', 2),
  [
    check("name").notEmpty(),
    check("type").notEmpty(),
    check("color").notEmpty(),
    check("size").notEmpty(),
    check("details").notEmpty(),
    check("price").notEmpty(),
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
    check("price").notEmpty(),
  ],
  productsController.updateProduct
);

router.delete("/:pid", productsController.deleteProduct);

module.exports = router;
