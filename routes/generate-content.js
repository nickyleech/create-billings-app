const express = require('express');
const router = express.Router();
const generateHandler = require('../api/generate-content');

router.all('/', generateHandler);

module.exports = router;