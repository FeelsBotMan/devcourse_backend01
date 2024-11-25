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
app.post('/login', function(req,res) {

})

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
