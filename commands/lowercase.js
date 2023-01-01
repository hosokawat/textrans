module.exports = {
  action:(val) => String.prototype['toLowerCase'].apply(val),
  description:'lowercase "AAA" => "aaa"',
  vendor: 'official',
}