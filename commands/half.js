module.exports = {
  action:(val) => {
    return val.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
  });

  },
  description:'fullwidth to half width ａａａ => "aaa"',
  vendor: 'official',
}