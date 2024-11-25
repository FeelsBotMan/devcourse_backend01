const express = require('express');
const usersRouter = express.Router();

let userDB = new Map(); // 가상의 사용자 데이터베이스
let userIdCounter = 1;  // 사용자 ID 증가용 변수

// GET: 모든 사용자 가져오기 또는 특정 사용자 검색
usersRouter.get('/', (req, res) => {
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
usersRouter.get('/:id', (req, res) => {
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
usersRouter.post('/join', (req, res) => {
  try {
    const { name, username, password } = req.body;

    // 입력값 유효성 검사
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: '유효한 이름을 입력해주세요.' });
    }
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ message: '유효한 아이디를 입력해주세요.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    // 아이디 중복 검사
    const isUsernameTaken = Array.from(userDB.values()).some(
      user => user.username === username.trim()
    );
    if (isUsernameTaken) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다.' });
    }

    const userId = userIdCounter++;
    const newUser = {
      id: userId,
      name: name.trim(),
      username: username.trim(),
      password: password // 실제 구현시에는 반드시 암호화해야 합니다!
    };

    userDB.set(userId, newUser);

    // 비밀번호는 응답에서 제외
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: '사용자가 성공적으로 생성되었습니다.',
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

// PUT: 사용자 정보 업데이트
usersRouter.put('/:id', (req, res) => {
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
usersRouter.delete('/:id', (req, res) => {
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

module.exports = usersRouter;
