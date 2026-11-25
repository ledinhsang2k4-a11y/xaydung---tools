// Chạy: node tests/formulas.test.js
const assert = require('assert');
const F = require('../js/formulas.js');
let passed = 0;
function t(name, fn) { try { fn(); passed++; console.log('  ok  ' + name); } catch (e) { console.error('FAIL  ' + name + '\n      ' + e.message); process.exitCode = 1; } }
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) <= eps, `${a} != ${b}`);

t('bê tông: 4 móng 1.2×1.2×0.4 = 2.304 m³', () => {
  const r = F.concrete([{ d: 1.2, r: 1.2, c: 0.4, n: 4 }], 0);
  near(r.net, 2.304); near(r.total, 2.304);
});
t('bê tông: hao hụt 3% và bỏ qua dòng kích thước 0', () => {
  const r = F.concrete([{ d: 2, r: 1, c: 0.5, n: 2 }, { d: 0, r: 5, c: 5, n: 5 }], 3);
  near(r.net, 2); near(r.total, 2.06);
});
t('bê tông: vật liệu và làm tròn số bao lên', () => {
  const m = F.concreteMaterials(2, { xm: 330, cat: 0.47, da: 0.89, bao: 50 });
  near(m.cementKg, 660); assert.strictEqual(m.cementBags, 14); near(m.sand, 0.94); near(m.stone, 1.78);
  assert.strictEqual(F.concreteMaterials(1, { xm: 300, bao: 50 }).cementBags, 6);
});
t('thép: kg/m theo d²×0.00617', () => {
  near(F.rebarKgPerM(10), 0.617); near(F.rebarKgPerM(12), 0.88848, 1e-5); near(F.rebarKgPerM(20), 2.468);
});
t('thép: 10 thanh Φ16 dài 6 m, số cây 11.7 m', () => {
  const r = F.rebar([{ d: 16, len: 6, n: 10 }], { waste: 0, stock: 11.7 });
  near(r.net, 60 * 256 * 0.00617); assert.strictEqual(r.byD[0].bars, 6); // 60/11.7 = 5.13 → 6
});
t('thép: gộp theo đường kính và có hao hụt', () => {
  const r = F.rebar([{ d: 10, len: 2, n: 5 }, { d: 10, len: 3, n: 2 }, { d: 12, len: 1, n: 1 }], { waste: 10, stock: 11.7 });
  assert.strictEqual(r.byD.length, 2); near(r.byD[0].length, 16); near(r.total, r.net * 1.1);
});
t('gạch: tường 10×3 m, gạch 180×80×80, mạch 10 mm', () => {
  const r = F.brick({ len: 10, h: 3, open: 0, L: 180, W: 80, H: 80, joint: 10, mode: 'W', wasteBrick: 0, wasteMortar: 0 });
  near(r.netArea, 30); near(r.perM2, 1 / (0.19 * 0.09), 1e-6); near(r.countNet, 30 / (0.19 * 0.09), 1e-6);
  near(r.wallVol, 2.4); near(r.mortarNet, 2.4 - r.countNet * 0.18 * 0.08 * 0.08, 1e-9);
});
t('gạch: trừ cửa và hao hụt 3%', () => {
  const r = F.brick({ len: 5, h: 3, open: 2, L: 180, W: 80, H: 80, joint: 10, mode: 'W', wasteBrick: 3, wasteMortar: 10 });
  near(r.netArea, 13); assert.strictEqual(r.count, Math.ceil(13 / (0.19 * 0.09) * 1.03 - 1e-9));
});
t('gạch: tường dày xây theo cạnh L dùng mặt W×H', () => {
  const r = F.brick({ len: 1, h: 1, open: 0, L: 200, W: 100, H: 60, joint: 10, mode: 'L', wasteBrick: 0, wasteMortar: 0 });
  near(r.thickness, 0.2); near(r.perM2, 1 / (0.11 * 0.07), 1e-6);
});
t('ốp lát: 4×5 m, gạch 600×600, mạch 2 mm, hao hụt 5%', () => {
  const r = F.tiles({ len: 4, wid: 5, extra: 0, cut: 0, tl: 600, tw: 600, joint: 2, waste: 5, perBox: 4 });
  near(r.area, 20); near(r.unitArea, 0.602 * 0.602, 1e-9);
  assert.strictEqual(r.count, Math.ceil(20 / (0.602 * 0.602) * 1.05 - 1e-9)); assert.strictEqual(r.boxes, Math.ceil(r.count / 4));
});
t('ốp lát: diện tích âm được chặn về 0', () => {
  near(F.tiles({ len: 1, wid: 1, extra: 0, cut: 5, tl: 300, tw: 300, joint: 0, waste: 0, perBox: 0 }).area, 0);
});
t('sơn: phòng 4×5×3, trừ cửa 6 m², có trần, 2 phòng', () => {
  const r = F.paint({ len: 4, wid: 5, h: 3, open: 6, ceiling: 'yes', rooms: 2, cov: 10, primerCoats: 1, topCoats: 2, waste: 0, pack: 18 });
  near(r.walls, (2 * 9 * 3 - 6) * 2); near(r.ceiling, 40); near(r.area, 48 * 2 + 40);
  near(r.primer, r.area / 10); near(r.top, r.area * 2 / 10); assert.strictEqual(r.topPacks, Math.ceil(r.top / 18));
});
t('sơn: không trần thì chỉ tính tường', () => {
  near(F.paint({ len: 4, wid: 5, h: 3, open: 0, ceiling: 'no', rooms: 1, cov: 10, primerCoats: 0, topCoats: 1, waste: 0, pack: 0 }).area, 54);
});
t('quy đổi: chiều dài, diện tích, áp suất, lực', () => {
  near(F.convert(1, 'm', 'cm', 'Chiều dài'), 100); near(F.convert(12, 'inch (in)', 'mm', 'Chiều dài'), 304.8);
  near(F.convert(1, 'ha', 'm²', 'Diện tích'), 10000); near(F.convert(25, 'MPa (N/mm²)', 'kgf/cm²', 'Áp suất / ứng suất'), 254.9291, 1e-3);
  near(F.convert(1, 'tấn lực (tf)', 'kN', 'Lực'), 9.80665); near(F.convert(1, 'tấn', 'kg', 'Khối lượng'), 1000);
  assert.throws(() => F.convert(1, 'm', 'kg', 'Chiều dài'));
});
t('bảng thép: Φ10 = 0.617 kg/m, 7.22 kg/cây; tiết diện 78.54 mm²', () => {
  const r = F.rebarTable(11.7).find(x => x.d === 10);
  near(r.kgm, 0.617); near(r.kgBar, 7.21890, 1e-4); near(r.area, 78.5398, 1e-3);
});
t('dự toán: dự phòng và VAT tính trên tổng trước đó', () => {
  const r = F.estimate([{ qty: 10, price: 1000 }, { qty: 2, price: 500 }], 5, 10);
  near(r.sub, 11000); near(r.reserve, 550); near(r.vat, 1155); near(r.total, 12705);
});
console.log(`\n${passed} test đạt` + (process.exitCode ? ', CÓ LỖI' : ''));
