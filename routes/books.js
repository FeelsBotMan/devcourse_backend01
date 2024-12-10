const express = require('express');
const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
    res.json({ message: 'Books fetched successfully' });
});

router.get('/:id', (req, res) => {
    res.json({ message: 'Book fetched successfully', book: req.params.id });
});


module.exports = router;