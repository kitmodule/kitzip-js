# 💾 KitZip JS by Kitmodule

**Tạo file ZIP bằng vanilla JavaScript — nhẹ, chuỗi (chainable), và không phụ thuộc thư viện bên ngoài, với các tính năng nâng cao.**

[English](https://github.com/kitmodule/kitzip-js/blob/master/readme.md) | [Tiếng Việt](#)

[![npm version](https://img.shields.io/npm/v/@kitmodule/kitzip.svg)](https://www.npmjs.com/package/@kitmodule/kitzip)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kitmodule/kitzip-js/blob/master/LICENSE)


## ✨ Tính năng (Nâng cao)

* 📦 Tạo **file ZIP** từ chuỗi, JSON, ArrayBuffer hoặc base64.
* 🔗 Thêm file từ **URL** với callback tiến trình (progress) tùy chọn.
* 🧱 Thêm **nhiều file cùng lúc** bằng `.addFiles()`.
* 🔒 Bật/tắt nén theo file hoặc toàn bộ với `.compressAll()`.
* ⚡ Hoàn toàn **vanilla JavaScript**, không cần thư viện ngoài.
* 🖱️ Hỗ trợ **kéo & thả** trong trình duyệt để thêm file trực tiếp.
* 🧩 Hỗ trợ Node.js: fallback `CompressionStream → zlib`.
* 📊 Callback tiến trình **tùy chọn** cho từng file và toàn bộ ZIP.
* 🏎️ Tải xuống **không cần `await`** bằng `.save()`.


## 🚀 Cài đặt

### Sử dụng npm

```bash
npm install @kitmodule/kitzip
```

### Sử dụng CDN

```html
<script src="https://unpkg.com/@kitmodule/kitzip/dist/kitzip.min.js"></script>
```


## 💡 Ví dụ Sử dụng

### 1️⃣ Khởi tạo với mảng file ban đầu

```js
const initialFiles = [
  { name: 'a.txt', content: 'Hello' },
  { name: 'b.txt', content: 'World' }
];

const zip = new KitZip(initialFiles, { compress: true });
await zip.download('init-files.zip');
```

> ✅ Tiện lợi nếu bạn đã có danh sách file sẵn.


### 2️⃣ Khởi tạo trống và thêm file động

```js
const zip = new KitZip({ compress: false }); // trống, không nén

zip.add('file1.txt', 'Hello World!');
zip.add('file2.json', JSON.stringify({ version: 4 }));

// Thêm file từ URL
await zip.addURL('https://example.com/file.txt', 'remote.txt');

await zip.download('add-method.zip');
```

> ✅ Linh hoạt với file lấy từ API hoặc nhập từ người dùng.


### 3️⃣ Thêm nhiều file cùng lúc

```js
zip.addFiles([
  { name: 'one.txt', content: '1' },
  { name: 'two.txt', content: '2', compress: false }
]);
```

> ✅ Hữu ích khi cần thêm batch file.


### 4️⃣ Bật/tắt nén cho tất cả file

```js
zip.compressAll(true);  // tất cả nén
zip.compressAll(false); // tất cả lưu không nén
```


### 5️⃣ Kéo & thả file trong trình duyệt

```js
const dropArea = document.getElementById('drop-area');
zip.enableDragDrop(dropArea);
```

> ✅ Người dùng có thể kéo file vào khu vực drop, tự động thêm vào ZIP.


### 6️⃣ Tải xuống mà không cần `await`

```js
zip.save('quick.zip'); // tải ngay lập tức, không cần await
```

> ✅ Tiện lợi cho các file tải nhanh.


### 7️⃣ Shortcut helper `kitZip(files, filename)`

```js
await kitZip([
  { name: 'x.txt', content: 'Nội dung X' },
  { name: 'y.txt', content: 'Nội dung Y' }
], 'shortcut.zip');
```

> ✅ Ngắn gọn, chỉ cần truyền mảng file và tên ZIP.


## 🧩 Tham khảo API

### `new KitZip(files?, options?)`

| Tham số   | Kiểu   | Mô tả                                                      |                                                 |
| --------- | ------ | ---------------------------------------------------------- | ----------------------------------------------- |
| `files`   | Array  | Mảng file khởi tạo tùy chọn `{ name, content, compress? }` |                                                 |
| `options` | Object | `{ compress: true                                          | false, onProgress: fn }` Mặc định compress=true |


### Các phương thức

| Phương thức                       | Mô tả                                                 | Ví dụ                                      |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| `.add(name, content, opts?)`      | Thêm 1 file (chuỗi, ArrayBuffer, JSON, base64)        | `.add('hello.txt', 'Hello')`               |
| `.addFiles([{name,content,...}])` | Thêm nhiều file cùng lúc                              | `.addFiles([{name:'a',content:'1'}])`      |
| `.addURL(url, name, opts?)`       | Thêm file từ URL với callback tiến trình tùy chọn     | `.addURL('file.txt','file.txt')`           |
| `.setCompression(bool)`           | Bật/tắt nén cho các file tiếp theo                    | `.setCompression(false)`                   |
| `.compressAll(bool)`              | Bật/tắt nén cho tất cả file hiện có                   | `.compressAll(true)`                       |
| `.setProgressHandler(fn)`         | Callback `(percent, info)` cho tiến trình toàn bộ ZIP | `.setProgressHandler(console.log)`         |
| `.download(filename)`             | Tạo Blob ZIP và tải xuống                             | `.download('archive.zip')`                 |
| `.save(filename)`                 | Tải ZIP ngay lập tức (không cần await)                | `.save('quick.zip')`                       |
| `.createStream(writer)`           | Ghi ZIP vào writer tuỳ chỉnh với `write(chunk)`       | `.createStream(customWriter)`              |
| `kitZip(files, filename)`         | Shortcut tạo và tải ZIP từ mảng file                  | `kitZip([{name:'a',content:'1'}],'a.zip')` |


## 🧪 Ví dụ đầu ra

```js
const zip = new KitZip();
zip.add('hello.txt', 'Hello World!');
zip.addFiles([{ name: 'data.json', content: '{"v":1}' }]);
zip.save('demo.zip');
```

**ZIP `demo.zip` chứa:**

```
hello.txt
data.json
```


## ☕ Ủng hộ tác giả

Nếu bạn thấy thư viện hữu ích, bạn có thể ủng hộ:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge\&logo=ko-fi\&logoColor=white)](https://ko-fi.com/huynhnhanquoc)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=for-the-badge\&logo=buy-me-a-coffee\&logoColor=black)](https://buymeacoffee.com/huynhnhanquoc)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-f7f7f7?style=for-the-badge\&logo=githubsponsors\&logoColor=ff69b4\&color=f7f7f7)](https://github.com/sponsors/huynhnhanquoc)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge\&logo=patreon\&logoColor=white)](https://patreon.com/huynhnhanquoc)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge\&logo=paypal\&logoColor=white)](https://paypal.me/huynhnhanquoc)


## 🧾 License

Phát hành theo [MIT License](https://github.com/kitmodule/kitzip-js/blob/master/LICENSE)
© 2025 [Huỳnh Nhân Quốc](https://github.com/huynhnhanquoc) · Open Source [@Kit Module](https://github.com/kitmodule)

