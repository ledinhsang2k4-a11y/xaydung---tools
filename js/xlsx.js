/* Bộ ghi file .xlsx tự chứa (không cần thư viện, chạy offline).
   Xlsx.build(rows) -> Uint8Array. rows = mảng các dòng, mỗi dòng là mảng ô (số hoặc chuỗi).
   Số được lưu dạng số, chuỗi lưu dạng chuỗi UTF-8, nên không phụ thuộc cài đặt vùng hay bảng mã của Excel. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Xlsx = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var enc = new TextEncoder();

  var CRC = (function () {
    var t = [], n, k, c;
    for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(b) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function esc(s) {
    return String(s)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function colName(i) { // 0 -> A, 25 -> Z, 26 -> AA
    var s = '', n = i + 1;
    while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }
  var isNum = function (v) { return typeof v === 'number' && isFinite(v); };

  function sheetXml(rows) {
    // độ rộng cột: theo ô dài nhất, bỏ qua dòng chỉ có 1 ô (tiêu đề, ghi chú) để cột A không bị kéo quá rộng
    var width = [];
    rows.forEach(function (r) {
      if (r.length < 2) return;
      r.forEach(function (v, i) {
        var len = isNum(v) ? String(Math.round(v * 1e6) / 1e6).length : String(v == null ? '' : v).length;
        width[i] = Math.max(width[i] || 0, len);
      });
    });
    var cols = width.map(function (w, i) {
      var wd = Math.min(60, Math.max(10, (w || 0) + 2));
      return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + wd + '" customWidth="1"/>';
    }).join('');

    var firstRow = true;
    var data = rows.map(function (r, ri) {
      var cells = '';
      r.forEach(function (v, ci) {
        if (v == null || v === '') return;
        var ref = colName(ci) + (ri + 1);
        var style = firstRow ? ' s="1"' : '';
        if (isNum(v)) cells += '<c r="' + ref + '"' + style + '><v>' + (Math.round(v * 1e6) / 1e6) + '</v></c>';
        else cells += '<c r="' + ref + '"' + style + ' t="inlineStr"><is><t xml:space="preserve">' + esc(v) + '</t></is></c>';
      });
      if (cells) firstRow = false;
      return cells ? '<row r="' + (ri + 1) + '">' + cells + '</row>' : '';
    }).join('');

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      (cols ? '<cols>' + cols + '</cols>' : '') + '<sheetData>' + data + '</sheetData></worksheet>';
  }

  var STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

  var NS_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
  var OD = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

  function zipStore(files) { // ZIP không nén (method 0), tên file UTF-8
    var chunks = [], central = [], offset = 0;
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = f.data, crc = crc32(data);
      var lh = new Uint8Array(30 + name.length), v = new DataView(lh.buffer);
      v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true);
      v.setUint16(8, 0, true); v.setUint16(10, 0, true); v.setUint16(12, 0x21, true);
      v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true);
      v.setUint16(26, name.length, true); v.setUint16(28, 0, true); lh.set(name, 30);
      chunks.push(lh, data);
      var ch = new Uint8Array(46 + name.length), w = new DataView(ch.buffer);
      w.setUint32(0, 0x02014b50, true); w.setUint16(4, 20, true); w.setUint16(6, 20, true); w.setUint16(8, 0x0800, true);
      w.setUint16(10, 0, true); w.setUint16(12, 0, true); w.setUint16(14, 0x21, true);
      w.setUint32(16, crc, true); w.setUint32(20, data.length, true); w.setUint32(24, data.length, true);
      w.setUint16(28, name.length, true); w.setUint16(30, 0, true); w.setUint16(32, 0, true);
      w.setUint16(34, 0, true); w.setUint16(36, 0, true); w.setUint32(38, 0, true); w.setUint32(42, offset, true);
      ch.set(name, 46); central.push(ch);
      offset += lh.length + data.length;
    });
    var cdSize = central.reduce(function (a, c) { return a + c.length; }, 0);
    var end = new Uint8Array(22), e = new DataView(end.buffer);
    e.setUint32(0, 0x06054b50, true); e.setUint16(4, 0, true); e.setUint16(6, 0, true);
    e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, cdSize, true); e.setUint32(16, offset, true); e.setUint16(20, 0, true);
    var all = chunks.concat(central, [end]), total = all.reduce(function (a, c) { return a + c.length; }, 0);
    var out = new Uint8Array(total), pos = 0;
    all.forEach(function (c) { out.set(c, pos); pos += c.length; });
    return out;
  }

  function build(rows, sheetName) {
    var name = esc(String(sheetName || 'Kết quả').replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 31));
    var xml = function (s) { return enc.encode(s); };
    return zipStore([
      { name: '[Content_Types].xml', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>') },
      { name: '_rels/.rels', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + NS_REL + '"><Relationship Id="rId1" Type="' + OD + '/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
      { name: 'xl/workbook.xml', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="' + OD + '"><sheets><sheet name="' + name + '" sheetId="1" r:id="rId1"/></sheets></workbook>') },
      { name: 'xl/_rels/workbook.xml.rels', data: xml('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="' + NS_REL + '"><Relationship Id="rId1" Type="' + OD + '/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="' + OD + '/styles" Target="styles.xml"/></Relationships>') },
      { name: 'xl/styles.xml', data: xml(STYLES) },
      { name: 'xl/worksheets/sheet1.xml', data: xml(sheetXml(rows)) }
    ]);
  }

  return { build: build, crc32: crc32, MIME: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
});
