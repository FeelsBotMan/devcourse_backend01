const conn = require('../mariadb')
const {StatusCodes} = require('http-status-codes')
const util = require('util');

const query = util.promisify(conn.query).bind(conn);

const allCategories = async (req, res) => {
    try {
        const [result] = await query('SELECT * FROM categories');
        res.status(StatusCodes.OK).json({message: '카테고리 조회 성공', categories: result});
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: '서버 오류가 발생했습니다.'});
    }
}

module.exports = {
    allCategories
}
