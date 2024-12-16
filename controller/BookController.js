const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes')
const util = require('util');

const query = util.promisify(conn.query).bind(conn);

const allBooks = async (req, res) => {
    const {category_id, newly, page = 1, limit = 10} = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    if (isNaN(pageNum) || isNaN(limitNum)) {
        return res.status(StatusCodes.BAD_REQUEST).json({message: '페이지 또는 한계값이 유효하지 않습니다.'});
    }

    let sql = 'SELECT *, (SELECT COUNT(*) FROM likes WHERE book_id = books.id) AS likes_count FROM books';
    let params = [];
    if (category_id && newly !== undefined) {
        sql += ' WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
        params.push(category_id);
    } else if (category_id) {
        sql += ' WHERE category_id = ?';
        params.push(category_id);
    } else if (newly !== undefined) {
        sql += ' WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()';
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    try {
        const result = await query(sql, params);
        if (result.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({message: '조회 결과가 없습니다.'});
        } else {
            res.status(StatusCodes.OK).json({message: '책 조회 성공', books: result});
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: '서버 오류가 발생했습니다.'});
    }


}

const bookDetail = async (req, res) => {
    try {
        const { user_id } = req.body;
        const book_id = req.params.id;
        const [result] = await query(`SELECT b.*, c.name AS category_name, (SELECT COUNT(*) FROM likes WHERE book_id = b.id) AS likes_count, CASE WHEN EXISTS (SELECT 1 FROM likes WHERE book_id = b.id AND user_id = ?) THEN TRUE ELSE FALSE END AS user_liked FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ?`, [user_id, book_id]);
        if (result.length === 0) {
            res.status(StatusCodes.NOT_FOUND).json({message: '조회 결과가 없습니다.'});
        } else {
            res.status(StatusCodes.OK).json({message: '책 상세 조회 성공', book: result});
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: '서버 오류가 발생했습니다.'});
    }
}



module.exports = {
    allBooks,
    bookDetail
}

