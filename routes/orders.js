const express = require('express');
const router = express.Router();

router.use(express.json());

router.post('/', (req, res) => {
    res.json({ message: 'Orders created successfully' });
});

router.get('/', (req, res) => {
    res.json({ message: 'Orders fetched successfully' });
});

router.get('/:id', (req, res) => {
    res.json({ message: 'Orders fetched successfully', order: req.params.id });
});


module.exports = router;