module.exports = {
  action:(val) => {
    const m = val.match(/\d+/);
    if(m) {
      return Number(m.shift()).toLocaleString();
    }
    return '';
  },
  description:'add commma "1000" => "1,000" ',
  vendor: 'official',
}
