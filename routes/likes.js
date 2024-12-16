const express = require('express');
const router = express.Router();

const { countLikes, addLike, removeLike } = require('../controller/LikeController');

router.use(express.json());

router.get('/:id', countLikes);

router.post('/:id', addLike);

router.delete('/:id', removeLike);



module.exports = router;
