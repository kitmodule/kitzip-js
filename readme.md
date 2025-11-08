# 💾 KitZip JS by Kitmodule

**Generate ZIP files in vanilla JavaScript — lightweight, chainable, and dependency-free.**

[English](#) | [Tiếng Việt](https://github.com/kitmodule/kitzip-js/blob/master/readme-vi.md)

[![npm version](https://img.shields.io/npm/v/@kitmodule/kitzip.svg)](https://www.npmjs.com/package/@kitmodule/kitzip)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kitmodule/kitzip-js/blob/master/LICENSE)


## ✨ Features

* 📦 Create **ZIP files** from strings, JSON, ArrayBuffer, or base64.
* 🔗 Add files from **URLs** with optional progress tracking.
* ⚡ Pure **vanilla JavaScript**, zero dependencies.
* 🧱 Fluent, chainable API for building archives.
* 🔒 Supports **compression (Deflate)** if the browser supports it.
* 📊 Optional **progress callback** for both individual files and total ZIP.


## 🚀 Installation

### Using npm

```bash
npm install @kitmodule/kitzip
```

### Using CDN

```html
<script src="https://unpkg.com/@kitmodule/kitzip/dist/kitzip.min.js"></script>
```


## 💡 Usage

### 1️⃣ Initialize with file array (constructor)

```js
const initialFiles = [
  { name: 'a.txt', content: 'Hello' },
  { name: 'b.txt', content: 'World' }
];

const zip = new KitZip(initialFiles, { compress: true });
await zip.download('init-files.zip');
```

> ✅ Convenient if you already have a list of files.


### 2️⃣ Initialize empty and add files dynamically

```js
const zip = new KitZip({ compress: false }); // empty, no compression

zip.add('file1.txt', 'Hello World!');
zip.add('file2.json', JSON.stringify({ version: 4 }));

// Add file from URL
await zip.addURL('https://example.com/file.txt', 'remote.txt');

await zip.download('add-method.zip');
```

> ✅ Flexible for dynamic files, e.g., fetched from APIs or user input.


### 3️⃣ Shortcut helper `kitZip(files, filename)`

```js
await kitZip([
  { name: 'x.txt', content: 'X content' },
  { name: 'y.txt', content: 'Y content' }
], 'shortcut.zip');
```

> ✅ Short and simple: just pass a file array and target ZIP filename.


### 4️⃣ Combine `files` + `opts` + `.add()` (advanced)

```js
const files = [
  { name: 'a.txt', content: 'A' }
];

const zip = new KitZip(files, { compress: true });

// Add a new file with custom compression
zip.add('b.txt', 'B content', { compress: false });

// Track progress
zip.setProgressHandler((percent, info) => console.log(percent, info));

await zip.download('mixed.zip');
```

> ✅ Useful for mixed compression settings or tracking ZIP progress.


## 🧩 API Reference

### `new KitZip(files?, options?)`

| Param     | Type   | Description                                                    |                       |
| --------- | ------ | -------------------------------------------------------------- | --------------------- |
| `files`   | Array  | Optional array of initial files `{ name, content, compress? }` |                       |
| `options` | Object | `{ compress: true                                              | false }`Default`true` |


### Methods

| Method                     | Description                                               | Example                                    |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `.add(name, content)`      | Add a file (string, JSON, ArrayBuffer, base64)            | `.add('hello.txt', 'Hello')`               |
| `.addURL(url, name, opts)` | Add a file from a URL with optional `onProgress` callback | `.addURL('file.txt', 'file.txt')`          |
| `.setCompression(bool)`    | Enable/disable compression for following files            | `.setCompression(false)`                   |
| `.setProgressHandler(fn)`  | Callback `(percent, info)` for total progress             | `.setProgressHandler(console.log)`         |
| `.download(filename)`      | Generate ZIP Blob and trigger download                    | `.download('archive.zip')`                 |
| `.createStream(writer)`    | Stream ZIP to a custom writer with `write(chunk)`         | `.createStream(customWriter)`              |
| `kitZip(files, filename)`  | Shortcut to create and download ZIP from file array       | `kitZip([{name:'a',content:'1'}],'a.zip')` |


## 🧪 Example Output

```js
const zip = new KitZip();
zip.add('hello.txt', 'Hello World!');
await zip.download('demo.zip');
```

**Output ZIP `demo.zip` contains:**

```
hello.txt
readme.md
data.json
```


## ☕ Support the Author

If you find this library useful, you can support me:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge\&logo=ko-fi\&logoColor=white)](https://ko-fi.com/huynhnhanquoc)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_a_Coffee-FFDD00?style=for-the-badge\&logo=buy-me-a-coffee\&logoColor=black)](https://buymeacoffee.com/huynhnhanquoc)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub_Sponsors-f7f7f7?style=for-the-badge\&logo=githubsponsors\&logoColor=ff69b4\&color=f7f7f7)](https://github.com/sponsors/huynhnhanquoc)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge\&logo=patreon\&logoColor=white)](https://patreon.com/huynhnhanquoc)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge\&logo=paypal\&logoColor=white)](https://paypal.me/huynhnhanquoc)


## 🧾 License

Released under the [MIT License](https://github.com/kitmodule/kitzip-js/blob/master/LICENSE)
© 2025 [Huỳnh Nhân Quốc](https://github.com/huynhnhanquoc) · Open Source [@Kit Module](https://github.com/kitmodule)

