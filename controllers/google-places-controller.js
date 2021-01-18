const axios = require("axios");

const findPlace = async (req, res, next) => {
  try {
    const key = process.env.GOOGLE_API_KEY;
    const city = "tokyo";
    const category = "ramen";
    const minPrice = 0;
    const maxPrice = 50;

    // const result = await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/output?parameters
    // `);

    const { data } = await axios
      .get
      //   `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?query=${category}+${city}&type=restaurant&minprice=${minPrice}&maxprice=${maxPrice}&key=${key}`
      //   `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=tokyo&inputtype=textquery&key=${key}`
      //   `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&key=${key}`
      ();
    res.json({ message: "success", data });
  } catch (err) {
    err.code = 404;
    err.message = "Could not find any results based on the request.";
    return next(err);
  }
};

exports.findPlace = findPlace;
