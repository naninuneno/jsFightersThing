// TODO better Typescript impl? IIFE used to avoid problems with `require express` in multiple files
// see fighters.ts for one "proper" implementation

(() => {

  const express = require('express');
  const createError = require('http-errors');
  const path = require('path');
  const cookieParser = require('cookie-parser');
  const logger = require('morgan');

  const FightersRouter = require('./routes/fighters');
  const UsersRouter = require('./routes/users');

  const app = express();

// TODO dont need this for rest-api but can help diagnose errors - if removed, remove pug from package.json too
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration for dev testing
  app.use((req: any, res: any, next: any) => {
    // TODO - anything better?
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use('/fighters', new FightersRouter().router);
  app.use('/users', new UsersRouter().router);

// catch 404 and forward to error handler
  app.use((req: any, res: any, next: any) => {
    next(createError(404));
  });

// error handler
  app.use((err: any, req: any, res: any, next: any) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send(err);
    console.log(err);
    // res.render('error');
  });

  module.exports = app;

})();
