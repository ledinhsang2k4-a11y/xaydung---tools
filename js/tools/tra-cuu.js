/* Nhóm: Tra cứu — quy đổi đơn vị, bảng thép tròn */
(function () {
  'use strict';
  var nf = CX.nf, F = Formulas, esc = CX.esc;

  /* ===== Quy đổi đơn vị ===== */
  CX.register({
    id: 'quy-doi', name: 'Quy đổi đơn vị', group: 'Tra cứu', icon: '⇄',
    desc: 'Chiều dài, diện tích, thể tích, khối lượng, lực, áp suất (MPa, kgf/cm²...).',
    keywords: 'quy doi don vi mpa kgf cm2 tan kn inch feet m2 m3',
    mount: function (el) {
      var cats = Object.keys(F.UNITS);
      var st = CX.store.get('tool:quy-doi', { cat: cats[0], from: 'm', to: 'cm', val: '1' });
      if (!F.UNITS[st.cat] || !(st.from in F.UNITS[st.cat]) || !(st.to in F.UNITS[st.cat])) st = { cat: cats[0], from: 'm', to: 'cm', val: '1' };

      function opts(cat, sel) {
        return Object.keys(F.UNITS[cat]).map(function (u) { return '<option' + (u === sel ? ' selected' : '') + '>' + esc(u) + '</option>'; }).join('');
      }
      el.innerHTML =
        '<section class="card"><h2>Chọn đại lượng</h2><div class="grid">' +
        '<label class="fld"><span>Đại lượng</span><select id="q-cat">' + cats.map(function (c) { return '<option' + (c === st.cat ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label>' +
        '<label class="fld"><span>Giá trị</span><input id="q-val" inputmode="decimal" value="' + esc(st.val) + '"></label>' +
        '<label class="fld"><span>Từ đơn vị</span><select id="q-from"></select></label>' +
        '<label class="fld"><span>Sang đơn vị</span><select id="q-to"></select></label></div>' +
        '<div class="actions no-print"><button class="btn" id="q-swap">⇄ Đổi chiều</button></div></section>' +
        '<div id="q-out"></div>';
      var $ = function (id) { return el.querySelector(id); };

      function fill() {
        $('#q-from').innerHTML = opts(st.cat, st.from);
        $('#q-to').innerHTML = opts(st.cat, st.to);
      }
      function show() {
        CX.store.set('tool:quy-doi', st);
        var v = CX.num(st.val), main = F.convert(v, st.from, st.to, st.cat);
        var all = Object.keys(F.UNITS[st.cat]).map(function (u) {
          return '<tr><td>' + esc(u) + '</td><td>' + esc(nf(F.convert(v, st.from, u, st.cat), 6)) + '</td></tr>';
        }).join('');
        $('#q-out').innerHTML =
          '<section class="card"><h2>Kết quả</h2><div class="results"><div class="res main"><span>' + esc(nf(v, 6) + ' ' + st.from) + ' =</span><b>' +
          esc(nf(main, 6)) + ' <small>' + esc(st.to) + '</small></b></div></div></section>' +
          '<section class="card"><h2>Toàn bộ đơn vị của "' + esc(st.cat) + '"</h2><div class="tbl"><table class="data"><thead><tr><th>Đơn vị</th><th>Giá trị</th></tr></thead><tbody>' + all + '</tbody></table></div></section>';
      }
      fill(); show();
      $('#q-val').addEventListener('input', function (e) { st.val = e.target.value; show(); });
      $('#q-cat').addEventListener('change', function (e) {
        st.cat = e.target.value; var keys = Object.keys(F.UNITS[st.cat]);
        st.from = keys[0]; st.to = keys[1] || keys[0]; fill(); show();
      });
      $('#q-from').addEventListener('change', function (e) { st.from = e.target.value; show(); });
      $('#q-to').addEventListener('change', function (e) { st.to = e.target.value; show(); });
      $('#q-swap').addEventListener('click', function () { var t = st.from; st.from = st.to; st.to = t; fill(); show(); });
    }
  });

  /* ===== Bảng thép tròn ===== */
  CX.register({
    id: 'bang-thep', name: 'Bảng tra thép tròn', group: 'Tra cứu', icon: '◎',
    desc: 'Khối lượng 1 m, 1 cây, tiết diện và chu vi của thép Φ6 đến Φ32.',
    keywords: 'bang tra thep tron phi 6 8 10 12 14 16 tiet dien kg m',
    mount: function (el, tool) {
      var st = CX.store.get('tool:bang-thep', { stock: '11.7' });
      el.innerHTML =
        '<section class="card"><h2>Chiều dài cây thép</h2><div class="grid"><label class="fld"><span>Chiều dài cây <em>(m)</em></span><input id="b-stock" inputmode="decimal" value="' + esc(st.stock) + '"></label></div></section>' +
        '<section class="card"><h2>Bảng tra</h2><div class="tbl"><table class="data"><thead><tr><th>Đường kính</th><th>kg/m</th><th>kg/cây</th><th>Tiết diện (mm²)</th><th>Chu vi (mm)</th></tr></thead><tbody id="b-body"></tbody></table></div>' +
        '<div class="actions no-print"><button class="btn primary" id="b-csv">Xuất Excel (.csv)</button><button class="btn" id="b-print">In / lưu PDF</button></div></section>' +
        '<section class="card"><h2>Giả định và lưu ý</h2><ul class="note-list"><li>Khối lượng 1 m = d² × 0,00617 kg (d tính bằng mm).</li><li>Tiết diện = π × d² ÷ 4; chu vi = π × d.</li><li>Khối lượng thực tế của thép thương mại có dung sai theo tiêu chuẩn sản phẩm, nên có thể lệch nhẹ so với bảng này.</li></ul></section>';
      var rows;
      function draw() {
        CX.store.set('tool:bang-thep', st);
        rows = F.rebarTable(CX.num(st.stock));
        el.querySelector('#b-body').innerHTML = rows.map(function (r) {
          return '<tr><td>Φ' + r.d + '</td><td>' + nf(r.kgm, 3) + '</td><td>' + nf(r.kgBar, 2) + '</td><td>' + nf(r.area, 1) + '</td><td>' + nf(r.perimeter, 1) + '</td></tr>';
        }).join('');
      }
      draw();
      el.querySelector('#b-stock').addEventListener('input', function (e) { st.stock = e.target.value; draw(); });
      el.querySelector('#b-print').addEventListener('click', CX.print);
      el.querySelector('#b-csv').addEventListener('click', function () {
        var data = [[tool.name], ['Chiều dài cây (m)', CX.num(st.stock)], [], ['Đường kính (mm)', 'kg/m', 'kg/cây', 'Tiết diện (mm²)', 'Chu vi (mm)']];
        rows.forEach(function (r) { data.push([r.d, F.round(r.kgm, 3), F.round(r.kgBar, 2), F.round(r.area, 1), F.round(r.perimeter, 1)]); });
        CX.exportCSV('bang-thep-' + CX.today() + '.csv', data);
      });
    }
  });
})();
