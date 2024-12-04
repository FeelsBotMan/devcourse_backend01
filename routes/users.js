const express = require('express');
const usersRouter = express.Router();
const conn = require('../mariadb');
const bcrypt = require('bcrypt');
const util = require('util');
const { body, param, validationResult } = require('express-validator');

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();  
  }
  return res.status(422).json({ errors: errors.array() });
}


/// jwt 모듈
const jwt = require('jsonwebtoken');

/// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

usersRouter.use(express.json());

const query = util.promisify(conn.query).bind(conn);

// 로그인
usersRouter.post(
  '/login',
  [
    body('email').isEmail().withMessage('유효한 이메일 형식이 아닙니다.'),
    body('password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다.'),
    validator
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await query('SELECT * FROM users WHERE email = ?', [email]);
      if (!user[0]) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      }

      const isValidPassword = await bcrypt.compare(password, user[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      }


      // jwt 토큰 생성
      const token = jwt.sign({ userId: user[0].id }, process.env.JWT_SECRET, { expiresIn: '1h', issuer: 'localhost' });

      res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 유효시간 1시간
      res.status(200).json({
        message: '로그인 성공',
        user: { ...user[0], password: undefined }
      });

    } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
});

// 회원가입
usersRouter.post(
  '/join',
  [
    body('email').isEmail().withMessage('유효한 이메일 형식이 아닙니다.'),
    body('name').notEmpty().withMessage('이름을 입력해주세요.'),
    body('password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다.'),
    body('contact').notEmpty().withMessage('연락처를 입력해주세요.'),
    validator
  ],
  async (req, res) => {
    try {
      const { email, name, password, contact } = req.body;

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

// 사용자 조회 및 삭제
usersRouter
  .route('/:id')
  .get(
    [
      param('id').isInt().withMessage('유효하지 않은 사용자 ID입니다.'),
      validator
    ],
    async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await query('SELECT * FROM users WHERE id = ?', [userId]);
      
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
  .delete(
    [
      param('id').isInt().withMessage('유효하지 않은 사용자 ID입니다.'),
      validator
    ],
    async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);

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
