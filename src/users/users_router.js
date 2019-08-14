const express = require('express');
const path = require('path');
const UsersService = require('./users_service');
const xss = require('xss');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

const serializeUser = user => ({
  id: user.id,
  username: xss(user.username),
  date_created: new Date(user.date_created)
});

// router used for registration page
usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { username, password } = req.body;

    for(const field of ['username', 'password']) 
      if(!req.body[field]) 
        return res.status(400).json({ error: `Missing ${field} in request body`});

    const passwordError = UsersService.validatePassword(password);
    const usernameError = UsersService.validateUsername(username);

    if(passwordError) {
      return res.status(400).json({ error: passwordError });
    } 
    
    if(usernameError) {
      return res.status(400).json({ error: usernameError});
    }

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      username
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: 'Username already taken'});
        
        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              username,
              password: hashedPassword
            };

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.id}`))
                  .json(serializeUser(user));
              });
          });
      }) 
      .catch(next);
  });

module.exports = usersRouter;