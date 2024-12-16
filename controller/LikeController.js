const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const util = require('util');

const query = util.promisify(conn.query).bind(conn);

const countLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await query('SELECT COUNT(*) FROM likes WHERE product_id = ?', [id]);
    res.status(StatusCodes.OK).json(rows);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

const addLike = async (req, res) => {    
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    await query('INSERT INTO likes (product_id, user_id) VALUES (?, ?)', [id, user_id]);
    res.status(StatusCodes.CREATED).json({ message: 'Like created successfully' });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

const removeLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    await query('DELETE FROM likes WHERE product_id = ? AND user_id = ?', [id, user_id]);
    res.status(StatusCodes.OK).json({ message: 'Like deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
};

module.exports = { countLikes, addLike, removeLike };
