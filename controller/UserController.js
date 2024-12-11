const { body, param, validationResult } = require('express-validator'); // express-validator 모듈
const conn = require('../mariadb'); // mariadb 모듈
const bcrypt = require('bcrypt'); // bcrypt 모듈
const util = require('util'); // util 모듈
const { StatusCodes } = require('http-status-codes'); // http-status-codes 모듈\
const jwt = require('jsonwebtoken'); // jwt 모듈
const dotenv = require('dotenv'); // dotenv 모듈
dotenv.config();

const validator = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();  
        }
        return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ 
            message: '입력값 검증 실패',
            errors: errors.array() 
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
            message: '유효성 검사 중 오류가 발생했습니다.' 
        });
    }
};

// 비밀번호 정책 
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const validatePassword = (password) => {
    return PASSWORD_REGEX.test(password);
};
        

const query = util.promisify(conn.query).bind(conn);

const join = async (req, res) => {
    try {
      const { email, password } = req.body;

      const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(StatusCodes.CONFLICT).json({ message: '이미 존재하는 이메일입니다.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );

      if (!result.insertId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: '회원가입에 실패했습니다.' });
      }

      res.status(StatusCodes.CREATED).json({
        message: '회원가입 성공',
        userId: result.insertId
      });

    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

const joinValidator = [
    body('email').isEmail().withMessage('유효한 이메일 형식이 아닙니다.'),
    body('password')
    .isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(PASSWORD_REGEX).withMessage('비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.'),
    validator
]


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user[0]) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
        }

        const isValidPassword = await bcrypt.compare(password, user[0].password);
        if (!isValidPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
        }


        // jwt 토큰 생성
        const token = jwt.sign({ email: user[0].email }, process.env.JWT_SECRET, { expiresIn: '1h', issuer: 'localhost' });

        res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 유효시간 1시간
        
        res.status(StatusCodes.OK).json({
            message: '로그인 성공',
            user: { ...user[0], password: undefined }
        });

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

const loginValidator = [
    body('email').isEmail().withMessage('유효한 이메일 형식이 아닙니다.'),
    body('password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다.'),
    validator
]


const userGet = async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await query('SELECT * FROM users WHERE id = ?', [userId]);
      
      if (!user[0]) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      res.status(StatusCodes.OK).json({
        message: '사용자 조회 성공',
        user: { ...user[0], password: undefined }
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

const userGetValidator = [
    param('id').isInt().withMessage('유효하지 않은 사용자 ID입니다.'),
    validator
]

const userDelete = async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);

      const result = await query('DELETE FROM users WHERE id = ?', [userId]);
      
      if (result.affectedRows === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: '삭제할 사용자를 찾을 수 없습니다.' });
      }

      res.status(StatusCodes.OK).json({
        message: `ID ${userId}의 사용자가 성공적으로 삭제되었습니다.`,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

const userDeleteValidator = [
    param('id').isInt().withMessage('유효하지 않은 사용자 ID입니다.'),
    validator
]


const passwordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await query('SELECT * FROM users WHERE email = ?', [email]);

        if (!user[0]) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 임시 비밀번호 생성
        const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        // TODO: 이메일로 임시 비밀번호 전송 로직 추가 필요
        res.status(StatusCodes.OK).json({
            message: '비밀번호 초기화 성공. 임시 비밀번호가 이메일로 전송되었습니다.',
            tempPassword // 실제 서비스에서는 제거 필요
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

const passwordResetValidator = [
    body('email').isEmail().withMessage('유효한 이메일 형식이 아닙니다.'),
    validator
]

const passwordChange = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        
        // 사용자 확인
        const user = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (!user[0]) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 현재 비밀번호 확인
        const isValidPassword = await bcrypt.compare(currentPassword, user[0].password);
        if (!isValidPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 새 비밀번호 유효성 검사
        if (!validatePassword(newPassword)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ 
                message: '새 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.' 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);


        // TODO: 비밀번호 변경 성공 시 이메일 전송 로직 추가
        // TODO: 비밀번호 변경 시도 횟수 제한
        // TODO: 비밀번호 변경 이력 관리
        res.status(StatusCodes.OK).json({
            message: '비밀번호 변경 성공',
            userId: user[0].id
        });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

const passwordChangeValidator = [
    body('email').isEmail().withMessage('유효한 이메일 형식이 아닙니다.'),
    body('currentPassword').notEmpty().withMessage('현재 비밀번호를 입력해주세요.'),
    body('newPassword').custom(validatePassword)
        .withMessage('새 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.'),
    validator
];

const logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(StatusCodes.OK).json({ message: '로그아웃 성공' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: '서버 오류가 발생했습니다.', error: error.message });
    }
};

module.exports = { 
    join, joinValidator, 
    login, loginValidator, 
    logout,
    passwordReset, passwordResetValidator,
    passwordChange, passwordChangeValidator,
    userGet, userGetValidator,
    userDelete, userDeleteValidator
};