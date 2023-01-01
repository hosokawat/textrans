module.exports = {
  action:(val) => {
    const m = val.match(/\d+/);
    if(m) {
      return Number(m.shift()).toLocaleString();
    }
    return '';
  },
  description:'sneak case',
  vendor: 'official',
}
