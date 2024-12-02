const express = require('express');
const usersRouter = express.Router();
const conn = require('../mariadb');
const bcrypt = require('bcrypt');
const util = require('util');

const query = util.promisify(conn.query).bind(conn);

usersRouter.get('/login', async (req, res) => {
  try {
    const { email, password } = req.query;
    
    const user = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user[0]) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

    res.status(200).json({
      message: '로그인 성공',
      user: { ...user[0], password: undefined }
    });

  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

usersRouter.post('/join', async (req, res) => {
  try {
    const { email, name, password, contact } = req.body;

    if (!email?.trim() || !name?.trim() || !password || !contact?.trim()) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '유효한 이메일 형식이 아닙니다.' });
    }

    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (email, name, password, contact) VALUES (?, ?, ?, ?)',
      [email, name, hashedPassword, contact]
    );

    res.status(201).json({
      message: '회원가입 성공',
      userId: result.insertId
    });

  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

usersRouter
  .route('/:id')
  .get(async (req, res) => {
    try {
      const { email } = req.query;
      const user = await query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user[0]) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      res.status(200).json({
        message: '사용자 조회 성공',
        user: { ...user[0], password: undefined }
      });
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);

      if (isNaN(userId)) {
        return res.status(400).json({ message: '유효하지 않은 사용자 ID입니다.' });
      }

      const result = await query('DELETE FROM users WHERE id = ?', [userId]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '삭제할 사용자를 찾을 수 없습니다.' });
      }

      res.status(200).json({
        message: `ID ${userId}의 사용자가 성공적으로 삭제되었습니다.`,
      });
    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
  });

module.exports = usersRouter;
