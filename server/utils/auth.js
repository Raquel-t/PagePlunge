const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: ({ req }) => {
    // Token can be sent through headers or cookies in GraphQL requests
    let token = req.headers.authorization || req.cookies.token;

    if (token && token.startsWith('Bearer ')) {
      // Remove "Bearer " from token
      token = token.slice(7, token.length).trim();
    }

    if (!token) {
      throw new Error('You have no token!');
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log('Invalid token');
      throw new Error('Invalid token!');
    }

    return req;
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};