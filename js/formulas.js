/* Công thức thuần (không đụng DOM) — dùng chung cho giao diện và test */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Formulas = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var pos = function (x) { x = +x; return isFinite(x) && x > 0 ? x : 0; };
  var round = function (n, d) { var p = Math.pow(10, d == null ? 4 : d); return Math.round(n * p) / p; };
  var withWaste = function (x, pct) { return x * (1 + Math.max(0, +pct || 0) / 100); };

  /* ---- Bê tông ---- */
  // rows: [{d, r, c, n}] đơn vị mét; waste: %
  function concrete(rows, waste) {
    var items = rows.map(function (x) { return pos(x.d) * pos(x.r) * pos(x.c) * (pos(x.n) || 0); });
    var net = items.reduce(function (a, b) { return a + b; }, 0);
    return { items: items, net: net, total: withWaste(net, waste) };
  }
  // Vật liệu cho 1 m3 bê tông theo định mức người dùng nhập
  function concreteMaterials(volume, norm) {
    var kg = volume * pos(norm.xm);
    var bag = pos(norm.bao) || 50;
    return { cementKg: kg, cementBags: Math.ceil(kg / bag - 1e-9), sand: volume * pos(norm.cat), stone: volume * pos(norm.da) };
  }

  /* ---- Cốt thép ---- */
  // Khối lượng 1 m thép tròn: d(mm)^2 * 0.00617 (kg/m)
  function rebarKgPerM(d) { return pos(d) * pos(d) * 0.00617; }
  // rows: [{d (mm), len (m), n}] ; opts: {waste %, stock (m)}
  function rebar(rows, opts) {
    opts = opts || {};
    var stock = pos(opts.stock) || 11.7;
    var perRow = rows.map(function (x) {
      var len = pos(x.len) * pos(x.n);
      return { d: pos(x.d), length: len, kgm: rebarKgPerM(x.d), kg: len * rebarKgPerM(x.d) };
    });
    var byD = {};
    perRow.forEach(function (r) {
      if (!r.d) return;
      byD[r.d] = byD[r.d] || { d: r.d, length: 0, kg: 0 };
      byD[r.d].length += r.length; byD[r.d].kg += r.kg;
    });
    var list = Object.keys(byD).map(Number).sort(function (a, b) { return a - b; }).map(function (k) {
      var g = byD[k];
      var lenW = withWaste(g.length, opts.waste);
      return { d: g.d, length: g.length, kg: g.kg, kgWaste: withWaste(g.kg, opts.waste), bars: Math.ceil(lenW / stock - 1e-9) };
    });
    var net = list.reduce(function (a, g) { return a + g.kg; }, 0);
    return { perRow: perRow, byD: list, net: net, total: withWaste(net, opts.waste) };
  }

  /* ---- Gạch xây & vữa ---- */
  // mode 'W': tường dày = W (mặt gạch L×H hướng ra) ; mode 'L': tường dày = L (mặt W×H hướng ra). Đơn vị gạch: mm
  function brick(p) {
    var gross = pos(p.len) * pos(p.h);
    var net = Math.max(0, gross - pos(p.open));
    var L = pos(p.L) / 1000, W = pos(p.W) / 1000, H = pos(p.H) / 1000, j = pos(p.joint) / 1000;
    var face = p.mode === 'L' ? W : L;
    var thickness = p.mode === 'L' ? L : W;
    var perM2 = face && H ? 1 / ((face + j) * (H + j)) : 0;
    var countNet = net * perM2;
    var wallVol = net * thickness;
    var brickVol = countNet * L * W * H;
    var mortarNet = Math.max(0, wallVol - brickVol);
    return {
      netArea: net, perM2: perM2, thickness: thickness, wallVol: wallVol,
      countNet: countNet, count: Math.ceil(withWaste(countNet, p.wasteBrick) - 1e-9),
      mortarNet: mortarNet, mortar: withWaste(mortarNet, p.wasteMortar)
    };
  }

  /* ---- Ốp lát ---- */
  function tiles(p) {
    var area = Math.max(0, pos(p.len) * pos(p.wid) + pos(p.extra) - pos(p.cut));
    var tl = pos(p.tl) / 1000, tw = pos(p.tw) / 1000, j = pos(p.joint) / 1000;
    var unit = tl && tw ? (tl + j) * (tw + j) : 0;
    var net = unit ? area / unit : 0;
    var count = Math.ceil(withWaste(net, p.waste) - 1e-9);
    var perBox = pos(p.perBox);
    return { area: area, unitArea: unit, countNet: net, count: count, boxes: perBox ? Math.ceil(count / perBox - 1e-9) : 0 };
  }

  /* ---- Quy đổi đơn vị ---- */
  var UNITS = {
    'Chiều dài': { 'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000, 'inch (in)': 0.0254, 'feet (ft)': 0.3048, 'yard (yd)': 0.9144 },
    'Diện tích': { 'cm²': 1e-4, 'm²': 1, 'ha': 1e4, 'km²': 1e6, 'in²': 0.00064516, 'ft²': 0.09290304 },
    'Thể tích': { 'cm³': 1e-6, 'lít': 0.001, 'm³': 1, 'ft³': 0.028316846592, 'gallon Mỹ': 0.003785411784 },
    'Khối lượng': { 'g': 0.001, 'kg': 1, 'yến (10 kg)': 10, 'tạ (100 kg)': 100, 'tấn': 1000, 'lb (pound)': 0.45359237 },
    'Lực': { 'N': 1, 'kN': 1000, 'kgf': 9.80665, 'tấn lực (tf)': 9806.65, 'lbf': 4.4482216152605 },
    'Áp suất / ứng suất': { 'Pa': 1, 'kPa': 1e3, 'MPa (N/mm²)': 1e6, 'kgf/cm²': 98066.5, 'bar': 1e5, 'psi': 6894.757293168 }
  };
  function convert(value, from, to, cat) {
    var u = UNITS[cat];
    if (!u || !(from in u) || !(to in u)) throw new Error('Đơn vị không hợp lệ');
    return value * u[from] / u[to];
  }

  /* ---- Bảng thép tròn ---- */
  var REBAR_DIAMETERS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32];
  function rebarTable(stock) {
    stock = pos(stock) || 11.7;
    return REBAR_DIAMETERS.map(function (d) {
      return { d: d, kgm: rebarKgPerM(d), kgBar: rebarKgPerM(d) * stock, area: Math.PI * d * d / 4, perimeter: Math.PI * d };
    });
  }

  /* ---- Dự toán ---- */
  function estimate(items, reservePct, vatPct) {
    var lines = items.map(function (x) { return { amount: (+x.qty || 0) * (+x.price || 0) }; });
    var sub = lines.reduce(function (a, l) { return a + l.amount; }, 0);
    var reserve = sub * Math.max(0, +reservePct || 0) / 100;
    var vat = (sub + reserve) * Math.max(0, +vatPct || 0) / 100;
    return { lines: lines, sub: sub, reserve: reserve, vat: vat, total: sub + reserve + vat };
  }

  return {
    round: round, concrete: concrete, concreteMaterials: concreteMaterials, rebarKgPerM: rebarKgPerM, rebar: rebar,
    brick: brick, tiles: tiles, UNITS: UNITS, convert: convert,
    REBAR_DIAMETERS: REBAR_DIAMETERS, rebarTable: rebarTable, estimate: estimate
  };
});
