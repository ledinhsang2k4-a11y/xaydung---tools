// Chạy: node tests/xlsx.test.js
const assert = require('assert');
const zlib = require('zlib');
const X = require('../js/xlsx.js');
let n = 0;
const t = (name, fn) => { try { fn(); n++; console.log('  ok  ' + name); } catch (e) { console.error('FAIL  ' + name + '\n      ' + e.message); process.exitCode = 1; } };

t('CRC32 khớp với giá trị chuẩn ("123456789" = CBF43926)', () => {
  assert.strictEqual(X.crc32(new TextEncoder().encode('123456789')), 0xCBF43926);
});
t('file bắt đầu bằng chữ ký ZIP và kết thúc bằng bản ghi cuối', () => {
  const b = X.build([['Tiêu đề'], ['Cột A', 'Cột B'], ['Bê tông', 2.304]]);
  assert.strictEqual(Buffer.from(b.slice(0, 4)).toString('hex'), '504b0304');
  assert.strictEqual(Buffer.from(b.slice(b.length - 22, b.length - 18)).toString('hex'), '504b0506');
});
t('có đủ 6 phần bắt buộc của một file xlsx', () => {
  const s = Buffer.from(X.build([['a']])).toString('latin1');
  ['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/worksheets/sheet1.xml'].forEach(p => assert.ok(s.includes(p), 'thiếu ' + p));
});
t('chữ tiếng Việt được lưu nguyên dạng UTF-8, ký tự đặc biệt được thoát', () => {
  const s = Buffer.from(X.build([['Khối lượng bê tông <&> "ok"']])).toString('utf8');
  assert.ok(s.includes('Khối lượng bê tông &lt;&amp;&gt; &quot;ok&quot;'));
});
t('số lưu dạng số; chuỗi bắt đầu bằng "=" vẫn chỉ là chuỗi', () => {
  const s = Buffer.from(X.build([['=1+1', 5.1536256]])).toString('utf8');
  assert.ok(s.includes('t="inlineStr"') && s.includes('<v>5.153626</v>') && !s.includes('<f>'));
});
console.log(`\n${n} test đạt` + (process.exitCode ? ', CÓ LỖI' : ''));
