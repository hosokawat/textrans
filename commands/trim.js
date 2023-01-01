module.exports = {
  action:(val) => String.prototype['trim'].apply(val),
  description:'trim " 0 " => "0"',
  vendor: 'official',
}