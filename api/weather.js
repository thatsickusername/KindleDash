const handler = require('./index');

module.exports = async (req, res) => {
  req.url = '/weather';
  return handler(req, res);
};
