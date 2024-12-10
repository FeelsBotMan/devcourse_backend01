const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const likesRouter = require('./routes/likes');
const cartsRouter = require('./routes/carts');
const ordersRouter = require('./routes/orders');

app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/likes', likesRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);

app.listen(3000);