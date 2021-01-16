const dotenv = require('dotenv');
const express = require("express");
const bodyParser = require("body-parser");

const productsRoutes = require("./routes/product-routes");
const usersRoutes = require("./routes/user-routes");
const HttpError = require("./models/http-error");

dotenv.config({path: './config.env'});

const app = express();

app.use(bodyParser.json());

app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError("could not find this route.", 404)
    throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

app.listen(5000);
