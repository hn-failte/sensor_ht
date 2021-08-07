/**
 * 16进制转10进制
 * @param {String} hex
 * @returns
 */
export const hex2int = (hex) => {
  hex = String(hex);
  hex = /^0x/.test(hex) ? hex.slice(2) : hex;
  var len = hex.length,
    a = new Array(len),
    code;
  for (var i = 0; i < len; i++) {
    code = hex.charCodeAt(i);
    if (48 <= code && code < 58) {
      code -= 48;
    } else {
      code = (code & 0xdf) - 65 + 10;
    }
    a[i] = code;
  }

  return a.reduce(function (acc, c) {
    acc = 16 * acc + c;
    return acc;
  }, 0);
};

/**
 * 10进制转16进制
 * @param {Number} num
 * @param {String} width 16进制数的长度，默认为随字符串自动调整
 * @returns
 */
export const int2hex = (num, width) => {
  var hex = '0123456789abcdef';
  var s = '';
  while (num) {
    s = hex.charAt(num % 16) + s;
    num = Math.floor(num / 16);
  }
  if (typeof width === 'undefined' || width <= s.length) {
    return '0x' + s;
  }
  var delta = width - s.length;
  var padding = '';
  while (delta-- > 0) {
    padding += '0';
  }
  return '0x' + padding + s;
};
