const express = require('express');
const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
    res.json({ message: 'Likes fetched successfully' });
});

router.post('/:id', (req, res) => {
    res.json({ message: 'Like created successfully', like: req.params.id });
});

router.delete('/:id', (req, res) => {
    res.json({ message: 'Like deleted successfully', like: req.params.id });
});



module.exports = router;
