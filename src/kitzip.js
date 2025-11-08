/**
 * MIT License
 * Copyright (c) 2025-present, Huỳnh Nhân Quốc
 * Open source @ github.com/kitmodule
 */

(function (global) {
    const kitmodule = global.kitmodule || (global.kitmodule = {});

    // ------------------------
    // CRC32 Table for zip integrity
    // ------------------------
    const CRC_TABLE = (() => {
        const t = [];
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let k = 0; k < 8; k++) {
                c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
            }
            t[i] = c >>> 0;
        }
        return t;
    })();

    function crc32(data) {
        let crc = -1;
        for (let i = 0; i < data.length; i++) {
            crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff];
        }
        return (crc ^ -1) >>> 0;
    }

    // ------------------------
    // Encoding helpers
    // ------------------------
    function toUint8Array(input) {
        if (typeof input === 'string') return new TextEncoder().encode(input);
        if (input instanceof Uint8Array) return input;
        if (input instanceof ArrayBuffer) return new Uint8Array(input);
        if (input && input.base64) return base64ToUint8Array(input.base64);
        return new Uint8Array(0);
    }

    function base64ToUint8Array(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    // ------------------------
    // Date → DOS format for zip headers
    // ------------------------
    function dateToDos(date = new Date()) {
        const dosTime =
            ((date.getHours() & 0x1F) << 11) |
            ((date.getMinutes() & 0x3F) << 5) |
            ((Math.floor(date.getSeconds() / 2)) & 0x1F);
        const dosDate =
            (((date.getFullYear() - 1980) & 0x7F) << 9) |
            ((date.getMonth() + 1) << 5) |
            (date.getDate() & 0x1F);
        return { dosTime, dosDate };
    }

    // ------------------------
    // Deflate helper (CompressionStream / Node.js fallback)
    // ------------------------
    async function deflateRaw(data) {
        // Node.js fallback
        if (typeof CompressionStream === 'undefined') {
            if (typeof require === 'function') {
                const zlib = require('zlib');
                return zlib.deflateRawSync(data);
            }
            // Fallback: store without compression
            return data;
        }

        const cs = new CompressionStream('deflate-raw');
        const writer = cs.writable.getWriter();
        writer.write(data);
        writer.close();
        const compressed = await new Response(cs.readable).arrayBuffer();
        return new Uint8Array(compressed);
    }

    // ------------------------
    // Core KitZip class
    // ------------------------
    function KitZip(input = [], opts = {}) {
        // Nếu input là object nhưng không phải array → coi là opts
        if (input && !Array.isArray(input) && typeof input === 'object') {
            opts = input;
            input = [];
        }

        this.files = Array.isArray(input) ? input.slice() : [];
        this.compress = opts.compress !== false;
        this.onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
    }

    // ------------------------
    // Add single file
    // ------------------------
    KitZip.prototype.add = function (name, content, options = {}) {
        this.files.push({
            name,
            content,
            date: options.date || new Date(),
            compress: options.compress !== undefined ? options.compress : this.compress
        });
        return this;
    };

    // ------------------------
    // Add multiple files at once
    // ------------------------
    KitZip.prototype.addFiles = function (filesArray = []) {
        if (!Array.isArray(filesArray)) return this;
        filesArray.forEach(f => this.add(f.name, f.content, { compress: f.compress }));
        return this;
    };

    // ------------------------
    // Add file from URL
    // ------------------------
    KitZip.prototype.addURL = async function (url, name, options = {}) {
        const resp = await fetch(url);
        const reader = resp.body.getReader();
        const chunks = [];
        let loaded = 0;
        const total = +resp.headers.get('Content-Length') || 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            loaded += value.length;
            if (options.onProgress) options.onProgress(loaded, total);
        }

        const size = chunks.reduce((acc, c) => acc + c.length, 0);
        const data = new Uint8Array(size);
        let offset = 0;
        for (const c of chunks) {
            data.set(c, offset);
            offset += c.length;
        }

        this.add(name || url.split('/').pop(), data, options);
        return this;
    };

    // ------------------------
    // Enable/disable compression for following files
    // ------------------------
    KitZip.prototype.setCompression = function (enabled) {
        this.compress = !!enabled;
        return this;
    };

    // ------------------------
    // Compress all existing files
    // ------------------------
    KitZip.prototype.compressAll = function (enabled) {
        this.files.forEach(f => f.compress = !!enabled);
        return this;
    };

    // ------------------------
    // Progress callback
    // ------------------------
    KitZip.prototype.setProgressHandler = function (fn) {
        if (typeof fn === 'function') this.onProgress = fn;
        return this;
    };

    // ------------------------
    // Drag & Drop support in browser
    // ------------------------
    KitZip.prototype.enableDragDrop = function (element) {
        if (!(element instanceof HTMLElement)) return this;
        element.addEventListener('dragover', e => e.preventDefault());
        element.addEventListener('drop', e => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            files.forEach(f => {
                const reader = new FileReader();
                reader.onload = ev => this.add(f.name, ev.target.result);
                reader.readAsArrayBuffer(f);
            });
        });
        return this;
    };

    // ------------------------
    // Create zip stream (internal or for upload)
    // ------------------------
    KitZip.prototype.createStream = async function (writer) {
        const fileEntries = [];
        let offset = 0;

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const data = toUint8Array(file.content);
            const compressed = file.compress ? await deflateRaw(data) : data;
            const nameBytes = new TextEncoder().encode(file.name);
            const { dosTime, dosDate } = dateToDos(file.date);

            // Local file header
            const header = new Uint8Array(30 + nameBytes.length);
            const dv = new DataView(header.buffer);
            dv.setUint32(0, 0x04034b50, true);   // local file header signature
            dv.setUint16(4, 20, true);           // version needed to extract
            dv.setUint16(8, file.compress ? 8 : 0, true); // compression method
            dv.setUint16(10, dosTime, true);
            dv.setUint16(12, dosDate, true);
            dv.setUint32(14, crc32(data), true);
            dv.setUint32(18, compressed.length, true);
            dv.setUint32(22, data.length, true);
            dv.setUint16(26, nameBytes.length, true);
            header.set(nameBytes, 30);

            // write header + compressed data
            await writer.write(header);
            await writer.write(compressed);

            if (this.onProgress) this.onProgress(Math.round((i + 1) / this.files.length * 100), {
                fileIndex: i,
                fileName: file.name,
                status: 'processed'
            });

            fileEntries.push({ file, header, compressed, offset, nameBytes });
            offset += header.length + compressed.length;
        }

        // Central directory
        let cdSize = 0;
        const centralDir = [];
        for (const f of fileEntries) {
            const cd = new Uint8Array(46 + f.nameBytes.length);
            const dv = new DataView(cd.buffer);
            dv.setUint32(0, 0x02014b50, true);
            dv.setUint16(4, 20, true);
            dv.setUint16(6, 20, true);
            dv.setUint16(10, f.file.compress ? 8 : 0, true);
            const { dosTime, dosDate } = dateToDos(f.file.date);
            dv.setUint16(12, dosTime, true);
            dv.setUint16(14, dosDate, true);
            dv.setUint32(16, crc32(toUint8Array(f.file.content)), true);
            dv.setUint32(20, f.compressed.length, true);
            dv.setUint32(24, toUint8Array(f.file.content).length, true);
            dv.setUint16(28, f.nameBytes.length, true);
            dv.setUint32(42, f.offset, true);
            cd.set(f.nameBytes, 46);
            centralDir.push(cd);
            cdSize += cd.length;
        }

        // End of central directory
        const end = new Uint8Array(22);
        const dvEnd = new DataView(end.buffer);
        dvEnd.setUint32(0, 0x06054b50, true);
        dvEnd.setUint16(8, centralDir.length, true);
        dvEnd.setUint16(10, centralDir.length, true);
        dvEnd.setUint32(12, cdSize, true);
        dvEnd.setUint32(16, offset, true);

        // write central dir + end
        for (const cd of centralDir) await writer.write(cd);
        await writer.write(end);
    };

    // ------------------------
    // Download zip as file (browser)
    // ------------------------
    KitZip.prototype.download = async function (filename = 'kitzip.zip') {
        const chunks = [];
        const writer = { write(chunk) { chunks.push(chunk); }, close() { } };
        await this.createStream(writer);
        const blob = new Blob(chunks, { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ------------------------
    // Download zip WITHOUT await (helper save)
    // ------------------------
    KitZip.prototype.save = function (filename = 'kitzip.zip') {
        this.download(filename); // Không cần await
        return this;
    };

    // ------------------------
    // Shortcut helper
    // ------------------------
    async function kitZip(files = [], filename = 'kitzip.zip') {
        const zip = new KitZip(files);
        await zip.download(filename);
    }

    // ------------------------
    // Exports
    // ------------------------
    global.KitZip = KitZip;
    global.kitZip = kitZip;
    kitmodule.Zip = KitZip;
    kitmodule.zip = (files, ops) => new KitZip(files, ops);

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { KitZip, kitZip };
    }

})(typeof window !== 'undefined' ? window : globalThis);
