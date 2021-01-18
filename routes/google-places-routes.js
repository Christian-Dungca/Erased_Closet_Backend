const express = require('express');
const googlePlacesController = require('../controllers/google-places-controller');

const router = express.Router();

router.get('/findPlace', googlePlacesController.findPlace);

module.exports = router;