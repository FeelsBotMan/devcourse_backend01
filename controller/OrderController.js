const connection = require('../mariadb');

// 주문 생성
const order = async (req, res) => {
  const { userId, addressId, cartId } = req.body;

  try {
    // 사용자, 주소, 장바구니 검증
    const [user] = await connection.promise().query(`SELECT * FROM users WHERE id = ?`, [userId]);
    if (user.length === 0) return res.status(404).json({ error: 'User not found' });

    const [address] = await connection
      .promise()
      .query(`SELECT * FROM shipping_addresses WHERE id = ? AND user_id = ?`, [addressId, userId]);
    if (address.length === 0) return res.status(404).json({ error: 'Address not found' });

    const [cartItems] = await connection
      .promise()
      .query(
        `SELECT ci.quantity, b.price
         FROM cart_items ci
         JOIN books b ON ci.product_id = b.id
         WHERE ci.cart_id = ?`,
        [cartId]
      );
    if (cartItems.length === 0) return res.status(404).json({ error: 'Cart not found or empty' });

    // 총 주문 금액 계산
    const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // 주문 생성
    const [result] = await connection
      .promise()
      .query(
        `INSERT INTO orders (user_id, address_id, cart_id, total_price, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [userId, addressId, cartId, totalPrice]
      );

    const orderId = result.insertId;

    res.status(201).json({ message: 'Order created', orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 전체 주문 가져오기
const getOrders = async (req, res) => {
  try {
    const [orders] = await connection
      .promise()
      .query(
        `SELECT o.id, o.total_price, o.status, o.created_at, u.username, u.email, 
                sa.name AS recipient_name, sa.address_line_1, sa.city, sa.state, sa.postal_code
         FROM orders o
         JOIN users u ON o.user_id = u.id
         JOIN shipping_addresses sa ON o.address_id = sa.id`
      );

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 특정 주문 상세정보 가져오기
const getOrderDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const [order] = await connection
      .promise()
      .query(
        `SELECT o.id, o.total_price, o.status, o.created_at, u.username, u.email, 
                sa.name AS recipient_name, sa.address_line_1, sa.city, sa.state, sa.postal_code
         FROM orders o
         JOIN users u ON o.user_id = u.id
         JOIN shipping_addresses sa ON o.address_id = sa.id
         WHERE o.id = ?`,
        [id]
      );

    if (order.length === 0) return res.status(404).json({ error: 'Order not found' });

    const [cartItems] = await connection
      .promise()
      .query(
        `SELECT ci.quantity, b.title, b.price
         FROM cart_items ci
         JOIN books b ON ci.product_id = b.id
         WHERE ci.cart_id = (SELECT cart_id FROM orders WHERE id = ?)`,
        [id]
      );

    res.status(200).json({ order: order[0], items: cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  order,
  getOrders,
  getOrderDetail,
};
