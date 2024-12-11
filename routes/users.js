const express = require('express');
const { join, joinValidator, login, loginValidator, passwordReset, passwordResetValidator, passwordChange, passwordChangeValidator, userGet, userGetValidator, userDelete, userDeleteValidator, logout } = require('../controller/UserController');
const usersRouter = express.Router();


// 로그인
usersRouter.post(
  '/login',
  loginValidator,
  login
);

// 회원가입
usersRouter.post(
  '/join', 
  joinValidator,
  join
);

// 비밀번호 초기화
usersRouter.post(
  '/password/reset',
  passwordResetValidator,
  passwordReset
);

// 비밀번호 변경
usersRouter.post(
  '/password/change',
  passwordChangeValidator,
  passwordChange
);

// 사용자 조회 및 삭제
usersRouter
  .route('/:id')
  .get(
    userGetValidator,
    userGet
  )
  .delete(
    userDeleteValidator,
    userDelete
  )

module.exports = usersRouter;
