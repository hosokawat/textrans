const _s = require('underscore.string');

module.exports = {
  action:(val) => _s.camelize(val),
  description:'camelize',
  vendor: 'official',
}