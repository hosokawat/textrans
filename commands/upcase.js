module.exports = {
  action:(val) => String.prototype['toUpperCase'].apply(val),
  description:'upcase',
  vendor: 'official',
}