const handler = require('./index');

module.exports = async (req, res) => {
  req.url = '/todo';
  return handler(req, res);
};
