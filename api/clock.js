const handler = require('./index');

module.exports = async (req, res) => {
  req.url = '/clock';
  return handler(req, res);
};
