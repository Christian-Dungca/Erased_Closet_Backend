const express = require("express");
const { body } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  [
    body("name").notEmpty(),
    body("email").normalizeEmail().isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

router.get("/orders", usersController.getOrders);

router.post("/create-order", usersController.postOrder);

router.get("/cart", usersController.getCart);

router.delete("/cart/:pid", usersController.removeFromCart);

router.post("/cart/:pid", usersController.addToCart);

module.exports = router;
