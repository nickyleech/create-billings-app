const express = require('express');
const router = express.Router();
const timelineHandler = require('../api/timeline');

router.get('/', timelineHandler);

module.exports = router;