/* Nhóm: Khối lượng vật liệu — bê tông, cốt thép, gạch xây */
(function () {
  'use strict';
  var nf = CX.nf, F = Formulas;
  var G = 'Khối lượng vật liệu';

  /* ===== Bê tông ===== */
  var MAC = [
    { value: 'M150', label: 'M150', fills: { xm: 280, cat: 0.50, da: 0.91 } },
    { value: 'M200', label: 'M200', fills: { xm: 330, cat: 0.47, da: 0.89 } },
    { value: 'M250', label: 'M250', fills: { xm: 385, cat: 0.46, da: 0.88 } },
    { value: 'M300', label: 'M300', fills: { xm: 435, cat: 0.45, da: 0.87 } }
  ];
  CX.register({
    id: 'be-tong', name: 'Khối lượng bê tông', group: G, icon: '▥',
    desc: 'Móng, cột, dầm, sàn: thể tích bê tông, xi măng, cát, đá.',
    keywords: 'be tong mong cot dam san m200 m250 xi mang cat da khoi luong',
    mount: function (el, tool) {
      CX.calc(el, tool, {
        rows: {
          title: 'Danh sách cấu kiện', addLabel: 'Thêm cấu kiện', cols: [
            { name: 'ten', label: 'Tên cấu kiện', type: 'text', prefix: 'Cấu kiện' },
            { name: 'd', label: 'Dài (m)' }, { name: 'r', label: 'Rộng (m)' },
            { name: 'c', label: 'Cao/dày (m)' }, { name: 'n', label: 'Số lượng' }
          ],
          defaults: [
            { ten: 'Móng M1', d: '1.2', r: '1.2', c: '0.4', n: '4' },
            { ten: 'Cột C1', d: '0.22', r: '0.22', c: '3.2', n: '4' },
            { ten: 'Dầm D1', d: '4', r: '0.2', c: '0.3', n: '2' },
            { ten: 'Sàn S1', d: '4', r: '4', c: '0.1', n: '1' }
          ]
        },
        fieldsTitle: 'Mác bê tông và hao hụt',
        fields: [
          { name: 'mac', label: 'Mác bê tông', type: 'select', value: 'M200', options: MAC },
          { name: 'xm', label: 'Xi măng', unit: 'kg/m³', value: '330' },
          { name: 'cat', label: 'Cát', unit: 'm³/m³', value: '0.47' },
          { name: 'da', label: 'Đá 1×2', unit: 'm³/m³', value: '0.89' },
          { name: 'hh', label: 'Hao hụt', unit: '%', value: '3' },
          { name: 'bao', label: 'Bao xi măng', unit: 'kg/bao', value: '50' }
        ],
        notes: [
          'Định mức xi măng, cát, đá trong bảng mác là số gần đúng để ước tính nhanh. Hãy thay bằng định mức cấp phối do tư vấn hoặc thí nghiệm cung cấp.',
          'Thể tích là hình khối chữ nhật (dài × rộng × cao). Cấu kiện có hình dạng khác cần tính riêng.',
          'Chưa trừ thể tích cốt thép chiếm chỗ (thường nhỏ, bỏ qua khi ước tính).'
        ],
        compute: function (v, rows) {
          var r = F.concrete(rows, v.hh);
          var m = F.concreteMaterials(r.total, v);
          var warn = [];
          rows.forEach(function (x, i) { if (!(x.d > 0 && x.r > 0 && x.c > 0 && x.n > 0)) warn.push('Dòng ' + (i + 1) + ' có kích thước hoặc số lượng bằng 0 nên không được tính.'); });
          if (v.hh > 15) warn.push('Hao hụt ' + v.hh + '% khá cao, hãy kiểm tra lại.');
          var name = 'Bê tông ' + v.mac;
          return {
            warn: warn,
            results: [
              { label: 'Thể tích bê tông cần đặt (đã gồm hao hụt)', value: r.total, unit: 'm³', d: 2, main: true },
              { label: 'Thể tích tịnh', value: r.net, unit: 'm³', d: 3 },
              { label: 'Xi măng', value: m.cementKg, unit: 'kg', d: 0 },
              { label: 'Số bao xi măng (làm tròn lên)', value: m.cementBags, unit: 'bao', d: 0 },
              { label: 'Cát', value: m.sand, unit: 'm³', d: 2 },
              { label: 'Đá 1×2', value: m.stone, unit: 'm³', d: 2 }
            ],
            table: {
              head: ['Cấu kiện', 'Dài (m)', 'Rộng (m)', 'Cao (m)', 'SL', 'Thể tích (m³)'],
              rows: rows.map(function (x, i) { return [x.ten, x.d, x.r, x.c, x.n, r.items[i]]; })
            },
            steps: [
              'Mỗi cấu kiện: V = dài × rộng × cao × số lượng.',
              'Thể tích tịnh = tổng các cấu kiện = ' + nf(r.net, 3) + ' m³.',
              'Thể tích cần đặt = thể tích tịnh × (1 + ' + nf(v.hh, 1) + '%) = ' + nf(r.total, 3) + ' m³.',
              'Xi măng = ' + nf(r.total, 2) + ' × ' + nf(v.xm, 0) + ' kg = ' + nf(m.cementKg, 0) + ' kg, tức ' + m.cementBags + ' bao ' + nf(v.bao, 0) + ' kg.',
              'Cát = ' + nf(r.total, 2) + ' × ' + nf(v.cat, 2) + ' = ' + nf(m.sand, 2) + ' m³; đá = ' + nf(r.total, 2) + ' × ' + nf(v.da, 2) + ' = ' + nf(m.stone, 2) + ' m³.'
            ],
            est: [
              { label: 'Bê tông thương phẩm vào dự toán', items: [{ name: name, unit: 'm³', qty: r.total }] },
              { label: 'Vật liệu trộn tại chỗ vào dự toán', items: [
                { name: 'Xi măng', unit: 'bao', qty: m.cementBags },
                { name: 'Cát bê tông', unit: 'm³', qty: m.sand },
                { name: 'Đá 1×2', unit: 'm³', qty: m.stone }
              ] }
            ]
          };
        }
      });
    }
  });

  /* ===== Cốt thép ===== */
  var DOPT = F.REBAR_DIAMETERS.map(function (d) { return { value: d, label: 'Φ' + d }; });
  CX.register({
    id: 'cot-thep', name: 'Khối lượng cốt thép', group: G, icon: '≡',
    desc: 'Tổng khối lượng thép theo đường kính, số cây thép 11,7 m cần mua.',
    keywords: 'cot thep sat thep thanh dai khoi luong kg cay phi',
    mount: function (el, tool) {
      CX.calc(el, tool, {
        rows: {
          title: 'Danh sách thanh thép', addLabel: 'Thêm thanh thép', cols: [
            { name: 'ten', label: 'Vị trí / mô tả', type: 'text', prefix: 'Thanh' },
            { name: 'd', label: 'Đường kính', type: 'select', options: DOPT },
            { name: 'len', label: 'Dài mỗi thanh (m)' }, { name: 'n', label: 'Số thanh' }
          ],
          defaults: [
            { ten: 'Thép chủ cột C1', d: '16', len: '3.8', n: '16' },
            { ten: 'Thép chủ dầm D1', d: '18', len: '4.6', n: '8' },
            { ten: 'Đai cột Φ6', d: '6', len: '0.8', n: '60' },
            { ten: 'Thép sàn Φ8', d: '8', len: '4', n: '40' }
          ]
        },
        fieldsTitle: 'Hao hụt và chiều dài cây thép',
        fields: [
          { name: 'hh', label: 'Hao hụt cắt, nối', unit: '%', value: '5' },
          { name: 'stock', label: 'Chiều dài cây thép', unit: 'm', value: '11.7' }
        ],
        notes: [
          'Khối lượng 1 m thép tròn = d² × 0,00617 (kg/m, d tính bằng mm). Sai khác nhỏ so với bảng của nhà sản xuất là bình thường.',
          'Số cây chỉ là ước lượng theo tổng chiều dài. Cách cắt thực tế (tận dụng đầu mẩu) sẽ cho kết quả tốt hơn hoặc xấu hơn.',
          'Chiều dài mỗi thanh cần bạn tự lấy từ bản vẽ (đã gồm đoạn neo, nối chồng, móc).'
        ],
        compute: function (v, rows) {
          var r = F.rebar(rows, { waste: v.hh, stock: v.stock });
          var warn = [];
          rows.forEach(function (x, i) { if (!(x.len > 0 && x.n > 0)) warn.push('Dòng ' + (i + 1) + ' thiếu chiều dài hoặc số thanh nên không được tính.'); });
          var res = [{ label: 'Tổng khối lượng thép (đã gồm hao hụt)', value: r.total, unit: 'kg', d: 1, main: true },
            { label: 'Khối lượng tịnh', value: r.net, unit: 'kg', d: 1 },
            { label: 'Quy đổi', value: r.total / 1000, unit: 'tấn', d: 3 }];
          r.byD.forEach(function (g) { res.push({ label: 'Φ' + g.d + ' (' + g.bars + ' cây ' + nf(v.stock, 1) + ' m)', value: g.kgWaste, unit: 'kg', d: 1 }); });
          return {
            warn: warn, results: res,
            table: {
              head: ['Vị trí', 'Φ (mm)', 'Dài/thanh (m)', 'Số thanh', 'kg/m', 'Khối lượng (kg)'],
              rows: rows.map(function (x, i) { return [x.ten, Number(x.d), x.len, x.n, F.round(r.perRow[i].kgm, 3), F.round(r.perRow[i].kg, 2)]; })
            },
            steps: [
              'Khối lượng 1 m = d² × 0,00617 (ví dụ Φ16: 16² × 0,00617 = ' + nf(F.rebarKgPerM(16), 3) + ' kg/m).',
              'Mỗi dòng: khối lượng = dài mỗi thanh × số thanh × kg/m.',
              'Gộp theo đường kính, nhân (1 + ' + nf(v.hh, 1) + '%) cho hao hụt.',
              'Số cây = tổng chiều dài (đã gồm hao hụt) ÷ ' + nf(v.stock, 1) + ' m, làm tròn lên.'
            ],
            est: [{ label: 'Thép theo đường kính vào dự toán', items: r.byD.map(function (g) { return { name: 'Thép Φ' + g.d, unit: 'kg', qty: g.kgWaste }; }) }]
          };
        }
      });
    }
  });

  /* ===== Gạch xây và vữa ===== */
  CX.register({
    id: 'gach-xay', name: 'Gạch xây và vữa', group: G, icon: '▦',
    desc: 'Số viên gạch và thể tích vữa cho tường, trừ cửa và lỗ mở.',
    keywords: 'gach xay tuong vua gach ong gach dac so vien',
    mount: function (el, tool) {
      CX.calc(el, tool, {
        fieldsTitle: 'Tường và loại gạch',
        fields: [
          { name: 'len', label: 'Tổng chiều dài tường', unit: 'm', value: '12' },
          { name: 'h', label: 'Chiều cao tường', unit: 'm', value: '3.2' },
          { name: 'open', label: 'Diện tích cửa, lỗ trừ đi', unit: 'm²', value: '6' },
          { name: 'L', label: 'Gạch: dài', unit: 'mm', value: '180' },
          { name: 'W', label: 'Gạch: rộng', unit: 'mm', value: '80' },
          { name: 'H', label: 'Gạch: cao', unit: 'mm', value: '80' },
          { name: 'joint', label: 'Mạch vữa', unit: 'mm', value: '10' },
          { name: 'mode', label: 'Cách xây', type: 'select', value: 'W', options: [
            { value: 'W', label: 'Tường đơn: dày = cạnh rộng (W)' },
            { value: 'L', label: 'Tường dày: dày = cạnh dài (L)' }
          ] },
          { name: 'wasteBrick', label: 'Hao hụt gạch', unit: '%', value: '3' },
          { name: 'wasteMortar', label: 'Hao hụt vữa', unit: '%', value: '10' }
        ],
        notes: [
          'Số viên/m² = 1 ÷ ((cạnh hướng ra + mạch) × (cao + mạch)). Mỗi loại gạch và tay nghề thợ cho số liệu khác nhau, hãy đối chiếu với định mức hiện hành.',
          'Thể tích vữa = thể tích tường − thể tích gạch (chưa gồm vữa tô trát, vữa giằng, lanh tô).',
          'Chưa tính gạch xây tường nhiều lớp hoặc tường có góc cắt, vát.'
        ],
        compute: function (v) {
          var r = F.brick(v);
          var warn = [];
          if (v.open > v.len * v.h) warn.push('Diện tích cửa lớn hơn diện tích tường nên diện tích xây bằng 0.');
          if (!(v.L > 0 && v.W > 0 && v.H > 0)) warn.push('Kích thước gạch phải lớn hơn 0.');
          return {
            warn: warn,
            results: [
              { label: 'Số viên gạch cần mua (đã gồm hao hụt)', value: r.count, unit: 'viên', d: 0, main: true },
              { label: 'Diện tích xây thực', value: r.netArea, unit: 'm²', d: 2 },
              { label: 'Số viên trên 1 m² tường', value: r.perM2, unit: 'viên/m²', d: 1 },
              { label: 'Bề dày tường (chưa tô)', value: r.thickness * 1000, unit: 'mm', d: 0 },
              { label: 'Thể tích vữa xây (đã gồm hao hụt)', value: r.mortar, unit: 'm³', d: 3 }
            ],
            steps: [
              'Diện tích xây = dài × cao − cửa = ' + nf(v.len, 2) + ' × ' + nf(v.h, 2) + ' − ' + nf(v.open, 2) + ' = ' + nf(r.netArea, 2) + ' m².',
              'Số viên/m² = 1 ÷ ((' + (v.mode === 'L' ? v.W : v.L) + ' + ' + v.joint + ') × (' + v.H + ' + ' + v.joint + ')) mm = ' + nf(r.perM2, 2) + '.',
              'Số viên = ' + nf(r.netArea, 2) + ' × ' + nf(r.perM2, 2) + ' = ' + nf(r.countNet, 1) + ', nhân (1 + ' + nf(v.wasteBrick, 1) + '%) rồi làm tròn lên = ' + r.count + ' viên.',
              'Vữa = thể tích tường (' + nf(r.wallVol, 3) + ' m³) − thể tích gạch = ' + nf(r.mortarNet, 3) + ' m³, nhân hao hụt vữa.'
            ],
            est: [{ label: 'Gạch và vữa vào dự toán', items: [
              { name: 'Gạch xây', unit: 'viên', qty: r.count },
              { name: 'Vữa xây', unit: 'm³', qty: r.mortar }
            ] }]
          };
        }
      });
    }
  });
})();
