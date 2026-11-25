/* Nhóm: Dự toán — bảng dự toán sơ bộ, nhận hạng mục từ các công cụ tính khối lượng */
(function () {
  'use strict';
  var nf = CX.nf, esc = CX.esc, F = Formulas;

  CX.register({
    id: 'du-toan', name: 'Dự toán sơ bộ', group: 'Dự toán', icon: '₫',
    desc: 'Khối lượng × đơn giá bạn tự nhập, thêm dự phòng và VAT. Nhận hạng mục từ các công cụ khác.',
    keywords: 'du toan don gia thanh tien vat du phong bao gia chi phi',
    mount: function (el, tool) {
      var d = CX.estimate.load();

      el.innerHTML =
        '<section class="card"><h2>Hạng mục</h2>' +
        '<p class="muted" style="margin-top:0">Nhập đơn giá theo báo giá thực tế của bạn. Công cụ không có sẵn bảng giá và không tự cập nhật giá.</p>' +
        '<div class="tbl"><table class="rows"><thead><tr><th>Hạng mục</th><th>Đơn vị</th><th>Khối lượng</th><th>Đơn giá (đ)</th><th>Thành tiền (đ)</th><th></th></tr></thead><tbody id="e-body"></tbody></table></div>' +
        '<div class="actions no-print"><button class="btn" data-act="add">+ Thêm hạng mục</button><button class="btn danger" data-act="clear">Xóa toàn bộ</button></div></section>' +
        '<section class="card"><h2>Tổng hợp</h2><div class="grid" style="margin-bottom:14px">' +
        '<label class="fld"><span>Dự phòng <em>(%)</em></span><input data-g="reserve" inputmode="decimal" value="' + esc(d.reserve) + '"></label>' +
        '<label class="fld"><span>VAT <em>(%)</em></span><input data-g="vat" inputmode="decimal" value="' + esc(d.vat) + '"></label></div>' +
        '<div id="e-sum"></div>' +
        '<div class="actions no-print"><button class="btn primary" data-act="csv">Xuất Excel (.csv)</button><button class="btn" data-act="print">In / lưu PDF</button></div></section>' +
        '<section class="card"><h2>Giả định và lưu ý</h2><ul class="note-list">' +
        '<li>Dự phòng tính trên tổng chi phí hạng mục; VAT tính trên (tổng + dự phòng). Hãy chỉnh theo cách tính của hợp đồng hoặc quy định hiện hành.</li>' +
        '<li>Các nút "+ ... vào dự toán" ở công cụ khác sẽ cộng dồn khối lượng vào dòng trùng tên và đơn vị. Đơn giá giữ nguyên.</li>' +
        '<li>Dự toán sơ bộ không thay thế bảng dự toán chi tiết theo định mức và đơn giá của địa phương.</li></ul></section>';
      var body = el.querySelector('#e-body'), sum = el.querySelector('#e-sum');

      function rowsHTML() {
        if (!d.items.length) return '<tr><td colspan="6"><div class="empty">Chưa có hạng mục. Bấm "+ Thêm hạng mục" hoặc dùng nút "+ ... vào dự toán" ở các công cụ tính khối lượng.</div></td></tr>';
        return d.items.map(function (it, i) {
          return '<tr data-i="' + i + '">' +
            '<td><input data-c="name" value="' + esc(it.name) + '" aria-label="Tên hạng mục"></td>' +
            '<td><input data-c="unit" value="' + esc(it.unit) + '" aria-label="Đơn vị" style="min-width:64px"></td>' +
            '<td><input data-c="qty" inputmode="decimal" value="' + esc(it.qty) + '" aria-label="Khối lượng"></td>' +
            '<td><input data-c="price" inputmode="decimal" value="' + esc(it.price) + '" aria-label="Đơn giá"></td>' +
            '<td class="data amount" style="white-space:nowrap;text-align:right;font-weight:700;padding-left:10px"></td>' +
            '<td><button class="btn sm danger del" data-act="del" data-i="' + i + '" aria-label="Xóa hạng mục ' + (i + 1) + '">✕</button></td></tr>';
        }).join('');
      }
      function calc() {
        var items = d.items.map(function (x) { return { qty: CX.num(x.qty), price: CX.num(x.price) }; });
        var r = F.estimate(items, CX.num(d.reserve), CX.num(d.vat));
        body.querySelectorAll('tr[data-i]').forEach(function (tr, i) { tr.querySelector('.amount').textContent = nf(r.lines[i].amount, 0); });
        sum.innerHTML = '<table class="data"><tbody>' +
          '<tr><td>Cộng hạng mục</td><td>' + esc(CX.money(r.sub)) + '</td></tr>' +
          '<tr><td>Dự phòng (' + esc(nf(CX.num(d.reserve), 2)) + '%)</td><td>' + esc(CX.money(r.reserve)) + '</td></tr>' +
          '<tr><td>VAT (' + esc(nf(CX.num(d.vat), 2)) + '%)</td><td>' + esc(CX.money(r.vat)) + '</td></tr></tbody>' +
          '<tfoot><tr><td>Tổng dự toán</td><td style="font-size:20px">' + esc(CX.money(r.total)) + '</td></tr></tfoot></table>';
        return r;
      }
      function render() { body.innerHTML = rowsHTML(); calc(); }
      render();

      el.addEventListener('input', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-g')) d[t.getAttribute('data-g')] = t.value;
        else if (t.hasAttribute('data-c')) d.items[+t.closest('tr').getAttribute('data-i')][t.getAttribute('data-c')] = t.value;
        else return;
        CX.estimate.save(d); calc();
      });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]'); if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'add') {
          d.items.push({ id: CX.uid(), name: 'Hạng mục ' + (d.items.length + 1), unit: '', qty: '', price: '' });
          CX.estimate.save(d); render();
          var last = body.querySelector('tr:last-child input'); if (last) { last.focus(); last.select(); }
        } else if (act === 'del') {
          d.items.splice(+b.getAttribute('data-i'), 1); CX.estimate.save(d); render();
        } else if (act === 'clear') {
          if (d.items.length && confirm('Xóa toàn bộ hạng mục trong dự toán?')) { d.items = []; CX.estimate.save(d); render(); }
        } else if (act === 'print') CX.print();
        else if (act === 'csv') {
          var r = calc();
          var rows = [[tool.name], ['Ngày xuất', CX.dateVN(CX.today())], [], ['STT', 'Hạng mục', 'Đơn vị', 'Khối lượng', 'Đơn giá (đ)', 'Thành tiền (đ)']];
          d.items.forEach(function (x, i) { rows.push([i + 1, x.name, x.unit, CX.num(x.qty), CX.num(x.price), Math.round(r.lines[i].amount)]); });
          rows.push([], ['', 'Cộng hạng mục', '', '', '', Math.round(r.sub)], ['', 'Dự phòng ' + CX.num(d.reserve) + '%', '', '', '', Math.round(r.reserve)],
            ['', 'VAT ' + CX.num(d.vat) + '%', '', '', '', Math.round(r.vat)], ['', 'Tổng dự toán', '', '', '', Math.round(r.total)],
            [], ['Dự toán sơ bộ chỉ mang tính tham khảo.']);
          CX.exportCSV('du-toan-' + CX.today() + '.csv', rows);
        }
      });
    }
  });
})();
