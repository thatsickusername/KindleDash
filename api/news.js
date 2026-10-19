const handler = require('./index');

module.exports = async (req, res) => {
  req.url = '/news';
  return handler(req, res);
};
