/* Nhóm: Biểu mẫu và nhật ký — checklist nghiệm thu / an toàn, nhật ký công trình */
(function () {
  'use strict';
  var esc = CX.esc;
  var G = 'Biểu mẫu & nhật ký';

  /* ===== Checklist ===== */
  var TEMPLATES = [
    { id: 'thep', name: 'Nghiệm thu cốt thép trước khi đổ bê tông', items: [
      'Chủng loại, đường kính, số lượng thanh đúng bản vẽ thiết kế',
      'Khoảng cách thép chủ, bước đai đúng bản vẽ',
      'Chiều dài neo, nối chồng và vị trí mối nối đúng thiết kế',
      'Lớp bê tông bảo vệ: con kê đủ số lượng, đúng chiều dày',
      'Cốt thép sạch: không dính dầu mỡ, bùn đất, gỉ bong tróc',
      'Thép chờ, thép neo, thép râu đúng vị trí và cố định chắc chắn',
      'Cốt thép được buộc, hàn chắc, không bị xô lệch khi đi lại',
      'Hồ sơ vật liệu (chứng chỉ, kết quả thí nghiệm) đã có đủ',
      'Giám sát đã xác nhận cho phép chuyển bước'
    ] },
    { id: 'coppha', name: 'Nghiệm thu cốp pha, ván khuôn', items: [
      'Kích thước, cao độ, tim trục đúng bản vẽ',
      'Cốp pha kín khít, không rò rỉ vữa tại các mối ghép',
      'Hệ giàn giáo, cây chống đủ số lượng, có giằng ngang, chân chống đặt chắc',
      'Bề mặt cốp pha sạch, đã quét chất chống dính',
      'Các lỗ chờ, hộp kỹ thuật, bu lông chôn sẵn đã được đặt đúng vị trí',
      'Đã vệ sinh đáy cốp pha (rác, nước đọng, mùn cưa)',
      'Có lối đi và ván lót thao tác an toàn cho công nhân'
    ] },
    { id: 'do-be-tong', name: 'Kiểm tra khi đổ bê tông', items: [
      'Đã có phiếu cho phép đổ bê tông (sau nghiệm thu cốt thép, cốp pha)',
      'Kiểm tra phiếu giao hàng: mác, độ sụt, giờ trộn',
      'Lấy mẫu thử theo yêu cầu (độ sụt, mẫu nén)',
      'Đổ theo từng lớp, đầm đủ thời gian, không đầm vào cốp pha và cốt thép',
      'Chiều cao rơi tự do của bê tông không quá lớn, không để phân tầng',
      'Che chắn khi mưa, có phương án mạch ngừng nếu bị gián đoạn',
      'Hoàn thiện bề mặt, ghi lại giờ bắt đầu và kết thúc đổ',
      'Kế hoạch bảo dưỡng bê tông (tưới ẩm, che phủ) đã được giao người phụ trách'
    ] },
    { id: 'an-toan-ngay', name: 'An toàn lao động hằng ngày trên công trường', items: [
      'Đã họp đầu ca, phổ biến công việc và biện pháp an toàn trong ngày',
      'Mọi người đội mũ bảo hộ, mang giày, găng tay, kính theo công việc',
      'Hàng rào, biển báo, đèn cảnh báo khu vực nguy hiểm đầy đủ',
      'Lối đi, đường vận chuyển thông thoáng, không vật cản',
      'Lỗ chờ, mép sàn, cầu thang có lan can hoặc che chắn',
      'Vật liệu xếp gọn, chắc chắn, không chất sát mép hố, mép sàn',
      'Dụng cụ điện cầm tay còn tốt, có tiếp địa và dây điện không trần',
      'Có sẵn bình chữa cháy, hộp sơ cứu và số điện thoại khẩn cấp',
      'Vệ sinh công trường cuối ngày, rác thải được gom đúng nơi'
    ] },
    { id: 'tren-cao', name: 'An toàn làm việc trên cao', items: [
      'Người làm việc trên cao đủ sức khỏe và đã được hướng dẫn',
      'Đeo dây an toàn toàn thân, điểm neo chắc chắn',
      'Giàn giáo lắp đúng thiết kế, chân đế vững, có giằng chéo',
      'Sàn thao tác kín, không hở, có lan can và lưới chắn vật rơi',
      'Thang đặt đúng góc, có người giữ chân hoặc buộc chắc đầu thang',
      'Khu vực phía dưới được rào chắn, cấm người đi lại',
      'Không làm việc trên cao khi mưa, gió mạnh hoặc thiếu ánh sáng',
      'Dụng cụ cầm tay được buộc hoặc đựng trong túi, không ném từ trên xuống'
    ] },
    { id: 'dien-tam', name: 'Điện tạm công trường', items: [
      'Tủ điện có khóa, mái che, có thiết bị chống rò (RCD/ELCB)',
      'Dây dẫn đủ tiết diện, không rách vỏ, không kéo lê trên mặt đất ẩm',
      'Ổ cắm, phích cắm loại dùng ngoài trời, không đấu tạm',
      'Thiết bị có vỏ kim loại đã được nối đất',
      'Chỉ người có chuyên môn được đấu nối và sửa chữa điện',
      'Có biển cảnh báo điện và sơ đồ cấp điện tại tủ chính',
      'Tắt điện khi nghỉ ca, sửa chữa hoặc di chuyển thiết bị'
    ] }
  ];

  CX.register({
    id: 'checklist', name: 'Checklist nghiệm thu và an toàn', group: G, icon: '☑',
    desc: 'Danh sách kiểm tra có thể tích chọn, thêm mục riêng, in ra giấy hoặc lưu PDF.',
    keywords: 'checklist nghiem thu an toan lao dong cop pha cot thep do be tong tren cao dien',
    mount: function (el, tool) {
      var meta = CX.store.get('checklist:meta', { project: '', place: '', inspector: '', date: CX.today(), tpl: TEMPLATES[0].id });
      var tpl = TEMPLATES.find(function (t) { return t.id === meta.tpl; }) || TEMPLATES[0];
      var data;
      function load() { data = CX.store.get('checklist:' + tpl.id, { checks: {}, custom: [], note: '' }); }
      function save() { CX.store.set('checklist:' + tpl.id, data); CX.store.set('checklist:meta', meta); }
      load();

      el.innerHTML =
        '<section class="card"><h2>Thông tin phiếu</h2><div class="grid">' +
        '<label class="fld" style="grid-column:1/-1"><span>Biểu mẫu</span><select data-m="tpl">' +
        TEMPLATES.map(function (t) { return '<option value="' + t.id + '"' + (t.id === meta.tpl ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join('') + '</select></label>' +
        '<label class="fld"><span>Công trình</span><input type="text" data-m="project" value="' + esc(meta.project) + '"></label>' +
        '<label class="fld"><span>Hạng mục / vị trí</span><input type="text" data-m="place" value="' + esc(meta.place) + '"></label>' +
        '<label class="fld"><span>Người kiểm tra</span><input type="text" data-m="inspector" value="' + esc(meta.inspector) + '"></label>' +
        '<label class="fld"><span>Ngày</span><input type="date" data-m="date" value="' + esc(meta.date) + '"></label></div></section>' +
        '<section class="card"><h2 id="c-title"></h2><div class="progress" aria-hidden="true"><i id="c-bar"></i></div><p class="muted" id="c-count" style="margin:0 0 6px"></p><div id="c-list"></div>' +
        '<div class="actions no-print"><input type="text" id="c-new" placeholder="Thêm mục kiểm tra riêng" style="flex:1;min-width:200px"><button class="btn" data-act="addc">+ Thêm mục</button></div>' +
        '<label class="fld" style="margin-top:14px"><span>Ghi chú, tồn tại cần khắc phục</span><textarea id="c-note"></textarea></label>' +
        '<div class="actions no-print"><button class="btn primary" data-act="csv">Xuất Excel (.csv)</button><button class="btn" data-act="print">In / lưu PDF</button><button class="btn" data-act="clear">Bỏ chọn tất cả</button></div></section>' +
        '<section class="card"><h2>Lưu ý</h2><ul class="note-list"><li>Đây là danh mục kiểm tra thông dụng để nhắc việc, không thay thế quy trình nghiệm thu, hồ sơ và biện pháp an toàn theo thiết kế, hợp đồng và quy định hiện hành của công trình.</li><li>Bạn có thể thêm các mục riêng của công trình ngay trong phiếu.</li></ul></section>';

      var $ = function (s) { return el.querySelector(s); };
      function allItems() { return tpl.items.concat(data.custom); }
      function draw() {
        var items = allItems(), done = 0;
        $('#c-title').textContent = tpl.name;
        $('#c-list').innerHTML = items.map(function (txt, i) {
          var on = !!data.checks[i]; if (on) done++;
          var isCustom = i >= tpl.items.length;
          return '<div class="check' + (on ? ' done' : '') + '"><input type="checkbox" id="ck' + i + '" data-i="' + i + '"' + (on ? ' checked' : '') + '>' +
            '<label for="ck' + i + '">' + esc(txt) + '</label>' +
            (isCustom ? '<button class="btn sm danger no-print" data-act="delc" data-i="' + (i - tpl.items.length) + '" aria-label="Xóa mục">✕</button>' : '') + '</div>';
        }).join('');
        $('#c-bar').style.width = (items.length ? Math.round(done / items.length * 100) : 0) + '%';
        $('#c-count').textContent = 'Đã đạt ' + done + '/' + items.length + ' mục';
        $('#c-note').value = data.note || '';
      }
      draw();

      el.addEventListener('input', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-m')) {
          var k = t.getAttribute('data-m'); meta[k] = t.value;
          if (k === 'tpl') { tpl = TEMPLATES.find(function (x) { return x.id === t.value; }); load(); draw(); }
          save();
        } else if (t.id === 'c-note') { data.note = t.value; save(); }
      });
      el.addEventListener('change', function (e) {
        var t = e.target;
        if (t.type === 'checkbox' && t.hasAttribute('data-i')) { data.checks[t.getAttribute('data-i')] = t.checked; save(); draw(); }
      });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]'); if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'addc') {
          var inp = $('#c-new'), v = inp.value.trim(); if (!v) return inp.focus();
          data.custom.push(v); inp.value = ''; save(); draw();
        } else if (act === 'delc') {
          var idx = +b.getAttribute('data-i'), off = tpl.items.length;
          data.custom.splice(idx, 1);
          var nc = {}; Object.keys(data.checks).forEach(function (k) { k = +k; if (k < off + idx) nc[k] = data.checks[k]; else if (k > off + idx) nc[k - 1] = data.checks[k]; });
          data.checks = nc; save(); draw();
        } else if (act === 'clear') { data.checks = {}; save(); draw(); }
        else if (act === 'print') CX.print();
        else if (act === 'csv') {
          var rows = [[tpl.name], ['Công trình', meta.project], ['Hạng mục / vị trí', meta.place], ['Người kiểm tra', meta.inspector], ['Ngày', CX.dateVN(meta.date)], [], ['STT', 'Nội dung kiểm tra', 'Kết quả']];
          allItems().forEach(function (txt, i) { rows.push([i + 1, txt, data.checks[i] ? 'Đạt' : 'Chưa đạt / chưa kiểm tra']); });
          rows.push([], ['Ghi chú', data.note || '']);
          CX.exportCSV('checklist-' + tpl.id + '-' + meta.date + '.csv', rows);
        }
      });
      $('#c-new').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); el.querySelector('[data-act=addc]').click(); } });
    }
  });

  /* ===== Nhật ký công trình ===== */
  var WEATHER = ['Nắng', 'Nhiều mây', 'Mưa nhỏ', 'Mưa lớn', 'Gió mạnh'];
  CX.register({
    id: 'nhat-ky', name: 'Nhật ký công trình', group: G, icon: '✎',
    desc: 'Ghi nhanh mỗi ngày: thời tiết, nhân công, công việc, vật tư, sự cố. Xuất Excel hoặc in.',
    keywords: 'nhat ky cong trinh hang ngay thoi tiet nhan cong su co ghi chep',
    mount: function (el, tool) {
      var d = CX.store.get('diary', { project: '', entries: [] });
      var editing = null;
      function blank() { return { id: '', date: CX.today(), weather: WEATHER[0], workers: '', work: '', material: '', issue: '' }; }
      var form = blank();

      el.innerHTML =
        '<section class="card no-print"><h2 id="n-title">Ghi nhật ký mới</h2><div class="grid">' +
        '<label class="fld"><span>Ngày</span><input type="date" data-n="date"></label>' +
        '<label class="fld"><span>Thời tiết</span><select data-n="weather">' + WEATHER.map(function (w) { return '<option>' + w + '</option>'; }).join('') + '</select></label>' +
        '<label class="fld"><span>Số nhân công <em>(người)</em></span><input data-n="workers" inputmode="numeric"></label></div>' +
        '<label class="fld" style="margin-top:12px"><span>Công việc đã làm</span><textarea data-n="work"></textarea></label>' +
        '<label class="fld" style="margin-top:12px"><span>Vật tư vào, ra công trường</span><textarea data-n="material"></textarea></label>' +
        '<label class="fld" style="margin-top:12px"><span>Khó khăn, sự cố, việc cần xử lý</span><textarea data-n="issue"></textarea></label>' +
        '<div class="actions"><button class="btn primary" data-act="save">Lưu nhật ký</button><button class="btn" data-act="cancel" id="n-cancel" hidden>Hủy sửa</button></div></section>' +
        '<section class="card"><h2>Các ngày đã ghi</h2><label class="fld no-print" style="max-width:420px;margin-bottom:12px"><span>Tên công trình (hiện trên bản in và file xuất)</span><input type="text" id="n-project"></label>' +
        '<div id="n-list"></div>' +
        '<div class="actions no-print"><button class="btn primary" data-act="csv">Xuất Excel (.csv)</button><button class="btn" data-act="print">In / lưu PDF</button></div></section>' +
        '<section class="card no-print"><h2>Lưu ý</h2><ul class="note-list"><li>Nhật ký được lưu trong trình duyệt của thiết bị này. Đổi máy hoặc xóa dữ liệu duyệt web sẽ mất, hãy xuất file hoặc dùng nút "Sao lưu" ở trang chủ định kỳ.</li><li>Đây là sổ ghi chép cá nhân, chưa phải biểu mẫu nhật ký công trình theo quy định của hợp đồng hay cơ quan quản lý.</li></ul></section>';
      var $ = function (s) { return el.querySelector(s); };
      $('#n-project').value = d.project;

      function fillForm() {
        el.querySelectorAll('[data-n]').forEach(function (i) { i.value = form[i.getAttribute('data-n')]; });
        $('#n-title').textContent = editing ? 'Sửa nhật ký ngày ' + CX.dateVN(form.date) : 'Ghi nhật ký mới';
        $('#n-cancel').hidden = !editing;
      }
      function list() {
        var es = d.entries.slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
        $('#n-list').innerHTML = es.length ? es.map(function (e) {
          return '<article class="entry"><h3>' + esc(CX.dateVN(e.date)) + '</h3><p class="meta">' + esc(e.weather) + (e.workers ? ' · ' + esc(e.workers) + ' nhân công' : '') + '</p>' +
            (e.work ? '<p><b>Công việc:</b> ' + esc(e.work) + '</p>' : '') + (e.material ? '<p><b>Vật tư:</b> ' + esc(e.material) + '</p>' : '') +
            (e.issue ? '<p><b>Sự cố, việc cần xử lý:</b> ' + esc(e.issue) + '</p>' : '') +
            '<div class="actions no-print"><button class="btn sm" data-act="edit" data-id="' + e.id + '">Sửa</button><button class="btn sm danger" data-act="del" data-id="' + e.id + '">Xóa</button></div></article>';
        }).join('') : '<div class="empty">Chưa có nhật ký nào. Điền biểu mẫu phía trên rồi bấm "Lưu nhật ký".</div>';
      }
      fillForm(); list();

      el.addEventListener('input', function (e) {
        var t = e.target;
        if (t.hasAttribute('data-n')) form[t.getAttribute('data-n')] = t.value;
        else if (t.id === 'n-project') { d.project = t.value; CX.store.set('diary', d); }
      });
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]'); if (!b) return;
        var act = b.getAttribute('data-act'), id = b.getAttribute('data-id');
        if (act === 'save') {
          if (!form.date) return CX.toast('Hãy chọn ngày cho nhật ký.');
          if (!form.work.trim() && !form.material.trim() && !form.issue.trim()) return CX.toast('Hãy ghi ít nhất một mục: công việc, vật tư hoặc sự cố.');
          if (editing) { var i = d.entries.findIndex(function (x) { return x.id === editing; }); if (i >= 0) d.entries[i] = Object.assign({}, form, { id: editing }); }
          else d.entries.push(Object.assign({}, form, { id: CX.uid() }));
          CX.store.set('diary', d); CX.toast('Đã lưu nhật ký ngày ' + CX.dateVN(form.date) + '.');
          editing = null; form = blank(); fillForm(); list();
        } else if (act === 'cancel') { editing = null; form = blank(); fillForm(); }
        else if (act === 'edit') {
          var en = d.entries.find(function (x) { return x.id === id; }); if (!en) return;
          editing = id; form = Object.assign({}, en); fillForm(); window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (act === 'del') {
          if (!confirm('Xóa nhật ký này?')) return;
          d.entries = d.entries.filter(function (x) { return x.id !== id; }); CX.store.set('diary', d);
          if (editing === id) { editing = null; form = blank(); fillForm(); }
          list();
        } else if (act === 'print') CX.print();
        else if (act === 'csv') {
          var rows = [[tool.name], ['Công trình', d.project], [], ['Ngày', 'Thời tiết', 'Nhân công', 'Công việc', 'Vật tư', 'Sự cố, việc cần xử lý']];
          d.entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (x) {
            rows.push([CX.dateVN(x.date), x.weather, x.workers, x.work, x.material, x.issue]);
          });
          CX.exportCSV('nhat-ky-' + CX.today() + '.csv', rows);
        }
      });
    }
  });
})();
