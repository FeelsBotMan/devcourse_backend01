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

// GET: 모든 사용자 가져오기 또는 특정 사용자 검색
app.get('/users', (req, res) => {
  try {
    const { name } = req.query;
    const users = Array.from(userDB.values());

    if (name) {
      const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(name.toLowerCase())
      );
      return res.json({
        count: filteredUsers.length,
        users: filteredUsers
      });
    }

    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

// GET: 특정 사용자 ID로 조회
app.get('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: '유효하지 않은 사용자 ID입니다.' });
    }

    const user = userDB.get(userId);
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

// POST: 새로운 사용자 추가
app.post('/users', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: '유효한 이름을 입력해주세요.' });
    }

    const userId = userIdCounter++;
    const newUser = { id: userId, name: name.trim() };

    userDB.set(userId, newUser);

    res.status(201).json({
      message: '사용자가 성공적으로 생성되었습니다.',
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

// PUT: 사용자 정보 업데이트
app.put('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ message: '유효하지 않은 사용자 ID입니다.' });
    }

    if (!userDB.has(userId)) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: '유효한 이름을 입력해주세요.' });
    }

    const updatedUser = { id: userId, name: name.trim() };
    userDB.set(userId, updatedUser);

    res.json({
      message: `ID ${userId}의 사용자 정보가 성공적으로 업데이트되었습니다.`,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

// DELETE: 사용자 삭제
app.delete('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: '유효하지 않은 사용자 ID입니다.' });
    }

    if (!userDB.has(userId)) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    userDB.delete(userId);

    res.json({
      message: `ID ${userId}의 사용자가 성공적으로 삭제되었습니다.`,
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
