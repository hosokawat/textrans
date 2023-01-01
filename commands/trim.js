module.exports = {
  action:(val) => String.prototype['trim'].apply(val),
  description:'trim',
  vendor: 'official',
}