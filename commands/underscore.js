const _s = require('underscore.string');

module.exports = {
  action:(val) => _s.underscored(val),
  description:'sneaklize "aaaBbb" => "aaa_bbb"',
  vendor: 'official',
}