const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware 설정
app.use(bodyParser.json());

// 임시 데이터베이스로 사용할 Map
const userDB = new Map();
let userIdCounter = 1;

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Welcome to Express with Postman and Map as a DB!');
});

// GET: 모든 사용자 가져오기
app.get('/users', (req, res) => {
  const users = Array.from(userDB.values());
  res.json(users);
});

// POST: 새로운 사용자 추가
app.post('/users', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const userId = userIdCounter++;
  const newUser = { id: userId, name };

  userDB.set(userId, newUser);

  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
  });
});

// PUT: 사용자 정보 업데이트
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { name } = req.body;

  if (!userDB.has(userId)) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const updatedUser = { id: userId, name };
  userDB.set(userId, updatedUser);

  res.json({
    message: `User with ID ${userId} updated successfully`,
    user: updatedUser,
  });
});

// DELETE: 사용자 삭제
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (!userDB.has(userId)) {
    return res.status(404).json({ message: 'User not found' });
  }

  userDB.delete(userId);

  res.json({
    message: `User with ID ${userId} deleted successfully`,
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
