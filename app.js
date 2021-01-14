const express = require("express");
const bodyParser = require("body-parser");

const productsRoutes = require("./routes/product-routes");

const app = express();

app.use('/api/products', productsRoutes);

app.listen(5000);
