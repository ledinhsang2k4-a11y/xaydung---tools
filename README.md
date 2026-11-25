# Bộ công cụ xây dựng

Hệ thống công cụ web tĩnh cho ngành xây dựng: HTML, CSS và JavaScript thuần, **không cần build, không cần backend**. Mở được ngay trên GitHub Pages, chạy được khi mất mạng (PWA).

## Công cụ có sẵn

| Nhóm | Công cụ |
|---|---|
| Khối lượng vật liệu | Bê tông (móng, cột, dầm, sàn), cốt thép, gạch xây và vữa, gạch ốp lát, sơn nước |
| Dự toán | Dự toán sơ bộ (khối lượng × đơn giá tự nhập, dự phòng, VAT), nhận hạng mục từ các công cụ tính |
| Tra cứu | Quy đổi đơn vị (kể cả MPa, kgf/cm², tf, kN), bảng tra thép tròn Φ6 đến Φ32 |
| Biểu mẫu và nhật ký | Checklist nghiệm thu và an toàn (6 mẫu), nhật ký công trình |

Mọi công cụ đều: xuất Excel (.csv), in hoặc lưu PDF, hiển thị công thức từng bước, tự lưu dữ liệu nhập trên thiết bị.

## Đưa lên GitHub Pages

**Cách 1: không dùng Actions (đơn giản nhất)**
1. Tạo repo mới trên GitHub, đẩy toàn bộ thư mục này lên nhánh `main`.
2. Vào **Settings → Pages**, mục *Build and deployment* chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`.
3. Đợi khoảng một phút, trang chạy tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

**Cách 2: dùng Actions (có chạy test trước khi deploy)**
1. Vào **Settings → Pages**, mục *Source* chọn **GitHub Actions**.
2. Mỗi lần push vào `main`, workflow `.github/workflows/deploy.yml` chạy test công thức rồi deploy. Nếu test hỏng, trang không được cập nhật.

Mọi đường dẫn trong dự án đều là đường dẫn tương đối nên chạy đúng ở dạng `user.github.io/ten-repo/`, không cần cấu hình `base`.

## Chạy thử trên máy

```bash
# Cần Python hoặc Node, chỉ để mở một máy chủ tĩnh
python3 -m http.server 8080      # rồi mở http://localhost:8080
node tests/formulas.test.js      # chạy test công thức
```

Có thể mở thẳng `index.html` bằng trình duyệt, nhưng tính năng offline (service worker) chỉ hoạt động khi chạy qua http hoặc https.

## Cấu trúc

```
index.html              khung trang
css/style.css           giao diện
js/formulas.js          công thức thuần (không đụng DOM), có test
js/core.js              lưu trữ, xuất file, bộ dựng công cụ tính (CX.calc)
js/app.js               định tuyến, trang chủ, sao lưu
js/tools/*.js           các công cụ, mỗi file đăng ký bằng CX.register(...)
tests/formulas.test.js  test công thức
sw.js, manifest.webmanifest, icons/   PWA
```

## Thêm một công cụ mới

1. Nếu có tính toán, thêm hàm thuần vào `js/formulas.js` và viết test trong `tests/formulas.test.js`.
2. Tạo công cụ trong `js/tools/` bằng `CX.register({ id, name, group, icon, desc, keywords, mount })`. Với công cụ dạng "nhập thông số → ra kết quả", dùng `CX.calc(el, tool, { fields, rows, compute, notes })` để có sẵn form, bảng dòng, kết quả, xuất Excel, in và nút thêm vào dự toán. Xem `js/tools/vat-lieu.js` làm mẫu.
3. Thêm thẻ `<script>` vào `index.html` và tên file vào danh sách `ASSETS` trong `sw.js`.
4. Mỗi lần phát hành, đổi `CACHE = 'xdt-v1'` trong `sw.js` thành `xdt-v2`... để người dùng nhận bản mới.

## Lưu ý quan trọng

- **Định mức trong mác bê tông (M150 đến M300) và số liệu hao hụt chỉ là giá trị tham khảo gần đúng.** Hãy nhờ kỹ sư rà soát và thay bằng định mức hiện hành trước khi công bố rộng rãi.
- Công cụ **không tính kết cấu** và không thay thế hồ sơ thiết kế. Trang đã có phần miễn trừ trách nhiệm, hãy giữ nguyên.
- Dữ liệu người dùng lưu trong `localStorage`. Không có đồng bộ giữa các thiết bị, nên đã có nút Sao lưu/Khôi phục (.json) ở trang chủ.
- File CSV xuất ra dùng dấu `;` và số thập phân dùng dấu phẩy, để Excel bản tiếng Việt mở đúng. Nếu mở bằng Excel dùng định dạng số kiểu Mỹ, hãy đổi cài đặt vùng hoặc dùng Google Sheets (Import).
- Biểu tượng PWA là SVG. Một số bản iOS cần ảnh PNG 180×180 cho biểu tượng màn hình chính, bạn có thể thêm `icons/apple-touch-icon.png` và sửa thẻ `<link rel="apple-touch-icon">`.
