const conn = require('../mariadb');
const { StatusCodes } = require('http-status-codes');
const util = require('util');

const query = util.promisify(conn.query).bind(conn);

const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    await query('INSERT IGNORE INTO carts (user_id) VALUES (?)', [user_id]);
    const cartResult = await query('SELECT id FROM carts WHERE user_id = ?', [user_id]);
    const cart_id = cartResult[0].id;

    const existingItem = await query(
      'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cart_id, product_id]
    );

    if (existingItem.length > 0) {
      await query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
        [quantity, cart_id, product_id]
      );
    } else {
      await query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cart_id, product_id, quantity]
      );
    }
    res.status(StatusCodes.CREATED).json({ message: '상품이 장바구니에 추가되었습니다.' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.' });
  }
}

const getCartItems = async (req, res) => {
  try {
    const { user_id, selected_items } = req.body;

    const result = await query('SELECT * FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?) AND product_id IN (?)', [user_id, selected_items]);

    res.status(StatusCodes.OK).json({ message: '장바구니 조회 성공', cart: result });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
}

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    await query('DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?) AND product_id = ?', [user_id, id]);
    res.status(StatusCodes.OK).json({ message: '상품이 장바구니에서 삭제되었습니다.' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.' });
  }
}

module.exports = { addToCart, getCartItems, removeFromCart };

