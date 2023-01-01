const _s = require('underscore.string');

module.exports = {
  action:(val) => _s.camelize(val),
  description:'camelize text "aa_bb" => "aaBB"',
  vendor: 'official',
}