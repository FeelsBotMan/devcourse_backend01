const express = require('express');
const router = express.Router();


const {
    allBooks,
    bookDetail
} = require('../controller/BookController');

router.use(express.json());

// 전체 책 조회
router.get('/', allBooks);

// 책 상세 조회
router.get('/:id', bookDetail);


module.exports = router;