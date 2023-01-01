module.exports = {
  action:(val) => {
    return val.replace(/[A-Za-z0-9]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) + 65248);
  });

  },
  description:'convert full Width "aaa" => "ａａａ"',
  vendor: 'official',
}