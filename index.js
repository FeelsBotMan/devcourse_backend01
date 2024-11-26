const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware 설정
app.use(bodyParser.json());
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Welcome to Express with Postman and Map as a DB!');
});


// 로그인
app.post('/login', async function(req, res) {
  try {
    // 입력값 검증
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ 
        success: false,
        message: '사용자명과 비밀번호를 모두 입력해주세요.' 
      });
    }

    const { username, password } = req.body;
    
    // 사용자 찾기
    const user = await usersRouter.db.find(user => user.username === username);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '사용자를 찾을 수 없습니다.' 
      });
    }

    // 비밀번호 검증 (실제로는 bcrypt 등을 사용하여 해시 비교)
    const isPasswordValid = password === user.password; // 예시용, 실제론 해시 비교 필요
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: '비밀번호가 일치하지 않습니다.' 
      });
    }

    // 로그인 성공 응답
    res.json({
      success: true,
      message: '로그인 성공',
      data: {
        userId: user.id,
        username: user.username,
        // 민감한 정보는 제외하고 필요한 사용자 정보만 반환
      }
    });

  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.' 
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
