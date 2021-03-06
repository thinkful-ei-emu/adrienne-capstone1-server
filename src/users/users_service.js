const xss = require('xss');
const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user);
  },
  validatePassword(password) {
    if(password.length < 8) {
      return 'Password must be longer than 8 characters';
    }
    if(password.length > 72) {
      return 'Password must be less than 72 characters';
    }
    if(password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password input invalid';
    }
    if(!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, number, and special character';
    }
    return null;
  },
  validateUsername(username) {
    if(username.startsWith(' ') || username.endsWith(' ')){
      return 'Username input invalid';
    }
    if(username.length < 1 || username.length > 20) {
      return 'Username must be between 6 and 20 characters';
    }
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  }
};

module.exports = UsersService;