const express = require('express');
const router = express.Router();
const authHandler = require('../api/auth');

router.all('/', authHandler);

module.exports = router;