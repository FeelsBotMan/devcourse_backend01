const express = require('express');
const router = express.Router();

router.use(express.json());

router.post('/', (req, res) => {
    res.json({ message: 'Carts created successfully' });
});

router.get('/', (req, res) => {
    res.json({ message: 'Carts fetched successfully' });
});

router.delete('/:id', (req, res) => {
    res.json({ message: 'Carts deleted successfully', cart: req.params.id });
});

// router.get('/carts', (req, res) => {
//     res.json({ message: 'Carts fetched successfully' });
// });


module.exports = router;