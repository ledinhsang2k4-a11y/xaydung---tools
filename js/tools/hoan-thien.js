/* Nhóm: Khối lượng vật liệu (hoàn thiện) — ốp lát */
(function () {
  'use strict';
  var nf = CX.nf, F = Formulas;
  var G = 'Khối lượng vật liệu';

  /* ===== Ốp lát ===== */
  CX.register({
    id: 'op-lat', name: 'Gạch ốp lát', group: G, icon: '▩',
    desc: 'Số viên gạch lát nền hoặc ốp tường, số thùng cần mua.',
    keywords: 'op lat gach men gach nen op tuong thung vien mach',
    mount: function (el, tool) {
      CX.calc(el, tool, {
        fieldsTitle: 'Diện tích và loại gạch',
        fields: [
          { name: 'len', label: 'Chiều dài sàn', unit: 'm', value: '5' },
          { name: 'wid', label: 'Chiều rộng sàn', unit: 'm', value: '4' },
          { name: 'extra', label: 'Diện tích cộng thêm (tường, bậc...)', unit: 'm²', value: '0' },
          { name: 'cut', label: 'Diện tích trừ (cột, bồn...)', unit: 'm²', value: '0' },
          { name: 'tl', label: 'Gạch: cạnh dài', unit: 'mm', value: '600' },
          { name: 'tw', label: 'Gạch: cạnh rộng', unit: 'mm', value: '600' },
          { name: 'joint', label: 'Mạch ron', unit: 'mm', value: '2' },
          { name: 'waste', label: 'Hao hụt (cắt, vỡ)', unit: '%', value: '5' },
          { name: 'perBox', label: 'Số viên mỗi thùng (0 nếu không rõ)', unit: 'viên', value: '4' }
        ],
        notes: [
          'Hao hụt thường tăng khi lát chéo, lát theo hoa văn hoặc phòng nhiều góc. Nên mua dư thêm một ít cùng lô để dặm vá sau này.',
          'Diện tích = dài × rộng + diện tích cộng thêm − diện tích trừ.',
          'Cùng một mã gạch nhưng khác lô sản xuất có thể lệch màu, nên mua đủ trong một lần.'
        ],
        compute: function (v) {
          var r = F.tiles(v);
          var warn = [];
          if (!(v.tl > 0 && v.tw > 0)) warn.push('Kích thước gạch phải lớn hơn 0.');
          var res = [
            { label: 'Số viên gạch cần mua (đã gồm hao hụt)', value: r.count, unit: 'viên', d: 0, main: true },
            { label: 'Diện tích ốp lát', value: r.area, unit: 'm²', d: 2 },
            { label: 'Số viên tịnh', value: r.countNet, unit: 'viên', d: 1 }
          ];
          if (v.perBox > 0) res.push({ label: 'Số thùng (làm tròn lên)', value: r.boxes, unit: 'thùng', d: 0 });
          return {
            warn: warn, results: res,
            steps: [
              'Diện tích = ' + nf(v.len, 2) + ' × ' + nf(v.wid, 2) + ' + ' + nf(v.extra, 2) + ' − ' + nf(v.cut, 2) + ' = ' + nf(r.area, 2) + ' m².',
              'Diện tích 1 viên kể cả mạch = (' + v.tl + ' + ' + v.joint + ') × (' + v.tw + ' + ' + v.joint + ') mm = ' + nf(r.unitArea, 4) + ' m².',
              'Số viên tịnh = ' + nf(r.area, 2) + ' ÷ ' + nf(r.unitArea, 4) + ' = ' + nf(r.countNet, 1) + '; nhân (1 + ' + nf(v.waste, 1) + '%) rồi làm tròn lên = ' + r.count + ' viên.'
            ],
            est: [{ label: 'Gạch ốp lát vào dự toán', items: [{ name: 'Gạch ốp lát ' + v.tl + '×' + v.tw, unit: 'viên', qty: r.count }] }]
          };
        }
      });
    }
  });
})();
