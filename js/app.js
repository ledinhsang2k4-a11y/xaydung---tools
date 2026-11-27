/* Khung ứng dụng: định tuyến theo hash, trang chủ, giới thiệu, sao lưu */
(function () {
  'use strict';
  var esc = CX.esc;
  var app = document.getElementById('app');
  var homeState = { q: '', group: '' };

  var plain = function (s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  };

  /* ---------- Sao lưu / khôi phục ---------- */
  function backup() {
    var data = { app: 'xay-dung-tools', version: 1, exported: new Date().toISOString(), data: CX.store.all() };
    CX.download('sao-luu-xay-dung-' + CX.today() + '.json', JSON.stringify(data, null, 2), 'application/json');
    CX.toast('Đã tải file sao lưu. Hãy cất file này ở nơi an toàn.');
  }
  function restore(file) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var j = JSON.parse(fr.result);
        if (!j || j.app !== 'xay-dung-tools' || typeof j.data !== 'object') throw new Error('File không phải bản sao lưu của bộ công cụ này.');
        var n = Object.keys(j.data).length;
        if (!confirm('Khôi phục ' + n + ' mục dữ liệu? Dữ liệu cùng tên trên thiết bị này sẽ bị ghi đè.')) return;
        Object.keys(j.data).forEach(function (k) { CX.store.set(k, j.data[k]); });
        CX.toast('Đã khôi phục dữ liệu.'); route();
      } catch (e) { CX.toast('Không khôi phục được: ' + e.message); }
    };
    fr.readAsText(file);
  }

  /* ---------- Trang chủ ---------- */
  function home() {
    document.title = 'Bộ công cụ hỗ trợ tính toán khối lượng vật liệu và dự toán';
    app.innerHTML =
      '<div class="hero"><h1>Tính nhanh ngay tại công trường</h1>' +
      '<p>Khối lượng vật liệu, dự toán sơ bộ, tra cứu và checklist nghiệm thu, an toàn. Chạy trên điện thoại, dùng được khi mất mạng, không cần tài khoản.</p></div>' +
      '<div class="searchbar"><input id="q" type="search" placeholder="Tìm công cụ: bê tông, thép, gạch, checklist..." aria-label="Tìm công cụ" autocomplete="off"></div>' +
      '<div class="chips" id="chips"></div><div id="list"></div>' +
      '<div class="notice"><p><b>Dữ liệu nằm trên thiết bị của bạn.</b> Không có máy chủ, nên đổi máy hoặc xóa dữ liệu duyệt web sẽ làm mất dự toán và checklist đã nhập.</p>' +
      '<div class="actions"><button class="btn" id="bk">Sao lưu dữ liệu (.json)</button><label class="btn" style="cursor:pointer">Khôi phục từ file<input id="rs" type="file" accept="application/json,.json" hidden></label></div></div>';

    var q = document.getElementById('q'); q.value = homeState.q;
    var chips = document.getElementById('chips');
    function drawChips() {
      chips.innerHTML = ['Tất cả'].concat(CX.groups).map(function (g, i) {
        var val = i ? g : '';
        return '<button class="chip" aria-pressed="' + (homeState.group === val) + '" data-g="' + esc(val) + '">' + esc(g) + '</button>';
      }).join('');
    }
    function drawList() {
      var term = plain(homeState.q).trim();
      var found = CX.tools.filter(function (t) {
        if (homeState.group && t.group !== homeState.group) return false;
        return !term || plain(t.name + ' ' + t.desc + ' ' + t.keywords).indexOf(term) >= 0;
      });
      var box = document.getElementById('list');
      if (!found.length) { box.innerHTML = '<div class="empty">Không có công cụ nào khớp "' + esc(homeState.q) + '". Thử từ khóa ngắn hơn, ví dụ "thép" hoặc "gạch".</div>'; return; }
      box.innerHTML = CX.groups.map(function (g) {
        var items = found.filter(function (t) { return t.group === g; });
        if (!items.length) return '';
        return '<h2 class="group-title">' + esc(g) + '</h2><div class="tools">' + items.map(function (t) {
          return '<a class="tool-card" href="#/tool/' + t.id + '"><span class="ico" aria-hidden="true">' + esc(t.icon) + '</span><div><b>' + esc(t.name) + '</b><span>' + esc(t.desc) + '</span></div></a>';
        }).join('') + '</div>';
      }).join('');
    }
    drawChips(); drawList();
    q.addEventListener('input', function () { homeState.q = q.value; drawList(); });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]'); if (!b) return;
      homeState.group = b.getAttribute('data-g'); drawChips(); drawList();
    });
    document.getElementById('bk').addEventListener('click', backup);
    document.getElementById('rs').addEventListener('change', function (e) { if (e.target.files[0]) restore(e.target.files[0]); e.target.value = ''; });
  }

  /* ---------- Trang công cụ ---------- */
  function toolPage(id) {
    var tool = CX.tools.find(function (t) { return t.id === id; });
    if (!tool) { notFound(); return; }
    document.title = tool.name + ' | Bộ công cụ hỗ trợ tính toán khối lượng vật liệu và dự toán';
    app.innerHTML =
      '<a class="crumb" href="#/">← Tất cả công cụ</a>' +
      '<div class="print-only print-head"><h1>' + esc(tool.name) + '</h1><div>Ngày in: ' + esc(CX.dateVN(CX.today())) + '</div></div>' +
      '<div class="tool-head"><h1>' + esc(tool.name) + '</h1><p>' + esc(tool.desc) + '</p></div><div id="tool-root"></div>' +
      '<p class="disclaimer">Kết quả chỉ mang tính tham khảo, dùng để ước tính nhanh. Không thay thế hồ sơ thiết kế, dự toán chính thức hay đánh giá của kỹ sư có chuyên môn. Người dùng chịu trách nhiệm kiểm tra lại số liệu trước khi áp dụng.</p>';
    try { tool.mount(document.getElementById('tool-root'), tool); }
    catch (e) { document.getElementById('tool-root').innerHTML = '<div class="warn">Công cụ gặp lỗi: ' + esc(e.message) + '. Thử tải lại trang.</div>'; console.error(e); }
  }

  /* ---------- Giới thiệu ---------- */
  function about() {
    document.title = 'Giới thiệu | Bộ công cụ hỗ trợ tính toán khối lượng vật liệu và dự toán';
    app.innerHTML =
      '<a class="crumb" href="#/">← Tất cả công cụ</a><div class="tool-head"><h1>Giới thiệu và miễn trừ trách nhiệm</h1></div>' +
      '<section class="card"><h2>Bộ công cụ này là gì?</h2><p>Tập hợp công cụ tính nhanh cho người làm xây dựng. Toàn bộ chạy trong trình duyệt, không gửi dữ liệu của bạn đi đâu. Sau lần mở đầu tiên, bạn có thể dùng khi không có mạng và thêm vào màn hình chính điện thoại.</p></section>' +
      '<section class="card"><h2>Công thức dùng trong các công cụ</h2><ul class="note-list">' +
      '<li>Bê tông: V = dài × rộng × cao × số lượng; vật liệu = V × định mức do bạn nhập hoặc chọn theo mác.</li>' +
      '<li>Thép tròn: khối lượng 1 m = d² × 0,00617 kg (d tính bằng mm).</li>' +
      '<li>Gạch xây: số viên/m² = 1 ÷ ((cạnh hướng ra + mạch) × (cao + mạch)); vữa = thể tích tường − thể tích gạch.</li>' +
      '<li>Ốp lát: số viên = diện tích ÷ diện tích một viên kể cả mạch, nhân hao hụt, làm tròn lên.</li>' +
      '<li>Quy đổi: dùng hệ số chuẩn quốc tế (ví dụ 1 kgf = 9,80665 N, 1 inch = 25,4 mm).</li></ul></section>' +
      '<section class="card"><h2>Miễn trừ trách nhiệm</h2><p>Kết quả chỉ để ước tính nhanh. Định mức vật liệu trong các mác bê tông, tỷ lệ hao hụt và số liệu gạch là giá trị tham khảo gần đúng, cần đối chiếu với định mức, tiêu chuẩn, hồ sơ thiết kế và báo giá thực tế. Các công cụ không tính kết cấu và không thay thế kỹ sư có chuyên môn. Người dùng tự chịu trách nhiệm khi áp dụng kết quả.</p></section>' +
      '<section class="card"><h2>Dữ liệu của bạn</h2><p>Dữ liệu nhập (dự toán, checklist, thông số đã nhập) chỉ lưu trong trình duyệt của thiết bị này. Hãy dùng nút "Sao lưu dữ liệu" ở trang chủ để giữ bản dự phòng.</p></section>';
  }

  function notFound() {
    document.title = 'Không tìm thấy | Bộ công cụ hỗ trợ tính toán khối lượng vật liệu và dự toán';
    app.innerHTML = '<a class="crumb" href="#/">← Tất cả công cụ</a><div class="empty" style="margin-top:20px">Không tìm thấy trang này. <a href="#/">Về trang chủ</a> để chọn công cụ.</div>';
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/');
    if (!h) home();
    else if (parts[0] === 'tool' && parts[1]) toolPage(decodeURIComponent(parts[1]));
    else if (parts[0] === 'about') about();
    else notFound();
  }
  var lastHash = null;
  window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); app.focus({ preventScroll: true }); });
  route();

  /* ---------- Chạy offline ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
