/* Lõi dùng chung: lưu trữ, định dạng, xuất file, bộ dựng công cụ tính toán */
(function () {
  'use strict';
  var PREFIX = 'xdt:v1:';
  var CX = (window.CX = { tools: [], groups: ['Khối lượng vật liệu', 'Dự toán', 'Tra cứu', 'Biểu mẫu & nhật ký'] });

  /* ---------- Lưu trữ cục bộ (có version) ---------- */
  CX.store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(PREFIX + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); return true; }
      catch (e) { CX.toast('Không lưu được dữ liệu: trình duyệt đang chặn bộ nhớ hoặc đã đầy.'); return false; }
    },
    remove: function (k) { try { localStorage.removeItem(PREFIX + k); } catch (e) {} },
    all: function () {
      var out = {};
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var key = localStorage.key(i);
          if (key.indexOf(PREFIX) === 0) out[key.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(key));
        }
      } catch (e) {}
      return out;
    }
  };

  /* ---------- Tiện ích ---------- */
  CX.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  // Đọc số: chấp nhận dấu phẩy hoặc chấm thập phân, bỏ khoảng trắng
  CX.num = function (s) {
    if (typeof s === 'number') return isFinite(s) ? s : 0;
    var n = parseFloat(String(s == null ? '' : s).replace(/\s/g, '').replace(',', '.'));
    return isFinite(n) ? n : 0;
  };
  CX.nf = function (n, d) {
    if (d == null) d = 2;
    return isFinite(n) ? new Intl.NumberFormat('vi-VN', { maximumFractionDigits: d }).format(n) : '—';
  };
  CX.money = function (n) { return CX.nf(Math.round(n), 0) + ' đ'; };
  CX.today = function () {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  CX.dateVN = function (iso) {
    var p = String(iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso || '';
  };
  CX.uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };

  var toastTimer;
  CX.toast = function (msg, link) {
    var old = document.querySelector('.toast'); if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = CX.esc(msg) + (link ? ' <a href="' + CX.esc(link.href) + '">' + CX.esc(link.text) + '</a>' : '');
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 4500);
  };

  /* ---------- Xuất file ---------- */
  CX.download = function (name, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  };
  // Xuất file Excel thật (.xlsx): chữ tiếng Việt và số luôn đúng, không phụ thuộc cài đặt vùng của Excel
  CX.exportXLSX = function (name, rows) {
    name = String(name).replace(/\.csv$/i, '').replace(/\.xlsx$/i, '') + '.xlsx';
    try {
      CX.download(name, Xlsx.build(rows), Xlsx.MIME);
      CX.toast('Đã xuất file ' + name);
    } catch (e) {
      CX.toast('Không xuất được file Excel: ' + e.message);
    }
  };
  CX.exportCSV = CX.exportXLSX; // tên cũ, giữ để các công cụ gọi vào vẫn chạy
  CX.print = function () { window.print(); };

  /* ---------- Đăng ký công cụ ---------- */
  CX.register = function (t) { CX.tools.push(t); };

  /* ---------- Dự toán dùng chung ---------- */
  CX.estimate = {
    load: function () { return CX.store.get('estimate', { items: [], reserve: 5, vat: 10 }); },
    save: function (d) { CX.store.set('estimate', d); },
    add: function (list) {
      var d = CX.estimate.load();
      list.forEach(function (it) {
        if (!(it.qty > 0)) return;
        var ex = d.items.find(function (x) { return x.name === it.name && x.unit === it.unit; });
        if (ex) ex.qty = Math.round((CX.num(ex.qty) + it.qty) * 1e4) / 1e4;
        else d.items.push({ id: CX.uid(), name: it.name, unit: it.unit, qty: Math.round(it.qty * 1e4) / 1e4, price: 0 });
      });
      CX.estimate.save(d);
      return d;
    }
  };

  /* ---------- Bộ dựng công cụ tính toán ---------- */
  function fieldHTML(f, val) {
    var label = CX.esc(f.label) + (f.unit ? ' <em>(' + CX.esc(f.unit) + ')</em>' : '');
    if (f.type === 'select') {
      return '<label class="fld"><span>' + label + '</span><select data-f="' + f.name + '">' +
        f.options.map(function (o) {
          return '<option value="' + CX.esc(o.value) + '"' + (String(o.value) === String(val) ? ' selected' : '') + '>' + CX.esc(o.label) + '</option>';
        }).join('') + '</select></label>';
    }
    return '<label class="fld"><span>' + label + '</span><input data-f="' + f.name + '" type="text" ' +
      (f.type === 'text' ? '' : 'inputmode="decimal" ') + 'value="' + CX.esc(val) + '" autocomplete="off"></label>';
  }
  function cellHTML(c, val, i) {
    if (c.type === 'select') {
      return '<select data-r="' + i + '" data-c="' + c.name + '" aria-label="' + CX.esc(c.label) + '">' +
        c.options.map(function (o) {
          return '<option value="' + CX.esc(o.value) + '"' + (String(o.value) === String(val) ? ' selected' : '') + '>' + CX.esc(o.label) + '</option>';
        }).join('') + '</select>';
    }
    return '<input data-r="' + i + '" data-c="' + c.name + '" aria-label="' + CX.esc(c.label) + '" type="text" ' +
      (c.type === 'text' ? '' : 'inputmode="decimal" ') + 'value="' + CX.esc(val) + '" autocomplete="off">';
  }
  function parseFields(fields, raw) {
    var o = {};
    (fields || []).forEach(function (f) { o[f.name] = (f.type === 'select' || f.type === 'text') ? raw[f.name] : CX.num(raw[f.name]); });
    return o;
  }
  function parseRows(cols, rows) {
    return rows.map(function (r) {
      var o = {};
      cols.forEach(function (c) { o[c.name] = (c.type === 'select' || c.type === 'text') ? r[c.name] : CX.num(r[c.name]); });
      return o;
    });
  }

  function renderOut(box, out, tool, inputs) {
    var h = '';
    if (out.warn && out.warn.length) h += '<div class="warn" role="alert">' + out.warn.map(CX.esc).join('<br>') + '</div>';
    h += '<section class="card"><h2>Kết quả</h2><div class="results">' + out.results.map(function (r) {
      return '<div class="res' + (r.main ? ' main' : '') + '"><span>' + CX.esc(r.label) + '</span><b>' +
        CX.esc(CX.nf(r.value, r.d == null ? 2 : r.d)) + (r.unit ? ' <small>' + CX.esc(r.unit) + '</small>' : '') + '</b></div>';
    }).join('') + '</div>';
    if (out.table) {
      h += '<div class="tbl" style="margin-top:14px"><table class="data"><thead><tr>' +
        out.table.head.map(function (x) { return '<th>' + CX.esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        out.table.rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + CX.esc(typeof c === 'number' ? CX.nf(c, 3) : c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
    }
    h += '<div class="actions no-print">' +
      '<button class="btn primary" data-act="csv">Xuất Excel (.xlsx)</button>' +
      '<button class="btn" data-act="print">In / lưu PDF</button>';
    (out.est || []).forEach(function (g, i) {
      h += '<button class="btn" data-act="est" data-i="' + i + '">+ ' + CX.esc(g.label) + '</button>';
    });
    h += '</div></section>';
    if (out.steps && out.steps.length) {
      h += '<details class="card" open><summary>Cách tính (công thức từng bước)</summary><ol>' +
        out.steps.map(function (s) { return '<li>' + CX.esc(s) + '</li>'; }).join('') + '</ol></details>';
    }
    if (tool._notes && tool._notes.length) {
      h += '<section class="card"><h2>Giả định và lưu ý</h2><ul class="note-list">' +
        tool._notes.map(function (s) { return '<li>' + CX.esc(s) + '</li>'; }).join('') + '</ul></section>';
    }
    box.innerHTML = h;

    box.onclick = function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'print') return CX.print();
      if (act === 'csv') {
        var rows = [[tool.name], ['Ngày xuất', CX.dateVN(CX.today())], []];
        if (inputs.length) { rows.push(['Thông số đầu vào']); inputs.forEach(function (r) { rows.push(r); }); rows.push([]); }
        if (out.table) { rows.push(out.table.head); out.table.rows.forEach(function (r) { rows.push(r); }); rows.push([]); }
        rows.push(['Kết quả']);
        out.results.forEach(function (r) { rows.push([r.label, r.value, r.unit || '']); });
        rows.push([], ['Kết quả chỉ mang tính tham khảo, cần được kỹ sư có chuyên môn kiểm tra trước khi áp dụng.']);
        return CX.exportCSV(tool.id + '-' + CX.today() + '.xlsx', rows);
      }
      if (act === 'est') {
        var g = out.est[+b.getAttribute('data-i')];
        CX.estimate.add(g.items);
        CX.toast('Đã thêm ' + g.items.filter(function (x) { return x.qty > 0; }).length + ' hạng mục vào dự toán.', { href: '#/tool/du-toan', text: 'Mở dự toán' });
      }
    };
  }

  /* cfg: { fields, rows:{title,cols,defaults,addLabel}, fieldsTitle, notes, compute(v, rows) } */
  CX.calc = function (el, tool, cfg) {
    var key = 'tool:' + tool.id;
    var defaults = { v: {}, rows: [] };
    (cfg.fields || []).forEach(function (f) { defaults.v[f.name] = f.value == null ? '' : f.value; });
    if (cfg.rows) defaults.rows = JSON.parse(JSON.stringify(cfg.rows.defaults || []));
    var saved = CX.store.get(key, null);
    var st = { v: Object.assign({}, defaults.v, saved && saved.v), rows: saved && saved.rows ? saved.rows : defaults.rows };
    tool._notes = cfg.notes || [];

    function rowsHTML() {
      return st.rows.map(function (r, i) {
        return '<tr>' + cfg.rows.cols.map(function (c) { return '<td>' + cellHTML(c, r[c.name], i) + '</td>'; }).join('') +
          '<td><button class="btn sm danger del" data-act="del" data-i="' + i + '" aria-label="Xóa dòng ' + (i + 1) + '">✕</button></td></tr>';
      }).join('');
    }
    var html = '';
    if (cfg.rows) {
      html += '<section class="card"><h2>' + CX.esc(cfg.rows.title || 'Danh sách') + '</h2><div class="tbl"><table class="rows"><thead><tr>' +
        cfg.rows.cols.map(function (c) { return '<th>' + CX.esc(c.label) + '</th>'; }).join('') + '<th></th></tr></thead><tbody id="rows-body"></tbody></table></div>' +
        '<div class="actions no-print"><button class="btn" data-act="add">+ ' + CX.esc(cfg.rows.addLabel || 'Thêm dòng') + '</button>' +
        '<button class="btn" data-act="reset">Đặt lại ví dụ</button></div></section>';
    }
    if ((cfg.fields || []).length) {
      html += '<section class="card"><h2>' + CX.esc(cfg.fieldsTitle || 'Thông số đầu vào') + '</h2><div class="grid">' +
        cfg.fields.map(function (f) { return fieldHTML(f, st.v[f.name]); }).join('') + '</div>' +
        (cfg.rows ? '' : '<div class="actions no-print"><button class="btn" data-act="reset">Đặt lại ví dụ</button></div>') + '</section>';
    }
    el.innerHTML = html + '<div id="calc-out"></div>';
    var body = el.querySelector('#rows-body'), outBox = el.querySelector('#calc-out');
    if (body) body.innerHTML = rowsHTML();

    function update() {
      CX.store.set(key, st);
      var v = parseFields(cfg.fields, st.v);
      var rows = cfg.rows ? parseRows(cfg.rows.cols, st.rows) : [];
      var out;
      try { out = cfg.compute(v, rows); } catch (e) { outBox.innerHTML = '<div class="warn">Không tính được: ' + CX.esc(e.message) + '</div>'; return; }
      var inputs = (cfg.fields || []).map(function (f) {
        var val = v[f.name];
        if (f.type === 'select') { var o = f.options.find(function (x) { return String(x.value) === String(val); }); val = o ? o.label : val; }
        return [f.label, val, f.unit || ''];
      });
      renderOut(outBox, out, tool, inputs);
    }

    el.addEventListener('input', function (e) {
      var t = e.target;
      if (t.hasAttribute('data-f')) st.v[t.getAttribute('data-f')] = t.value;
      else if (t.hasAttribute('data-r')) st.rows[+t.getAttribute('data-r')][t.getAttribute('data-c')] = t.value;
      else return;
      update();
    });
    el.addEventListener('change', function (e) { // select có "fills": tự điền các ô liên quan
      var t = e.target, name = t.getAttribute && t.getAttribute('data-f');
      if (!name) return;
      var f = cfg.fields.find(function (x) { return x.name === name; });
      var o = f && f.options && f.options.find(function (x) { return String(x.value) === t.value; });
      if (o && o.fills) {
        Object.keys(o.fills).forEach(function (k) {
          st.v[k] = String(o.fills[k]);
          var inp = el.querySelector('[data-f="' + k + '"]'); if (inp) inp.value = st.v[k];
        });
        update();
      }
    });
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b || b.closest('#calc-out')) return;
      var act = b.getAttribute('data-act');
      if (act === 'add') {
        var nr = {}; cfg.rows.cols.forEach(function (c) { nr[c.name] = c.type === 'text' ? '' : (c.type === 'select' ? c.options[0].value : ''); });
        if (cfg.rows.cols[0].type === 'text') nr[cfg.rows.cols[0].name] = (cfg.rows.cols[0].prefix || 'Hạng mục') + ' ' + (st.rows.length + 1);
        st.rows.push(nr); body.innerHTML = rowsHTML(); update();
        var last = body.querySelector('tr:last-child input'); if (last) last.focus();
      } else if (act === 'del') {
        st.rows.splice(+b.getAttribute('data-i'), 1); body.innerHTML = rowsHTML(); update();
      } else if (act === 'reset') {
        if (!confirm('Đặt lại về dữ liệu ví dụ? Dữ liệu đang nhập của công cụ này sẽ mất.')) return;
        st = { v: Object.assign({}, defaults.v), rows: JSON.parse(JSON.stringify(defaults.rows)) };
        el.querySelectorAll('[data-f]').forEach(function (inp) { inp.value = st.v[inp.getAttribute('data-f')]; });
        if (body) body.innerHTML = rowsHTML();
        update();
      }
    });
    update();
  };
})();
