const express = require('express');
const router = express.Router();

router.use(express.json());

const {
    allCategories
} = require('../controller/CategoryController');

router.get('/', allCategories);

module.exports = router;