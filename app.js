const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productsRoutes = require("./routes/product-routes");
const usersRoutes = require("./routes/user-routes");
const googlePlacesRoutes = require("./routes/google-places-routes");
const HttpError = require("./models/http-error");

dotenv.config({ path: "./config.env" });

const app = express();

// ChIJ51cu8IcbXWARiRtXIothAS4
// ChIJ68aBlEKuEmsRHUA9oME5Zh0

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/products", productsRoutes);
app.use("/api/users", usersRoutes);
app.use("/places", googlePlacesRoutes);

app.use((req, res, next) => {
  const error = new HttpError("could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    `mongodb+srv://christian:${process.env.DB_PASSWORD}@cluster0.zfuny.mongodb.net/erasedstore?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log('connected')
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  }); 
