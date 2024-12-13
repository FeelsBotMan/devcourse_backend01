const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100 // 최대 100번 요청
}));

const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const categoryRouter = require('./routes/category');
const likesRouter = require('./routes/likes');
const cartsRouter = require('./routes/carts');
const ordersRouter = require('./routes/orders');

app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/category', categoryRouter);
app.use('/likes', likesRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);



app.listen(3000);